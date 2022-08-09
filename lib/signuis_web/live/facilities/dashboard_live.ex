defmodule SignuisWeb.Facilities.DashboardLive do
  use SignuisWeb, :live_view
  use SignuisWeb.Mixins.Map

  alias SignuisWeb.MapMarker
  alias SignuisWeb.HeatmapCell
  alias Signuis.Facilities
  alias Signuis.Reporting
  alias Signuis.Reporting.Report

  def mount(%{"facility_id" => facility_id} = params, session, socket) do
    {:ok,
      socket
      |> assign(:facility, Facilities.get_facility!(facility_id))
      |> assign(:facilities, [])
      |> assign(:focused_entity, nil)
      |> assign(:report_heatmap, [])
      |> init_map(params, session)
    }
  end

  def update_map(socket) do
    markers = []
    heatmap_cells = []

    markers = markers ++ Enum.map(socket.assigns.facilities, &MapMarker.to/1)
    heatmap_cells = heatmap_cells ++ Enum.map(socket.assigns.report_heatmap, &HeatmapCell.to/1)

    socket
    |> set_map_data(markers ++ heatmap_cells)
  end

  def cast_location(changeset, location) do
    case location do
      %Geo.Point{coordinates: {lat, long}, srid: 4326} ->
        changeset
        |> Ecto.Changeset.put_change(:location__lat, lat)
        |> Ecto.Changeset.put_change(:location__lng, long)
      _ ->
        changeset
        |> Ecto.Changeset.add_error(:location, "veuillez activer la géolocalisation")
    end
  end

  def handle_event("dev::reports::generate", %{"number" => number}, socket) do
    facility = socket.assigns.facility
    for _i <- 1..String.to_integer(number) do
      location = GeoMath.random_within(facility.location, GeoMath.Distance.km(2))
      nuisance_type = Enum.random(Reporting.list_nuisances_types())
      nuisance_level = Enum.random(1..10)

      Reporting.create_report(%{nuisance_type_id: nuisance_type.id, nuisance_level: nuisance_level}, pre_validations: [
        &(cast_location(&1, location))
      ])
    end
    {:noreply, socket}
  end

  def handle_event("form::report::toggle", _value, socket) do
    socket = socket
    |> assign(:display_report_form, not socket.assigns.display_report_form)
    {:noreply, socket}
  end

  def handle_event("report::validate", %{"report" => report_params}, socket) do
    changeset = %Report{}
    |> Reporting.change_report(report_params, pre_validations: [&(cast_location(&1, socket.assigns.location))])
    |> Map.put(:action, :insert)

    socket = socket
    |> assign(:report_changeset, changeset)

    {:noreply, socket}
  end

  def handle_event("report::submit", %{"report" => report_params}, socket) do
    result = Reporting.create_report(report_params, pre_validations: [&(cast_location(&1, socket.assigns.location))])
    socket = case result do
      {:ok, _report} ->
        socket
        |> put_flash(:info, "Report created successfully")
        |> assign(:display_report_form, false)

      {:error, changeset} ->
        socket
        |> assign(:report_changeset, changeset)

    end

    {:noreply, socket}
  end

  def handle_info({"map::marker-clicked", marker}, socket) do
    entity = MapMarker.from(marker)

    socket = if entity do
      socket
      |> fly_to(marker.location)
    else
      socket
    end

    {:noreply, socket |> assign(:focused_entity, entity)}
  end

  def handle_info({"map::bounds-updated", bounds}, socket) do
    {:noreply,
      socket
      |> assign(:facilities, Facilities.list_facilities(filter: [bounds: bounds]))
      |> assign(:report_heatmap, Reporting.get_report_heatmap(grid: 0.0001, bounds: bounds))
      |> update_map
    }
  end

  def handle_info({"geolocation::position-updated", position}, socket) do
    {:noreply,
      socket
      |> assign(:location, position)
      |> update_map
    }
  end

end
