defmodule SignuisWeb.Administration.Facilities.FacilityController do
  use SignuisWeb, :controller

  alias Signuis.Facilities
  alias Signuis.Facilities.Facility

  def index(conn, _params) do
    if permit?(Administration, {:access, :facilities}, conn.assigns.current_user) do
      facilities = Facilities.list_facilities()
      render(conn, "index.html", facilities: facilities)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def new(conn, _params) do
    if permit?(Administration, {:add, :facilities}, conn.assigns.current_user) do
      changeset = Facilities.change_facility(%Facility{}, %{}, admin: true)
      render(conn, "new.html", changeset: changeset)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def create(conn, %{"facility" => facility_params}) do
    if permit?(Administration, {:add, :facilities}, conn.assigns.current_user) do
      case Facilities.create_facility(facility_params, admin: true) do
        {:ok, facility} ->
          conn
          |> put_flash(:info, "Facility created successfully.")
          |> redirect(to: Routes.administration_facility_path(conn, :show, facility))

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

    if permit?(Administration, {:access, :facilities}, conn.assigns.current_user, facility) do
      render(conn, "show.html", facility: facility)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def edit(conn, %{"id" => id}) do
    facility = Facilities.get_facility!(id)
    if permit?(Administration, {:update, :facilities}, conn.assigns.current_user, facility) do
      changeset = Facilities.change_facility(facility, %{}, admin: true)
      render(conn, "edit.html", facility: facility, changeset: changeset)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def update(conn, %{"id" => id, "facility" => facility_params}) do
    facility = Facilities.get_facility!(id)
    if permit?(Administration, {:update, :facilities}, conn.assigns.current_user, facility) do
      case Facilities.update_facility(facility, facility_params, admin: true) do
        {:ok, facility} ->
          conn
          |> put_flash(:info, "Facility updated successfully.")
          |> redirect(to: Routes.administration_facility_path(conn, :show, facility))

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

    if permit?(Administration, {:update, :facilities}, conn.assigns.current_user, facility) do
      {:ok, _facility} = Facilities.delete_facility(facility)

      conn
      |> put_flash(:info, "Facility deleted successfully.")
      |> redirect(to: Routes.administration_facility_path(conn, :index))
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end
end
