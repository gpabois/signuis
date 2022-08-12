defmodule Signuis.Messaging.ReportCallbackAck do
  use Ecto.Schema
  import Ecto.Changeset

  schema "reports_callbacks_acks" do

    field :report_id, :id
    field :report_callback_id, :id
    field :message_id, :id

    timestamps()
  end

  @doc false
  def changeset(report_callback_ack, attrs) do
    report_callback_ack
    |> cast(attrs, [:report_id, :report_callback_id, :message_id])
    |> validate_required([:report_id, :report_callback_id, :message_id])
  end
end
