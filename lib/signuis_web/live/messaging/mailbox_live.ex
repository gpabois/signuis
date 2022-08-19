defmodule SignuisWeb.Messaging.MailboxLive do
  use SignuisWeb, :live_view

  alias Signuis.Messaging
  alias Signuis.Accounts.{User, Anonymous}

  def mount(_params, _session, socket) do
     case socket.assigns.current_user do
      %Anonymous{id: id} ->
        Phoenix.PubSub.subscribe(Signuis.PubSub, "sessions::#{id}")
      %User{id: id} ->
        Phoenix.PubSub.subscribe(Signuis.PubSub, "users::#{id}")
    end

    {:ok,
      socket
      |> load_messages
    }
  end

  defp load_messages(socket) do
    filter = %{"to" => socket.assigns.current_user}
    messages = Messaging.list_messages(filter: filter, preload: [:from_facility, :from_user])
    assign(socket, :messages, messages)
  end

  def handle_info(event, socket) do
    socket = case event do
      {:new_message, _} -> load_messages(socket)
      {:new_messages, _} -> load_messages(socket)
      _ -> socket
    end

    {:noreply, socket}
  end

  def handle_event("messages::delete_all", _, socket) do
    Messaging.delete_all_messages(filter: %{"to" => socket.assigns.current_user})
    {:noreply, load_messages(socket)}
  end

end
