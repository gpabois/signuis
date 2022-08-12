defmodule Signuis.Reporting.Report do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  alias Signuis.Repo
  import Signuis.Utils
  import Signuis.Filter

  alias Signuis.Reporting.NuisanceType

  schema "reports" do
    field :location, Geo.PostGIS.Geometry
    field :location__lat, :float, virtual: true
    field :location__lng, :float, virtual: true

    belongs_to :nuisance_type, NuisanceType

    field :nuisance_level, :integer
    field :user_id, :id
    field :session_id, :string

    timestamps()
  end

  def list(opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms
    preload = Keyword.get(opts, :preload, [])

    __MODULE__
    |> filter(filters, __MODULE__)
    |> Repo.all
    |> Repo.preload(preload)
  end

  def count(opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms

    __MODULE__
    |> filter(filters, __MODULE__)
    |> select([b], count(b.id))
    |> Repo.one!
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
      join: f in "reports_facilities",
      on: f.report_id == b.id,
      where: f.facility_id == ^facility.id
    )
  end


  def filter_on_attribute({:timerange, {bgt, endt}}, query) do
    query = query
    |> where([b], b.inserted_at >= ^bgt)

    if endt do
      query
      |> where([b], b.inserted_at <= ^endt)
    else
      query
    end
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
    |> cast(attrs, [:nuisance_level, :nuisance_type_id, :user_id, :session_id, :location__lat, :location__lng])

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
