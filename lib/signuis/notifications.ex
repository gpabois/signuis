defmodule Signuis.Notifications do
  @moduledoc """
  The Notifications context.
  """

  import Ecto.Query, warn: false
  alias Signuis.Repo

  alias Signuis.Notifications.Notification

  @doc """
  Returns the list of notifications.

  ## Examples

      iex> list_notifications()
      [%Notification{}, ...]

  """
  def list_notifications(opts \\ []) do
    Notification.list(opts)
  end

  def count_notifications(opts \\ []) do
    Notification.count(opts)
  end

  @doc """
  Gets a single notification.

  Raises `Ecto.NoResultsError` if the Notification does not exist.

  ## Examples

      iex> get_notification!(123)
      %Notification{}

      iex> get_notification!(456)
      ** (Ecto.NoResultsError)

  """
  def get_notification!(id), do: Repo.get!(Notification, id)

  @doc """
  Creates a notification.

  ## Examples

      iex> create_notification(%{field: value})
      {:ok, %Notification{}}

      iex> create_notification(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_notification(attrs \\ %{}) do
    with {:ok, notification} <- %Notification{}
    |> Notification.changeset(attrs)
    |> Repo.insert() do
      Signuis.EventTypes.new_notification(notification)
      {:ok, notification}
    end
  end

  def multi_create_notification(multi, notification_params) do
    Ecto.Multi.insert(
      multi,
      {:notification, Signuis.Utils.uid(16)},
      Notification.changeset(%Notification{}, notification_params)
    )
  end

  def notify_new_notifications(result) do
    case result do
      {:ok, changes} ->
        notifications = Enum.filter(changes, fn {_, value} -> is_struct(value, Notification) end)
        |> Enum.map(fn {_, value} -> value end)
        Signuis.EventTypes.new_notifications(notifications)
    end
  end

  @doc """
  Updates a notification.

  ## Examples

      iex> update_notification(notification, %{field: new_value})
      {:ok, %Notification{}}

      iex> update_notification(notification, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_notification(%Notification{} = notification, attrs) do
    with {:ok, notification} <-
    notification
    |> Notification.changeset(attrs)
    |> Repo.update() do
      Signuis.EventTypes.updated_notification(notification)
      {:ok, notification}
    end
  end

  @doc """
  Deletes a notification.

  ## Examples

      iex> delete_notification(notification)
      {:ok, %Notification{}}

      iex> delete_notification(notification)
      {:error, %Ecto.Changeset{}}

  """
  def delete_notification(%Notification{} = notification) do
    Repo.delete(notification)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking notification changes.

  ## Examples

      iex> change_notification(notification)
      %Ecto.Changeset{data: %Notification{}}

  """
  def change_notification(%Notification{} = notification, attrs \\ %{}) do
    Notification.changeset(notification, attrs)
  end
end
