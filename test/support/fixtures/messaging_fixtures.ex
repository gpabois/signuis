defmodule Signuis.MessagingFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Signuis.Messaging` context.
  """

  @doc """
  Generate a message.
  """
  def message_fixture(attrs \\ %{}) do
    {:ok, message} =
      attrs
      |> Enum.into(%{
        contenu: "some contenu",
        from_session_id: "some from_session_id",
        titre: "some titre",
        to_session_id: "some to_session_id"
      })
      |> Signuis.Messaging.create_message()

    message
  end

  @doc """
  Generate a callback.
  """
  def callback_fixture(attrs \\ %{}) do
    {:ok, callback} =
      attrs
      |> Enum.into(%{
        contenu: "some contenu",
        strategy: "some strategy",
        titre: "some titre"
      })
      |> Signuis.Messaging.create_callback()

    callback
  end

  @doc """
  Generate a report_callback_ack.
  """
  def report_callback_ack_fixture(attrs \\ %{}) do
    {:ok, report_callback_ack} =
      attrs
      |> Enum.into(%{

      })
      |> Signuis.Messaging.create_report_callback_ack()

    report_callback_ack
  end
end
