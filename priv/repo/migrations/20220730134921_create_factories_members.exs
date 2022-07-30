defmodule Signuis.Repo.Migrations.CreateFactoriesMembers do
  use Ecto.Migration

  def change do
    create table(:factories_members) do
      add :roles, {:array, :string}
      add :user_id, references(:users, on_delete: :nothing)
      add :factory_id, references(:factories, on_delete: :nothing)

      timestamps()
    end

    create index(:factories_members, [:user_id])
    create index(:factories_members, [:factory_id])
    create unique_index(:factories_members, [:user_id, :factory_id])

  end
end
