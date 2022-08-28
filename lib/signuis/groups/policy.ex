defmodule Signuis.Groups.Policy do
  @behaviour Bodyguard.Policy

  import Bodyguard

  alias Signuis.Administration

  alias Signuis.Groups
  alias Signuis.Groups.{Group, Member}
  alias Signuis.Accounts.User

  def authorize(action, user, params) do
    permit?(Administration, action, user, params)
    or case {action, params} do
      _ -> false
    end
  end

  def authorize(action, user) do
    permit?(Administration, action, user)
    or case action do
      _ -> false
    end
  end

end
