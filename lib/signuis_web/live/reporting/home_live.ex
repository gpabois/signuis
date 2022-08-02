defmodule SignuisWeb.Reporting.HomeLive do
  use SignuisWeb, :live_view

  import Signuis.Utils
  alias SignuisWeb.MapMarker

  def mount(_params, _session, socket) do
    {:ok,
      socket
      |> assign(:markers, [])
      |> assign(:location, nil)
    }
  end

  def update_markers(socket) do
    markers = []

    markers = markers ++ if socket.assigns.location do
      [%MapMarker{id: "anonymous", type: "user", location: socket.assigns.location}]
    else
      []
    end

    socket
    |> assign(:markers, markers)
    |> push_event("map::markers-updated", %{})
  end

  def handle_event("map::marker-clicked", marker, socket) do
    {:noreply, socket}
  end

  def handle_event("map::bounds-updated", bounds, socket) do
    bounds = decode_js_bounds(bounds)
    {:noreply, socket}
  end

  def handle_event("geolocation::position-updated", position, socket) do
    position = decode_js_position(position)
    {:noreply,
      socket
      |> assign(:location, position)
      |> update_markers
    }
  end

end
