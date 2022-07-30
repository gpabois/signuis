defmodule SignuisWeb.Factories.FactoryControllerTest do
  use SignuisWeb.ConnCase

  import Signuis.FactoriesFixtures

  @create_attrs %{adresse__code_postal: "some adresse__code_postal", adresse__commune: "some adresse__commune", adresse__voie: "some adresse__voie", description: "some description", location__lat: 120.5, location__lng: 120.5, nom: "some nom", valid: true}
  @update_attrs %{adresse__code_postal: "some updated adresse__code_postal", adresse__commune: "some updated adresse__commune", adresse__voie: "some updated adresse__voie", description: "some updated description", location__lat: 456.7, location__lng: 456.7, nom: "some updated nom", valid: false}
  @invalid_attrs %{adresse__code_postal: nil, adresse__commune: nil, adresse__voie: nil, description: nil, location__lat: nil, location__lng: nil, nom: nil, valid: nil}

  describe "index" do
    test "lists all factories", %{conn: conn} do
      conn = get(conn, Routes.factories_factory_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Factories"
    end
  end

  describe "new factory" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.factories_factory_path(conn, :new))
      assert html_response(conn, 200) =~ "New Factory"
    end
  end

  describe "create factory" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.factories_factory_path(conn, :create), factory: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.factories_factory_path(conn, :show, id)

      conn = get(conn, Routes.factories_factory_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Factory"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.factories_factory_path(conn, :create), factory: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Factory"
    end
  end

  describe "edit factory" do
    setup [:create_factory]

    test "renders form for editing chosen factory", %{conn: conn, factory: factory} do
      conn = get(conn, Routes.factories_factory_path(conn, :edit, factory))
      assert html_response(conn, 200) =~ "Edit Factory"
    end
  end

  describe "update factory" do
    setup [:create_factory]

    test "redirects when data is valid", %{conn: conn, factory: factory} do
      conn = put(conn, Routes.factories_factory_path(conn, :update, factory), factory: @update_attrs)
      assert redirected_to(conn) == Routes.factories_factory_path(conn, :show, factory)

      conn = get(conn, Routes.factories_factory_path(conn, :show, factory))
      assert html_response(conn, 200) =~ "some updated adresse__code_postal"
    end

    test "renders errors when data is invalid", %{conn: conn, factory: factory} do
      conn = put(conn, Routes.factories_factory_path(conn, :update, factory), factory: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Factory"
    end
  end

  describe "delete factory" do
    setup [:create_factory]

    test "deletes chosen factory", %{conn: conn, factory: factory} do
      conn = delete(conn, Routes.factories_factory_path(conn, :delete, factory))
      assert redirected_to(conn) == Routes.factories_factory_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.factories_factory_path(conn, :show, factory))
      end
    end
  end

  defp create_factory(_) do
    factory = factory_fixture()
    %{factory: factory}
  end
end
