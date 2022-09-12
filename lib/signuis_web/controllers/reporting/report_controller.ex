defmodule SignuisWeb.Reporting.ReportController do
  use SignuisWeb, :controller

  alias Signuis.Reporting

  def index(conn, params) do
    filter = Map.get(params, "filter", %{})
    page = Map.get(params, "page", %{})

    %{elements: reports, pagination: pagination} = Reporting.paginate_reports(
      filter: Map.merge(filter, %{"user" => conn.assigns.current_user}),
      page: page,
      preload: [:nuisance_type]
    )

    conn
    |> assign(:reports, reports)
    |> assign(:pagination, pagination)
    |> assign(:filter, filter)
    |> render("index.html")
  end
end
