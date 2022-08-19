defmodule Signuis.Messaging.Servers.ReportCallback do
  use GenServer

  alias Signuis.Reporting.Report

  alias Signuis.Facilities.Facility

  alias Signuis.Messaging
  alias Signuis.Messaging.{ReportCallback, ReportCallbackAck}

  alias Signuis.Repo

  def start_link(_) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  def init(init) do
    Phoenix.PubSub.subscribe(Signuis.PubSub, "facilities")
    Phoenix.PubSub.subscribe(Signuis.PubSub, "messaging")

    Messaging.list_report_callbacks(filter: %{"status" => "opened"})
    |> process_reports_callbacks

    {:ok, init}
  end

  @impl true
  def handle_info(event, state) do
    state = case event do
      # New report callback, process the remaining reports
      {:new_report_callback, report_callback} ->
        process_report_callback(report_callback)
        state
      # Related to facility production
      # The production has ended
      {:end_facility_production, facility_production, _facility} ->
        reports_callbacks = Messaging.list_report_callbacks(filter: %{"facility_production" => facility_production, "status" => "opened"})
        process_reports_callbacks(reports_callbacks)
        state
      # A new report is produced, check if we need to call back
      {:new_assigned_report, %Report{} = report, %Facility{} = facility} ->
        report_callbacks = Messaging.list_report_callbacks(filter: %{"facility" => facility, "status" => "opened"})
        process_reports(report, report_callbacks)
        state
      {:new_assigned_reports, reports, %Facility{} = facility} ->
        reports_callbacks = Messaging.list_report_callbacks(filter: %{"facility" => facility, "status" => "opened"})
        process_reports(reports, reports_callbacks)
      _ -> state
    end

    {:noreply, state}
  end

  def process_reports_callbacks(reports_callbacks) do
    for report_callback <- reports_callbacks do
      process_report_callback(report_callback)
    end
  end

  def process_report_callback(%ReportCallback{} = report_callback) do
    process_remaining_reports(report_callback)

    # If we are done, we close the callback
    if ReportCallback.is_done?(report_callback) do
      Messaging.update_report_callback(report_callback, %{"status" => "done"})
    end
  end

  defp process_remaining_reports(%ReportCallback{} = report_callback) do
    reports = Messaging.get_remaining_reports(report_callback)
    process_reports(reports, report_callback)
  end

  defp generate_message_params(report, report_callback), do: %{
    title: report_callback.title,
    content: report_callback.content,

    to_user_id: report.user_id,
    to_session_id: report.session_id,

    from_facility_id: report_callback.facility_id
  }

  defp process_report(%Report{} = report, %ReportCallback{} = report_callback) do
    if not ReportCallback.has_called_back?(report_callback, report) do
      message_params = generate_message_params(report, report_callback)

      with {:ok, message} <- Messaging.create_message(message_params),
           {:ok, _ack} <- Messaging.create_report_callback_ack(%{"message_id" => message.id, "report_callback_id" => report_callback.id, "report_id" => report.id}) do
        :processed
      end
    else
      :already_processed
    end
  end

  defp generate_message_insert_command(report, report_callback), do:  {
    generate_message_params(report, report_callback),
    run_after: fn multi, message_insert_id ->
      Ecto.Multi.insert(
        multi,
        {:report_callback_ack, Signuis.Utils.uid(16)},
        fn catalog ->
          message = catalog[message_insert_id]
          Messaging.change_report_callback_ack(%ReportCallbackAck{}, %{
            message_id: message.id,
            report_id: report.id,
            report_callback_id: report_callback.id
          })
        end)
    end
  }

  defp process_reports(reports, report_callbacks) when is_list(report_callbacks) do
    for report_callback <- report_callbacks, reduce: Ecto.Multi.new() do
      multi ->
        reports = ReportCallback.filter_not_called_back(report_callback, reports)
        messages_inserts_commands = Enum.map(reports, &generate_message_insert_command(&1, report_callback))
        Messaging.multi_create_messages(multi, messages_inserts_commands)
    end
    |> Repo.transaction
    |> Messaging.notify_new_messages
  end

  defp process_reports(reports, %ReportCallback{} = report_callback) do
    reports = ReportCallback.filter_not_called_back(report_callback, reports)
    messages_inserts_commands = Enum.map(reports, &generate_message_insert_command(&1, report_callback))

    Ecto.Multi.new()
    |> Messaging.multi_create_messages(messages_inserts_commands)
    |> Repo.transaction
    |> Messaging.notify_new_messages
  end
end
