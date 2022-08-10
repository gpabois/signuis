defmodule SignuisWeb.Reporting.HomeLive do
  use SignuisWeb, :live_view
  use SignuisWeb.Mixins.Map
  use SignuisWeb.Mixins.Geolocation

  alias SignuisWeb.MapMarker
  alias Signuis.Facilities
  alias Signuis.Reporting
  alias Signuis.Reporting.Report

  def mount(params, session, socket) do
    choices_nuisance_types = Reporting.list_nuisances_types
    |> Enum.map(&{&1.label, &1.id})

    {:ok,
      socket
      |> assign(:current_user, nil)
      |> assign(:facilities, [])
      |> assign(:focused_entity, nil)
      |> assign(:location, nil)
      |> assign(:report_changeset, Reporting.change_report(%Report{}, %{}))
      |> assign(:choices_nuisance_types, choices_nuisance_types)
      |> assign(:display_report_form, false)
      |> init_map(params, session)
    }
  end
  def update_map(socket) do
    markers = []

    markers = markers ++ if socket.assigns.location do
      [%MapMarker{id: "anonymous", type: "user", location: socket.assigns.location, object: nil}]
    else
      []
    end

    markers = markers ++ Enum.map(socket.assigns.facilities, &MapMarker.to/1)

    socket
    |> set_map_data(markers)
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
      |> update_map
    }
  end

  def handle_info({"geolocation::position-updated", position}, socket) do
    # If it is the first location we get, we fly to it.
    socket = if socket.assigns.location == nil do
      socket
      |> fly_to(position)
    else
      socket
    end

    socket = socket
    |> assign(:location, position)
    |> update_map

    {:noreply, socket}
  end

end
