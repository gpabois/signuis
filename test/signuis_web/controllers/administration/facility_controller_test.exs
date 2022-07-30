defmodule SignuisWeb.Administration.FacilityControllerTest do
  use SignuisWeb.ConnCase

  import Signuis.FacilitiesFixtures

  @create_attrs %{}
  @update_attrs %{}
  @invalid_attrs %{}

  describe "index" do
    test "lists all facilities", %{conn: conn} do
      conn = get(conn, Routes.administration_facility_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Facilities"
    end
  end

  describe "new facility" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.administration_facility_path(conn, :new))
      assert html_response(conn, 200) =~ "New Facility"
    end
  end

  describe "create facility" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.administration_facility_path(conn, :create), facility: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.administration_facility_path(conn, :show, id)

      conn = get(conn, Routes.administration_facility_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Facility"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.administration_facility_path(conn, :create), facility: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Facility"
    end
  end

  describe "edit facility" do
    setup [:create_facility]

    test "renders form for editing chosen facility", %{conn: conn, facility: facility} do
      conn = get(conn, Routes.administration_facility_path(conn, :edit, facility))
      assert html_response(conn, 200) =~ "Edit Facility"
    end
  end

  describe "update facility" do
    setup [:create_facility]

    test "redirects when data is valid", %{conn: conn, facility: facility} do
      conn = put(conn, Routes.administration_facility_path(conn, :update, facility), facility: @update_attrs)
      assert redirected_to(conn) == Routes.administration_facility_path(conn, :show, facility)

      conn = get(conn, Routes.administration_facility_path(conn, :show, facility))
      assert html_response(conn, 200)
    end

    test "renders errors when data is invalid", %{conn: conn, facility: facility} do
      conn = put(conn, Routes.administration_facility_path(conn, :update, facility), facility: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Facility"
    end
  end

  describe "delete facility" do
    setup [:create_facility]

    test "deletes chosen facility", %{conn: conn, facility: facility} do
      conn = delete(conn, Routes.administration_facility_path(conn, :delete, facility))
      assert redirected_to(conn) == Routes.administration_facility_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.administration_facility_path(conn, :show, facility))
      end
    end
  end

  defp create_facility(_) do
    facility = facility_fixture()
    %{facility: facility}
  end
end
