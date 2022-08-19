defmodule Signuis.Repo.Migrations.CreateFacilitiesProductions do
  use Ecto.Migration

  def change do
    create table(:facilities_productions) do
      add :begin, :naive_datetime
      add :end, :naive_datetime
      add :facility_id, references(:facilities, on_delete: :nothing)

      timestamps(type: :timestamptz)
    end

    create index(:facilities_productions, [:facility_id])
  end
end
