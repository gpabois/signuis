defmodule SignuisWeb.Mixins.Map do
  defmacro __using__(_opts \\ []) do
    quote do
      defp init_map(socket, _params, _session) do
        socket
        |> assign(:markers, [])
        |> assign(:heatmap_cells, [])
      end

      def fly_to(socket, %Geo.Point{coordinates: {lat, long}}) do
        socket
        |> push_event("map::fly-to", %{
          coordinates: %{
            lat: lat,
            long: long
          },
          srid: 4326
        })
      end

      def set_map_data(socket, data) do
        markers = Enum.filter(data, &(case &1 do
          %SignuisWeb.MapMarker{} -> true
          _ -> false
        end))

        heatmap_cells = Enum.filter(data, &(case &1 do
          %SignuisWeb.HeatmapCell{} -> true
          _ -> false
        end))

        socket
        |> assign(:markers, markers)
        |> assign(:heatmap_cells, heatmap_cells)
        |> push_event("map::data-updated", %{})
      end

      def handle_event("map::marker-clicked", %{"id" => id, "type" => type}, socket) do
        id = case Integer.parse(id) do
          :error -> id
          {id, _} -> id
        end

        case Enum.find(socket.assigns.markers, fn m -> m.id == id and m.type == String.to_existing_atom(type) end) do
          nil -> {}
          marker -> send(self(), {"map::marker-clicked", marker})
        end
        {:noreply, socket}
      end

      def handle_event("map::bounds-updated", bounds, socket) do
        bounds = Signuis.Utils.decode_js_bounds(bounds)
        send(self(), {"map::bounds-updated", bounds})
        {:noreply, socket}
      end
    end
  end
end
