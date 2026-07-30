//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
const dispTableID = ["eList", "eListNon"];
let empDetails = [];
let groupList = [];
let filterVar = {
  empstatus: 0,
  monthYear: null,
  group: null,
};
let monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let monthNames2 = [
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
let reqList = [];
let filteredCancellationRequests = [];
let cancellationCurrentPage = 1;
let cancellationItemsPerPage = 10;

// Original Date Change Requests mock records from changeRequests/index.html (commit dffabbc).
// Both rows were static HTML inside #datechangeTableBody with status "Cancelled".
const originalDateChangeRequestData = [
  {
    req_id: 1,
    display_id: "DC-0001",
    original_request_id: 482,
    emp_name: "Medrano, Collene Keith",
    emp_number: "EMP-475",
    group_name: "Systems Group",
    location: "Kobe City, Japan",
    requester_name: "Kurita, Hiroki",
    requester_group: "Boiler Group",
    req_date: "2026-02-19",
    old_date: "2026-02-19",
    old_date_to: "2026-06-25",
    new_date: "2026-02-19",
    new_date_to: "2026-06-30",
    reason:
      "Dispatch is no longer required due to project schedule changes.",
    status: "cancelled",
  },
  {
    req_id: 2,
    display_id: "DC-0001",
    original_request_id: 482,
    emp_name: "Medrano, Collene Keith",
    emp_number: "EMP-475",
    group_name: "Systems Group",
    location: "Kobe City, Japan",
    requester_name: "Kurita, Hiroki",
    requester_group: "Boiler Group",
    req_date: "2026-02-19",
    old_date: "2026-02-19",
    old_date_to: "2026-06-30",
    new_date: "2026-02-19",
    new_date_to: "2026-06-25",
    reason:
      "Dispatch is no longer required due to project schedule changes.",
    status: "pending",
  },
];

let allDateChangeRequests = [...originalDateChangeRequestData];
let filteredDateChangeRequests = [...allDateChangeRequests];
let selectedDateChangeStatus = "all";
let dateChangeCurrentPage = 1;
let dateChangeItemsPerPage = 10;
let cardData = [];
let printData = {};
let sortDateAsc = false;
let presID = [];
let reqAccess = false;

let pendingDateChangeAction = null; // 'approve' | 'deny'

let pendingCancellationAction = null;

const { jsPDF } = globalThis.jspdf;
//#endregion
