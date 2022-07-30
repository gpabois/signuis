defmodule SignuisWeb.Factories.FactoryController do
  use SignuisWeb, :controller

  alias Signuis.Factories
  alias Signuis.Factories.Factory

  def index(conn, _params) do
    factories = Factories.list_factories()
    render(conn, "index.html", factories: factories)
  end

  def new(conn, _params) do
    changeset = Factories.change_factory(%Factory{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"factory" => factory_params}) do
    case Factories.register_factory(factory_params, conn.assigns.current_user) do
      {:ok, factory} ->
        conn
        |> put_flash(:info, "Factory created successfully.")
        |> redirect(to: Routes.factories_factory_path(conn, :show, factory))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    factory = Factories.get_factory!(id)
    render(conn, "show.html", factory: factory)
  end

  def edit(conn, %{"id" => id}) do
    factory = Factories.get_factory!(id)
    changeset = Factories.change_factory(factory)
    render(conn, "edit.html", factory: factory, changeset: changeset)
  end

  def update(conn, %{"id" => id, "factory" => factory_params}) do
    factory = Factories.get_factory!(id)

    case Factories.update_factory(factory, factory_params) do
      {:ok, factory} ->
        conn
        |> put_flash(:info, "Factory updated successfully.")
        |> redirect(to: Routes.factories_factory_path(conn, :show, factory))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", factory: factory, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    factory = Factories.get_factory!(id)
    {:ok, _factory} = Factories.delete_factory(factory)

    conn
    |> put_flash(:info, "Factory deleted successfully.")
    |> redirect(to: Routes.factories_factory_path(conn, :index))
  end
end
