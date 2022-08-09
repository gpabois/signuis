defmodule SignuisWeb.HeatmapCell do
  use Phoenix.HTML

  defstruct [weight: nil, location: nil, precision: 20]

  def to(%{location: location, weight: weight, precision: precision}) do
    precision = case precision do
      {_, radius} -> radius
      precision -> precision
    end

    %__MODULE__{
      weight: weight,
      location: location,
      precision: precision
    }
  end
end
