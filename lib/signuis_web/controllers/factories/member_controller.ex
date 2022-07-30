defmodule SignuisWeb.Factories.MemberController do
  use SignuisWeb, :controller

  alias Signuis.Factories
  alias Signuis.Factories.Member

  def index(conn, _params) do
    factories_members = Factories.list_factories_members()
    render(conn, "index.html", factories_members: factories_members)
  end

  def new(conn, %{"factory_id" => factory_id}) do
    factory = Factories.get_factory!(factory_id)
    changeset = Factories.change_member(%Member{})
    render(conn, "new.html", changeset: changeset, factory: factory)
  end

  def create(conn, %{"factory_id" => factory_id, "member" => member_params}) do
    factory = Factories.get_factory!(factory_id)
    case Factories.create_member(member_params) do
      {:ok, _member} ->
        conn
        |> put_flash(:info, "Member created successfully.")
        |> redirect(to: Routes.factories_member_path(conn, :index, factory))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset, factory: factory)
    end
  end

  def edit(conn, %{"id" => id}) do
    member = Factories.get_member!(id)
    changeset = Factories.change_member(member)
    render(conn, "edit.html", member: member, changeset: changeset)
  end

  def update(conn, %{"id" => id, "member" => member_params}) do
    member = Factories.get_member!(id)

    case Factories.update_member(member, member_params) do
      {:ok, member} ->
        conn
        |> put_flash(:info, "Member updated successfully.")
        |> redirect(to: Routes.factories_member_path(conn, :index, member.factory_id))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", member: member, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    member = Factories.get_member!(id)
    {:ok, _member} = Factories.delete_member(member)

    conn
    |> put_flash(:info, "Member deleted successfully.")
    |> redirect(to: Routes.factories_member_path(conn, :index, member.factory_id))
  end
end
