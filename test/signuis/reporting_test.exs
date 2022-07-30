defmodule Signuis.ReportingTest do
  use Signuis.DataCase

  alias Signuis.Reporting

  describe "nuisances_types" do
    alias Signuis.Reporting.NuisanceType

    import Signuis.ReportingFixtures

    @invalid_attrs %{description: nil, family: nil, label: nil}

    test "list_nuisances_types/0 returns all nuisances_types" do
      nuisance_type = nuisance_type_fixture()
      assert Reporting.list_nuisances_types() == [nuisance_type]
    end

    test "get_nuisance_type!/1 returns the nuisance_type with given id" do
      nuisance_type = nuisance_type_fixture()
      assert Reporting.get_nuisance_type!(nuisance_type.id) == nuisance_type
    end

    test "create_nuisance_type/1 with valid data creates a nuisance_type" do
      valid_attrs = %{description: "some description", family: "some family", label: "some label"}

      assert {:ok, %NuisanceType{} = nuisance_type} = Reporting.create_nuisance_type(valid_attrs)
      assert nuisance_type.description == "some description"
      assert nuisance_type.family == "some family"
      assert nuisance_type.label == "some label"
    end

    test "create_nuisance_type/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Reporting.create_nuisance_type(@invalid_attrs)
    end

    test "update_nuisance_type/2 with valid data updates the nuisance_type" do
      nuisance_type = nuisance_type_fixture()
      update_attrs = %{description: "some updated description", family: "some updated family", label: "some updated label"}

      assert {:ok, %NuisanceType{} = nuisance_type} = Reporting.update_nuisance_type(nuisance_type, update_attrs)
      assert nuisance_type.description == "some updated description"
      assert nuisance_type.family == "some updated family"
      assert nuisance_type.label == "some updated label"
    end

    test "update_nuisance_type/2 with invalid data returns error changeset" do
      nuisance_type = nuisance_type_fixture()
      assert {:error, %Ecto.Changeset{}} = Reporting.update_nuisance_type(nuisance_type, @invalid_attrs)
      assert nuisance_type == Reporting.get_nuisance_type!(nuisance_type.id)
    end

    test "delete_nuisance_type/1 deletes the nuisance_type" do
      nuisance_type = nuisance_type_fixture()
      assert {:ok, %NuisanceType{}} = Reporting.delete_nuisance_type(nuisance_type)
      assert_raise Ecto.NoResultsError, fn -> Reporting.get_nuisance_type!(nuisance_type.id) end
    end

    test "change_nuisance_type/1 returns a nuisance_type changeset" do
      nuisance_type = nuisance_type_fixture()
      assert %Ecto.Changeset{} = Reporting.change_nuisance_type(nuisance_type)
    end
  end

  describe "reports" do
    alias Signuis.Reporting.Report

    import Signuis.ReportingFixtures

    @invalid_attrs %{location__lat: nil, location__lng: nil}

    test "list_reports/0 returns all reports" do
      report = report_fixture()
      assert Reporting.list_reports() == [report]
    end

    test "get_report!/1 returns the report with given id" do
      report = report_fixture()
      assert Reporting.get_report!(report.id) == report
    end

    test "create_report/1 with valid data creates a report" do
      valid_attrs = %{location__lat: 120.5, location__lng: 120.5}

      assert {:ok, %Report{} = report} = Reporting.create_report(valid_attrs)
      assert report.location__lat == 120.5
      assert report.location__lng == 120.5
    end

    test "create_report/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Reporting.create_report(@invalid_attrs)
    end

    test "update_report/2 with valid data updates the report" do
      report = report_fixture()
      update_attrs = %{location__lat: 456.7, location__lng: 456.7}

      assert {:ok, %Report{} = report} = Reporting.update_report(report, update_attrs)
      assert report.location__lat == 456.7
      assert report.location__lng == 456.7
    end

    test "update_report/2 with invalid data returns error changeset" do
      report = report_fixture()
      assert {:error, %Ecto.Changeset{}} = Reporting.update_report(report, @invalid_attrs)
      assert report == Reporting.get_report!(report.id)
    end

    test "delete_report/1 deletes the report" do
      report = report_fixture()
      assert {:ok, %Report{}} = Reporting.delete_report(report)
      assert_raise Ecto.NoResultsError, fn -> Reporting.get_report!(report.id) end
    end

    test "change_report/1 returns a report changeset" do
      report = report_fixture()
      assert %Ecto.Changeset{} = Reporting.change_report(report)
    end
  end
end
