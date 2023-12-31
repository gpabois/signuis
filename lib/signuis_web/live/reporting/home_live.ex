defmodule SignuisWeb.Reporting.HomeLive do
  use SignuisWeb, :live_view
  use SignuisWeb.Mixins.Map
  use SignuisWeb.Mixins.Geolocation

  alias SignuisWeb.MapMarker
  alias Signuis.Facilities
  alias Signuis.Reporting
  alias Signuis.Accounts.{User, Anonymous}
  alias Signuis.Reporting.Report

  def mount(params, session, socket) do
    choices_nuisance_types = Reporting.list_nuisances_types
    |> Enum.map(&{&1.label, &1.id})

    {:ok,
      socket
      |> assign(:facilities, [])
      |> assign(:focused_entity, nil)
      |> assign(:location, nil)
      |> assign(:report_changeset, Reporting.change_report(%Report{}, %{}))
      |> assign(:choices_nuisance_types, choices_nuisance_types)
      |> assign(:display_report_form, false)
      |> init_map(params, session),
      layout: {SignuisWeb.LayoutView, "nowrap.live.html"}
    }
  end
  def update_map(socket) do
    markers = []

    markers = markers ++ if socket.assigns.location do
      [%MapMarker{id: "anonymous", type: "user", location: socket.assigns.location, object: nil}]
    else
      []
    end

    markers = markers ++ Enum.map(socket.assigns.facilities, &MapMarker.to/1)

    socket
    |> set_map_data(markers)
  end


  def handle_event("form::report::toggle", _value, socket) do
    socket = socket
    |> assign(:display_report_form, not socket.assigns.display_report_form)
    {:noreply, socket}
  end

  def handle_event("form::report::validate", %{"report" => report_params}, socket) do
    changeset = %Report{}
    |> Reporting.change_report(report_params, pre_validations: [
      &(cast_user(&1, socket.assigns.current_user)),
      &(cast_location(&1, socket.assigns.location))
    ])
    |> Map.put(:action, :insert)

    socket = socket
    |> assign(:report_changeset, changeset)

    {:noreply, socket}
  end

  def handle_event("form::report::submit", %{"report" => report_params}, socket) do
    result = Reporting.create_report(report_params, pre_validations: [
      &(cast_user(&1, socket.assigns.current_user)),
      &(cast_location(&1, socket.assigns.location))
    ])

    socket = case result do
      {:ok, _report} ->
        socket
        |> put_flash(:info, "Le signalement a été enregistré.")
        |> assign(:display_report_form, false)

      {:error, changeset} ->
        socket
        |> assign(:report_changeset, changeset)

    end

    {:noreply, socket}
  end

  def handle_info({"map::marker-clicked", marker}, socket) do
    entity = MapMarker.from(marker)

    socket = if entity do
      socket
      |> fly_to(marker.location)
    else
      socket
    end

    {:noreply, socket |> assign(:focused_entity, entity)}
  end

  def handle_info({"map::bounds-updated", bounds}, socket) do
    {:noreply,
      socket
      |> assign(:facilities, Facilities.list_facilities(filter: %{"bounds" =>  bounds, "valid" => true}))
      |> update_map
    }
  end

  def handle_info({"geolocation::position-updated", position}, socket) do
    # If it is the first location we get, we fly to it.
    socket = if socket.assigns.location == nil do
      socket
      |> fly_to(position)
    else
      socket
    end

    socket = socket
    |> assign(:location, position)
    |> update_map

    {:noreply, socket}
  end

  def cast_user(changeset, user) do
    case user do
      %User{id: id} -> Ecto.Changeset.put_change(changeset, :user_id, id)
      %Anonymous{id: id} -> Ecto.Changeset.put_change(changeset, :session_id, id)
      _ -> Ecto.Changeset.add_error(:user, "no known user")
    end
  end

  def cast_location(changeset, location) do
    case location do
      %Geo.Point{coordinates: {lat, long}, srid: 4326} ->
        changeset
        |> Ecto.Changeset.put_change(:location__lat, lat)
        |> Ecto.Changeset.put_change(:location__lng, long)
      _ ->
        changeset
        |> Ecto.Changeset.add_error(:location, "veuillez activer la géolocalisation")
    end
  end
end
