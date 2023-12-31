defmodule SignuisWeb.Facilities.DashboardLive do
  use SignuisWeb, :live_view
  use SignuisWeb.Mixins.Map

  alias SignuisWeb.MapMarker
  alias SignuisWeb.HeatmapCell
  alias Signuis.Facilities
  alias Signuis.Messaging
  alias Signuis.Messaging.ReportCallback
  alias Signuis.Reporting

  alias Signuis.Reporting.HistorySelector

  @grid_size 0.001

  def mount(%{"facility_id" => facility_id} = params, session, socket) do
    facility = Facilities.get_facility!(facility_id)

    socket = if permit?(Facilities, {:access, :dashboard}, socket.assigns.current_user, facility) do
      :timer.send_interval(10000, :fetch_reports)

      Phoenix.PubSub.subscribe(Signuis.PubSub, "facilities::#{facility.id}")

      socket
      |> assign(:display_action_panel, false)
      |> assign(:display_history_form, false)
      |> assign(:history, nil)
      |> assign(:history_changeset, HistorySelector.changeset(%HistorySelector{}, %{}))
      |> assign(:current_production, Facilities.current_ongoing_production(facility))
      |> assign(:facility, facility)
      |> assign(:opened_report_callbacks, Messaging.list_report_callbacks(filter: %{"facility" => facility, "status" => "opened"}))
      |> assign(:focused_entity, nil)
      |> assign(:report_heatmap, [])
      |> assign(:alive_reports_count, nil)
      |> assign(:map_bounds, nil)
      |> assign(:report_callback_changeset, Messaging.change_report_callback(%ReportCallback{}, %{}))
      |> assign(:display_report_callback_form, false)
      |> init_map(params, session)
      |> SignuisWeb.Facilities.FacilityController.nav

    else
      socket |> redirect(to: "/403.html")
    end

    {:ok, socket, layout: {SignuisWeb.LayoutView, "nowrap.live.html"}}
  end

  def update_map(socket) do
    markers = [MapMarker.to(socket.assigns.facility)]
    heatmap_cells = []

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

  def handle_info(event, socket) do
    alive_threshold_dt = DateTime.add(Timex.now(socket.assigns.tz), -1800, :second) # Now - 30 mn (Reports are alive during 30 minutes)

    socket = case event do
      :fetch_reports ->
          datetime_range =  if socket.assigns.history, do: socket.assigns.history, else: {alive_threshold_dt, nil}
          alive_reports_count = Reporting.count_reports(filter: %{
            "facility" => socket.assigns.facility,
            "datetime_range" => datetime_range
          })

         socket = if socket.assigns.map_bounds != nil do
          heatmap = Reporting.get_report_heatmap(
            grid: @grid_size,
            bounds: socket.assigns.map_bounds,
            datetime_range: datetime_range
          )

          socket
          |> assign(:report_heatmap, heatmap)
          |> update_map
        else
          socket
        end
        |> assign(:alive_reports_count, alive_reports_count)

      {:begin_facility_production, production} ->
        socket
        |> assign(:current_production, production)

      {:end_facility_production, production} ->
        socket
        |> assign(:current_production, nil)

      {:new_report_callback, report_callback} ->
        socket
        |> assign(:opened_report_callbacks, Messaging.list_report_callbacks(filter: %{"facility" => socket.assigns.facility, "status" => "opened"}))

      {:updated_report_callback, report_callback} ->
        socket
        |> assign(:opened_report_callbacks, Messaging.list_report_callbacks(filter: %{"facility" => socket.assigns.facility, "status" => "opened"}))

      {"map::marker-clicked", marker} ->
          entity = MapMarker.from(marker)

          socket = if entity do
            socket
            |> fly_to(marker.location)
          else
            socket
          end

          socket
          |> assign(:focused_entity, entity)

      {"map::bounds-updated", bounds} ->
          socket = socket
          |> assign(:map_bounds, bounds)
          send(self(), :fetch_reports)
          socket

      _ -> socket
    end

    {:noreply, socket}
  end

  def handle_event("dev::reports::generate", %{"number" => number}, socket) do
    facility = socket.assigns.facility
    for _i <- 1..String.to_integer(number) do
      location = GeoMath.random_within(facility.location, GeoMath.Distance.km(2), min: 0.2)
      nuisance_type = Enum.random(Reporting.list_nuisances_types())
      nuisance_level = Enum.random(1..10)

      Reporting.create_report(%{nuisance_type_id: nuisance_type.id, nuisance_level: nuisance_level}, pre_validations: [
        &(cast_location(&1, location))
      ])
    end
    {:noreply, socket}
  end

  def handle_event("action_panel::toggle", _, socket) do
    {:noreply, assign(socket, :display_action_panel, not socket.assigns.display_action_panel)}
  end

  def handle_event("form::report_callback::toggle", _, socket) do
    {:noreply,
      socket
      |> assign(:display_report_callback_form, not socket.assigns.display_report_callback_form)
    }
  end

  def handle_event("form::report_callback::validate", %{"report_callback" => report_callback_params}, socket) do
    changeset = %ReportCallback{}
    |> Messaging.change_report_callback(report_callback_params, pre_validations: [&(cast_report_callback_remaining_parameters(&1, socket))])
    |> Map.put(:action, :insert)

    socket = socket
    |> assign(:report_callback_changeset, changeset)
    {:noreply, socket}
  end

  def handle_event("form::report_callback::submit", %{"report_callback" => report_callback_params}, socket) do
    pre_validations = [&(cast_report_callback_remaining_parameters(&1, socket))]

    result = Messaging.create_report_callback(report_callback_params, pre_validations: pre_validations)

    socket = case result do
      {:ok, _report} ->
        socket
        |> put_flash(:info, "Report callback created successfully")
        |> assign(:display_report_callback_form, false)

      {:error, changeset} ->
        socket
        |> assign(:report_callback_changeset, changeset)

    end

    {:noreply, socket}
  end

  def handle_event("report_callbacks::close", %{"report_callback_id" => report_callback_id}, socket) do
    report_callback = Messaging.get_report_callback!(report_callback_id)
    Messaging.update_report_callback(report_callback, %{"status" => "closed"})
    {:noreply, socket}
  end

  defp cast_report_callback_remaining_parameters(changeset, socket) do
    changeset = changeset
    |> Ecto.Changeset.put_change(:strategy, ReportCallback.during_facility_production)
    |> Ecto.Changeset.put_change(:facility_id, socket.assigns.facility.id)

    case Ecto.Changeset.get_change(changeset, :facility_production_id, nil) do
      nil -> if socket.assigns.current_production do
        changeset |> Ecto.Changeset.put_change(:facility_production_id, socket.assigns.current_production.id)
      else
        changeset |> Ecto.Changeset.add_error(:facility_production_id, "aucune production n'est en cours")
      end

      facility_production ->
        changeset |> Ecto.Changeset.put_change(:facility_production_id, facility_production.id)
    end
  end

  def handle_event("production::toggle", _, socket) do
    Facilities.toggle_production(socket.assigns.facility)
    {:noreply, socket}
  end

  def handle_event("form::history::change", %{"history_selector" => history_selector_params}, socket) do
    socket = with {:ok, history} <- HistorySelector.create(history_selector_params, tz: socket.assigns.tz) do
      socket = socket
      |> assign(:history, history)
      |> assign(:history_changeset, HistorySelector.changeset(history, %{}))
      send(self(), :fetch_reports)
      socket
    else
      {:error, _changeset} ->
        socket
    end
    {:noreply, socket}
  end

  def handle_event("form::history::toggle", _, socket) do
    socket = socket
    |> assign(:display_history_form, not socket.assigns.display_history_form)

    socket = if !socket.assigns.display_history_form do
      socket
      |> assign(:history, nil)
      |> assign(:history_changeset, HistorySelector.changeset(%HistorySelector{}, %{}))
    else
      socket
    end
    {:noreply, socket}
  end
end
