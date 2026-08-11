//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
let empDetails = [];
let editAccess = false;
let reqAccess = false;

let dashboardDispatchList = [];
let dashboardPassportAlerts = [];
let dashboardVisaAlerts = [];
let dashboardTrendData = [];
let dashboardRequestList = [];
let dashboardGroupList = [];
let dashboardCancellations = [];
let dashboardDateChanges = [];
let dashboardActivityItems = [];

let dispatchChartInstance = null;
let groupChartInstance = null;
let dashboardGroupDispatchYear = null;
let dashboardTrendYear = null;
let statusChartInstance = null;

const ACTIVITY_PAGE_SIZE = 10;
let activityPaginationState = {
  currentPage: 1,
  itemsPerPage: ACTIVITY_PAGE_SIZE,
  totalItems: 0,
};

const LATEST_DISPATCH_PAGE_SIZE = 10;
let latestDispatchPaginationState = {
  currentPage: 1,
  itemsPerPage: LATEST_DISPATCH_PAGE_SIZE,
  totalItems: 0,
};

const STATUS_CHART_COLORS = {
  pending: "#be860b",
  approved: "#0e9c42",
  completed: "#22c55e",
  declined: "#ec8f5e",
  cancelled: "#f43f5e",
};

const GROUP_CHART_COLORS = [
  "#212121",
  "#4ade80",
  "#22c55e",
  "#698071",
  "#555555",
  "#0e9c42",
  "#8d8d8d",
  "#374151",
];

const monthNames2 = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
//#endregion
