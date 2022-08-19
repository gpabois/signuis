defmodule Signuis.Reporting.HistorySelector do
  alias Signuis.Utils.DateTimeRange.Form, as: DateTimeRangeForm
  import Ecto.Changeset

  defstruct [
    begin_date: nil,
    begin_time: nil,
    end_date: nil,
    end_time: nil,

    begin_datetime: nil,
    end_datetime: nil
  ]

  @types %{
    begin_date: :date,
    begin_time: :time,
    end_date: :date,
    end_time: :time,

    begin_datetime: :naive_datetime,
    end_datetime: :naive_datetime
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
