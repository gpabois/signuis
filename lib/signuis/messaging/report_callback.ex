defmodule Signuis.Messaging.ReportCallback do
  use Ecto.Schema

  import Ecto.Query
  import Ecto.Changeset

  alias Signuis.Repo
  import Signuis.Utils
  import Signuis.Filter

  alias Signuis.Facilities
  alias Signuis.Messaging
  alias Signuis.Reporting.Report

  schema "reports_callbacks" do
    field :content, :string
    field :strategy, :string
    field :title, :string
    field :status, :string, default: "opened"

    field :facility_id, :id
    field :facility_production_id, :id

    field :begin, :naive_datetime
    field :end, :naive_datetime

    timestamps()
  end

  def list(opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms
    preload = Keyword.get(opts, :preload, [])

    __MODULE__
    |> filter(filters, __MODULE__)
    |> Repo.all
    |> Repo.preload(preload)
  end

  def filter_on_attribute({:facility, facility}, query) do
    where(query, [b], b.facility_id == ^facility.id)
  end

  def filter_on_attribute({:status, status}, query) do
    where(query, [b], b.status == ^status)
  end

  @doc """
    Check if the report callback is closed (we don't expect new reports to be callback)
  """
  def is_closed?(%__MODULE__{} = report_callback) do
    cond do
      report_callback.facility_production_id != nil ->
        facility_production = Facilities.get_production!(report_callback.facility_production_id)
        cond do
          facility_production.end != nil and facility_production.end <= NaiveDateTime.utc_now() ->
            true
          true ->
            false
        end
      report_callback.end <= NaiveDateTime.utc_now() ->
        true
      true -> false
    end
  end

  def is_done?(%__MODULE__{} = report_callback) do
    is_closed?(report_callback) and not Messaging.has_remaining_reports?(report_callback)
  end

  def has_called_back?(%__MODULE__{} = report_callback_id, %Report{} = report) do
    Repo.get_by(Signuis.Messaging.ReportCallbackAck, report_id: report.id, report_callback_id: report_callback_id.id) != nil
  end

  @during_facility_production "during_facility_production"

  def during_facility_production, do: @during_facility_production

  def cast_strategy(changeset) do
    case get_change(changeset, :strategy, nil) do
      @during_facility_production ->
        case get_change(changeset, :facility_production_id, nil) do
          nil -> add_error(changeset, :facility_production_id, "missing facility production")
          _ -> changeset
        end

      _ -> changeset
    end
  end

  @doc false
  def changeset(report_callback, attrs, opts \\ []) do
    pre_validations = Keyword.get(opts, :pre_validations, [])

    changeset = report_callback
    |> cast(attrs, [:title, :content, :strategy, :status, :facility_id, :facility_production_id, :begin, :end])

    changeset = Enum.reduce(pre_validations, changeset, &(&1.(&2)))

    changeset
    |> validate_required([:title, :content, :strategy, :facility_id])
    |> cast_strategy()
  end
end
