defmodule Signuis.Repo.Migrations.CreateFacilitiesProductions do
  use Ecto.Migration

  def change do
    create table(:facilities_productions) do
      add :begin, :timestamptz
      add :end, :timestamptz
      add :facility_id, references(:facilities, on_delete: :nothing)

      timestamps(type: :timestamptz)
    end

    create index(:facilities_productions, [:facility_id])
  end
end
