defmodule Signuis.Facilities.Servers.Production do
  use GenServer

  alias Signuis.Facilities.Facility
  alias Signuis.Facilities

  def start_link(_) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @impl true
  def init(_) do
    {:ok, %{}}
  end

  @impl true
  def handle_call({:toggle_production, %Facility{} = facility}, _from, state) do
    result = case Facilities.current_ongoing_production(facility) do
      nil ->
        params = %{facility_id: facility.id, begin: DateTime.utc_now(), end: nil}
        Facilities.create_production(params, mode: :toggle)
      production ->
        Facilities.update_production(production, %{end: DateTime.utc_now()}, mode: :toggle)
    end
    {:reply, result, state}
  end

  def toggle_production(%Facility{} = facility) do
    GenServer.call(__MODULE__, {:toggle_production, facility})
  end
end
