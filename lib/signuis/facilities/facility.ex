defmodule Signuis.Facilities.Facility do
  use Ecto.Schema
  import Ecto.Changeset
  import Signuis.Filter

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
    lat = get_change(changeset, :location__lat)
    lng = get_change(changeset, :location__lng)

    geo = %Geo.Point{coordinates: {lat, lng}, srid: 4326}

    changeset |> put_change(:location, geo)
  end
end
