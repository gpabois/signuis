defmodule Signuis.Repo.Migrations.CreateGroups do
  use Ecto.Migration

  def change do
    create table(:groups) do
      add :name, :string
      add :description, :string
      add :roles, {:array, :string}
      add :valid, :boolean, default: false, null: false

      timestamps(type: :timestamptz)
    end
  end
end
