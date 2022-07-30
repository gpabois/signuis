defmodule Signuis.Repo do
  use Ecto.Repo,
    otp_app: :signuis,
    adapter: Ecto.Adapters.Postgres
end
