defmodule Signuis.Groups.Member do
  use Ecto.Schema
  import Ecto.Changeset

  alias Signuis.Accounts.User
  alias Signuis.Repo

  schema "group_members" do
    field :roles, {:array, :string}

    field :user_id, :id
    field :group_id, :id

    timestamps()
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
end
