defmodule Signuis.Administration do
  @behaviour Bodyguard

  alias Signuis.Accounts.{User, Anonymous}

  def authorize(_action, %Anonymous{}, _params), do: false
  def authorize(_action, %Anonymous{}), do: false

  def authorize(_action, %User{} = user) do
    # By default we allow any action
    "admin" in user.roles
  end

  def authorize(_action, %User{} = user, _params) do
    # By default we allow any action
    "admin" in user.roles
  end

  def authorize(_action, %User{} = user) do
    # By default we allow any action
    "admin" in user.roles
  end
end
