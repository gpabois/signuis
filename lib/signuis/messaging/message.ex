defmodule Signuis.Messaging.Message do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  alias Signuis.Repo
  import Signuis.Utils
  import Signuis.Filter

  schema "messages" do
    field :content, :string

    field :title, :string

    field :to_session_id, :string
    field :to_user_id, :id
    field :to_facility_id, :id

    field :from_session_id, :string
    field :from_user_id, :id
    field :from_facility_id, :id

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

  def filter_on_attribute({:to_session_id, session_id}, query) do
    where(query, [b], b.to_session_id == ^session_id)
  end

  def filter_on_attribute({:to_user_id, user_id}, query) do
    where(query, [b], b.to_user_id == ^user_id)
  end

  @doc false
  def changeset(message, attrs) do
    message
    |> cast(attrs, [:titre, :contenu, :to_session_id, :from_session_id])
    |> validate_required([:titre, :contenu, :to_session_id, :from_session_id])
  end
end
