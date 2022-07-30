defmodule Signuis.Factories do
  @moduledoc """
  The Factories context.
  """

  import Ecto.Query, warn: false
  alias Signuis.Repo

  alias Signuis.Factories.Factory
  alias Signuis.Factories.Member

  @doc """
  Returns the list of factories.

  ## Examples

      iex> list_factories()
      [%Factory{}, ...]

  """
  def list_factories do
    Repo.all(Factory)
  end

  @doc """
  Gets a single factory.

  Raises `Ecto.NoResultsError` if the Factory does not exist.

  ## Examples

      iex> get_factory!(123)
      %Factory{}

      iex> get_factory!(456)
      ** (Ecto.NoResultsError)

  """
  def get_factory!(id), do: Repo.get!(Factory, id)

  @doc """
  Creates a factory.

  ## Examples

      iex> create_factory(%{field: value})
      {:ok, %Factory{}}

      iex> create_factory(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_factory(attrs \\ %{}) do
    %Factory{}
    |> Factory.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Register a factory.

  ## Examples

    iex > register_factory(%{...}, admin)
    {:ok, %Factory{}}
  """
  def register_factory(attrs \\ %{}, %Signuis.Accounts.User{} = admin) do
    Repo.transaction fn ->
      with {:ok, factory} <- create_factory(attrs),
          {:ok, _member} <- create_member([user_id: admin.id, factory_id: factory.id, roles: [:admin]] |> Enum.into(%{})) do
        {:ok, factory}
      end
    end
  end

  @doc """
  Updates a factory.

  ## Examples

      iex> update_factory(factory, %{field: new_value})
      {:ok, %Factory{}}

      iex> update_factory(factory, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_factory(%Factory{} = factory, attrs) do
    factory
    |> Factory.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a factory.

  ## Examples

      iex> delete_factory(factory)
      {:ok, %Factory{}}

      iex> delete_factory(factory)
      {:error, %Ecto.Changeset{}}

  """
  def delete_factory(%Factory{} = factory) do
    Repo.delete(factory)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking factory changes.

  ## Examples

      iex> change_factory(factory)
      %Ecto.Changeset{data: %Factory{}}

  """
  def change_factory(%Factory{} = factory, attrs \\ %{}) do
    Factory.changeset(factory, attrs)
  end

  @doc """
  Returns the list of factories_members.

  ## Examples

      iex> list_factories_members()
      [%Member{}, ...]

  """
  def list_factories_members do
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
