defmodule SignuisWeb.Messaging.MessageController do
  use SignuisWeb, :controller

  alias Signuis.Messaging

  def index(conn, _params) do
    filter = %{"to" => conn.assigns.current_user}
    messages = Messaging.list_messages(filter: filter, preload: [:from_facility, :from_user])

    conn
    |> assign(:messages, messages)
    |> render("index.html")
  end

  def show(conn, %{"id" => id}) do
    message = Messaging.get_message!(id)
    render(conn, "show.html", message: message)
  end
end
