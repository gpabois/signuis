defmodule SignuisWeb.Plugs.SessionId do

  @behaviour Plug

  import Plug.Conn

  @impl true
  def init(default), do: default

  @impl true
  def call(conn, _config) do
    case get_session(conn, :session_id) do
      nil ->
        session_id = unique_session_id()
        conn
        |> put_session(:session_id, session_id)
        |> assign(:current_session_id, session_id)
      session_id ->
        conn
        |> assign(:current_session_id, session_id)
    end
  end

  defp unique_session_id() do
    :crypto.strong_rand_bytes(64) |> Base.url_encode64()
  end
end
