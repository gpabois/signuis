defmodule SignuisWeb.Messaging.MessageController do
  use SignuisWeb, :controller

  alias Signuis.Messaging

  def index(conn, _params) do
    filter = case conn.assigns do
      %{current_user: current_user} when not is_nil(current_user) ->
        %{"to_user_id" => current_user.id}
      %{current_session_id: session_id} ->
        %{"to_session_id" => session_id}
    end

    messages = Messaging.list_messages(filter: filter)

    conn
    |> assign(:messages, messages)
    |> render("index.html")
  end

  def show(conn, %{"id" => id}) do
    message = Messaging.get_message!(id)
    render(conn, "show.html", message: message)
  end
end
