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
      |> assign(:last_notifications, Notifications.list_notifications(filter: filter))
      |> assign(:unread_notifications_count, Notifications.count_notifications(filter: Map.merge(filter, %{"read" => false}))),
      layout: {SignuisWeb.LayoutView, "nowrap.live.html"}
    }
  end

  def handle_info(event, socket) do
    socket = case event do
      {:new_notification, _} ->
        socket
        |> assign(:last_notifications, Notifications.list_notifications(filter: socket.assigns.filter))
        |> assign(:unread_notifications_count, Notifications.count_notifications(filter: Map.merge(socket.assigns.filter, %{"read" => false})))
      {:updated_notification, _} ->
          socket
          |> assign(:last_notifications, Notifications.list_notifications(filter: socket.assigns.filter))
          |> assign(:unread_notifications_count, Notifications.count_notifications(filter: Map.merge(socket.assigns.filter, %{"read" => false})))
      _ -> socket
    end

    {:noreply, socket}
  end

  def handle_event("notification::clicked", %{"notification" => notification_id}, socket) do
    notif = Notifications.get_notification!(notification_id)
    Notifications.update_notification(notif, %{"read" => true})
    {:noreply, socket}
  end

end
