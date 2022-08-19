defmodule Signuis.Repo.Migrations.CreateFacilitiesMembers do
  use Ecto.Migration

  def change do
    create table(:facilities_members) do
      add :roles, {:array, :string}
      add :user_id, references(:users, on_delete: :delete_all)
      add :facility_id, references(:facilities, on_delete: :delete_all)

      timestamps(type: :timestamptz)
    end

    create index(:facilities_members, [:user_id])
    create index(:facilities_members, [:facility_id])
    create unique_index(:facilities_members, [:user_id, :facility_id])

  end
end
