defmodule SignuisWeb.Facilities.ReportController do
  use SignuisWeb, :controller

  alias Signuis.Facilities
  alias Signuis.Reporting

  def index(conn, %{"facility_id" => facility_id} = args) do
    facility = Facilities.get_facility!(facility_id)
    filter = Map.get(args, "filter", %{})
    page = Map.get(args, "page", %{})

    %{elements: reports, pagination: pagination} = Reporting.paginate_reports(
      filter: Map.merge(filter, %{"facility" => facility}),
      page: page,
      preload: [:nuisance_type]
    )

    conn
    |> assign(:filter, filter)
    |> assign(:facility, facility)
    |> assign(:reports, reports)
    |> assign(:pagination, pagination)
    |> SignuisWeb.Facilities.FacilityController.nav
    |> render("index.html")
  end

end
