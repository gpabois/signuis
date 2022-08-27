defmodule Signuis.Dev.ReportCommand do
  import Ecto.Changeset

  alias Signuis.Reporting

  defstruct [
    count: 1, user_id: nil, facility_id: nil, max_distance: 2, min_distance: 0,
    begin_date: nil, begin_time: nil,
    end_date: nil, end_time: nil,
    begin_datetime: nil, end_datetime: nil
  ]

  @types %{
    count: :integer,
    user_id: :id,
    facility_id: :id,
    max_distance: :float,
    min_distance: :float,

    begin_date: :date,
    begin_time: :time,

    end_date: :date,
    end_time: :time,

    begin_datetime: :utc_datetime,
    end_datetime: :utc_datetime
  }

  def changeset(%__MODULE__{} = report_command, attrs, opts \\ []) do
    {report_command, @types}
    |> cast(attrs, Map.keys(@types))
    |> Signuis.Utils.DateTimeRange.Form.cast_datetime_range(attrs, opts)
  end

  def execute(attrs, opts \\ []) do
    with {:ok, report_command} <- apply_action(changeset(%__MODULE__{}, attrs, opts), :insert) do
      facility = Signuis.Facilities.get_facility!(report_command.facility_id)

      for _i <- 0..report_command.count, reduce: [] do
        reports_params -> %Geo.Point{coordinates: {lat, long}, srid: 4326} = GeoMath.random_within(facility.location, GeoMath.Distance.km(2), min: 0.2)
        nuisance_type = Enum.random(Reporting.list_nuisances_types())
        nuisance_level = Enum.random(1..10)
        user_id = report_command.user_id

        inserted_at = cond do
          report_command.begin_datetime != nil and report_command.end_datetime != nil ->
            dt = DateTime.diff(report_command.end_datetime, report_command.begin_datetime)
            DateTime.add(report_command.begin_datetime, round(dt * :rand.uniform()))
          report_command.begin_datetime != nil ->
            dt = DateTime.diff(DateTime.utc_now(), report_command.begin_datetime)
            DateTime.add(report_command.begin_datetime, round(dt * :rand.uniform()))
          true ->
            DateTime.utc_now()
        end

        params = %{
          nuisance_type_id: nuisance_type.id,
          nuisance_level: nuisance_level,
          user_id: user_id,
          location__lat: lat,
          location__lng: long,
          inserted_at: inserted_at
        }

        [params | reports_params]
      end
      |>  Reporting.create_reports
    end
  end
end
