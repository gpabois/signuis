defmodule Signuis.NotificationsTest do
  use Signuis.DataCase

  alias Signuis.Notifications

  describe "notifications" do
    alias Signuis.Notifications.Notification

    import Signuis.NotificationsFixtures

    @invalid_attrs %{session_id: nil, type: nil}

    test "list_notifications/0 returns all notifications" do
      notification = notification_fixture()
      assert Notifications.list_notifications() == [notification]
    end

    test "get_notification!/1 returns the notification with given id" do
      notification = notification_fixture()
      assert Notifications.get_notification!(notification.id) == notification
    end

    test "create_notification/1 with valid data creates a notification" do
      valid_attrs = %{session_id: "some session_id", type: "some type"}

      assert {:ok, %Notification{} = notification} = Notifications.create_notification(valid_attrs)
      assert notification.session_id == "some session_id"
      assert notification.type == "some type"
    end

    test "create_notification/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Notifications.create_notification(@invalid_attrs)
    end

    test "update_notification/2 with valid data updates the notification" do
      notification = notification_fixture()
      update_attrs = %{session_id: "some updated session_id", type: "some updated type"}

      assert {:ok, %Notification{} = notification} = Notifications.update_notification(notification, update_attrs)
      assert notification.session_id == "some updated session_id"
      assert notification.type == "some updated type"
    end

    test "update_notification/2 with invalid data returns error changeset" do
      notification = notification_fixture()
      assert {:error, %Ecto.Changeset{}} = Notifications.update_notification(notification, @invalid_attrs)
      assert notification == Notifications.get_notification!(notification.id)
    end

    test "delete_notification/1 deletes the notification" do
      notification = notification_fixture()
      assert {:ok, %Notification{}} = Notifications.delete_notification(notification)
      assert_raise Ecto.NoResultsError, fn -> Notifications.get_notification!(notification.id) end
    end

    test "change_notification/1 returns a notification changeset" do
      notification = notification_fixture()
      assert %Ecto.Changeset{} = Notifications.change_notification(notification)
    end
  end
end
