defmodule Signuis.Notifications.Notification do
  use Ecto.Schema
  import Ecto.Changeset

  schema "notifications" do
    field :session_id, :string
    field :type, :string
    field :user_id, :id
    field :message_id, :id

    timestamps()
  end

  @doc false
  def changeset(notification, attrs) do
    notification
    |> cast(attrs, [:session_id, :type])
    |> validate_required([:session_id, :type])
  end
end
