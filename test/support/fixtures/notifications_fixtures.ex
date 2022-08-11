defmodule Signuis.NotificationsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Signuis.Notifications` context.
  """

  @doc """
  Generate a notification.
  """
  def notification_fixture(attrs \\ %{}) do
    {:ok, notification} =
      attrs
      |> Enum.into(%{
        session_id: "some session_id",
        type: "some type"
      })
      |> Signuis.Notifications.create_notification()

    notification
  end
end
