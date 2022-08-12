defmodule Signuis.Notifications.Servers.Messages do
  use GenServer

  alias Signuis.Notifications
  alias Signuis.Notifications.Notification

  def start_link(_) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  def init(init) do
    #Logger.info("[Signuis] Starting #{__MODULE__ |> to_string}")
    Phoenix.PubSub.subscribe(Signuis.PubSub, "messaging")
    {:ok, init}
  end

  @impl true
  def handle_info(event, state) do
    state = case event do
      {:new_message, message} ->
        # Automatically notify the receiver of the message
        to = cond do
          message.to_user_id ->
            %{"user_id" => message.to_user_id}
          message.to_session_id ->
            %{"session_id" => message.to_session_id}
        end

        notifications_params = Map.merge(to, %{
          "type" => Notification.new_message,
          "message_id" => message.id
        })

        Notifications.create_notification(notifications_params)
        state
      _ -> state
    end
    {:noreply, state}
  end
end
