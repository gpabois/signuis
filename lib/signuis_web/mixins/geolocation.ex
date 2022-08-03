defmodule SignuisWeb.Mixins.Geolocation do
  defmacro __using__(_opts \\ []) do
    quote do
      def handle_event("geolocation::position-updated", position, socket) do
        position = Signuis.Utils.decode_js_position(position)
        send(self(), {"geolocation::position-updated", position})
        {:noreply, socket}
      end
    end
  end
end
