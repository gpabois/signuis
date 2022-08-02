defmodule Signuis.Facilities.Member do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  import Signuis.Utils
  import Signuis.Filter

  schema "facilities_members" do
    field :roles, {:array, :string}, default: []
    field :user_id, :id
    field :facility_id, :id

    timestamps()
  end

  def list(opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms

    __MODULE__
    |> filter(filters, __MODULE__)
  end

  def filter_on_attribute({:facility, facility}, query) do
    where(query, [b], b.facility_id == ^facility.id)
  end

  @doc false
  def changeset(member, attrs) do
    member
    |> cast(attrs, [:user_id, :facility_id, :roles])
    |> validate_required([:user_id, :facility_id])
    |> unique_constraint([:user_id, :facility_id])
  end
end
