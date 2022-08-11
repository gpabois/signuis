defmodule Signuis.MessagingTest do
  use Signuis.DataCase

  alias Signuis.Messaging

  describe "messages" do
    alias Signuis.Messaging.Message

    import Signuis.MessagingFixtures

    @invalid_attrs %{contenu: nil, from_session_id: nil, titre: nil, to_session_id: nil}

    test "list_messages/0 returns all messages" do
      message = message_fixture()
      assert Messaging.list_messages() == [message]
    end

    test "get_message!/1 returns the message with given id" do
      message = message_fixture()
      assert Messaging.get_message!(message.id) == message
    end

    test "create_message/1 with valid data creates a message" do
      valid_attrs = %{contenu: "some contenu", from_session_id: "some from_session_id", titre: "some titre", to_session_id: "some to_session_id"}

      assert {:ok, %Message{} = message} = Messaging.create_message(valid_attrs)
      assert message.contenu == "some contenu"
      assert message.from_session_id == "some from_session_id"
      assert message.titre == "some titre"
      assert message.to_session_id == "some to_session_id"
    end

    test "create_message/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Messaging.create_message(@invalid_attrs)
    end

    test "update_message/2 with valid data updates the message" do
      message = message_fixture()
      update_attrs = %{contenu: "some updated contenu", from_session_id: "some updated from_session_id", titre: "some updated titre", to_session_id: "some updated to_session_id"}

      assert {:ok, %Message{} = message} = Messaging.update_message(message, update_attrs)
      assert message.contenu == "some updated contenu"
      assert message.from_session_id == "some updated from_session_id"
      assert message.titre == "some updated titre"
      assert message.to_session_id == "some updated to_session_id"
    end

    test "update_message/2 with invalid data returns error changeset" do
      message = message_fixture()
      assert {:error, %Ecto.Changeset{}} = Messaging.update_message(message, @invalid_attrs)
      assert message == Messaging.get_message!(message.id)
    end

    test "delete_message/1 deletes the message" do
      message = message_fixture()
      assert {:ok, %Message{}} = Messaging.delete_message(message)
      assert_raise Ecto.NoResultsError, fn -> Messaging.get_message!(message.id) end
    end

    test "change_message/1 returns a message changeset" do
      message = message_fixture()
      assert %Ecto.Changeset{} = Messaging.change_message(message)
    end
  end

  describe "callbacks" do
    alias Signuis.Messaging.Callback

    import Signuis.MessagingFixtures

    @invalid_attrs %{contenu: nil, strategy: nil, titre: nil}

    test "list_callbacks/0 returns all callbacks" do
      callback = callback_fixture()
      assert Messaging.list_callbacks() == [callback]
    end

    test "get_callback!/1 returns the callback with given id" do
      callback = callback_fixture()
      assert Messaging.get_callback!(callback.id) == callback
    end

    test "create_callback/1 with valid data creates a callback" do
      valid_attrs = %{contenu: "some contenu", strategy: "some strategy", titre: "some titre"}

      assert {:ok, %Callback{} = callback} = Messaging.create_callback(valid_attrs)
      assert callback.contenu == "some contenu"
      assert callback.strategy == "some strategy"
      assert callback.titre == "some titre"
    end

    test "create_callback/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Messaging.create_callback(@invalid_attrs)
    end

    test "update_callback/2 with valid data updates the callback" do
      callback = callback_fixture()
      update_attrs = %{contenu: "some updated contenu", strategy: "some updated strategy", titre: "some updated titre"}

      assert {:ok, %Callback{} = callback} = Messaging.update_callback(callback, update_attrs)
      assert callback.contenu == "some updated contenu"
      assert callback.strategy == "some updated strategy"
      assert callback.titre == "some updated titre"
    end

    test "update_callback/2 with invalid data returns error changeset" do
      callback = callback_fixture()
      assert {:error, %Ecto.Changeset{}} = Messaging.update_callback(callback, @invalid_attrs)
      assert callback == Messaging.get_callback!(callback.id)
    end

    test "delete_callback/1 deletes the callback" do
      callback = callback_fixture()
      assert {:ok, %Callback{}} = Messaging.delete_callback(callback)
      assert_raise Ecto.NoResultsError, fn -> Messaging.get_callback!(callback.id) end
    end

    test "change_callback/1 returns a callback changeset" do
      callback = callback_fixture()
      assert %Ecto.Changeset{} = Messaging.change_callback(callback)
    end
  end

  describe "reports_callbacks_acks" do
    alias Signuis.Messaging.ReportCallbackAck

    import Signuis.MessagingFixtures

    @invalid_attrs %{}

    test "list_reports_callbacks_acks/0 returns all reports_callbacks_acks" do
      report_callback_ack = report_callback_ack_fixture()
      assert Messaging.list_reports_callbacks_acks() == [report_callback_ack]
    end

    test "get_report_callback_ack!/1 returns the report_callback_ack with given id" do
      report_callback_ack = report_callback_ack_fixture()
      assert Messaging.get_report_callback_ack!(report_callback_ack.id) == report_callback_ack
    end

    test "create_report_callback_ack/1 with valid data creates a report_callback_ack" do
      valid_attrs = %{}

      assert {:ok, %ReportCallbackAck{} = report_callback_ack} = Messaging.create_report_callback_ack(valid_attrs)
    end

    test "create_report_callback_ack/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Messaging.create_report_callback_ack(@invalid_attrs)
    end

    test "update_report_callback_ack/2 with valid data updates the report_callback_ack" do
      report_callback_ack = report_callback_ack_fixture()
      update_attrs = %{}

      assert {:ok, %ReportCallbackAck{} = report_callback_ack} = Messaging.update_report_callback_ack(report_callback_ack, update_attrs)
    end

    test "update_report_callback_ack/2 with invalid data returns error changeset" do
      report_callback_ack = report_callback_ack_fixture()
      assert {:error, %Ecto.Changeset{}} = Messaging.update_report_callback_ack(report_callback_ack, @invalid_attrs)
      assert report_callback_ack == Messaging.get_report_callback_ack!(report_callback_ack.id)
    end

    test "delete_report_callback_ack/1 deletes the report_callback_ack" do
      report_callback_ack = report_callback_ack_fixture()
      assert {:ok, %ReportCallbackAck{}} = Messaging.delete_report_callback_ack(report_callback_ack)
      assert_raise Ecto.NoResultsError, fn -> Messaging.get_report_callback_ack!(report_callback_ack.id) end
    end

    test "change_report_callback_ack/1 returns a report_callback_ack changeset" do
      report_callback_ack = report_callback_ack_fixture()
      assert %Ecto.Changeset{} = Messaging.change_report_callback_ack(report_callback_ack)
    end
  end
end
