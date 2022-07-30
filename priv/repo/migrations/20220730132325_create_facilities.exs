defmodule Signuis.Repo.Migrations.CreateFacilities do
  use Ecto.Migration

  def change do
    create table(:facilities) do
      add :name, :string
      add :description, :text
      # add :location__lat, :float
      # add :location__lng, :float
      add :valid, :boolean, default: false, null: false
      add :adresse__street, :string
      add :adresse__city, :string
      add :adresse__zip_code, :string

      timestamps()
    end

    # Add location column
    execute("SELECT AddGeometryColumn ('facilities','location', 4326,'POINT', 2);")

    # Create a GIST Index
    create index(:facilities, [:location], using: :gist)
  end
end
