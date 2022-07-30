defmodule Signuis.ReportingFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Signuis.Reporting` context.
  """

  @doc """
  Generate a nuisance_type.
  """
  def nuisance_type_fixture(attrs \\ %{}) do
    {:ok, nuisance_type} =
      attrs
      |> Enum.into(%{
        description: "some description",
        family: "some family",
        label: "some label"
      })
      |> Signuis.Reporting.create_nuisance_type()

    nuisance_type
  end

  @doc """
  Generate a report.
  """
  def report_fixture(attrs \\ %{}) do
    {:ok, report} =
      attrs
      |> Enum.into(%{
        location__lat: 120.5,
        location__lng: 120.5
      })
      |> Signuis.Reporting.create_report()

    report
  end
end
