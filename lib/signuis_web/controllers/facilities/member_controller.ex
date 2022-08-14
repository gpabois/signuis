defmodule SignuisWeb.Facilities.MemberController do
  use SignuisWeb, :controller

  alias Signuis.Facilities
  alias Signuis.Facilities.Member

  def index(conn, %{"facility_id" => facility_id}) do
    facility = Facilities.get_facility!(facility_id)
    if permit?(Facilities, {:access, :members}, conn.assigns.current_user, facility) do
      facilities_members = Facilities.list_facilities_members(preload: [:user], filter: %{"facility" => facility})

      conn
      |> assign(:facility, facility)
      |> assign(:facilities_members, facilities_members)
      |> SignuisWeb.Facilities.FacilityController.nav
      |> render("index.html")
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def new(conn, %{"facility_id" => facility_id}) do
    facility = Facilities.get_facility!(facility_id)
    if permit?(Facilities, {:add, :members}, conn.assigns.current_user, facility) do
      changeset = Facilities.change_member(%Member{}, %{}, mode: :new)
      render(conn, "new.html", changeset: changeset, facility: facility)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def create(conn, %{"facility_id" => facility_id, "member" => member_params}) do
    facility = Facilities.get_facility!(facility_id)

    if permit?(Facilities, {:add, :members}, conn.assigns[:current_user], facility) do
      member_params = member_params |> Map.put("facility_id", facility.id)

      case Facilities.create_member(member_params) do
        {:ok, _member} ->
          conn
          |> put_flash(:info, "Member created successfully.")
          |> redirect(to: Routes.facilities_member_path(conn, :index, facility))

        {:error, %Ecto.Changeset{} = changeset} ->

          render(conn, "new.html", changeset: changeset, facility: facility)
      end
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def edit(conn, %{"id" => id}) do
    member = Facilities.get_member!(id)
    facility = Facilities.get_facility!(member.facility_id)

    if permit?(Facilities, {:update, :members}, conn.assigns.current_user, {facility, member}) do
      changeset = Facilities.change_member(member, %{}, mode: :update)
      render(conn, "edit.html", member: member, changeset: changeset, facility: facility)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def update(conn, %{"id" => id, "member" => member_params}) do
    member = Facilities.get_member!(id)
    facility = Facilities.get_facility!(member.facility_id)

    if permit?(Facilities, {:update, :members}, conn.assigns.current_user, {facility, member}) do
      case Facilities.update_member(member, member_params) do
        {:ok, member} ->
          conn
          |> put_flash(:info, "Member updated successfully.")
          |> redirect(to: Routes.facilities_member_path(conn, :index, member.facility_id))

        {:error, %Ecto.Changeset{} = changeset} ->
          render(conn, "edit.html", member: member, changeset: changeset, facility: facility)
      end
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def delete(conn, %{"id" => id}) do
    member = Facilities.get_member!(id)
    facility = Facilities.get_facility!(member.facility_id)

    if permit?(Facilities, {:update, :members}, conn.assigns.current_user, {facility, member}) do
      {:ok, _member} = Facilities.delete_member(member)

      conn
      |> put_flash(:info, "Member deleted successfully.")
      |> redirect(to: Routes.facilities_member_path(conn, :index, member.facility_id))
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end
end
