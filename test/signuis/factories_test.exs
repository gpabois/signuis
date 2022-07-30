defmodule Signuis.FactoriesTest do
  use Signuis.DataCase

  alias Signuis.Factories

  describe "factories" do
    alias Signuis.Factories.Factory

    import Signuis.FactoriesFixtures

    @invalid_attrs %{adresse__code_postal: nil, adresse__commune: nil, adresse__voie: nil, description: nil, location__lat: nil, location__lng: nil, nom: nil, valid: nil}

    test "list_factories/0 returns all factories" do
      factory = factory_fixture()
      assert Factories.list_factories() == [factory]
    end

    test "get_factory!/1 returns the factory with given id" do
      factory = factory_fixture()
      assert Factories.get_factory!(factory.id) == factory
    end

    test "create_factory/1 with valid data creates a factory" do
      valid_attrs = %{adresse__code_postal: "some adresse__code_postal", adresse__commune: "some adresse__commune", adresse__voie: "some adresse__voie", description: "some description", location__lat: 120.5, location__lng: 120.5, nom: "some nom", valid: true}

      assert {:ok, %Factory{} = factory} = Factories.create_factory(valid_attrs)
      assert factory.adresse__code_postal == "some adresse__code_postal"
      assert factory.adresse__commune == "some adresse__commune"
      assert factory.adresse__voie == "some adresse__voie"
      assert factory.description == "some description"
      assert factory.location__lat == 120.5
      assert factory.location__lng == 120.5
      assert factory.nom == "some nom"
      assert factory.valid == true
    end

    test "create_factory/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Factories.create_factory(@invalid_attrs)
    end

    test "update_factory/2 with valid data updates the factory" do
      factory = factory_fixture()
      update_attrs = %{adresse__code_postal: "some updated adresse__code_postal", adresse__commune: "some updated adresse__commune", adresse__voie: "some updated adresse__voie", description: "some updated description", location__lat: 456.7, location__lng: 456.7, nom: "some updated nom", valid: false}

      assert {:ok, %Factory{} = factory} = Factories.update_factory(factory, update_attrs)
      assert factory.adresse__code_postal == "some updated adresse__code_postal"
      assert factory.adresse__commune == "some updated adresse__commune"
      assert factory.adresse__voie == "some updated adresse__voie"
      assert factory.description == "some updated description"
      assert factory.location__lat == 456.7
      assert factory.location__lng == 456.7
      assert factory.nom == "some updated nom"
      assert factory.valid == false
    end

    test "update_factory/2 with invalid data returns error changeset" do
      factory = factory_fixture()
      assert {:error, %Ecto.Changeset{}} = Factories.update_factory(factory, @invalid_attrs)
      assert factory == Factories.get_factory!(factory.id)
    end

    test "delete_factory/1 deletes the factory" do
      factory = factory_fixture()
      assert {:ok, %Factory{}} = Factories.delete_factory(factory)
      assert_raise Ecto.NoResultsError, fn -> Factories.get_factory!(factory.id) end
    end

    test "change_factory/1 returns a factory changeset" do
      factory = factory_fixture()
      assert %Ecto.Changeset{} = Factories.change_factory(factory)
    end
  end

  describe "factories_members" do
    alias Signuis.Factories.Member

    import Signuis.FactoriesFixtures

    @invalid_attrs %{roles: nil}

    test "list_factories_members/0 returns all factories_members" do
      member = member_fixture()
      assert Factories.list_factories_members() == [member]
    end

    test "get_member!/1 returns the member with given id" do
      member = member_fixture()
      assert Factories.get_member!(member.id) == member
    end

    test "create_member/1 with valid data creates a member" do
      valid_attrs = %{roles: []}

      assert {:ok, %Member{} = member} = Factories.create_member(valid_attrs)
      assert member.roles == []
    end

    test "create_member/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Factories.create_member(@invalid_attrs)
    end

    test "update_member/2 with valid data updates the member" do
      member = member_fixture()
      update_attrs = %{roles: []}

      assert {:ok, %Member{} = member} = Factories.update_member(member, update_attrs)
      assert member.roles == []
    end

    test "update_member/2 with invalid data returns error changeset" do
      member = member_fixture()
      assert {:error, %Ecto.Changeset{}} = Factories.update_member(member, @invalid_attrs)
      assert member == Factories.get_member!(member.id)
    end

    test "delete_member/1 deletes the member" do
      member = member_fixture()
      assert {:ok, %Member{}} = Factories.delete_member(member)
      assert_raise Ecto.NoResultsError, fn -> Factories.get_member!(member.id) end
    end

    test "change_member/1 returns a member changeset" do
      member = member_fixture()
      assert %Ecto.Changeset{} = Factories.change_member(member)
    end
  end
end
