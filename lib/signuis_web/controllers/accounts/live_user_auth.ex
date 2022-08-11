defmodule SignuisWeb.Accounts.LiveUserAuth do
  import Phoenix.LiveView

  alias Signuis.Accounts
  # alias SignuisWeb.Router.Helpers, as: Routes

  def on_mount(:assign_current_user, _params, session, socket) do
    socket = socket
    |> assign_current_user(session)
    |> assign_current_session_id(session)

    {:cont, socket}
  end

  defp unique_session_id() do
    :crypto.strong_rand_bytes(16) |> Base.encode16()
  end

  defp assign_current_session_id(socket, session) do
    case session do
      %{"session_id" => session_id} ->
        assign_new(socket, :current_session_id, fn -> session_id end)
    end
  end

  defp assign_current_user(socket, session) do
    case session do
      %{"user_token" => user_token} ->
        user = Accounts.get_user_by_session_token(user_token)
        assign_new(socket, :current_user, fn -> user end)
      %{} ->
        assign_new(socket, :current_user, fn -> nil end)
    end
  end
end
