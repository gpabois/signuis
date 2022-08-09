defmodule SignuisWeb.Components.Map do
  use Phoenix.Component

  @default_location %Geo.Point{coordinates: {48.866667, 2.333333}, srid: 4326}

  def map(assigns) do
    %Geo.Point{coordinates: {center_lat, center_lng}, srid: 4326} = Map.get(assigns, :center, @default_location)
    classes = Map.get(assigns, :classes, []) |> Enum.join(" ")
    markers = Map.get(assigns, :markers, [])
    heatmap_cells = Map.get(assigns, :heatmap_cells, [])

    id = Map.get(assigns, :id, "")
    phx_hook = Map.get(assigns, :"phx-hook", "")
    zoom = Map.get(assigns, :zoom, 16)

    ~H"""
    <leaflet-map id={id} phx-hook={phx_hook} lat={center_lat} class={classes} lng={center_lng} zoom={zoom}>
      <%= for marker <- markers do %>
      <.marker slot={marker.slot} data-id={marker.id} data-type={marker.type} location={marker.location}/>
      <% end %>
      <%= for cell <- heatmap_cells do %>
      <.heatmap_cell location={cell.location} weight={cell.weight} bounds={cell.bounds} />
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

  def heatmap_cell(assigns) do
    %Geo.Point{coordinates: {lat, lng}, srid: 4326} = Map.get(assigns, :location, @default_location)
    weight = Map.get(assigns, :weight, 0)
    %{
      bottom_left: {bottom_right__lat, bottom_right__lng},
      top_right: {top_left__lat, top_left__lng}
    } = Map.get(assigns, :bounds, nil)
    ~H"""
    <leaflet-heatmap-cell
        weight={weight}
        lat={lat}
        lng={lng}
        bottom_left__lat={bottom_right__lat}
        bottom_left__lng={bottom_right__lng}
        top_right__lat={top_left__lat}
        top_right__lng={top_left__lng}
    >
    </leaflet-heatmap-cell>
  """
  end
end
