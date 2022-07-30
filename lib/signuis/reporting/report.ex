defmodule Signuis.Reporting.Report do
  use Ecto.Schema
  import Ecto.Changeset

  schema "reports" do
    field :location, Geo.PostGIS.Geography
    field :location__lat, :float, virtual: true
    field :location__lng, :float, virtual: true
    field :nuisance_type_id, :id
    field :nuisance_level, :integer
    field :user_id, :id

    timestamps()
  end

  @doc false
  def changeset(report, attrs) do
    report
    |> cast(attrs, [:nuisance_level, :nuisance_type_id, :user_id, :location__lat, :location__lng])
    |> validate_required([:nuisance_level, :nuisance_type_id, :location__lat, :location__lng])
    |> cast_location(changeset)
  end

  def cast_location(changeset) do
    lat = get_change(changeset, :location__lat)
    lng = get_change(changeset, :location__lng)

    geo = %Geo.Point{coordinates: {lat, lng}, srid: 4326}

    changeset |> put_change(:location, geo)
  end
end
