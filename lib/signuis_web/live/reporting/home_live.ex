defmodule SignuisWeb.Reporting.HomeLive do
  use SignuisWeb, :live_view
  use SignuisWeb.Mixins.Map
  use SignuisWeb.Mixins.Geolocation

  alias SignuisWeb.MapMarker
  alias Signuis.Facilities

  def mount(params, session, socket) do
    {:ok,
      socket
      |> assign(:facilities, [])
      |> init_map(params, session)
      |> assign(:location, nil)
    }
  end

  def update_markers(socket) do
    markers = []

    markers = markers ++ if socket.assigns.location do
      [%MapMarker{id: "anonymous", type: "user", location: socket.assigns.location, object: nil}]
    else
      []
    end

    markers = markers ++ Enum.map(socket.assigns.facilities, &MapMarker.to/1)

    socket
    |> set_markers(markers)
  end

  def handle_info({"map::marker-clicked", _marker}, socket) do
    {:noreply, socket}
  end

  def handle_info({"map::bounds-updated", bounds}, socket) do
    {:noreply,
      socket
      |> assign(:facilities, Facilities.list_facilities(filter: [bounds: bounds]))
      |> update_markers
    }
  end

  def handle_info({"geolocation::position-updated", position}, socket) do
    {:noreply,
      socket
      |> assign(:location, position)
      |> update_markers()
    }
  end

end
