defmodule Signuis.EventTypes do

  def new_report(report), do: Phoenix.PubSub.broadcast(Signuis.PubSub, "reports", {:new_report, report})

  def new_assigned_report(facility, report) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities", {:new_assigned_report, report, facility})
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{facility.id}", {:new_assigned_report, report})
  end

  def begin_production(facility, production) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities", {:begin_facility_production, production, facility})
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{facility.id}", {:begin_facility_production, production})
  end

  def end_production(facility, production) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities", {:end_facility_production, production, facility})
    Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{facility.id}", {:end_facility_production, production})
  end

  def new_report_callback(report_callback) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "messaging::reports_callbacks", {:new_report_callback, report_callback})
    if report_callback.facility_id do
      Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{report_callback.facility_id}", {:new_report_callback, report_callback})
    end
  end

  def updated_report_callback(report_callback) do
    Phoenix.PubSub.broadcast(Signuis.PubSub, "messaging::reports_callbacks", {:updated_report_callback, report_callback})
    if report_callback.facility_id do
      Phoenix.PubSub.broadcast(Signuis.PubSub, "facilities::#{report_callback.facility_id}", {:updated_report_callback, report_callback})
    end
  end

end
