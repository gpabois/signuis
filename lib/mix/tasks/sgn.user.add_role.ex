defmodule Mix.Tasks.Sgn.User.AddRole do
  use Mix.Task
  alias Signuis.Accounts

  @moduledoc "Assign a role to the user"
  @shortdoc "email role"

  @requirements ["app.start"]

  @impl Mix.Task
  def run(args) do
    case args do
      [email, role] when role in ["admin"] ->
        case Accounts.get_user_by_email(email) do
          user when not is_nil(user) ->
            if role in user.roles do
              Mix.shell.error("User `#{user.email}` has already the role `#{role}`.")
            else
              case Accounts.update_user(user, %{"roles" => [role | user.roles]}) do
                {:ok, user } ->
                  Mix.shell.info("User `#{user.email}` has been given the role `#{role}`.")
                {:error, changeset} ->
                  Mix.shell.error("Cannot add role to user, because: ")
                  for {field, {msg, _}} <- changeset.errors do
                    Mix.shell.error("- error in field #{field}: #{msg}")
                  end
              end
            end
          nil->
            Mix.shell.info("User with email `#{email}` does not exist.")
        end
      [_email, role] when role not in ["admin"] ->
        Mix.shell().error("Invalid arguments, role must be `admin`")
      _ ->
        Mix.shell().error("Invalid arguments, must be `email role`")
    end
  end
end
