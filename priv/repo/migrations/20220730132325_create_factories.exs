defmodule Signuis.Repo.Migrations.CreateFactories do
  use Ecto.Migration

  def change do
    create table(:factories) do
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
    execute("SELECT AddGeometryColumn ('factories','location', 4326,'POINT', 2);")

    # Create a GIST Index
    create index(:factories, [:location], using: :gist)
  end
end
