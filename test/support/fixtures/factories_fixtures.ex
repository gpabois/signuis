defmodule Signuis.FactoriesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Signuis.Factories` context.
  """

  @doc """
  Generate a factory.
  """
  def factory_fixture(attrs \\ %{}) do
    {:ok, factory} =
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
      |> Signuis.Factories.create_factory()

    factory
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
      |> Signuis.Factories.create_member()

    member
  end
end
