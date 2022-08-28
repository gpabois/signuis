defmodule Signuis.Groups.Member do
  use Ecto.Schema
  import Ecto.Changeset

  schema "group_members" do
    field :roles, {:array, :string}
    field :user_id, :id
    field :group_id, :id

    timestamps()
  end

  @doc false
  def changeset(member, attrs) do
    member
    |> cast(attrs, [:roles])
    |> validate_required([:roles])
  end
end
