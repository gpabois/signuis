defmodule Signuis.Facilities.Production do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  alias Signuis.Repo
  import Signuis.Utils
  import Signuis.Filter

  schema "facilities_productions" do
    field :begin, :naive_datetime
    field :end, :naive_datetime
    field :facility_id, :id

    timestamps()
  end

  @doc false
  def changeset(production, attrs) do
    production
    |> cast(attrs, [:begin, :end])
    |> validate_required([:begin, :end])
  end

  def list(opts \\ []) do
    filters = Keyword.get(opts, :filter, %{}) |> Enum.into(%{}) |> keys_to_atoms
    preload = Keyword.get(opts, :preload, [])

    __MODULE__
    |> filter(filters, __MODULE__)
    |> Repo.all
    |> Repo.preload(preload)
  end


  def filter_on_attribute({:facility, facility}, query) do
    where(query, [b], b.facility_id == ^facility.id)
  end
end
