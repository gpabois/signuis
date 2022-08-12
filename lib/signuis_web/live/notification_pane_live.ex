defmodule SignuisWeb.Notifications.NotificationPaneLive do
  use SignuisWeb, :live_view
  use SignuisWeb.Mixins.Map

  alias Signuis.Notifications

  def mount(_params, session, socket) do
    filter = case socket.assigns do
      %{current_user: current_user} when not is_nil(current_user) ->
        Phoenix.PubSub.subscribe(Signuis.PubSub, "users::#{current_user.id}")
        %{"user_id" => current_user.id}
      %{current_session_id: current_session_id} ->
        Phoenix.PubSub.subscribe(Signuis.PubSub, "sessions::#{current_session_id}")
        %{"session_id" => current_session_id}
    end

    {:ok,
      socket
      |> assign(:filter, filter)
      |> assign(:last_notifications, Notifications.list_notifications(filter: filter))
      |> assign(:unread_notifications_count, Notifications.count_notifications(filter: Map.merge(filter, %{"read" => false})))
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
