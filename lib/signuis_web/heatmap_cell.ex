defmodule SignuisWeb.HeatmapCell do
  use Phoenix.HTML

  defstruct [weight: nil, location: nil, bounds: nil]

  def to(%{location: location, weight: weight, cell: cell}) do
    [[bottom_left, _, top_right, _, _] |_] = cell.coordinates
    bounds = %{bottom_left: bottom_left, top_right: top_right}

    %__MODULE__{
      weight: weight,
      location: location,
      bounds: bounds
    }
  end
end
