defmodule Signuis.FacilitiesTest do
  use Signuis.DataCase

  alias Signuis.Facilities

  describe "facilities" do
    alias Signuis.Facilities.Facility

    import Signuis.FacilitiesFixtures

    @invalid_attrs %{adresse__code_postal: nil, adresse__commune: nil, adresse__voie: nil, description: nil, location__lat: nil, location__lng: nil, nom: nil, valid: nil}

    test "list_facilities/0 returns all facilities" do
      facility = facility_fixture()
      assert Facilities.list_facilities() == [facility]
    end

    test "get_facility!/1 returns the facility with given id" do
      facility = facility_fixture()
      assert Facilities.get_facility!(facility.id) == facility
    end

    test "create_facility/1 with valid data creates a facility" do
      valid_attrs = %{adresse__code_postal: "some adresse__code_postal", adresse__commune: "some adresse__commune", adresse__voie: "some adresse__voie", description: "some description", location__lat: 120.5, location__lng: 120.5, nom: "some nom", valid: true}

      assert {:ok, %Facility{} = facility} = Facilities.create_facility(valid_attrs)
      assert facility.adresse__code_postal == "some adresse__code_postal"
      assert facility.adresse__commune == "some adresse__commune"
      assert facility.adresse__voie == "some adresse__voie"
      assert facility.description == "some description"
      assert facility.location__lat == 120.5
      assert facility.location__lng == 120.5
      assert facility.nom == "some nom"
      assert facility.valid == true
    end

    test "create_facility/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Facilities.create_facility(@invalid_attrs)
    end

    test "update_facility/2 with valid data updates the facility" do
      facility = facility_fixture()
      update_attrs = %{adresse__code_postal: "some updated adresse__code_postal", adresse__commune: "some updated adresse__commune", adresse__voie: "some updated adresse__voie", description: "some updated description", location__lat: 456.7, location__lng: 456.7, nom: "some updated nom", valid: false}

      assert {:ok, %Facility{} = facility} = Facilities.update_facility(facility, update_attrs)
      assert facility.adresse__code_postal == "some updated adresse__code_postal"
      assert facility.adresse__commune == "some updated adresse__commune"
      assert facility.adresse__voie == "some updated adresse__voie"
      assert facility.description == "some updated description"
      assert facility.location__lat == 456.7
      assert facility.location__lng == 456.7
      assert facility.nom == "some updated nom"
      assert facility.valid == false
    end

    test "update_facility/2 with invalid data returns error changeset" do
      facility = facility_fixture()
      assert {:error, %Ecto.Changeset{}} = Facilities.update_facility(facility, @invalid_attrs)
      assert facility == Facilities.get_facility!(facility.id)
    end

    test "delete_facility/1 deletes the facility" do
      facility = facility_fixture()
      assert {:ok, %Facility{}} = Facilities.delete_facility(facility)
      assert_raise Ecto.NoResultsError, fn -> Facilities.get_facility!(facility.id) end
    end

    test "change_facility/1 returns a facility changeset" do
      facility = facility_fixture()
      assert %Ecto.Changeset{} = Facilities.change_facility(facility)
    end
  end

  describe "facilities_members" do
    alias Signuis.Facilities.Member

    import Signuis.FacilitiesFixtures

    @invalid_attrs %{roles: nil}

    test "list_facilities_members/0 returns all facilities_members" do
      member = member_fixture()
      assert Facilities.list_facilities_members() == [member]
    end

    test "get_member!/1 returns the member with given id" do
      member = member_fixture()
      assert Facilities.get_member!(member.id) == member
    end

    test "create_member/1 with valid data creates a member" do
      valid_attrs = %{roles: []}

      assert {:ok, %Member{} = member} = Facilities.create_member(valid_attrs)
      assert member.roles == []
    end

    test "create_member/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Facilities.create_member(@invalid_attrs)
    end

    test "update_member/2 with valid data updates the member" do
      member = member_fixture()
      update_attrs = %{roles: []}

      assert {:ok, %Member{} = member} = Facilities.update_member(member, update_attrs)
      assert member.roles == []
    end

    test "update_member/2 with invalid data returns error changeset" do
      member = member_fixture()
      assert {:error, %Ecto.Changeset{}} = Facilities.update_member(member, @invalid_attrs)
      assert member == Facilities.get_member!(member.id)
    end

    test "delete_member/1 deletes the member" do
      member = member_fixture()
      assert {:ok, %Member{}} = Facilities.delete_member(member)
      assert_raise Ecto.NoResultsError, fn -> Facilities.get_member!(member.id) end
    end

    test "change_member/1 returns a member changeset" do
      member = member_fixture()
      assert %Ecto.Changeset{} = Facilities.change_member(member)
    end
  end
end
