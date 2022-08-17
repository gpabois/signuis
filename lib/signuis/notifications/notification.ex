defmodule Signuis.Notifications.Notification do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  import Signuis.Filter
  import Signuis.Utils

  alias Signuis.Accounts.{User, Anonymous}
  alias Signuis.Messaging.Message

  alias Signuis.Repo

  schema "notifications" do
    field :session_id, :string
    field :type, :string
    field :user_id, :id

    belongs_to :message, Message

    field :read, :boolean

    timestamps()
  end

  @new_message "new_message"
  def new_message, do: @new_message
  @doc false
  def changeset(notification, attrs) do
    notification
    |> cast(attrs, [:user_id, :session_id, :type, :message_id, :read])
    |> validate_required([:type])
  end

  def list(opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms
    preload = Keyword.get(opts, :preload, [])

    __MODULE__
    |> filter(filters, __MODULE__)
    |> order_by([desc: :inserted_at])
    |> Repo.all
    |> Repo.preload(preload)
  end

  def count(opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms

    __MODULE__
    |> filter(filters, __MODULE__)
    |> select([b], count(b.id))
    |> Repo.one!
  end

  def filter_on_attribute({:read, read}, query) do
    where(query, [b], b.read == ^read)
  end

  def filter_on_attribute({:user, %Anonymous{id: session_id}}, query) do
    filter_on_attribute({:session_id, session_id}, query)
  end

  def filter_on_attribute({:user, %User{} = user}, query) do
    filter_on_attribute({:user_id, user.id}, query)
  end

  def filter_on_attribute({:session_id, session_id}, query) do
    where(query, [b], b.session_id == ^session_id)
  end

  def filter_on_attribute({:user_id, user_id}, query) do
    where(query, [b], b.user_id == ^user_id)
  end

end
