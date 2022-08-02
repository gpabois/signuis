defmodule Signuis.Reporting.NuisanceType do
  use Ecto.Schema
  import Ecto.Changeset

  schema "nuisances_types" do
    field :description, :string
    field :family, :string
    field :label, :string

    timestamps()
  end

  def families, do: [
    "Olfactive": :smell,
    "Sonore": :sound
  ]

  @doc false
  def changeset(nuisance_type, attrs) do
    nuisance_type
    |> cast(attrs, [:label, :family, :description])
    |> validate_required([:label, :family, :description])
  end
end
