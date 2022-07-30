defmodule Signuis.Reporting do
  @moduledoc """
  The Reporting context.
  """

  import Ecto.Query, warn: false
  alias Signuis.Repo

  alias Signuis.Reporting.NuisanceType

  @doc """
  Returns the list of nuisances_types.

  ## Examples

      iex> list_nuisances_types()
      [%NuisanceType{}, ...]

  """
  def list_nuisances_types do
    Repo.all(NuisanceType)
  end

  @doc """
  Gets a single nuisance_type.

  Raises `Ecto.NoResultsError` if the Nuisance type does not exist.

  ## Examples

      iex> get_nuisance_type!(123)
      %NuisanceType{}

      iex> get_nuisance_type!(456)
      ** (Ecto.NoResultsError)

  """
  def get_nuisance_type!(id), do: Repo.get!(NuisanceType, id)

  @doc """
  Creates a nuisance_type.

  ## Examples

      iex> create_nuisance_type(%{field: value})
      {:ok, %NuisanceType{}}

      iex> create_nuisance_type(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_nuisance_type(attrs \\ %{}) do
    %NuisanceType{}
    |> NuisanceType.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a nuisance_type.

  ## Examples

      iex> update_nuisance_type(nuisance_type, %{field: new_value})
      {:ok, %NuisanceType{}}

      iex> update_nuisance_type(nuisance_type, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_nuisance_type(%NuisanceType{} = nuisance_type, attrs) do
    nuisance_type
    |> NuisanceType.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a nuisance_type.

  ## Examples

      iex> delete_nuisance_type(nuisance_type)
      {:ok, %NuisanceType{}}

      iex> delete_nuisance_type(nuisance_type)
      {:error, %Ecto.Changeset{}}

  """
  def delete_nuisance_type(%NuisanceType{} = nuisance_type) do
    Repo.delete(nuisance_type)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking nuisance_type changes.

  ## Examples

      iex> change_nuisance_type(nuisance_type)
      %Ecto.Changeset{data: %NuisanceType{}}

  """
  def change_nuisance_type(%NuisanceType{} = nuisance_type, attrs \\ %{}) do
    NuisanceType.changeset(nuisance_type, attrs)
  end

  alias Signuis.Reporting.Report

  @doc """
  Returns the list of reports.

  ## Examples

      iex> list_reports()
      [%Report{}, ...]

  """
  def list_reports do
    Repo.all(Report)
  end

  @doc """
  Gets a single report.

  Raises `Ecto.NoResultsError` if the Report does not exist.

  ## Examples

      iex> get_report!(123)
      %Report{}

      iex> get_report!(456)
      ** (Ecto.NoResultsError)

  """
  def get_report!(id), do: Repo.get!(Report, id)

  @doc """
  Creates a report.

  ## Examples

      iex> create_report(%{field: value})
      {:ok, %Report{}}

      iex> create_report(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_report(attrs \\ %{}) do
    %Report{}
    |> Report.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a report.

  ## Examples

      iex> update_report(report, %{field: new_value})
      {:ok, %Report{}}

      iex> update_report(report, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_report(%Report{} = report, attrs) do
    report
    |> Report.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a report.

  ## Examples

      iex> delete_report(report)
      {:ok, %Report{}}

      iex> delete_report(report)
      {:error, %Ecto.Changeset{}}

  """
  def delete_report(%Report{} = report) do
    Repo.delete(report)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking report changes.

  ## Examples

      iex> change_report(report)
      %Ecto.Changeset{data: %Report{}}

  """
  def change_report(%Report{} = report, attrs \\ %{}) do
    Report.changeset(report, attrs)
  end
end
