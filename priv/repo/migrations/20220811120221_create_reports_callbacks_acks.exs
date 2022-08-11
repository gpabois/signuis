defmodule Signuis.Repo.Migrations.CreateReportsCallbacksAcks do
  use Ecto.Migration

  def change do
    create table(:reports_callbacks_acks) do
      add :report_callback_id, references(:reports_callbacks, on_delete: :delete_all)
      add :report_id, references(:reports, on_delete: :delete_all)
      add :message_id, references(:messages, on_delete: :delete_all)

      timestamps()
    end

    create index(:reports_callbacks_acks, [:report_callback_id])
    create index(:reports_callbacks_acks, [:report_id])
    create index(:reports_callbacks_acks, [:message_id])
  end
end
