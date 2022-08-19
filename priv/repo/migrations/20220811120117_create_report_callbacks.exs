defmodule Signuis.Repo.Migrations.CreateReportCallbacks do
  use Ecto.Migration

  def change do
    create table(:reports_callbacks) do
      add :title, :string
      add :content, :text
      add :strategy, :string
      add :status, :string, default: "opened"

      add :facility_id, references(:facilities, on_delete: :delete_all)
      add :facility_production_id, references(:facilities_productions, on_delete: :delete_all)

      add :begin, :naive_datetime
      add :end, :naive_datetime

      timestamps(type: :timestamptz)
    end

    create index(:reports_callbacks, [:facility_id])
    create index(:reports_callbacks, [:facility_production_id])
  end
end
