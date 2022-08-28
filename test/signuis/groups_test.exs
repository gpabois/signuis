defmodule Signuis.GroupsTest do
  use Signuis.DataCase

  alias Signuis.Groups

  describe "groups" do
    alias Signuis.Groups.Group

    import Signuis.GroupsFixtures

    @invalid_attrs %{description: nil, name: nil, roles: nil, valid: nil}

    test "list_groups/0 returns all groups" do
      group = group_fixture()
      assert Groups.list_groups() == [group]
    end

    test "get_group!/1 returns the group with given id" do
      group = group_fixture()
      assert Groups.get_group!(group.id) == group
    end

    test "create_group/1 with valid data creates a group" do
      valid_attrs = %{description: "some description", name: "some name", roles: [], valid: true}

      assert {:ok, %Group{} = group} = Groups.create_group(valid_attrs)
      assert group.description == "some description"
      assert group.name == "some name"
      assert group.roles == []
      assert group.valid == true
    end

    test "create_group/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Groups.create_group(@invalid_attrs)
    end

    test "update_group/2 with valid data updates the group" do
      group = group_fixture()
      update_attrs = %{description: "some updated description", name: "some updated name", roles: [], valid: false}

      assert {:ok, %Group{} = group} = Groups.update_group(group, update_attrs)
      assert group.description == "some updated description"
      assert group.name == "some updated name"
      assert group.roles == []
      assert group.valid == false
    end

    test "update_group/2 with invalid data returns error changeset" do
      group = group_fixture()
      assert {:error, %Ecto.Changeset{}} = Groups.update_group(group, @invalid_attrs)
      assert group == Groups.get_group!(group.id)
    end

    test "delete_group/1 deletes the group" do
      group = group_fixture()
      assert {:ok, %Group{}} = Groups.delete_group(group)
      assert_raise Ecto.NoResultsError, fn -> Groups.get_group!(group.id) end
    end

    test "change_group/1 returns a group changeset" do
      group = group_fixture()
      assert %Ecto.Changeset{} = Groups.change_group(group)
    end
  end

  describe "group_members" do
    alias Signuis.Groups.Member

    import Signuis.GroupsFixtures

    @invalid_attrs %{roles: nil}

    test "list_group_members/0 returns all group_members" do
      member = member_fixture()
      assert Groups.list_group_members() == [member]
    end

    test "get_member!/1 returns the member with given id" do
      member = member_fixture()
      assert Groups.get_member!(member.id) == member
    end

    test "create_member/1 with valid data creates a member" do
      valid_attrs = %{roles: []}

      assert {:ok, %Member{} = member} = Groups.create_member(valid_attrs)
      assert member.roles == []
    end

    test "create_member/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Groups.create_member(@invalid_attrs)
    end

    test "update_member/2 with valid data updates the member" do
      member = member_fixture()
      update_attrs = %{roles: []}

      assert {:ok, %Member{} = member} = Groups.update_member(member, update_attrs)
      assert member.roles == []
    end

    test "update_member/2 with invalid data returns error changeset" do
      member = member_fixture()
      assert {:error, %Ecto.Changeset{}} = Groups.update_member(member, @invalid_attrs)
      assert member == Groups.get_member!(member.id)
    end

    test "delete_member/1 deletes the member" do
      member = member_fixture()
      assert {:ok, %Member{}} = Groups.delete_member(member)
      assert_raise Ecto.NoResultsError, fn -> Groups.get_member!(member.id) end
    end

    test "change_member/1 returns a member changeset" do
      member = member_fixture()
      assert %Ecto.Changeset{} = Groups.change_member(member)
    end
  end
end
