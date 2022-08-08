defmodule SignuisWeb.Mixins.Map do
  defmacro __using__(_opts \\ []) do
    quote do
      defp init_map(socket, _params, _session) do
        socket
        |> assign(:markers, [])
      end

      def set_markers(socket, markers) do
        socket
        |> assign(:markers, markers)
        |> push_event("map::markers-updated", %{})
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
