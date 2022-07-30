defmodule Signuis.Repo.Migrations.CreateReports do
  use Ecto.Migration

  def change do
    create table(:reports) do
      # add :location__lat, :float
      # add :location__lng, :float
      add :nuisance_level, :integer
      add :nuisance_type_id, references(:nuisances_types, on_delete: :delete_all)
      add :user_id, references(:users, on_delete: :nilify_all)

      timestamps()
    end

    create index(:reports, [:nuisance_type_id])
    create index(:reports, [:user_id])

    # Add location column
    execute("SELECT AddGeometryColumn ('reports','location', 4326,'POINT', 2);")

    # Create a GIST Index
    create index(:reports, [:location], using: :gist)
  end
end
