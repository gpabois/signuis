defmodule SignuisWeb.LayoutView do
  use SignuisWeb, :view

  # Phoenix LiveDashboard is available only in development by default,
  # so we instruct Elixir to not warn if the dashboard route is missing.
  @compile {:no_warn_undefined, {Routes, :live_dashboard_path, 2}}

  def js_view_name(conn) do
    if conn.private |> Map.has_key?(:phoenix_live_view) do
      {tpl_name, _, _} = conn.private.phoenix_live_view

      [
        "",
        tpl_name
        |> to_string
        |> String.split(".")
        |> Enum.reverse
        |> Enum.at(0)
      ]
    else
      [view_name(conn), template_name(view_template(conn))]
    end
    |> Enum.reverse()
    |> List.insert_at(0, "view")
    |> Enum.map(&Inflex.camelize/1)
    |> Enum.reverse()
    |> Enum.join("")
  end

  defp view_name(conn) do
    conn
    |> view_module()
    |> Phoenix.Naming.resource_name()
    |> String.replace("_view", "")
  end

  defp template_name(template) when is_binary(template) do
    template
    |> String.split(".")
    |> Enum.at(0)
  end
end
