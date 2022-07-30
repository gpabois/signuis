defmodule Signuis.Factories.Member do
  use Ecto.Schema
  import Ecto.Changeset

  schema "factories_members" do
    field :roles, {:array, :string}, default: []
    field :user_id, :id
    field :factory_id, :id

    timestamps()
  end

  @doc false
  def changeset(member, attrs) do
    member
    |> cast(attrs, [:user_id, :factory_id, :roles])
    |> validate_required([:user_id, :factory_id])
    |> unique_constraint([:user_id, :factory_id])
  end
end
