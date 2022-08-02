defmodule Signuis.Utils do

  def keys_to_atoms(map) do
    map
    |> Enum.reduce(%{}, fn {key, val}, acc -> Map.put(acc, String.to_existing_atom(key), val) end)
  end

  def decode_js_position(position) do
    [lat, lng] = position["coordinates"]
    %Geo.Point{
      coordinates: {lat, lng},
      srid: position["srid"]
    }
  end

  def decode_js_bounds(bounds) do
    %{
      bottom_left: bounds["bottom_left"] |> decode_js_position,
      top_right: bounds["top_right"] |> decode_js_position
    }
  end
end
