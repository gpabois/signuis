defmodule Signuis.Facilities.Policy do
  @behaviour Bodyguard.Policy

  import Bodyguard

  alias Signuis.Administration
  alias Signuis.Facilities
  alias Signuis.Facilities.{Facility, Member}
  alias Signuis.Accounts.User


  def authorize(action, user, params) do
    permit?(Administration, action, user, params)
    or case {action, params} do
      {{:access, view}, %Facility{} = facility} when view in [:menu, :dashboard, :reports, :production, :members] ->
        is_member?(facility, user)
      {{:update, :facilities}, %Facility{} = facility} ->
        has_role?(facility, user, "admin")
      {{:add, :members}, %Facility{} = facility} ->
        has_role?(facility, user, "admin")
      {{action, :members}, {%Facility{} = facility, %Member{} = member}} when action in [:update, :delete] ->
        member.user_id != user.id and has_role?(facility, user, "admin")
      _ -> false
    end
  end

  def authorize(action, user) do
    permit?(Administration, action, user)
    or case action do
      {:add, :facilities} when is_struct(user, User) ->
        true
      _ -> false
    end
  end

  defp is_member?(%Facility{} = facility, user) do
    Facilities.is_member?(facility, user)
  end

  defp has_role?(%Facility{} = facility, user, role) do
    Facilities.has_role?(facility, user, role)
  end
end
