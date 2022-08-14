defmodule SignuisWeb.Reporting.ReportController do
  use SignuisWeb, :controller

  alias Signuis.Reporting

  def index(conn, _params) do
    filter = %{"user" => conn.assigns.user}
    reports = Reporting.list_reports(filter: filter, preload: [:nuisance_type])
    render(conn, "index.html", reports: reports)
  end
end
