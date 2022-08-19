defmodule Signuis.Utils.DateTimeRange.Form do
  import Ecto.Changeset

  defstruct [begin_date: nil, begin_time: nil, end_date: nil, end_time: nil]

  @types %{
    begin_date: :date,
    begin_time: :time,
    end_date: :date,
    end_time: :time
  }

  def changeset(object, attrs) do
    {object, @types}
    |> cast(attrs, Map.keys(@types))
  end

  def cast_datetime_range(changeset, attrs, opts \\ []) do
    bindings = %{
      begin_date: Keyword.get(opts, :begin_date, :begin_date),
      begin_time: Keyword.get(opts, :begin_time, :begin_time),
      end_date: Keyword.get(opts, :end_date, :end_date),
      end_time: Keyword.get(opts, :end_time, :end_time),
    }

    changeset = changeset
    |> cast(attrs, Enum.map(bindings, fn {_, als} -> als end))

    attrs = Enum.reduce(
      bindings, %{},
      fn {key, als}, attrs ->
        Map.put(attrs, key, get_field(changeset, als))
      end
    )

    dtr_changeset = changeset(%__MODULE__{}, attrs)

    with {:ok, %{begin_date: begin_date, begin_time: begin_time, end_date: end_date, end_time: end_time}} <-  apply_action(dtr_changeset, :get) do
      attrs = %{
        begin_datetime: (if nil in [begin_date, begin_time], do: nil, else: DateTime.new!(begin_date, begin_time)),
        end_datetime: (if nil in [end_date, end_time], do: nil, else: DateTime.new!(end_date, end_time))
      }

      bindings = %{
        begin_datetime: Keyword.get(opts, :begin_datetime, :begin_datetime),
        end_datetime: Keyword.get(opts, :end_datetime, :end_datetime)
      }

      changeset = Enum.reduce(
        bindings, changeset,
        fn {key, als}, changeset ->
          put_change(changeset, als, attrs[key])
        end
      )

      changeset
    else
      {:error, dtr_changeset} ->
        changeset = Enum.reduce(dtr_changeset.errors, changeset,
        fn {key, {message, keys}}, changeset ->
          add_error(changeset, bindings[key], message, keys)
        end)
        changeset
    end
  end
end
