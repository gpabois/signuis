defmodule SignuisWeb.Facilities.FacilityController do
  use SignuisWeb, :controller

  alias Signuis.Facilities
  alias Signuis.Facilities.Facility

  def nav(%Plug.Conn{} = conn) do
    conn
    |> Plug.Conn.assign(:nav, [
      {conn.assigns.facility.name, [
        {Routes.facilities_live_path(conn, SignuisWeb.Facilities.DashboardLive, conn.assigns.facility), "Surveillance"},
        {Routes.facilities_report_path(conn, :index, conn.assigns.facility), "Signalements"},
        {Routes.facilities_member_path(conn, :index, conn.assigns.facility), "Equipe"}
      ]}
    ])
  end

  def nav(%Phoenix.LiveView.Socket{} = conn) do
    conn
    |> Phoenix.LiveView.assign(:nav, [
      {conn.assigns.facility.name, [
        {Routes.facilities_live_path(conn, SignuisWeb.Facilities.DashboardLive, conn.assigns.facility), "Surveillance"},
        {Routes.facilities_report_path(conn, :index, conn.assigns.facility), "Signalements"},
        {Routes.facilities_member_path(conn, :index, conn.assigns.facility), "Equipe"}
      ]}
    ])
  end


  def index(conn, _params) do
    facilities = Facilities.list_facilities()
    render(conn, "index.html", facilities: facilities)
  end

  def new(conn, _params) do
    changeset = Facilities.change_facility(%Facility{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"facility" => facility_params}) do
    case Facilities.register_facility(facility_params, conn.assigns.current_user) do
      {:ok, facility} ->
        conn
        |> put_flash(:info, "Facility created successfully.")
        |> redirect(to: Routes.facilities_facility_path(conn, :show, facility))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    facility = Facilities.get_facility!(id)
    render(conn, "show.html", facility: facility)
  end

  def edit(conn, %{"id" => id}) do
    facility = Facilities.get_facility!(id)
    changeset = Facilities.change_facility(facility)
    render(conn, "edit.html", facility: facility, changeset: changeset)
  end

  def update(conn, %{"id" => id, "facility" => facility_params}) do
    facility = Facilities.get_facility!(id)

    case Facilities.update_facility(facility, facility_params) do
      {:ok, facility} ->
        conn
        |> put_flash(:info, "Facility updated successfully.")
        |> redirect(to: Routes.facilities_facility_path(conn, :show, facility))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", facility: facility, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    facility = Facilities.get_facility!(id)
    {:ok, _facility} = Facilities.delete_facility(facility)

    conn
    |> put_flash(:info, "Facility deleted successfully.")
    |> redirect(to: Routes.facilities_facility_path(conn, :index))
  end
end
