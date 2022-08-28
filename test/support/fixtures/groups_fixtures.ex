defmodule Signuis.GroupsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Signuis.Groups` context.
  """

  @doc """
  Generate a group.
  """
  def group_fixture(attrs \\ %{}) do
    {:ok, group} =
      attrs
      |> Enum.into(%{
        description: "some description",
        name: "some name",
        roles: [],
        valid: true
      })
      |> Signuis.Groups.create_group()

    group
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
      |> Signuis.Groups.create_member()

    member
  end
end
