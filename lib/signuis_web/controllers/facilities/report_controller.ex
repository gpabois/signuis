defmodule SignuisWeb.Facilities.ReportController do
  use SignuisWeb, :controller

  alias Signuis.Facilities

  def index(conn, %{"facility_id" => facility_id} = args) do
    facility = Facilities.get_facility!(facility_id)
    facilities_reports_count = Facilities.count_facilities_reports(facility)

    page = Map.get(args, "page", 1)
    max_page = (facilities_reports_count / 50) + (if rem(facilities_reports_count, 50) > 0, do: 1, else: 0)

    facilities_reports = Facilities.list_facilities_reports(facility, chunk: {page - 1, 50})

    render(conn,
      "index.html",
      facility: facility,
      facilities_reports: facilities_reports,
      page: page,
      max_page: max_page
    )
  end

end
