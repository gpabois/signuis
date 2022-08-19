defmodule Signuis.Messaging do
  @moduledoc """
  The Messaging context.
  """

  import Ecto.Query, warn: false
  alias Signuis.Repo

  alias Signuis.Messaging
  alias Signuis.Messaging.Message
  alias Signuis.Reporting
  alias Signuis.Facilities
  @doc """
  Returns the list of messages.

  ## Examples

      iex> list_messages()
      [%Message{}, ...]

  """
  def list_messages(opts \\ []) do
    Message.list(opts)
  end

  @doc """
  Gets a single message.

  Raises `Ecto.NoResultsError` if the Message does not exist.

  ## Examples

      iex> get_message!(123)
      %Message{}

      iex> get_message!(456)
      ** (Ecto.NoResultsError)

  """
  def get_message!(id), do: Repo.get!(Message, id)

  @doc """
  Creates a message.

  ## Examples

      iex> create_message(%{field: value})
      {:ok, %Message{}}

      iex> create_message(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_message(attrs \\ %{}) do
    with {:ok, message} <-
    %Message{}
    |> Message.changeset(attrs)
    |> Repo.insert() do
      Signuis.EventTypes.new_message(message)
      {:ok, message}
    end
  end

  @doc """
    Used to notify new message, after a successful db transaction
  """
  def notify_new_messages(result) do
    case result do
      {:ok, changes} ->
        messages = changes
        |> Enum.filter(fn {_, value} -> is_struct(value, Message) end)
        |> Enum.map(fn {_, value} -> value end)

      Signuis.EventTypes.new_messages(messages)
      result
      {:error, changes} -> result
    end
  end

  @doc """
    Enqueue a message insertion into the Ecto.Multi

    This will trigger a {:new_message, message} notification.
  """
  def multi_create_message(multi, message_params, opts) do
    name = Keyword.get(opts, :name, {:message, Signuis.Utils.uid(16)})
    run_after = Keyword.get(opts, :run_after, nil)

    changeset = Messaging.change_message(%Message{}, message_params)

    multi = Ecto.Multi.insert(multi, name, changeset)

    if run_after do
      run_after.(multi, name)
    else
      multi
    end
  end

  @doc """
    Enqueue message insertions into the Ecto.Multi

    This will trigger a batch notification {:new_messages, messages}.
  """
  def multi_create_messages(multi, messages_commands) do
    # Create random names for insertions operations
      for message_command <- messages_commands, reduce: multi do
      multi ->
        {message_params, opts} = case message_command do

        {message_params, opts} ->
          {message_params, opts}
        message_params ->
          {message_params, []}
      end

      multi_create_message(multi, message_params, opts)
    end
  end

  @doc """
  Updates a message.

  ## Examples

      iex> update_message(message, %{field: new_value})
      {:ok, %Message{}}

      iex> update_message(message, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_message(%Message{} = message, attrs) do
    message
    |> Message.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a message.

  ## Examples

      iex> delete_message(message)
      {:ok, %Message{}}

      iex> delete_message(message)
      {:error, %Ecto.Changeset{}}

  """
  def delete_message(%Message{} = message) do
    Repo.delete(message)
  end

  def delete_all_messages(opts \\ []) do
    Message.delete_all(opts)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking message changes.

  ## Examples

      iex> change_message(message)
      %Ecto.Changeset{data: %Message{}}

  """
  def change_message(%Message{} = message, attrs \\ %{}) do
    Message.changeset(message, attrs)
  end

  alias Signuis.Messaging.ReportCallback

  def get_remaining_reports(%ReportCallback{} = report_callback) do
    if report_callback.facility_production_id do
      facility_production = Facilities.get_production!(report_callback.facility_production_id)
      facility = Facilities.get_facility!(facility_production.facility_id)

      Reporting.list_reports(filter: %{
        "facility"             => facility,
        "not-report-callback" => report_callback,
        "datetime_range"           => {facility_production.begin, facility_production.end}
      })
    else
      []
    end
  end

  def has_remaining_reports?(%ReportCallback{} = report_callback) do
    if report_callback.facility_production_id do
      facility_production = Facilities.get_production!(report_callback.facility_production_id)
      facility = Facilities.get_facility!(facility_production.facility_id)

      Reporting.count_reports(filter: %{
        "facility"             => facility,
        "not-report-callback" => report_callback,
        "datetime_range"           => {facility_production.begin, facility_production.end}
      }) > 0
    else
      false
    end
  end


  @doc """
  Returns the list of report_callbacks.

  ## Examples

      iex> list_report_callbacks()
      [%ReportCallback{}, ...]

  """
  def list_report_callbacks(opts \\ []) do
    ReportCallback.list(opts)
  end

  @doc """
  Gets a single report_callback.

  Raises `Ecto.NoResultsError` if the ReportCallback does not exist.

  ## Examples

      iex> get_report_callback!(123)
      %ReportCallback{}

      iex> get_report_callback!(456)
      ** (Ecto.NoResultsError)

  """
  def get_report_callback!(id), do: Repo.get!(ReportCallback, id)

  @doc """
  Creates a report_callback.

  ## Examples

      iex> create_report_callback(%{field: value})
      {:ok, %ReportCallback{}}

      iex> create_report_callback(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_report_callback(attrs, opts \\ []) do
    with {:ok, report_callback} <-
    %ReportCallback{}
    |> ReportCallback.changeset(attrs, opts)
    |> Repo.insert() do
      Signuis.EventTypes.new_report_callback(report_callback)
      {:ok, report_callback}
    end
  end

  @doc """
  Updates a report_callback.

  ## Examples

      iex> update_report_callback(report_callback, %{field: new_value})
      {:ok, %ReportCallback{}}

      iex> update_report_callback(report_callback, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_report_callback(%ReportCallback{} = report_callback, attrs) do
    with {:ok, report_callback} <- report_callback
    |> ReportCallback.changeset(attrs)
    |> Repo.update() do
      Signuis.EventTypes.updated_report_callback(report_callback)
      {:ok, report_callback}
    end
  end

  @doc """
  Deletes a report_callback.

  ## Examples

      iex> delete_report_callback(report_callback)
      {:ok, %ReportCallback{}}

      iex> delete_report_callback(report_callback)
      {:error, %Ecto.Changeset{}}

  """
  def delete_report_callback(%ReportCallback{} = report_callback) do
    Repo.delete(report_callback)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking report_callback changes.

  ## Examples

      iex> change_report_callback(report_callback)
      %Ecto.Changeset{data: %ReportCallback{}}

  """
  def change_report_callback(%ReportCallback{} = report_callback, attrs, opts \\ []) do
    ReportCallback.changeset(report_callback, attrs, opts)
  end

  alias Signuis.Messaging.ReportCallbackAck

  @doc """
  Returns the list of reports_report_callbacks_acks.

  ## Examples

      iex> list_reports_report_callbacks_acks()
      [%ReportCallbackAck{}, ...]

  """
  def list_reports_report_callbacks_acks do
    Repo.all(ReportCallbackAck)
  end

  @doc """
  Gets a single report_callback_ack.

  Raises `Ecto.NoResultsError` if the Report report_callback ack does not exist.

  ## Examples

      iex> get_report_callback_ack!(123)
      %ReportReportCallbackAck{}

      iex> get_report_callback_ack!(456)
      ** (Ecto.NoResultsError)

  """
  def get_report_callback_ack!(id), do: Repo.get!(ReportCallbackAck, id)

  @doc """
  Creates a report_callback_ack.

  ## Examples

      iex> create_report_callback_ack(%{field: value})
      {:ok, %ReportReportCallbackAck{}}

      iex> create_report_callback_ack(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_report_callback_ack(attrs \\ %{}) do
    %ReportCallbackAck{}
    |> ReportCallbackAck.changeset(attrs)
    |> Repo.insert()
  end

  def multi_create_report_callback_ack(multi, name, attrs) do
    changeset = %ReportCallbackAck{}
    |> ReportCallbackAck.changeset(attrs)

    Ecto.Multi.insert(multi, name, changeset)
  end

  @doc """
  Updates a report_callback_ack.

  ## Examples

      iex> update_report_callback_ack(report_callback_ack, %{field: new_value})
      {:ok, %ReportReportCallbackAck{}}

      iex> update_report_callback_ack(report_callback_ack, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_report_callback_ack(%ReportCallbackAck{} = report_callback_ack, attrs) do
    report_callback_ack
    |> ReportCallbackAck.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a report_callback_ack.

  ## Examples

      iex> delete_report_callback_ack(report_callback_ack)
      {:ok, %ReportReportCallbackAck{}}

      iex> delete_report_callback_ack(report_callback_ack)
      {:error, %Ecto.Changeset{}}

  """
  def delete_report_callback_ack(%ReportCallbackAck{} = report_callback_ack) do
    Repo.delete(report_callback_ack)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking report_callback_ack changes.

  ## Examples

      iex> change_report_callback_ack(report_callback_ack)
      %Ecto.Changeset{data: %ReportCallbackAck{}}

  """
  def change_report_callback_ack(%ReportCallbackAck{} = report_callback_ack, attrs \\ %{}) do
    ReportCallbackAck.changeset(report_callback_ack, attrs)
  end
end
