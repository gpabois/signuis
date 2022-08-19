defmodule Signuis.Messaging.Message do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  alias Signuis.Repo
  import Signuis.Utils
  import Signuis.Filter

  alias Signuis.Facilities.Facility
  alias Signuis.Accounts.{User, Anonymous}

  schema "messages" do
    field :content, :string

    field :title, :string

    field :to_session_id, :string

    belongs_to :to_facility, Facility
    belongs_to :to_user, User

    field :from_session_id, :string
    belongs_to :from_facility, Facility
    belongs_to :from_user, User

    timestamps()
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

  def delete_all(opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms
    __MODULE__
    |> filter(filters, __MODULE__)
    |> Repo.delete_all
  end

  def filter_on_attribute({:to, %Anonymous{id: session_id}}, query) do
    filter_on_attribute({:to_session_id, session_id}, query)
  end

  def filter_on_attribute({:to, %User{} = user}, query) do
    filter_on_attribute({:to_user_id, user.id}, query)
  end
  def filter_on_attribute({:to_session_id, session_id}, query) do
    where(query, [b], b.to_session_id == ^session_id)
  end

  def filter_on_attribute({:to_user_id, user_id}, query) do
    where(query, [b], b.to_user_id == ^user_id)
  end
  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:title, :content, :to_user_id, :to_session_id, :to_facility_id, :from_session_id, :from_user_id, :from_facility_id])
    |> validate_required([:title, :content])
  end
end
