defmodule Signuis.Repo.Migrations.CreateNotifications do
  use Ecto.Migration

  def change do
    create table(:notifications) do
      add :session_id, :string
      add :type, :string
      add :user_id, references(:users, on_delete: :delete_all)
      add :message_id, references(:messages, on_delete: :delete_all)

      timestamps()
    end

    create index(:notifications, [:user_id])
    create index(:notifications, [:message_id])
  end
end
