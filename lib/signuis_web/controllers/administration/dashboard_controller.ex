defmodule SignuisWeb.Administration.DashboardController do
  use SignuisWeb, :controller

  def show(conn, _params) do
    if permit?(Administration, {:access, :dashboard}, conn.assigns.current_user) do
      conn
      |> render("show.html")
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end
end
