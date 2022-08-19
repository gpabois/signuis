defmodule Signuis.EventTypes do

  def new_report(report), do: Phoenix.PubSub.broadcast(Signuis.PubSub, "reports", {:new_report, report})

  def new_reports(reports), do: Phoenix.PubSub.broadcast(Signuis.PubSub, "reports", {:new_reports, reports})

  def new_assigned_report(facility, report) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities", {:new_assigned_report, report, facility})
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{facility.id}", {:new_assigned_report, report})
  end

  def new_assigned_reports(facility, reports) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities", {:new_assigned_reports, reports, facility})
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{facility.id}", {:new_assigned_reports, reports})
  end

  def begin_production(facility, production) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities", {:begin_facility_production, production, facility})
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{facility.id}", {:begin_facility_production, production})
  end

  def end_production(facility, production) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities", {:end_facility_production, production, facility})
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{facility.id}", {:end_facility_production, production})
  end

  def new_message(message) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "messaging", {:new_message, message})
    cond do
      message.to_user_id ->
        Phoenix.PubSub.broadcast(Signuis.PubSub, "users::#{message.to_user_id}", {:new_message, message})
      message.to_facility_id ->
        Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{message.to_facility_id}", {:new_message, message})
      message.to_session_id ->
        Phoenix.PubSub.broadcast(Signuis.PubSub, "sessions::#{message.to_session_id}", {:new_message, message})
      true ->
        %{}
    end
  end

  def new_messages(messages) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "messaging", {:new_messages, messages})

    user_messages = Enum.filter(messages, &(&1.to_user_id != nil))
    session_messages = Enum.filter(messages, &(&1.to_session_id != nil))

    for {user_id, messages} <- Enum.group_by(user_messages, &(&1.to_user_id)) do
      Phoenix.PubSub.broadcast(Signuis.PubSub, "users::#{user_id}", {:new_messages, messages})
    end

    for {session_id, messages} <- Enum.group_by(session_messages, &(&1.to_session_id)) do
      Phoenix.PubSub.broadcast(Signuis.PubSub, "sessions::#{session_id}", {:new_messages, messages})
    end
  end

  def new_notification(notification) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "notifications", {:new_notification, notification})
    cond do
      notification.user_id ->
        Phoenix.PubSub.broadcast(Signuis.PubSub, "users::#{notification.user_id}", {:new_notification, notification})
      notification.session_id ->
        Phoenix.PubSub.broadcast(Signuis.PubSub, "sessions::#{notification.session_id}", {:new_notification, notification})
      true -> %{}
    end
  end

  def new_notifications(notifications) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "notifications", {:new_notifications, notifications})

    for notification <- notifications do
      cond do
        notification.user_id ->
          Phoenix.PubSub.broadcast(Signuis.PubSub, "users::#{notification.user_id}", {:new_notification, notification})
        notification.session_id ->
          Phoenix.PubSub.broadcast(Signuis.PubSub, "sessions::#{notification.session_id}", {:new_notification, notification})
        true -> %{}
      end
    end
  end

  def updated_notification(notification) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "notifications", {:updated_notification, notification})
    cond do
      notification.user_id ->
        Phoenix.PubSub.broadcast(Signuis.PubSub, "users::#{notification.user_id}", {:updated_notification, notification})
      notification.session_id ->
        Phoenix.PubSub.broadcast(Signuis.PubSub, "sessions::#{notification.session_id}", {:updated_notification, notification})
    end
  end

  def new_report_callback(report_callback) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "messaging", {:new_report_callback, report_callback})
    if report_callback.facility_id do
      Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{report_callback.facility_id}", {:new_report_callback, report_callback})
    end
  end

  def updated_report_callback(report_callback) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "messaging", {:updated_report_callback, report_callback})
    if report_callback.facility_id do
      Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{report_callback.facility_id}", {:updated_report_callback, report_callback})
    end
  end

end
