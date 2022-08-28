defmodule Signuis.Repo.Migrations.CreateGroupMembers do
  use Ecto.Migration

  def change do
    create table(:group_members) do
      add :roles, {:array, :string}
      add :user_id, references(:users, on_delete: :delete_all)
      add :group_id, references(:groups, on_delete: :delete_all)

      timestamps(type: :timestamptz)
    end

    create index(:group_members, [:user_id])
    create index(:group_members, [:group_id])
  end
end
