defmodule SignuisWeb do
  @moduledoc """
  The entrypoint for defining your web interface, such
  as controllers, views, channels and so on.

  This can be used in your application as:

      use SignuisWeb, :controller
      use SignuisWeb, :view

  The definitions below will be executed for every view,
  controller, etc, so keep them short and clean, focused
  on imports, uses and aliases.

  Do NOT define functions inside the quoted expressions
  below. Instead, define any helper function in modules
  and import those modules here.
  """

  def controller do
    quote do
      use Phoenix.Controller, namespace: SignuisWeb

      import Plug.Conn
      import SignuisWeb.Gettext
      alias SignuisWeb.Router.Helpers, as: Routes
      import Bodyguard
      alias Signuis.{Facilities, Administration}
    end
  end

  def view do
    quote do
      use Phoenix.View,
        root: "lib/signuis_web/templates",
        namespace: SignuisWeb

      # Import convenience functions from controllers
      import Phoenix.Controller,
        only: [get_flash: 1, get_flash: 2, view_module: 1, view_template: 1]

      alias Signuis.Accounts.{User, Anonymous}
      # For policy checks
      alias Signuis.{Facilities, Administration}

      import Bodyguard

      # Include shared imports and aliases for views
      unquote(view_helpers())
      import Surface



    end
  end

  def live_view do
    quote do
      use Phoenix.LiveView,
        layout: {SignuisWeb.LayoutView, "live.html"}

      alias Signuis.Accounts.{User, Anonymous}
      # For policy checks
      alias Signuis.{Facilities, Administration}

      import Bodyguard

      on_mount {SignuisWeb.Accounts.LiveUserAuth, :assign_current_user}
      on_mount {SignuisWeb.Plugs.LiveTz, :assign_tz}

      unquote(view_helpers())
    end
  end

  def live_component do
    quote do
      use Phoenix.LiveComponent
      alias Bodyguard
      unquote(view_helpers())
    end
  end

  def component do
    quote do
      use Phoenix.Component

      unquote(view_helpers())
    end
  end

  def router do
    quote do
      use Phoenix.Router

      import Plug.Conn
      import Phoenix.Controller
      import Phoenix.LiveView.Router
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
      import SignuisWeb.Gettext
    end
  end

  defp view_helpers do
    quote do
      # Use all HTML functionality (forms, tags, etc)
      use Phoenix.HTML

      # Import LiveView and .heex helpers (live_render, live_patch, <.form>, etc)
      import Phoenix.LiveView.Helpers

      # Import basic rendering functionality (render, render_layout, etc)
      import Phoenix.View

      import SignuisWeb.ErrorHelpers
      import SignuisWeb.Gettext
      alias SignuisWeb.Router.Helpers, as: Routes

      import SignuisWeb.Components.Map

      def render_pagination(pagination, route) do
        Phoenix.View.render(SignuisWeb.PaginationView, "_pagination.html", [pagination: pagination, route: route])
      end

      def unique_id(prefix) do
        rsuffix = :crypto.strong_rand_bytes(16) |> Base.url_encode64()
        "#{prefix}-#{rsuffix}"
      end

      def display_datetime(datetime, opts \\ []) do
        tz = Keyword.get(opts, :tz, "Europe/Paris")

        Timex.Timezone.convert(datetime, tz)
        |> Timex.format!("{0h24}:{0m}:{0s} ({0D}/{0M}/{YY})")
      end
    end
  end

  @doc """
  When used, dispatch to the appropriate controller/view/etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
