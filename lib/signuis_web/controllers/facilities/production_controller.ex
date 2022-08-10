defmodule SignuisWeb.Facilities.ProductionController do
  use SignuisWeb, :controller

  alias Signuis.Facilities
  alias Signuis.Facilities.Production

  def index(conn, %{"facility_id" => facility_id}) do
    facility = Facilities.get_facility!(facility_id)
    facilities_productions = Facilities.list_facilities_productions(filter: %{"facility" => facility})

    conn
    |> assign(:facility, facility)
    |> assign(:facilities_productions, facilities_productions)
    |> SignuisWeb.Facilities.FacilityController.nav
    |> render("index.html")
  end

  def new(conn, %{"facility_id" => facility_id}) do
    facility = Facilities.get_facility!(facility_id)
    changeset = Facilities.change_production(%Production{})

    conn
    |> assign(:changeset, changeset)
    |> assign(:facility, facility)
    |> SignuisWeb.Facilities.FacilityController.nav
    |> render("new.html")
  end

  def create(conn, %{"facility_id" => facility_id, "production" => production_params}) do
    facility = Facilities.get_facility!(facility_id)

    production_params = production_params |> Map.put("facility_id", facility.id)

    case Facilities.create_production(production_params) do
      {:ok, _production} ->
        conn
        |> put_flash(:info, "Production created successfully.")
        |> redirect(to: Routes.facilities_production_path(conn, :index, facility))

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> assign(:changeset, changeset)
        |> assign(:facility, facility)
        |> SignuisWeb.Facilities.FacilityController.nav
        |> render("new.html")
    end
  end

  def edit(conn, %{"id" => id}) do
    production = Facilities.get_production!(id)
    facility = Facilities.get_facility!(production.facility_id)
    changeset = Facilities.change_production(production)

    conn
    |> assign(:changeset, changeset)
    |> assign(:facility, facility)
    |> assign(:production, production)
    |> SignuisWeb.Facilities.FacilityController.nav
    |> render("edit.html")
  end

  def update(conn, %{"id" => id, "production" => production_params}) do
    production = Facilities.get_production!(id)
    facility = Facilities.get_facility!(production.facility_id)

    case Facilities.update_production(production, production_params) do
      {:ok, _production} ->
        conn
        |> put_flash(:info, "Production updated successfully.")
        |> redirect(to: Routes.facilities_production_path(conn, :index, facility))

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> assign(:production, production)
        |> assign(:changeset, changeset)
        |> assign(:facility, facility)
        |> render("edit.html")
    end
  end

  def delete(conn, %{"id" => id}) do
    production = Facilities.get_production!(id)
    facility = Facilities.get_facility!(production.facility_id)
    {:ok, _production} = Facilities.delete_production(production)

    conn
    |> put_flash(:info, "Production deleted successfully.")
    |> redirect(to: Routes.facilities_production_path(conn, :index, facility))
  end
end
