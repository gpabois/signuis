defmodule :"Elixir.Signuis.Repo.Migrations.Add sessionId to report" do
  use Ecto.Migration

  def change do
    alter table(:reports) do
      add :session_id, :string
    end
  end
end
