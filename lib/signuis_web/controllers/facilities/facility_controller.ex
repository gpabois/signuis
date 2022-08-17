defmodule SignuisWeb.Facilities.FacilityController do
  use SignuisWeb, :controller

  alias Signuis.Facilities
  alias Signuis.Facilities.Facility

  defp get_navigable_links(conn_or_socket, facility, user) do
    (if permit?(Facilities, {:access, :dashboard}, user, facility), do: [{Routes.facilities_live_path(conn_or_socket, SignuisWeb.Facilities.DashboardLive, facility), "Surveillance"}], else: [])
    ++
    (if permit?(Facilities, {:access, :reports}, user, facility), do: [{Routes.facilities_report_path(conn_or_socket, :index, facility), "Signalements"}], else: [])
    ++
    (if permit?(Facilities, {:access, :production}, user, facility), do: [{Routes.facilities_production_path(conn_or_socket, :index, facility), "Planning de production"}])
    ++
    (if permit?(Facilities, {:access, :members}, user, facility), do: [{Routes.facilities_member_path(conn_or_socket, :index, facility), "Equipe"}], else: [])
  end

  def nav(%Plug.Conn{} = conn) do
    if permit?(Facilities, {:access, :menu}, conn.assigns.current_user, conn.assigns.facility) do
      conn
      |> Plug.Conn.assign(:nav, [
        {conn.assigns.facility.name, get_navigable_links(conn, conn.assigns.facility, conn.assigns.current_user)}
      ])
    else
      conn
    end
  end

  def nav(%Phoenix.LiveView.Socket{} = socket) do
    if permit?(Facilities, {:access, :menu}, socket.assigns.current_user, socket.assigns.facility) do
      socket
      |> Phoenix.LiveView.assign(:nav, [
        {socket.assigns.facility.name, get_navigable_links(socket, socket.assigns.facility, socket.assigns.current_user)}
    ]) else
      socket
    end
  end


  def index(conn, _params) do
    facilities = Facilities.list_facilities()
    render(conn, "index.html", facilities: facilities)
  end

  def new(conn, _params) do
    if permit?(Facilities, {:add, :facilities}, conn.assigns.current_user) do
      changeset = Facilities.change_facility(%Facility{}, %{})
      render(conn, "new.html", changeset: changeset)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def create(conn, %{"facility" => facility_params}) do
    if permit?(Facilities, {:add, :facilities}, conn.assigns.current_user) do
      case Facilities.register_facility(facility_params, conn.assigns.current_user) do
        {:ok, facility} ->
          conn
          |> put_flash(:info, "Facility created successfully.")
          |> redirect(to: Routes.facilities_facility_path(conn, :show, facility))

        {:error, %Ecto.Changeset{} = changeset} ->
          render(conn, "new.html", changeset: changeset)
      end
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def show(conn, %{"id" => id}) do
    facility = Facilities.get_facility!(id)

    conn
    |> assign(:facility, facility)
    |> nav
    |> render("show.html")
  end

  def edit(conn, %{"id" => id}) do
    facility = Facilities.get_facility!(id)

    if permit?(Facilities, {:update, :facilities}, conn.assigns.current_user, facility) do
      changeset = Facilities.change_facility(facility, %{})
      render(conn, "edit.html", facility: facility, changeset: changeset)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def update(conn, %{"id" => id, "facility" => facility_params}) do
    facility = Facilities.get_facility!(id)

    if permit?(Facilities, {:update, :facilities}, conn.assigns.current_user, facility) do
      case Facilities.update_facility(facility, facility_params) do
        {:ok, facility} ->
          conn
          |> put_flash(:info, "Facility updated successfully.")
          |> redirect(to: Routes.facilities_facility_path(conn, :show, facility))

        {:error, %Ecto.Changeset{} = changeset} ->
          render(conn, "edit.html", facility: facility, changeset: changeset)
      end
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def delete(conn, %{"id" => id}) do
    facility = Facilities.get_facility!(id)

    if permit?(Facilities, {:delete, :facilities}, conn.assigns.current_user, facility) do
      {:ok, _facility} = Facilities.delete_facility(facility)

      conn
      |> put_flash(:info, "Facility deleted successfully.")
      |> redirect(to: Routes.facilities_facility_path(conn, :index))
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end
end
