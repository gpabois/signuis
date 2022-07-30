import ReportingLiveView from './reporting_live';
import FacilityDashboardLiveView from './facility_dashboard_live';

const views = {
    ReportingLiveView,
    FacilityDashboardLiveView
};

export default function loadView(viewName) {
    return views[viewName] || undefined;
  }