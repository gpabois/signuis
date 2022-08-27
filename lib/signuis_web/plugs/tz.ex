defmodule SignuisWeb.Plugs.Tz do

  @behaviour Plug

  import Plug.Conn

  @default_tz "Europe/Paris"

  @impl true
  def init(default), do: default

  @impl true
  def call(conn, _config) do
    assign(conn, :tz, @default_tz)
  end

end
