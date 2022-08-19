

defmodule SignuisWeb.Dev.ToolboxLive do
  use SignuisWeb, :live_view

  alias Signuis.Dev.ReportCommand
  alias Signuis.Reporting

  def mount(_params, _session, socket) do
    {:ok,
      socket
      |> assign(:users, Signuis.Accounts.list_users())
      |> assign(:facilities, Signuis.Facilities.list_facilities())
      |> assign(:report_command_changeset, ReportCommand.changeset(%ReportCommand{}, %{}))
    }
  end

  def handle_event(event, params, socket) do
    socket = case {event, params} do
      {"reports::delete_all", _} ->
        Reporting.delete_all_reports()
        socket
      {"form::report_command::submit", %{"report_command" => report_command_params}} ->
        Task.start(fn -> ReportCommand.execute(report_command_params) end)
        socket
    end
    {:noreply, socket}
  end
end
