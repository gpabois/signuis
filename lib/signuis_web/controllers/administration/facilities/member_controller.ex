defmodule SignuisWeb.Administration.Facilities.MemberController do
  use SignuisWeb, :controller

  alias Signuis.Facilities
  alias Signuis.Facilities.Member

  def index(conn, %{"facility_id" => facility_id}) do
    facility = Facilities.get_facility!(facility_id)
    members = Facilities.list_facilities_members(filter: [facility: facility])
    render(conn, "index.html", members: members, facility: facility)
  end

  def new(conn, %{"facility_id" => facility_id}) do
    facility = Facilities.get_facility!(facility_id)
    changeset = Facilities.change_member(%Member{})
    render(conn, "new.html", changeset: changeset, facility: facility)
  end

  def create(conn, %{"facility_id" => facility_id, "member" => member_params}) do
    facility = Facilities.get_facility!(facility_id)
    member_params = Map.put(member_params, "facility_id", facility.id)
    case Facilities.create_member(member_params) do
      {:ok, member} ->
        conn
        |> put_flash(:info, "Member created successfully.")
        |> redirect(to: Routes.administration_member_path(conn, :show, member))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset, facility: facility)
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
    facility = Facilities.get_facility!(member.facility_id)

    {:ok, _member} = Facilities.delete_member(member)

    conn
    |> put_flash(:info, "Member deleted successfully.")
    |> redirect(to: Routes.administration_member_path(conn, :index, facility))
  end
end
