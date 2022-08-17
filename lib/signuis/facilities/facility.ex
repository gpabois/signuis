defmodule Signuis.Facilities.Facility do
  use Ecto.Schema

  alias Signuis.Repo

  import Ecto.Changeset
  import Signuis.Filter
  import Geo.PostGIS
  import Ecto.Query

  schema "facilities" do
    field :adresse__zip_code, :string
    field :adresse__city, :string
    field :adresse__street, :string

    field :description, :string

    field :location, Geo.PostGIS.Geometry
    field :location__lat, :float, virtual: true
    field :location__lng, :float, virtual: true

    field :name, :string
    field :valid, :boolean, default: false

    timestamps()
  end

  def list(opts \\ []) do
    filter = Keyword.get(opts, :filter, %{}) |> Enum.into(%{})

    __MODULE__
    |> filter(filter, __MODULE__)
    |> Repo.all
  end

  def get!(id) do
    Repo.get!(__MODULE__, id)
    |> fill_vfields()
  end

  def fill_vfields(nil), do: nil

  def fill_vfields(%__MODULE__{location: %Geo.Point{coordinates: {lat, lng}}} = facility) do
    facility
    |> Map.put(:location__lat, lat)
    |> Map.put(:location__lng, lng)
  end

  def filter_on_attribute({:bounds, %{bottom_left: bottom_left, top_right: top_right}}, query) do
    from(
      f in query,
      where: st_within(
        fragment("?::geometry", f.location),
        fragment("?::geometry",
          st_set_srid(
            st_make_box_2d(^bottom_left, ^top_right), 4326)
          )
        )
    )
  end

  def get_in_area(%Geo.Point{srid: 4326} = bottom_left, %Geo.Point{srid: 4326} = top_right) do
    from(
      f in __MODULE__,
      where: st_within(
        fragment("?::geometry", f.location),
        fragment("?::geometry",
          st_set_srid(
            st_make_box_2d(^bottom_left, ^top_right), 4326)
          )
        )
    )
  end

  @doc false
  def changeset(facility, attrs, opts \\ []) do
    case Keyword.get(opts, :admin, false) do
      false ->
        facility
        |> cast(attrs, [:name, :description, :location__lat, :location__lng, :adresse__street, :adresse__city, :adresse__zip_code])
        |> validate_required([:name, :description, :location__lat, :location__lng, :adresse__street, :adresse__city, :adresse__zip_code])
        |> cast_location()
      true ->
        admin_changeset(facility, attrs)
    end

  end

  defp admin_changeset(facility, attrs) do
    facility
    |> cast(attrs, [:name, :description, :location__lat, :location__lng, :adresse__street, :adresse__city, :adresse__zip_code, :valid])
    |> validate_required([:name, :description, :location__lat, :location__lng, :adresse__street, :adresse__city, :adresse__zip_code])
    |> cast_location()
  end

  def cast_location(changeset) do
    if Enum.any?([
      get_field(changeset, :location__lat) == nil,
      get_field(changeset, :location__lng) == nil
    ]) do
      changeset
      |> add_error(:location, "missing location")
    else
      lat = get_field(changeset, :location__lat)
      lng = get_field(changeset, :location__lng)

      geo = %Geo.Point{coordinates: {lat, lng}, srid: 4326}

      changeset |> put_change(:location, geo)
    end

  end
end
