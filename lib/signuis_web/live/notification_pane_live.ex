defmodule SignuisWeb.Notifications.NotificationPaneLive do
  use SignuisWeb, :live_view
  use SignuisWeb.Mixins.Map

  alias Signuis.Notifications
  alias Signuis.Accounts.{User, Anonymous}
  def mount(_params, _session, socket) do
    filter = %{"user" => socket.assigns.current_user}

    case socket.assigns.current_user do
      %Anonymous{id: id} ->
        Phoenix.PubSub.subscribe(Signuis.PubSub, "sessions::#{id}")
      %User{id: id} ->
        Phoenix.PubSub.subscribe(Signuis.PubSub, "users::#{id}")
    end

    {:ok,
      socket
      |> assign(:filter, filter)
      |> load_status(),
      layout: {SignuisWeb.LayoutView, "nowrap.live.html"}
    }
  end

  def load_status(socket) do
    socket
    |> assign(:last_notifications, Notifications.list_notifications(filter: Map.merge(socket.assigns.filter, %{"read" => false}), preload: [:message, message: [:from_facility]]))
    |> assign(:unread_notifications_count, Notifications.count_notifications(filter: Map.merge(socket.assigns.filter, %{"read" => false})))
  end

  def handle_info(event, socket) do
    socket = case event do
      {:new_notification, _} ->
        socket
        |> load_status()
      {:updated_notification, _} ->
          socket
          |> load_status()
      _ -> socket
    end

    {:noreply, socket}
  end

  def handle_event("notification::clicked", %{"notification" => notification_id}, socket) do
    notification = Notifications.get_notification!(notification_id)
    Notifications.update_notification(notification, %{"read" => true})

    socket = cond do
      notification.message != nil ->
        redirect(socket, to: Routes.messaging_live_path(socket, SignuisWeb.Messaging.MailboxLive))
      true ->
        socket
    end

    {:noreply, socket}
  end

end
