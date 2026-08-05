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

let allDateChangeRequests = [];
let filteredDateChangeRequests = [];
let selectedDateChangeStatus = "all";
let selectedCancellationStatus = "all";
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
