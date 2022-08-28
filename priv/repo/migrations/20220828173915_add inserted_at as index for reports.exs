defmodule :"Elixir.Signuis.Repo.Migrations.Add insertedAt as index for reports" do
  use Ecto.Migration

  def change do
    create index(:reports, [:inserted_at])
  end
end
