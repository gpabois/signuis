defmodule SignuisWeb.Components.Map do
  use Phoenix.Component

  @default_location %Geo.Point{coordinates: {48.866667, 2.333333}, srid: 4326}

  def map(assigns) do
    %Geo.Point{coordinates: {center_lat, center_lng}, srid: 4326} = Map.get(assigns, :center, @default_location)
    classes = Map.get(assigns, :classes, []) |> Enum.join(" ")
    markers = Map.get(assigns, :markers, [])
    id = Map.get(assigns, :id, "")
    phx_hook = Map.get(assigns, :"phx-hook", "")

    ~H"""
    <leaflet-map id={id} phx-hook={phx_hook} lat={center_lat} class={classes} lng={center_lng}>
      <%= for marker <- markers do %>
      <.marker slot={marker.slot} data-id={marker.id} data-type={marker.type} location={marker.location}/>
      <% end %>
    </leaflet-map>
    """
  end

  def marker(assigns) do
    %Geo.Point{coordinates: {lat, lng}, srid: 4326} = Map.get(assigns, :location, @default_location)
    data_type = Map.get(assigns, :"data-type", nil)
    data_id = Map.get(assigns, :"data-id", nil)
    slot = Map.get(assigns, :slot, "")

    ~H"""
      <leaflet-marker data-type={data_type} data-id={data_id} lat={lat} lng={lng}>
        <%= slot |> Phoenix.HTML.raw %>
      </leaflet-marker>
    """
  end
end
