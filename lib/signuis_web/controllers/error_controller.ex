defmodule SignuisWeb.ErrorController do
  use SignuisWeb, :controller

  def e403(conn, _params) do
    render(conn, "403.html")
  end
end
