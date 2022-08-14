defmodule SignuisWeb.Administration.NuisanceTypeController do
  use SignuisWeb, :controller

  alias Signuis.Reporting
  alias Signuis.Reporting.NuisanceType

  def index(conn, _params) do
    if permit?(Administration, {:access, :nuisance_types}, conn.assigns.current_user) do
      nuisances_types = Reporting.list_nuisances_types()
      render(conn, "index.html", nuisances_types: nuisances_types)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def new(conn, _params) do
    if permit?(Administration, {:add, :nuisance_types}, conn.assigns.current_user) do
      changeset = Reporting.change_nuisance_type(%NuisanceType{})
      render(conn, "new.html", changeset: changeset)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def create(conn, %{"nuisance_type" => nuisance_type_params}) do
    if permit?(Administration, {:add, :nuisance_types}, conn.assigns.current_user) do
      case Reporting.create_nuisance_type(nuisance_type_params) do
        {:ok, nuisance_type} ->
          conn
          |> put_flash(:info, "Nuisance type created successfully.")
          |> redirect(to: Routes.administration_nuisance_type_path(conn, :show, nuisance_type))

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
    if permit?(Administration, {:access, :nuisance_types}, conn.assigns.current_user) do
      nuisance_type = Reporting.get_nuisance_type!(id)
      render(conn, "show.html", nuisance_type: nuisance_type)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def edit(conn, %{"id" => id}) do
    nuisance_type = Reporting.get_nuisance_type!(id)
    if permit?(Administration, {:update, :nuisance_types}, conn.assigns.current_user, nuisance_type) do
      changeset = Reporting.change_nuisance_type(nuisance_type)
      render(conn, "edit.html", nuisance_type: nuisance_type, changeset: changeset)
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def update(conn, %{"id" => id, "nuisance_type" => nuisance_type_params}) do
    nuisance_type = Reporting.get_nuisance_type!(id)

    if permit?(Administration, {:update, :nuisance_types}, conn.assigns.current_user, nuisance_type) do
      case Reporting.update_nuisance_type(nuisance_type, nuisance_type_params) do
        {:ok, nuisance_type} ->
          conn
          |> put_flash(:info, "Nuisance type updated successfully.")
          |> redirect(to: Routes.administration_nuisance_type_path(conn, :show, nuisance_type))

        {:error, %Ecto.Changeset{} = changeset} ->
          render(conn, "edit.html", nuisance_type: nuisance_type, changeset: changeset)
      end
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end

  def delete(conn, %{"id" => id}) do
    nuisance_type = Reporting.get_nuisance_type!(id)
    if permit?(Administration, {:delete, :nuisance_types}, conn.assigns.current_user, nuisance_type) do
      {:ok, _nuisance_type} = Reporting.delete_nuisance_type(nuisance_type)
      conn
      |> put_flash(:info, "Nuisance type deleted successfully.")
      |> redirect(to: Routes.administration_nuisance_type_path(conn, :index))
    else
      conn
      |> redirect(to: "/403.html")
      |> halt()
    end
  end
end
