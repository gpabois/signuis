defmodule SignuisWeb.Administration.DashboardController do
  use SignuisWeb, :controller

  def show(conn, _params) do
    conn
    |> render("show.html")
  end
end
