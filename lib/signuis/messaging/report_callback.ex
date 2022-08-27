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

  alias Signuis.Messaging.ReportCallbackAck

  schema "reports_callbacks" do
    field :content, :string
    field :strategy, :string
    field :title, :string
    field :status, :string, default: "opened"

    field :facility_id, :id
    field :facility_production_id, :id

    field :begin, :utc_datetime
    field :end, :utc_datetime

    timestamps(type: :utc_datetime)
  end

  def list(opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms
    preload = Keyword.get(opts, :preload, [])

    __MODULE__
    |> filter(filters, __MODULE__)
    |> Repo.all
    |> Repo.preload(preload)
  end

  def filter_on_attribute({:facility_production, facility_production}, query) do
    where(query, [b], b.facility_production_id == ^facility_production.id)
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
          facility_production.end != nil and facility_production.end <= DateTime.utc_now() ->
            true
          true ->
            false
        end
      report_callback.end <= DateTime.utc_now() ->
        true
      true -> false
    end
  end

  def is_done?(%__MODULE__{} = report_callback) do
    is_closed?(report_callback) and not Messaging.has_remaining_reports?(report_callback)
  end

  @doc """
    Filter the list of reports and keep only those which have not been called back by the report callback.
  """
  def filter_not_called_back(%__MODULE__{} = report_callback, reports) when is_list(reports) do
    reports_ids = Enum.map(reports, &(&1.id))

    called_backs = from(ack in ReportCallbackAck,
      select: [ack.report_id],
      where: ack.report_id in ^reports_ids,
      where: ack.report_callback_id == ^report_callback.id)
    |> Repo.all()

    Enum.filter(reports, fn r -> r.id not in called_backs end)
  end

  def has_called_back?(%__MODULE__{} = report_callback, %Report{} = report) do
    Repo.get_by(ReportCallbackAck, report_id: report.id, report_callback_id: report_callback.id) != nil
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
