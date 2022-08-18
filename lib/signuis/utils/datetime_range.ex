defmodule Signuis.Utils.DateTimeRange.Form do
  import Ecto.Changeset

  defstruct [date_begin: nil, time_begin: nil, date_end: nil, time_end: nil]

  @types %{
    date_begin: :date,
    time_begin: :time,
    date_end: :date,
    time_end: :time
  }

  def changeset(object, attrs) do
    {object, @types}
    |> cast(attrs, Map.keys(@types))
    |> validate_required(Map.keys(@types))
  end

  def cast_datetime_range(changeset, attrs, opts \\ []) do
    bindings = %{
      date_begin: Keyword.get(opts, :date_begin, :date_begin),
      time_begin: Keyword.get(opts, :time_begin, :time_begin),
      date_end: Keyword.get(opts, :date_end, :date_end),
      time_end: Keyword.get(opts, :time_end, :time_end),
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

    with {:ok, %{date_begin: date_begin, time_begin: time_begin, date_end: date_end, time_end: time_end}} <-  apply_action(dtr_changeset, :get) do
      attrs = %{
        datetime_begin:  NaiveDateTime.new!(date_begin, time_begin),
        datetime_end: NaiveDateTime.new!(date_end, time_end)
      }

      bindings = %{
        datetime_begin: Keyword.get(opts, :datetime_begin, :datetime_begin),
        datetime_end: Keyword.get(opts, :datetime_end, :datetime_end)
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
