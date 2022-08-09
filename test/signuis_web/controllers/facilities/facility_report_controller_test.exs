defmodule SignuisWeb.Facilities.FacilityReportControllerTest do
  use SignuisWeb.ConnCase

  import Signuis.FacilitiesFixtures

  @create_attrs %{}
  @update_attrs %{}
  @invalid_attrs %{}

  describe "index" do
    test "lists all facilities_reports", %{conn: conn} do
      conn = get(conn, Routes.facilities_facility_report_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Facilities reports"
    end
  end

  describe "new facility_report" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.facilities_facility_report_path(conn, :new))
      assert html_response(conn, 200) =~ "New Facility report"
    end
  end

  describe "create facility_report" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.facilities_facility_report_path(conn, :create), facility_report: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.facilities_facility_report_path(conn, :show, id)

      conn = get(conn, Routes.facilities_facility_report_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Facility report"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.facilities_facility_report_path(conn, :create), facility_report: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Facility report"
    end
  end

  describe "edit facility_report" do
    setup [:create_facility_report]

    test "renders form for editing chosen facility_report", %{conn: conn, facility_report: facility_report} do
      conn = get(conn, Routes.facilities_facility_report_path(conn, :edit, facility_report))
      assert html_response(conn, 200) =~ "Edit Facility report"
    end
  end

  describe "update facility_report" do
    setup [:create_facility_report]

    test "redirects when data is valid", %{conn: conn, facility_report: facility_report} do
      conn = put(conn, Routes.facilities_facility_report_path(conn, :update, facility_report), facility_report: @update_attrs)
      assert redirected_to(conn) == Routes.facilities_facility_report_path(conn, :show, facility_report)

      conn = get(conn, Routes.facilities_facility_report_path(conn, :show, facility_report))
      assert html_response(conn, 200)
    end

    test "renders errors when data is invalid", %{conn: conn, facility_report: facility_report} do
      conn = put(conn, Routes.facilities_facility_report_path(conn, :update, facility_report), facility_report: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Facility report"
    end
  end

  describe "delete facility_report" do
    setup [:create_facility_report]

    test "deletes chosen facility_report", %{conn: conn, facility_report: facility_report} do
      conn = delete(conn, Routes.facilities_facility_report_path(conn, :delete, facility_report))
      assert redirected_to(conn) == Routes.facilities_facility_report_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.facilities_facility_report_path(conn, :show, facility_report))
      end
    end
  end

  defp create_facility_report(_) do
    facility_report = facility_report_fixture()
    %{facility_report: facility_report}
  end
end
