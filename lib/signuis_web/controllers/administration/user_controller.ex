defmodule SignuisWeb.Administration.UserController do
  use SignuisWeb, :controller

  alias Signuis.Accounts

  def index(conn, _params) do
    if permit?(Administration, {:access, :users}, conn.assigns.current_user) do
      users = Accounts.list_users()
      render(conn, "index.html", users: users)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def show(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)

    if permit?(Administration, {:access, :users}, conn.assigns.current_user, user) do
      render(conn, "show.html", user: user)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def edit(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)

    if permit?(Administration, {:update, :users}, conn.assigns.current_user, user) do
      changeset = Accounts.change_user(user)
      render(conn, "edit.html", user: user, changeset: changeset)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def update(conn, %{"id" => id, "user" => user_params}) do
    user = Accounts.get_user!(id)

    if permit?(Administration, {:update, :users}, conn.assigns.current_user, user) do
      case Accounts.update_user(user, user_params) do
        {:ok, user} ->
          conn
          |> put_flash(:info, "User updated successfully.")
          |> redirect(to: Routes.administration_user_path(conn, :show, user))

        {:error, %Ecto.Changeset{} = changeset} ->
          render(conn, "edit.html", user: user, changeset: changeset)
      end
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def delete(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)
    if permit?(Administration, {:delete, :users}, conn.assigns.current_user, user) do
      {:ok, _user} = Accounts.delete_user(user)

      conn
      |> put_flash(:info, "User deleted successfully.")
      |> redirect(to: Routes.administration_user_path(conn, :index))
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end
end
