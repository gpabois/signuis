defmodule Signuis.Dev.ReportCommand do
  import Ecto.Changeset

  alias Signuis.Reporting

  defstruct [count: 1, user_id: nil, facility_id: nil, max_distance: 2, min_distance: 0]

  @types %{
    count: :integer,
    user_id: :id,
    facility_id: :id,
    max_distance: :float,
    min_distance: :float
  }

  def changeset(%__MODULE__{} = report_command, attrs) do
    {report_command, @types}
    |> cast(attrs, Map.keys(@types))
  end

  def execute(attrs) do
    with {:ok, report_command} <- apply_action(changeset(%__MODULE__{}, attrs), :insert) do
      facility = Signuis.Facilities.get_facility!(report_command.facility_id)

      IO.inspect(report_command)
      for _i <- 0..report_command.count, reduce: [] do
        reports_params -> %Geo.Point{coordinates: {lat, long}, srid: 4326} = GeoMath.random_within(facility.location, GeoMath.Distance.km(2), min: 0.2)
        nuisance_type = Enum.random(Reporting.list_nuisances_types())
        nuisance_level = Enum.random(1..10)
        user_id = report_command.user_id

        params = %{
          nuisance_type_id: nuisance_type.id,
          nuisance_level: nuisance_level,
          user_id: user_id,
          location__lat: lat,
          location__lng: long
        }

        [params | reports_params]
      end
      |>  Reporting.create_reports
    end
  end
end
