defmodule Signuis.Reporting.Report do
  use Ecto.Schema
  import Ecto.Changeset

  alias Signuis.Reporting.NuisanceType

  schema "reports" do
    field :location, Geo.PostGIS.Geometry
    field :location__lat, :float, virtual: true
    field :location__lng, :float, virtual: true

    belongs_to :nuisance_type, NuisanceType

    field :nuisance_level, :integer
    field :user_id, :id

    timestamps()
  end

  @doc false
  def changeset(report, attrs, opts \\ []) do
    pre_validations = Keyword.get(opts, :pre_validations, [])

    changeset = report
    |> cast(attrs, [:nuisance_level, :nuisance_type_id, :user_id, :location__lat, :location__lng])

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
