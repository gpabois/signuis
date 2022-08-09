defmodule Signuis.EventTypes do

  def new_report(report), do: Phoenix.PubSub.broadcast(Signuis.PubSub, "reports", {:new, report})

  def new_assigned_report(facility, report) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities", {:new_assigned_report, facility, report})
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{facility.id}", {:new_assigned_report, report})
  end
end
