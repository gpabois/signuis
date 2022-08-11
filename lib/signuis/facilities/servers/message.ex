defmodule Signuis.Facilities.Servers.Message do
  use GenServer

  alias Signuis.Reporting.Report
  alias Signuis.Facilities.Facility
  alias Signuis.Facilities

  def start_link(_) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  def init(init) do
    #Logger.info("[Signuis] Starting #{__MODULE__ |> to_string}")
    Phoenix.PubSub.subscribe(Signuis.PubSub, "facilities")
    {:ok, init}
  end

  @impl true
  def handle_info({:new_assigned_report, %Report{} = report, %Facility{} = facility}, state) do
    facilities = Facilities.list_facilities()
    Facilities.assign_report(
      facilities,
      report
    )
    {:noreply, state}
  end
end
