defmodule SignuisWeb.Administration.NuisanceTypeControllerTest do
  use SignuisWeb.ConnCase

  import Signuis.ReportingFixtures

  @create_attrs %{}
  @update_attrs %{}
  @invalid_attrs %{}

  describe "index" do
    test "lists all nuisances_types", %{conn: conn} do
      conn = get(conn, Routes.administration_nuisance_type_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Nuisances types"
    end
  end

  describe "new nuisance_type" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.administration_nuisance_type_path(conn, :new))
      assert html_response(conn, 200) =~ "New Nuisance type"
    end
  end

  describe "create nuisance_type" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.administration_nuisance_type_path(conn, :create), nuisance_type: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.administration_nuisance_type_path(conn, :show, id)

      conn = get(conn, Routes.administration_nuisance_type_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Nuisance type"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.administration_nuisance_type_path(conn, :create), nuisance_type: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Nuisance type"
    end
  end

  describe "edit nuisance_type" do
    setup [:create_nuisance_type]

    test "renders form for editing chosen nuisance_type", %{conn: conn, nuisance_type: nuisance_type} do
      conn = get(conn, Routes.administration_nuisance_type_path(conn, :edit, nuisance_type))
      assert html_response(conn, 200) =~ "Edit Nuisance type"
    end
  end

  describe "update nuisance_type" do
    setup [:create_nuisance_type]

    test "redirects when data is valid", %{conn: conn, nuisance_type: nuisance_type} do
      conn = put(conn, Routes.administration_nuisance_type_path(conn, :update, nuisance_type), nuisance_type: @update_attrs)
      assert redirected_to(conn) == Routes.administration_nuisance_type_path(conn, :show, nuisance_type)

      conn = get(conn, Routes.administration_nuisance_type_path(conn, :show, nuisance_type))
      assert html_response(conn, 200)
    end

    test "renders errors when data is invalid", %{conn: conn, nuisance_type: nuisance_type} do
      conn = put(conn, Routes.administration_nuisance_type_path(conn, :update, nuisance_type), nuisance_type: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Nuisance type"
    end
  end

  describe "delete nuisance_type" do
    setup [:create_nuisance_type]

    test "deletes chosen nuisance_type", %{conn: conn, nuisance_type: nuisance_type} do
      conn = delete(conn, Routes.administration_nuisance_type_path(conn, :delete, nuisance_type))
      assert redirected_to(conn) == Routes.administration_nuisance_type_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.administration_nuisance_type_path(conn, :show, nuisance_type))
      end
    end
  end

  defp create_nuisance_type(_) do
    nuisance_type = nuisance_type_fixture()
    %{nuisance_type: nuisance_type}
  end
end
