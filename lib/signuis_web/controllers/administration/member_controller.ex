defmodule SignuisWeb.Administration.MemberController do
  use SignuisWeb, :controller

  alias Signuis.Facilities
  alias Signuis.Facilities.Member

  def index(conn, _params) do
    facilities_members = Facilities.list_facilities_members()
    render(conn, "index.html", facilities_members: facilities_members)
  end

  def new(conn, _params) do
    changeset = Facilities.change_member(%Member{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"member" => member_params}) do
    case Facilities.create_member(member_params) do
      {:ok, member} ->
        conn
        |> put_flash(:info, "Member created successfully.")
        |> redirect(to: Routes.administration_member_path(conn, :show, member))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    member = Facilities.get_member!(id)
    render(conn, "show.html", member: member)
  end

  def edit(conn, %{"id" => id}) do
    member = Facilities.get_member!(id)
    changeset = Facilities.change_member(member)
    render(conn, "edit.html", member: member, changeset: changeset)
  end

  def update(conn, %{"id" => id, "member" => member_params}) do
    member = Facilities.get_member!(id)

    case Facilities.update_member(member, member_params) do
      {:ok, member} ->
        conn
        |> put_flash(:info, "Member updated successfully.")
        |> redirect(to: Routes.administration_member_path(conn, :show, member))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", member: member, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    member = Facilities.get_member!(id)
    {:ok, _member} = Facilities.delete_member(member)

    conn
    |> put_flash(:info, "Member deleted successfully.")
    |> redirect(to: Routes.administration_member_path(conn, :index))
  end
end
