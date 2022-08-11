defmodule Signuis.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Signuis.Repo,
      # Start the Telemetry supervisor
      SignuisWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Signuis.PubSub},
      # Start the Endpoint (http/https)
      SignuisWeb.Endpoint,
      # Assign the reports to facilities
      Signuis.Facilities.Servers.Report,
      # Manage facility production (toggle)
      Signuis.Facilities.Servers.Production
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Signuis.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    SignuisWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
