defmodule Signuis.Facilities do
  @moduledoc """
  The Facilities context.
  """

  import Ecto.Query, warn: false
  alias Signuis.Repo

  alias Signuis.Accounts.{User, Anonymous}

  alias Signuis.Facilities.Facility
  alias Signuis.Facilities.Member
  alias Signuis.Facilities.Production

  alias Signuis.Reporting.Report

  defdelegate authorize(action, user, params), to: Signuis.Facilities.Policy

  @doc """
    Assign a report to a facility
  """
  def assign_report(%Facility{id: facility_id} = facility, %Report{id: report_id} = report) do
    Repo.insert_all("reports_facilities", [[facility_id: facility_id, report_id: report_id]])
    Signuis.EventTypes.new_assigned_report(facility, report)
  end

  @doc """
    Assign a report to a list of facilities
  """
  def assign_report(facilities, %Report{id: report_id} = report) when is_list(facilities) do
    inserts = Enum.map(facilities, &[facility_id: &1.id, report_id: report_id])
    Repo.insert_all("reports_facilities", inserts)

    for facility <- facilities do
      Signuis.EventTypes.new_assigned_report(facility, report)
    end
  end

  def count_facilities_reports(%Facility{id: facility_id}) do
    from(j in "reports_facilities",
      where: j.facility_id == ^facility_id,
      select: count(j.id)
    ) |> Repo.one!
  end
  def list_facilities_reports(%Facility{id: facility_id}, opts \\ []) do
    chunk = Keyword.get(opts, :chunk, nil)

    query = from(r in Report,
      join: j in "reports_facilities", on: r.id == j.report_id,
      where: j.facility_id == ^facility_id
    )

    query = case chunk do
      {page, size} ->
        offset = page * size
        limit = size
        query
        |> offset(^offset)
        |> limit(^limit)
      nil -> query
    end

    query
    |> order_by([desc: :inserted_at])
    |> Repo.all()
    |> Repo.preload([:nuisance_type])
  end

  @doc """
  Returns the list of facilities.

  ## Examples

      iex> list_facilities()
      [%Facility{}, ...]

  """
  def list_facilities(opts \\ []) do
    Facility.list(opts)
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
  def get_facility!(id), do: Facility.get!(id)

  @doc """
  Creates a facility.

  ## Examples

      iex> create_facility(%{field: value})
      {:ok, %Facility{}}

      iex> create_facility(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_facility(attrs, opts \\ []) do
    %Facility{}
    |> Facility.changeset(attrs, opts)
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
          {:ok, _member} <- create_member(
            [user_id: admin.id, facility_id: facility.id, roles: [:admin]] |> Enum.into(%{}),
            mode: :direct_new) do
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
  def update_facility(%Facility{} = facility, attrs, opts \\ []) do
    facility
    |> Facility.changeset(attrs, opts)
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
  def change_facility(%Facility{} = facility, attrs, opts \\ []) do
    Facility.changeset(facility, attrs, opts)
  end

  @doc """
  Returns the list of facilities_members.

  ## Examples

      iex> list_facilities_members()
      [%Member{}, ...]

  """
  def list_facilities_members(opts \\ []) do
    Member.list(opts)
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

  def is_member?(%Facility{} = facility, %User{} = user) do
    Member.is_member?(facility, user)
  end

  def is_member?(%Facility{}, %Anonymous{}), do: false

  def has_role?(%Facility{} = facility, %User{} = user, role) do
    Member.has_role?(facility, user, role)
  end

  def has_role?(%Facility{}, %Anonymous{}, _), do: false

  @doc """
  Creates a member.

  ## Examples

      iex> create_member(%{field: value})
      {:ok, %Member{}}

      iex> create_member(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_member(attrs, opts \\ []) do
    mode = Keyword.get(opts, :mode, :new)
    opts = opts |> Keyword.put(:mode, mode)

    %Member{}
    |> Member.changeset(attrs, opts)
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
    |> Member.changeset(attrs, mode: :update)
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
  def change_member(%Member{} = member, attrs, opts \\ []) do
    Member.changeset(member, attrs, opts)
  end

  @doc """
    Toggle production in a facility
  """
  def toggle_production(%Facility{} = facility) do
    Signuis.Facilities.Servers.Production.toggle_production(facility)
  end

  def current_ongoing_production(%Facility{} = facility) do
    Production
    |> where([p], is_nil(p.end))
    |> where([p], p.facility_id == ^facility.id)
    |> Repo.one
  end

  @doc """
  Returns the list of facilities_productions.

  ## Examples

      iex> list_facilities_productions()
      [%Production{}, ...]

  """
  def list_facilities_productions(opts \\ []) do
    Production.list(opts)
  end

  @doc """
  Gets a single production.

  Raises `Ecto.NoResultsError` if the Production does not exist.

  ## Examples

      iex> get_production!(123)
      %Production{}

      iex> get_production!(456)
      ** (Ecto.NoResultsError)

  """
  def get_production!(id), do: Repo.get!(Production, id)

  @doc """
  Creates a production.

  ## Examples

      iex> create_production(%{field: value})
      {:ok, %Production{}}

      iex> create_production(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_production(attrs, opts \\ []) do
    with {:ok, production} <- %Production{}
    |> Production.changeset(attrs, opts)
    |> Repo.insert() do
      cond do
        production.end == nil ->
          facility = get_facility!(production.facility_id)
          Signuis.EventTypes.begin_production(facility, production)
        true -> {}
      end

      {:ok, production}
    end
  end

  @doc """
  Updates a production.

  ## Examples

      iex> update_production(production, %{field: new_value})
      {:ok, %Production{}}

      iex> update_production(production, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_production(%Production{} = production, attrs, opts \\ []) do
    prev_end = production.end
    with {:ok, production} <- production
    |> Production.changeset(attrs, opts)
    |> Repo.update() do
      cond do
        # We finished the production
        prev_end == nil and production.end != nil ->
          facility = get_facility!(production.facility_id)
          Signuis.EventTypes.end_production(facility, production)
        true -> {}
      end
      {:ok, production}
    end
  end

  @doc """
  Deletes a production.

  ## Examples

      iex> delete_production(production)
      {:ok, %Production{}}

      iex> delete_production(production)
      {:error, %Ecto.Changeset{}}

  """
  def delete_production(%Production{} = production) do
    Repo.delete(production)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking production changes.

  ## Examples

      iex> change_production(production)
      %Ecto.Changeset{data: %Production{}}

  """
  def change_production(%Production{} = production, attrs, opts \\ []) do
    Production.changeset(production, attrs, opts)
  end
end
