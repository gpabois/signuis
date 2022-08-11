defmodule Signuis.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :title, :string
      add :content, :text
      add :to_session_id, :string

      add :to_user_id, references(:users, on_delete: :delete_all)
      add :to_facility_id, references(:facilities, on_delete: :delete_all)

      add :from_session_id, :string
      add :from_user_id, references(:users, on_delete: :delete_all)
      add :from_facility_id, references(:facilities, on_delete: :delete_all)

      timestamps()
    end

    create index(:messages, [:to_user_id])
    create index(:messages, [:to_facility_id])
    create index(:messages, [:from_user_id])
    create index(:messages, [:from_facility_id])
  end
end
