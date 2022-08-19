defmodule Signuis.Notifications.Servers.Messages do
  use GenServer

  alias Signuis.Notifications
  alias Signuis.Notifications.Notification
  alias Signuis.Repo

  def start_link(_) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  def init(init) do
    #Logger.info("[Signuis] Starting #{__MODULE__ |> to_string}")
    Phoenix.PubSub.subscribe(Signuis.PubSub, "messaging")
    {:ok, init}
  end

  defp new_message_notification_params(message) do
    to = cond do
      message.to_user_id ->
        %{"user_id" => message.to_user_id}
      message.to_session_id ->
        %{"session_id" => message.to_session_id}
      true ->
        %{}
    end

    Map.merge(to, %{
      "type" => Notification.new_message,
      "message_id" => message.id
    })
  end

  @impl true
  def handle_info(event, state) do
    state = case event do
      {:new_message, message} ->
        notifications_params = new_message_notification_params(message)
        Notifications.create_notification(notifications_params)
        state
      {:new_messages, messages} ->
        for message <- messages, reduce: Ecto.Multi.new() do
          multi -> Notifications.multi_create_notification(multi, new_message_notification_params(message))
        end
        |> Repo.transaction
        |> Notifications.notify_new_notifications()
        state
      _ -> state
    end
    {:noreply, state}
  end
end
