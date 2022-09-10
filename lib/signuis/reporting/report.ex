defmodule Signuis.Reporting.Report do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  alias Signuis.Repo
  import Signuis.Utils

  alias Signuis.Accounts.{User, Anonymous}
  alias Signuis.Reporting.NuisanceType
  alias Signuis.Reporting.HistorySelector

  schema "reports" do
    field :location, Geo.PostGIS.Geometry
    field :location__lat, :float, virtual: true
    field :location__lng, :float, virtual: true

    belongs_to :nuisance_type, NuisanceType

    field :nuisance_level, :integer
    field :user_id, :id
    field :session_id, :string

    timestamps(type: :utc_datetime)
  end

  def list(opts \\ []) do
    __MODULE__
    |> filter(opts)
    |> Repo.all
    |> load(opts)
  end

  defp load(query, opts) do
    preloads = Keyword.get(opts, :preload, [])
    Repo.preload(query, preloads)
  end

  def filter(query, opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms
    Signuis.Filter.filter(query, filters, __MODULE__)
  end

  def paginate(opts \\ []) do
    nb_elements = count(opts)

    elements = __MODULE__
    |> filter(opts)
    |> Signuis.Pagination.paginate(opts)
    |> Repo.all
    |> load(opts)

    %{elements: elements, pagination: Signuis.Pagination.get_pagination(count(opts), opts)}
  end

  def count(opts \\ []) do
    __MODULE__
    |> filter(opts)
    |> select([b], count(b.id))
    |> Repo.one!
  end

  def filter_on_attribute({:datetime_range, %HistorySelector{begin_datetime: dt_begin, end_datetime: dt_end}}, query) do
    filter_on_attribute({:datetime_range, {dt_begin, dt_end}}, query)
  end

  def filter_on_attribute({:datetime_range, nil}, query), do: query

  def filter_on_attribute({:user, %Anonymous{id: session_id}}, query) do
    filter_on_attribute({:session_id, session_id}, query)
  end

  def filter_on_attribute({:user, %User{} = user}, query) do
    filter_on_attribute({:user_id, user.id}, query)
  end
  def filter_on_attribute({:user_id, user_id}, query) do
    query
    |> where([b], b.user_id == ^user_id)
  end

  def filter_on_attribute({:session_id, session_id}, query) do
    query
    |> where([b], b.session_id == ^session_id)
  end

  def filter_on_attribute({:facility, facility}, query) do
    from(b in query,
      inner_join: f in "reports_facilities",
      on: f.report_id == b.id,
      where: f.facility_id == ^facility.id
    )
  end

  def filter_on_attribute({:datetime_range, {begin_dt, end_dt}}, query) do
    query = if begin_dt, do: where(query, [b], b.inserted_at >= ^begin_dt), else: query
    if end_dt, do: where(query, [b], b.inserted_at <= ^end_dt), else: query
  end

  def filter_on_attribute({:"not-report-callback", report_callback}, query) do
    sq = from(
      r in Signuis.Messaging.ReportCallbackAck,
      where: r.report_callback_id == ^report_callback.id,
      select: r.report_id
    )

    from(b in query,
      where: b.id not in subquery(sq)
    )
  end

  @doc false
  def changeset(report, attrs, opts \\ []) do
    pre_validations = Keyword.get(opts, :pre_validations, [])

    changeset = report
    |> cast(attrs, [:nuisance_level, :nuisance_type_id, :user_id, :session_id, :location__lat, :location__lng, :inserted_at])

    changeset = Enum.reduce(pre_validations, changeset, &(&1.(&2)))

    changeset
    |> validate_required([:nuisance_level, :nuisance_type_id, :location__lat, :location__lng])
    |> cast_location()
  end

  def cast_location(changeset) do
    lat = get_change(changeset, :location__lat)
    lng = get_change(changeset, :location__lng)

    geo = %Geo.Point{coordinates: {lat, lng}, srid: 4326}

    changeset |> put_change(:location, geo)
  end
end
