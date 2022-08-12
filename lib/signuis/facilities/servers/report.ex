defmodule Signuis.Facilities.Servers.Report do
  use GenServer

  alias Signuis.Reporting.Report
  alias Signuis.Facilities

  def start_link(_) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  def init(init) do
    #Logger.info("[Signuis] Starting #{__MODULE__ |> to_string}")
    Phoenix.PubSub.subscribe(Signuis.PubSub, "reports")
    {:ok, init}
  end

  @impl true
  def handle_info(event, state) do
    state = case event do
      {:new_report, %Report{} = report} ->
        # Automatically assign all reports to a facility.
        # Need to enhance the assignment method to better aim the facilities that might be responsible for the nuisance.
        facilities = Facilities.list_facilities()
        Facilities.assign_report(
          facilities,
          report
        )
        state
      _ -> state
    end
    {:noreply, state}
  end
end
