defmodule :"Elixir.Signuis.Repo.Migrations.AddReportsFacilities" do
  use Ecto.Migration

  def change do
    create table(:reports_facilities) do
      add :facility_id, references(:facilities, on_delete: :delete_all)
      add :report_id, references(:reports, on_delete: :delete_all)
    end

    create index(:reports_facilities, [:facility_id])
    create index(:reports_facilities, [:report_id])
    create unique_index(:reports_facilities, [:facility_id, :report_id])
  end
end
