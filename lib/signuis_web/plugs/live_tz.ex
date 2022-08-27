defmodule SignuisWeb.Plugs.LiveTz do
  import Phoenix.LiveView

  @default_tz "Europe/Paris"

  def on_mount(:assign_tz, _params, session, socket) do
    {:cont, assign(socket, :tz, @default_tz)}
  end
end
