defmodule :"Elixir.Signuis.Repo.Migrations.Add timezone setting to user" do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :tz, :string, default: "Europe/Paris", null: false
    end
  end
end
