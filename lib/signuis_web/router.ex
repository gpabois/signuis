defmodule SignuisWeb.Router do
  use SignuisWeb, :router

  import SignuisWeb.Accounts.UserAuth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug SignuisWeb.Plugs.SessionId
    plug :fetch_live_flash
    plug :put_root_layout, {SignuisWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
    plug SignuisWeb.Plugs.Tz
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :administration do
    plug :put_layout, {SignuisWeb.Administration.LayoutView, "app.html"}
  end

  scope "/", SignuisWeb do
    pipe_through :browser

    live "/", Reporting.HomeLive
  end

  # Other scopes may use custom stacks.
  # scope "/api", SignuisWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: SignuisWeb.Telemetry
      live "/dev/toolbox", SignuisWeb.Dev.ToolboxLive
    end
  end

  # Enables the Swoosh mailbox preview in development.
  #
  # Note that preview only shows emails that were sent by the same
  # node running the Phoenix server.
  if Mix.env() == :dev do
    scope "/dev" do
      pipe_through :browser

      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  ## Errors
  scope "/" do
    pipe_through :browser

    get "/403.html", SignuisWeb.ErrorController, :e403
  end

  ## Facility routes
  scope "/facilities", SignuisWeb.Facilities, as: :facilities do
    pipe_through [:browser]#, :require_authenticated_user]

    live "/:facility_id/dashboard", DashboardLive
    resources "/", FacilityController, except: [:show, :index]

    get "/:facility_id/members/new", MemberController, :new
    post "/:facility_id/members", MemberController, :create

    get "/:facility_id/members", MemberController, :index

    resources "/members", MemberController, only: [:update, :edit, :delete]

    get "/:facility_id/production/new", ProductionController, :new
    post "/:facility_id/production", ProductionController, :create

    get "/:facility_id/production", ProductionController, :index

    resources "/production", ProductionController, only: [:update, :edit, :delete]

    get "/:facility_id/reports", ReportController, :index
  end

  scope "/facilities", SignuisWeb.Facilities, as: :facilities do
    pipe_through [:browser]
    resources "/", FacilityController, only: [:show, :index]
  end

  ## Messages
  scope "/messages", SignuisWeb.Messaging, as: :messaging do
    pipe_through [:browser]
    live "/", MailboxLive
  end

  # Reports
  scope "/reports", SignuisWeb.Reporting, as: :reporting do
    pipe_through [:browser]
    resources "/", ReportController, only: [:index]
  end

  ## Authentication routes
  scope "/accounts", SignuisWeb.Accounts, as: :accounts do
    pipe_through [:browser, :redirect_if_user_is_authenticated]

    get "/users/register", UserRegistrationController, :new
    post "/users/register", UserRegistrationController, :create
    get "/users/log_in", UserSessionController, :new
    post "/users/log_in", UserSessionController, :create
    get "/users/reset_password", UserResetPasswordController, :new
    post "/users/reset_password", UserResetPasswordController, :create
    get "/users/reset_password/:token", UserResetPasswordController, :edit
    put "/users/reset_password/:token", UserResetPasswordController, :update
  end

  scope "/accounts", SignuisWeb.Accounts, as: :accounts do
    pipe_through [:browser, :require_authenticated_user]

    get "/users/settings", UserSettingsController, :edit
    put "/users/settings", UserSettingsController, :update
    get "/users/settings/confirm_email/:token", UserSettingsController, :confirm_email
  end

  scope "/accounts", SignuisWeb.Accounts, as: :accounts do
    pipe_through [:browser]

    delete "/users/log_out", UserSessionController, :delete
    get "/users/confirm", UserConfirmationController, :new
    post "/users/confirm", UserConfirmationController, :create
    get "/users/confirm/:token", UserConfirmationController, :edit
    post "/users/confirm/:token", UserConfirmationController, :update
  end

  ## Administration
  scope "/administration", SignuisWeb.Administration, as: :administration do
    pipe_through [:browser, :administration]#, :require_authenticated_user]

    get "/", DashboardController, :show

    resources "/users", UserController, except: [:new, :create]

    scope "/facilities", Facilities do
      resources "/", FacilityController

      resources "/members", MemberController, except: [:new, :create, :index]
      resources "/:facility_id/members", MemberController, only: [:new, :create, :index]

    end

    resources "/nuisances/types", NuisanceTypeController
  end
end
