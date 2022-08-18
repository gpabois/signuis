defmodule Signuis.Reporting.HistorySelector do
  alias Signuis.Utils.DateTimeRange.Form, as: DateTimeRangeForm
  import Ecto.Changeset

  defstruct [
    date_begin: nil,
    time_begin: nil,
    date_end: nil,
    time_end: nil,

    datetime_begin: nil,
    datetime_end: nil
  ]

  @types %{
    date_begin: :date,
    time_begin: :time,
    date_end: :date,
    time_end: :time,

    datetime_begin: :naive_datetime,
    datetime_end: :naive_datetime
  }

  def changeset(history_selector, attrs) do
    {history_selector, @types}
    |> DateTimeRangeForm.cast_datetime_range(attrs)
  end

  def create(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> apply_action(:create)
  end
end
