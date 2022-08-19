defmodule Signuis.Repo.Migrations.CreateNuisancesTypes do
  use Ecto.Migration

  def change do
    create table(:nuisances_types) do
      add :label, :string
      add :family, :string
      add :description, :text

      timestamps(type: :timestamptz)
    end
  end
end
