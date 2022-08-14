defmodule Mix.Tasks.Sgn.User.Create do
  use Mix.Task
  alias Signuis.Accounts

  @moduledoc "Create a user"
  @shortdoc "email password"

  @requirements ["app.start"]

  @impl Mix.Task
  def run(args) do
    case args do
      [email, password] ->
        case Accounts.register_user(%{"email" => email, "password" => password}) do
          {:ok, user} -> Mix.shell.info("User `#{user.email}` has been created.")
          {:error, changeset} ->
            Mix.shell.error("Cannot create user, because: ")
            for {field, {msg, _}} <- changeset.errors do
              Mix.shell.error("- error in field #{field}: #{msg}")
            end
        end
      _ ->
        Mix.shell().error("Invalid arguments, must be `email password`")
    end
  end
end
