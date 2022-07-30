defmodule Signuis.Facilities.Member do
  use Ecto.Schema
  import Ecto.Changeset

  schema "facilities_members" do
    field :roles, {:array, :string}, default: []
    field :user_id, :id
    field :facility_id, :id

    timestamps()
  end

  @doc false
  def changeset(member, attrs) do
    member
    |> cast(attrs, [:user_id, :facility_id, :roles])
    |> validate_required([:user_id, :facility_id])
    |> unique_constraint([:user_id, :facility_id])
  end
end
