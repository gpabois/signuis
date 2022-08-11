defmodule SignuisWeb.Reporting.ReportController do
  use SignuisWeb, :controller

  alias Signuis.Reporting

  def index(conn, _params) do
    filter = case conn.assigns do
      %{current_user: current_user} when not is_nil(current_user) ->
        %{"user_id" => current_user.id}
      %{current_session_id: session_id} ->
        %{"session_id" => session_id}
    end

    reports = Reporting.list_reports(filter: filter, preload: [:nuisance_type])
    render(conn, "index.html", reports: reports)
  end
end
