defmodule Signuis.FacilitiesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Signuis.Facilities` context.
  """

  @doc """
  Generate a facility.
  """
  def facility_fixture(attrs \\ %{}) do
    {:ok, facility} =
      attrs
      |> Enum.into(%{
        adresse__code_postal: "some adresse__code_postal",
        adresse__commune: "some adresse__commune",
        adresse__voie: "some adresse__voie",
        description: "some description",
        location__lat: 120.5,
        location__lng: 120.5,
        nom: "some nom",
        valid: true
      })
      |> Signuis.Facilities.create_facility()

    facility
  end

  @doc """
  Generate a member.
  """
  def member_fixture(attrs \\ %{}) do
    {:ok, member} =
      attrs
      |> Enum.into(%{
        roles: []
      })
      |> Signuis.Facilities.create_member()

    member
  end
end
