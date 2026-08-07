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
let filteredRequestList = [];
let requestCurrentPage = 1;
const REQUEST_ITEMS_PER_PAGE = 10;
let cardData = [];
let printData = {};
let sortDateAsc = false;
let presID = [];
let reqAccess = false;
let headerData = null;
let selectedDispatchRequest = null;
let changeRequestTriggerElement = null;
let isChangeRequestSubmitting = false;
const { jsPDF } = globalThis.jspdf;
//#endregion