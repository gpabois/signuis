defmodule Signuis.Facilities do
  @moduledoc """
  The Facilities context.
  """

  import Ecto.Query, warn: false
  alias Signuis.Repo

  alias Signuis.Facilities.Facility
  alias Signuis.Facilities.Member

  @doc """
  Returns the list of facilities.

  ## Examples

      iex> list_facilities()
      [%Facility{}, ...]

  """
  def list_facilities do
    Repo.all(Facility)
  end

  @doc """
  Gets a single facility.

  Raises `Ecto.NoResultsError` if the Facility does not exist.

  ## Examples

      iex> get_facility!(123)
      %Facility{}

      iex> get_facility!(456)
      ** (Ecto.NoResultsError)

  """
  def get_facility!(id), do: Repo.get!(Facility, id)

  @doc """
  Creates a facility.

  ## Examples

      iex> create_facility(%{field: value})
      {:ok, %Facility{}}

      iex> create_facility(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_facility(attrs \\ %{}) do
    %Facility{}
    |> Facility.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Register a facility.

  ## Examples

    iex > register_facility(%{...}, admin)
    {:ok, %Facility{}}
  """
  def register_facility(attrs \\ %{}, %Signuis.Accounts.User{} = admin) do
    Repo.transaction fn ->
      with {:ok, facility} <- create_facility(attrs),
          {:ok, _member} <- create_member([user_id: admin.id, facility_id: facility.id, roles: [:admin]] |> Enum.into(%{})) do
        {:ok, facility}
      end
    end
  end

  @doc """
  Updates a facility.

  ## Examples

      iex> update_facility(facility, %{field: new_value})
      {:ok, %Facility{}}

      iex> update_facility(facility, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_facility(%Facility{} = facility, attrs) do
    facility
    |> Facility.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a facility.

  ## Examples

      iex> delete_facility(facility)
      {:ok, %Facility{}}

      iex> delete_facility(facility)
      {:error, %Ecto.Changeset{}}

  """
  def delete_facility(%Facility{} = facility) do
    Repo.delete(facility)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking facility changes.

  ## Examples

      iex> change_facility(facility)
      %Ecto.Changeset{data: %Facility{}}

  """
  def change_facility(%Facility{} = facility, attrs \\ %{}) do
    Facility.changeset(facility, attrs)
  end

  @doc """
  Returns the list of facilities_members.

  ## Examples

      iex> list_facilities_members()
      [%Member{}, ...]

  """
  def list_facilities_members do
    Repo.all(Member)
  end

  @doc """
  Gets a single member.

  Raises `Ecto.NoResultsError` if the Member does not exist.

  ## Examples

      iex> get_member!(123)
      %Member{}

      iex> get_member!(456)
      ** (Ecto.NoResultsError)

  """
  def get_member!(id), do: Repo.get!(Member, id)

  @doc """
  Creates a member.

  ## Examples

      iex> create_member(%{field: value})
      {:ok, %Member{}}

      iex> create_member(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_member(attrs \\ %{}) do
    %Member{}
    |> Member.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a member.

  ## Examples

      iex> update_member(member, %{field: new_value})
      {:ok, %Member{}}

      iex> update_member(member, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_member(%Member{} = member, attrs) do
    member
    |> Member.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a member.

  ## Examples

      iex> delete_member(member)
      {:ok, %Member{}}

      iex> delete_member(member)
      {:error, %Ecto.Changeset{}}

  """
  def delete_member(%Member{} = member) do
    Repo.delete(member)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking member changes.

  ## Examples

      iex> change_member(member)
      %Ecto.Changeset{data: %Member{}}

  """
  def change_member(%Member{} = member, attrs \\ %{}) do
    Member.changeset(member, attrs)
  end
end
