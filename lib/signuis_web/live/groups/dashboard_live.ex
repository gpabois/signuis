defmodule SignuisWeb.Groups.DashboardLive do
  use SignuisWeb, :live_view
  use SignuisWeb.Mixins.Map

  alias SignuisWeb.MapMarker
  alias SignuisWeb.HeatmapCell
  alias Signuis.{Groups, Facilities}
  alias Signuis.Reporting

  alias Signuis.Reporting.HistorySelector

  @grid_size 0.001

  def mount(%{"group_id" => group_id} = params, session, socket) do
    group = Groups.get_group!(group_id)

    socket = if permit?(Groups, {:access, :dashboard}, socket.assigns.current_user, group) do
      :timer.send_interval(10000, :fetch_reports)

      socket
      |> assign(:display_action_panel, false)
      |> assign(:display_history_form, false)
      |> assign(:history, nil)
      |> assign(:group, group)
      |> assign(:facilities, [])
      |> assign(:history_changeset, HistorySelector.changeset(%HistorySelector{}, %{}))
      |> assign(:report_heatmap, [])
      |> assign(:alive_reports_count, nil)
      |> assign(:map_bounds, nil)
      |> init_map(params, session)

    else
      socket |> redirect(to: "/403.html")
    end

    {:ok, socket, layout: {SignuisWeb.LayoutView, "nowrap.live.html"}}
  end

  def update_map(socket) do
    markers = Enum.map(socket.assigns.facilities, &MapMarker.to/1)
    heatmap_cells = []

    heatmap_cells = heatmap_cells ++ Enum.map(socket.assigns.report_heatmap, &HeatmapCell.to/1)

    socket
    |> set_map_data(markers ++ heatmap_cells)
  end

  def handle_info(event, socket) do
    alive_threshold_dt = DateTime.add(Timex.now(socket.assigns.tz), -1800, :second) # Now - 30 mn (Reports are alive during 30 minutes)

    socket = case event do
      :fetch_reports ->
          datetime_range =  if socket.assigns.history, do: socket.assigns.history, else: {alive_threshold_dt, nil}
          alive_reports_count = Reporting.count_reports(filter: %{
            "datetime_range" => datetime_range
          })

        if socket.assigns.map_bounds != nil do
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
          |> assign(:facilities, Facilities.list_facilities(filter: %{"bounds" =>  bounds, "valid" => true}))
          |> assign(:map_bounds, bounds)
          send(self(), :fetch_reports)
          socket

      _ -> socket
    end

    {:noreply, socket}
  end

  def handle_event("action_panel::toggle", _, socket) do
    {:noreply, assign(socket, :display_action_panel, not socket.assigns.display_action_panel)}
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
