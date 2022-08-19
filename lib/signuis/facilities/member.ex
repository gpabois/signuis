defmodule Signuis.Facilities.Member do
  use Ecto.Schema

  import Ecto.Changeset
  import Ecto.Query

  alias Signuis.Repo
  import Signuis.Utils
  import Signuis.Filter

  alias Signuis.Accounts.User
  alias Signuis.Facilities.Facility

  schema "facilities_members" do
    field :roles, {:array, :string}, default: []
    belongs_to :user, Signuis.Accounts.User
    field :facility_id, :id

    field :email, :string, virtual: true

    timestamps(type: :utc_datetime)
  end

  def is_member?(%Facility{} = facility, %User{} = user) do
    __MODULE__
    |> where([m], m.user_id == ^user.id)
    |> where([m], m.facility_id == ^facility.id)
    |> select([m], count(m.id))
    |> Repo.one > 0
  end

  def has_role?(%Facility{} = facility, %User{} = user, role) do
    __MODULE__
    |> where([m], m.user_id == ^user.id)
    |> where([m], m.facility_id == ^facility.id)
    |> where([m], ^role in m.roles)
    |> select([m], count(m.id))
    |> Repo.one > 0
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

  def cast_email(changeset) do
    case get_change(changeset, :email) do
      nil -> changeset |> add_error(:email, "can't be blank")
      email ->
        case Repo.get_by(User, email: email) do
          nil -> changeset |> add_error(:email, "user does not exist")
          user -> changeset |> put_change(:user_id, user.id)
        end
    end
  end

  @doc false
  def changeset(member, attrs, opts \\ []) do
    case Keyword.get(opts, :mode, :new) do
      :direct_new ->
        member
      |> cast(attrs, [:facility_id, :roles, :user_id])
      |> validate_required([:user_id, :facility_id])
      |> unique_constraint([:user_id, :facility_id])

      :new -> member
      |> cast(attrs, [:facility_id, :roles, :email])
      |> cast_email()
      |> validate_required([:user_id, :facility_id])
      |> unique_constraint([:user_id, :facility_id])

      :update ->
        member
        |> cast(attrs, [:roles])
        |> validate_required([:roles])
    end

  end
end
