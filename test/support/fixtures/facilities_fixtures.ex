defmodule Signuis.FacilitiesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Signuis.Facilities` context.
  """

  @doc """
  Generate a production.
  """
  def production_fixture(attrs \\ %{}) do
    {:ok, production} =
      attrs
      |> Enum.into(%{
        begin: ~N[2022-08-09 14:24:00],
        end: ~N[2022-08-09 14:24:00]
      })
      |> Signuis.Facilities.create_production()

    production
  end
end
