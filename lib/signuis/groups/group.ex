defmodule Signuis.Groups.Group do
  use Ecto.Schema
  import Ecto.Changeset

  schema "groups" do
    field :description, :string
    field :name, :string
    field :roles, {:array, :string}
    field :valid, :boolean, default: false

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(group, attrs) do
    group
    |> cast(attrs, [:name, :description, :roles, :valid])
    |> validate_required([:name, :description, :roles, :valid])
  end
end
