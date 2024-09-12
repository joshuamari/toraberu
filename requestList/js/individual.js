//#region GLOBALS
switch (document.location.hostname) {
  case "kdt-ph":
    rootFolder = "//kdt-ph/";
    break;
  case "localhost":
    rootFolder = "//localhost/";
    break;
  default:
    rootFolder = "//kdt-ph/";
    break;
}
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
let cardData = [];
let printData = {};
let sortDateAsc = false;
let presID = [];
let reqAccess = false;
const { jsPDF } = globalThis.jspdf;
//#endregion
checkAccess()
  .then((emp) => {
    if (emp.isSuccess) {
      empDetails = emp.data;
      reqAccess = empDetails["request"];
      if (!reqAccess) {
        alert("Access Denied");
        window.location.href = `${rootFolder}/PCS`;
        return;
      }
      $(document).ready(function () {
        fillEmployeeDetails();

        Promise.all([getGroups(), getRequests(), getCount(), getPresID()])
          .then(([grps, reqs, counts, pres]) => {
            groupList = grps;
            fillGroups(groupList);
            reqList = reqs["data"];
            cardData = counts;
            presID = pres["data"];
            fillCards();
            $(".tab")[0].click();
          })
          .catch((error) => {
            alert(`${error}`);
          });
      });
    } else {
      alert(emp.message);
      window.location.href = `${rootFolder}`;
    }
  })
  .catch((error) => {
    alert(`${error}`);
  });
//#region BINDS
$(document).on("click", "#menu", function () {
  $(".navigation").addClass("open");
  $("body").addClass("overflow-hidden");
});
$(document).on("click", "#closeNav", function () {
  $(".navigation").removeClass("open");
  $("body").removeClass("overflow-hidden");
});

$(document).on("input", "#search-bar", function () {
  searchEmployee();
});

$(document).on("change", "#grpSel", function () {
  var sel = $("#grpSel option:selected").text();
  var grphl = $(this).val().split(",").length;
  var grp = $(this).val();

  if (grphl === 1) {
    $(this).addClass("active");
    filterVar.group = grp;
    // filterDisplay();
  } else {
    $(this).removeClass("active");
    filterVar.group = null;
    // filterDisplay();
  }
  $(".grpCont").html(
    `<i class='bx bx-group'></i>
      <span id="lblGrp">${sel}</span>
      <i class='bx bx-x text-[18px] ml-3 z-[100]' id="removeGroup"></i>`
  );
  toggleLoadingAnimation(true);
  searchFilter(reqList);
});
$(document).on("click", "#removeGroup", function () {
  $("#grpSel").removeClass("active");
  $(".grpCont").html(
    `   <i class='bx bx-group'></i>
        <span id="lblGrp">All Groups</span>
        <i class='bx bx-chevron-down text-[18px] ml-3'></i>`
  );
  $("#grpSel").val($("#grpSel option:first").val());
  $("#grpSel").change();
});

$(document).on("input", "#monthSel", function () {
  var [year, month] = $(this).val().split("-");
  $(this).removeClass("active");
  var monthName = monthNames[parseInt(month) - 1];
  let display = `Requested Month`;
  let iClass = `<i class='bx bx-chevron-down text-[18px] ml-3'></i>`;
  if (monthName) {
    $(this).addClass("active");
    display = `${monthName} ${year}`;
    iClass = `<i class='bx bx-x text-[18px] ml-3 z-[100]' id="removeMonth"></i>`;
  }
  $(".monthCont").html(`<i class='bx bx-calendar'></i>
                      <span class="" id="monthLabel">${display}</span>
                      ${iClass}
                      `);
  searchFilter(reqList);
});
$(document).on("click", "#removeMonth", function () {
  $("#monthSel").removeClass("active");
  $(".monthCont").html(`<i class='bx bx-calendar'></i>
    <span class="" id="monthLabel">Requested Month</span>
    <i class='bx bx-chevron-down text-[18px] ml-3'></i>
    `);
  $("#monthSel").val("");
  searchFilter(reqList);
});
// $(document).on("click", "#btnExport", function () {
//   exportTable();
// });
$(document).on("click", "#portalBtn", function () {
  window.location.href = `${rootFolder}`;
});
$(document).on("click", ".tab", function () {
  var indicator = document.querySelector(".indicator");
  var $this = $(this);
  var rect = $this[0].getBoundingClientRect(); // Convert jQuery object to DOM element
  var parentRect = $this.parent()[0].getBoundingClientRect(); // Convert parent jQuery object to DOM element

  indicator.style.width = rect.width + "px";
  indicator.style.left = rect.left - parentRect.left + "px";
  $(".tab p").removeClass("font-semibold text-[var(--dark)] active");
  $(this).find("p").addClass("font-semibold text-[var(--dark)] active");
  searchFilter(reqList);
});
$(document).on("click", ".mainTable tr", function () {
  var rowID = $(this).closest("tr").attr("req-id");
  fillOpenModal(rowID);
  getRequestData(rowID)
    .then((res) => {
      if (res.isSuccess) {
        printData = res.data;
      }
    })
    .catch((error) => {
      alert(`Error: ${error}`);
    });
});
$(document).on("click", "#openModal .btn-close", function () {
  $("#openModal").modal("hide");
});
$(document).on("click", "#attachment", function () {
  fillAttachment(printData);
  $("#openModal .btn-close").click();
  $("#attachmentModal").modal("show");
});
$(document).on("click", "#attachment2", function () {
  fillAttachment2(printData);
  $("#openModal .btn-close").click();
  $("#attachmentModal2").modal("show");
});
$(document).on("click", "#btnBack", function () {
  $("#attachmentModal .btn-close").click();
  $("#openModal").modal("show");
});
$(document).on("click", "#btnBack2", function () {
  $("#attachmentModal2 .btn-close").click();
  $("#openModal").modal("show");
});
$(document).on("click", "#btnPrint", function () {
  saveToPDF();
});
$(document).on("click", "#btnPrint2", function () {
  saveToPDF2();
});
$(document).on("input", "#searchbar", function () {
  searchFilter(reqList);
});
$(document).on("click", "#sortDate", function () {
  sortDateAsc = !sortDateAsc;
  searchFilter(reqList);
});
$(document).on("click", ".statusBtn", function () {
  const stat = parseInt($(this).attr("stat-id"));

  updateStatus(stat)
    .then((res) => {
      if (res.isSuccess) {
        Promise.all([getRequests(), getCount()])
          .then(([reqs, counts]) => {
            reqList = reqs["data"];
            cardData = counts;
            fillCards();
            searchFilter(reqList);
            $(".btn-reject").prop("disabled", false);
            $(".btn-accept").prop("disabled", false);
          })
          .catch((error) => {
            alert(`Error: ${error}`);
          });
        $("#openModal .btn-close").click();
      }
    })
    .catch((error) => {
      alert(`Error: ${error}`);
    });
});

$(document).on("click", ".btn-reject", function () {
  $(".btn-reject").prop("disabled", true);
});
$(document).on("click", ".btn-accept", function () {
  $(".btn-accept").prop("disabled", true);
});
//#endregion

//#region FUNCTIONS
function getRequests() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_requests.php",
      dataType: "json",
      success: function (response) {
        const req = response;
        resolve(req);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching requests.");
        }
      },
    });
  });
}
function getCount() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_count_requests.php",
      dataType: "json",
      success: function (response) {
        const count = response;
        resolve(count);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching counts.");
        }
      },
    });
  });
}
function getRequestData(req_id) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_request_data.php",
      data: {
        request_id: req_id,
      },
      dataType: "json",
      success: function (response) {
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching request data.");
        }
      },
    });
  });
}
function getPresID() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_pres_id.php",
      dataType: "json",
      success: function (response) {
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching pres id.");
        }
      },
    });
  });
}
function saveToPDF() {
  $("#toPrint .td").css("margin-top", "-1rem");
  $("#toPrint .up").css("margin-top", "-0.85rem");
  $("#toPrint .top").css("margin-top", "-0.5rem");
  $("#toPrint .bottom").css("margin-bottom", "0.5rem");
  $("#toPrint .down").css("margin-bottom", "0.85rem");
  $("#attachmentModal td p, #attachmentModal th p").css("margin-top", "-1rem");
  $("#attachmentModal td p.top").css("margin-top", "-0.5rem");
  $("#toPrint .alw").css("margin-top", "-0.2rem");
  $("#toPrint .copy").css("margin-top", "0.5rem");

  var str = $("#attachment").text();

  html2canvas($("#toPrint")[0], { scale: 2 }).then((canvas) => {
    var imgData = canvas.toDataURL("image/jpeg", 1.25);
    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      displayMode: "fullwidth",
      userUnit: 1,
    });

    // Adjusting image position and size if needed
    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
    doc.save(str);
  });

  $("#toPrint .td").css("margin-top", "0");
  $("#toPrint .up").css("margin-top", "0");
  $("#toPrint .top").css("margin-top", "0");
  $("#toPrint .bottom").css("margin-bottom", "0");
  $("#toPrint .down").css("margin-bottom", "0");
  $("#attachmentModal td p, #attachmentModal th p").css("margin-top", "0");
  $("#attachmentModal td p.top").css("margin-top", "0");
  $("#toPrint .alw").css("margin-top", "0");
  $("#toPrint .copy").css("margin-top", "0");
}
function saveToPDF2() {
  $("#toPrint2 table td").css("padding", "0 10px 12px 10px");
  $("#toPrint2 table th").css("padding-top", "0");
  $("#toPrint2 table th").css("padding-bottom", "12px");
  var str = $("#attachment2").text();

  document.body.offsetHeight;

  html2canvas($("#toPrint2")[0], { scale: 2 }).then((canvas) => {
    var imgData = canvas.toDataURL("image/jpeg", 1.25);
    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      displayMode: "fullwidth",
      userUnit: 1,
    });

    // Adjusting image position and size if needed
    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
    doc.save(str);
  });

  // Revert scale if needed
  $("#toPrint2 table td").css("padding", "6px");
  $("#toPrint2 table th").css("padding-top", "6px");
  $("#toPrint2 table th").css("padding-bottom", "6px");
}
function fillCards() {
  var pending = cardData.data.pending;
  var accepted = cardData.data.accepted;
  var cancelled = cardData.data.cancelled;
  var todayTotal = cardData.data.todaytotal;
  var todayAccept = cardData.data.todayaccept;
  var total = cardData.data.total;
  $("#tab-2 p").nextAll().remove();
  if (pending != 0) {
    $("#tab-2").append(`
         <small
                      class="rounded-full w-[14px] h-[14px] bg-[var(--dark)] text-white text-[8px] flex items-center justify-content-center font-semibold" >${pending}</small>
      `);
  }
  $("#cardPending").text(pending);
  $("#cardAccepted").text(accepted);
  if (todayAccept != 0) {
    $("#cardTodayAccepted").html(
      `<small class="font-semibold" >+${todayAccept} today</small>`
    );
  }
  $("#cardCancelled").text(cancelled);
  if (todayTotal != 0) {
    $("#cardTodayTotal").html(
      `<small class="font-semibold" >+${todayTotal} today</small>`
    );
  }
  $("#cardTotal").text(total);
}
function formatName(name) {
  const [last, given] = name.split(",");
  const surname = last.toUpperCase();
  return given + " " + surname;
}
function fillAttachment(data) {
  $(".siteDispatch").empty();
  $("#printJap, #printPh, #printThird").text("");
  let date = data.dispatch_request.dh_date;
  let company = data.dispatch_request.company_name;
  let khi = data.dispatch_request.req_name;
  let khibu = data.dispatch_request.request_dept;
  let name = data.dispatch_request.emp_name;
  let from = data.dispatch_request.start;
  let to = data.dispatch_request.end;
  let country = data.dispatch_request.location_id;
  let loc = data.dispatch_request.specific_loc;
  let invitation = data.dispatch_request.invitation_id;
  let workOrder = data.dispatch_request.work_order;
  let project = data.dispatch_request.project_name;
  let siteDispatch = data.dispatch_request.site_dispatch;
  let salary = data.dispatch_request.allowance[0].amount;
  let salaryOthers = data.dispatch_request.allowance[1].amount;
  let khiTel = data.dispatch_request.req_tel;
  let khiFax = data.dispatch_request.req_fax;
  let gap = data.dispatch_request.gap_name;
  let cdcp = data.dispatch_request.cdcp_name;
  let gap_tel = data.dispatch_request.gap_tel;
  let cdcp_tel = data.dispatch_request.cdcp_tel;

  if (country == 1) {
    insertIconCountry(1);
    $("#printJap").text(loc);
  }
  if (country === 2) {
    insertIconCountry(2);
    $("#printPh").text(loc);
  }
  if (country === 3) {
    insertIconCountry(3);
    $("#printThird").text(loc);
  }
  if (invitation === 1) {
    insertIconInvitation(1);
  }
  if (invitation === 2) {
    insertIconInvitation(2);
  }
  if (invitation === 3) {
    insertIconInvitation(3);
  }
  if (siteDispatch === 1) {
    $(".siteDispatch").html(`<i class="bx bx-x down"></i>`);
  }
  if (siteDispatch === 0) {
    $(".siteDispatch").empty();
  }
  $("#printCompany").text(company);
  $("#printKHI").text(khi);
  $("#printBU").text(khibu);
  $("#printName").text(formatName(name));
  $("#printFrom").text(from);
  $("#printTo").text(to);
  $("#printWO").text(workOrder);
  $("#printProject").text(project);
  $("#printSalary").text(salary);
  $("#printSalaryOthers").text(salaryOthers);
  $("#printDate").text(date);
  $("#printTel").text(khiTel);
  $("#printFax").text(khiFax);
  $("#printGAPName").text(gap);
  $("#printCDCPName").text(cdcp);
  $("#printGAPNumber").text(gap_tel);
  $("#printCDCPNumber").text(cdcp_tel);
}
function fillAttachment2(data) {
  var dates = data.dispatch_request.date_request;
  var name = data.dispatch_request.emp_name;

  const [day, monthName, year] = dates.split(" ");
  const month = monthNames2.indexOf(monthName);
  var str = "";
  $("#workHistoryTable tbody").empty();
  if (data.work_history.length != 0) {
    $.each(data.work_history, function (index, item) {
      if (item.end_year == null) {
        item.end_year = "";
      }
      if (item.end_month == null) {
        item.end_month = "";
      }
      if (item.end_year == "-0001") {
        item.end_year = "";
      }
      if (item.end_month == "11") {
        item.end_month = "";
      }
      str += `
      <tr>
        <td>${item.start_year}</td>
        <td>${item.start_month}</td>
        <td>${item.end_year}</td>
        <td>${item.end_month}</td>
        <td>${item.company_name}</td>
        <td>${item.company_business}</td>
        <td>${item.business_content}</td>
        <td>${item.location}</td>
      </tr>
    `;
    });
  } else {
    str = `
    <tr>
      <td colspan="9" class="text-center">
        No data found.
      </td>
    </tr>
    `;
  }

  $("#workHistoryTable tbody").append(str);
  $("#whYear").text(year);
  $("#whMonth").text(month + 1);
  $("#whDay").text(day);
  $("#whName").text(name);
  $("#whBusiness").text(data.dispatch_request.business);
  $("#dic").text(data.dispatch_request.dept_in_charge);
  $("#dic_name").text(data.dispatch_request.dic_name);
  $("#dic_tel").text(data.dispatch_request.dic_tel);
  $("#comp_jap").text(data.dispatch_request.company_jap);
  $("#comp_desc").text(data.dispatch_request.company_desc);
  $("#company_n_desc").text(
    `${data.dispatch_request.company_jap} ${data.dispatch_request.company_desc}`
  );
}
function insertIconCountry(id) {
  $(".countries").empty();

  const iconElement = $("<i>").addClass("bx bx-x down");

  const countriesContainers = $(".countries");
  if (id === 1) {
    countriesContainers.eq(0).append(iconElement);
  }
  if (id === 2) {
    countriesContainers.eq(1).append(iconElement);
  }
  if (id === 3) {
    countriesContainers.eq(2).append(iconElement);
  }
}
function insertIconInvitation(id) {
  $(".inv").empty();

  const iconElement = $("<i>").addClass("bx bx-x down");

  const countriesContainers = $(".inv");
  if (id === 1) {
    countriesContainers.eq(0).append(iconElement);
  }
  if (id === 2) {
    countriesContainers.eq(1).append(iconElement);
  }
  if (id === 3) {
    countriesContainers.eq(2).append(iconElement);
  }
}
function fillOpenModal(trID) {
  const req = reqList.find((req) => req.req_id == trID);
  const name = req.emp_name;
  const grp = req.group_name;
  const passValidity = req.passValid;
  const visaValidity = req.visaValid;
  const startDate = req.from;
  const endDate = req.to;
  const reqName = req.requester_name;
  const reqDate = req.req_date;
  const status = parseInt(req.status);
  const location = req.specific_loc;
  const country = req.location;
  const duration = req.duration;
  const reqGrp = req.requester_group;
  const empnum = req.emp_number;
  const [last, given] = name.split(",");
  const surname = last.toUpperCase();
  const first = given.replace(/\s+/g, "");

  formatStatus(status);
  formatVisaPassport(visaValidity, passValidity);
  $("#modalEmpName").text(name);
  $("#modalGroup").text(grp);
  $("#modalDateFrom").text(formatDate(startDate));
  $("#modalDateTo").text(formatDate(endDate));
  $("#modalReqName").text(reqName);
  $("#modalReqDate").text(formatDate(reqDate));
  $("#modalLoc").text(location);
  $("#modalCountry").text(country);
  $("#modalReqGrp").text(reqGrp);
  $("#attachment").text(`${empnum}_${surname}${first}_DispatchRequest`);
  $("#attachment2").text(`${empnum}_${surname}${first}_WorkHistory`);

  if (duration > 1) {
    $("#modalDuration").html(
      `<span class="text-[16px] font-semibold" >${duration}</span>
       <p>days in total</p>`
    );
  } else {
    $("#modalDuration").html(
      `<span class="text-[16px] font-semibold" >${duration}</span>
       <p>day in total</p>`
    );
  }

  formatButtons(status);
  $("#openModal").modal("show");
}
function formatButtons(status) {
  $("#openModal .modal-footer").remove();
  if (
    (status === null || isNaN(status)) &&
    presID.includes(parseInt(empDetails["id"]))
  ) {
    $("#openModal .modal-content")
      .append(`<div class="flex-nowrap modal-footer  flex gap-2 border-0 ">
        <button
          class="statusBtn btn-reject transition w-50" stat-id="0">Cancel</button>
        <button
          class="statusBtn btn-accept w-50" stat-id="1">Accept</button>
      </div>`);
  } else {
    $("#openModal .modal-footer").remove();
  }
}
function formatDate(date) {
  var [year, month, day] = date.split("-");
  monthName = monthNames2[parseInt(month) - 1];

  return day + " " + monthName + " " + year;
}
function formatStatus(status) {
  let statusString =
    isNaN(status) || status === null
      ? "pending"
      : status === 1
      ? "accepted"
      : "cancelled";
  $("#titleModal").html(
    `  Dispatch Request<span class="status lg ${statusString} ms-3">${statusString}</span>`
  );
}
function formatVisaPassport(visa, passport) {
  function updateModal(id, isValid) {
    const iconClass = isValid
      ? "bx-check text-[var(--darkest-100)]"
      : "bx-x text-[var(--red-200)]";
    const className = isValid
      ? "text-[var(--darkest-100)]"
      : "text-[var(--red-200)]";
    const statusText = isValid ? "Valid" : "Invalid";
    $(id).html(`
      <i class='bx ${iconClass} text-[18px]'></i>
      <p class="text-[14px] ${className}">${statusText} ${
      id === "#modalPassport" ? "Passport" : "Visa"
    }</p>
    `);
  }

  updateModal("#modalPassport", passport);
  updateModal("#modalVisa", visa);
}

function fillTable(sampleData) {
  $("#tableBody").empty();
  var str = "";
  if (sampleData.length != 0) {
    $.each(sampleData, function (index, item) {
      str = `
    <tr req-id="${item.req_id}">
      <td>${item.emp_name}</td>
      <td>${formatDate(item.req_date)}</td>
      <td>${formatDate(item.from)}</td>
      <td>${formatDate(item.to)}</td>
      <td>${item.requester_name}</td>
      <td>${
        item.status === null
          ? ` <span class=" status pending ">
                        Pending
                      </span>`
          : item.status == 1
          ? `  <span class=" status accepted ">
                        Accepted
                      </span>`
          : `<span class=" status cancelled ">
                        Cancelled
                      </span>`
      }</td>
      <td>${
        item.passValid === true
          ? `  <span class="validity "><i class='bx bx-check text-[18px]   font-semibold'></i></span>`
          : ` <span class="validity "><i class='bx bx-x text-[18px] font-semibold'></i></span>`
      }</td>
        <td>${
          item.visaValid === true
            ? `  <span class="validity "><i class='bx bx-check text-[18px]   font-semibold'></i></span>`
            : ` <span class="validity "><i class='bx bx-x text-[18px] font-semibold'></i></span>`
        }</td>
      <td>
        <div class="openIcon " title="Open item">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"   width="144px" height="144px">
            <path d="M 41.470703 4.9863281 A 1.50015 1.50015 0 0 0 41.308594 5 L 27.5 5 A 1.50015 1.50015 0 1 0 27.5 8 L 37.878906 8 L 22.439453 23.439453 A 1.50015 1.50015 0 1 0 24.560547 25.560547 L 40 10.121094 L 40 20.5 A 1.50015 1.50015 0 1 0 43 20.5 L 43 6.6894531 A 1.50015 1.50015 0 0 0 41.470703 4.9863281 z M 12.5 8 C 8.3754991 8 5 11.375499 5 15.5 L 5 35.5 C 5 39.624501 8.3754991 43 12.5 43 L 32.5 43 C 36.624501 43 40 39.624501 40 35.5 L 40 25.5 A 1.50015 1.50015 0 1 0 37 25.5 L 37 35.5 C 37 38.003499 35.003499 40 32.5 40 L 12.5 40 C 9.9965009 40 8 38.003499 8 35.5 L 8 15.5 C 8 12.996501 9.9965009 11 12.5 11 L 22.5 11 A 1.50015 1.50015 0 1 0 22.5 8 L 12.5 8 z" fill="rgba(85, 85, 85, 0.5)"  stroke="rgba(85, 85, 85, 0.5)" stroke-width="1"/>
          </svg>
        </div>
      </td>
    </tr>`;

      $("#tableBody").append(str);
    });
  } else {
    str = `<td colspan="12" class="h-[530px]"><div class="flex items-center justify-center flex-col gap-3"><img src="../images/empty.png"   class="w-[150px] h-auto opacity-[0.75]" alt="empty">
    <h5 class="font-semibold text-[16px] text-[var(--gray-text)]">No item found.</h5>
    <p class="text-[var(--gray-text)]">Try adjusting your search or filter to find what you're looking for.</p>
    </div></td>`;
    $("#tableBody").append(str);
  }
}
function searchFilter(req_list) {
  const keyword = $("#searchbar").val().toLowerCase().trim();
  const grps = $("#grpSel").val().split(",").map(Number);
  const dateFilter = $("#monthSel").val();
  const activeTabId = $("button").has("p.active").attr("id");
  const tabFilters = {
    "tab-2": null,
    "tab-3": 1,
    "tab-4": 0,
  };
  const filter =
    tabFilters[activeTabId] !== undefined ? tabFilters[activeTabId] : undefined;
  const results = req_list.filter((emp) => {
    const searchMatch =
      emp.emp_name.toLowerCase().includes(keyword) ||
      emp.requester_name.toLowerCase().includes(keyword);

    const groupMatch = grps.includes(parseInt(emp.group_id));

    const dateMatch = dateFilter ? emp.req_date.startsWith(dateFilter) : true;

    const statusMatch = filter !== undefined ? emp.status == filter : true;

    return searchMatch && groupMatch && statusMatch && dateMatch;
  });

  results.sort((a, b) => {
    return sortDateAsc
      ? new Date(a.req_date) - new Date(b.req_date)
      : new Date(b.req_date) - new Date(a.req_date);
  });

  fillTable(results);
}
function getGroups() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_groups.php",
      dataType: "json",
      success: function (response) {
        const grps = response;
        resolve(grps);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.");
        }
      },
    });
  });
}
function fillGroups(grps) {
  const groupIDS = grps.map((obj) => obj.newID);
  var grpSelect = $("#grpSel");
  grpSelect.html(`<option value=${groupIDS}>All Groups</option>`);
  $.each(grps, function (index, item) {
    var option = $("<option>")
      .attr("value", item.newID)
      .text(item.abbreviation)
      .attr("grp-id", item.newID);
    grpSelect.append(option);
  });
}
function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "../global/check_login.php",
      dataType: "json",
      success: function (data) {
        const acc = data;
        resolve(acc);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.1");
        }
      },
    });
    // resolve(response);
  });
}
function fillEmployeeDetails() {
  const fName = capitalizeWord(empDetails.empname.firstname);
  const sName = capitalizeWord(empDetails.empname.surname);
  const initials = getInitials(fName, sName);
  const grpName = empDetails.group;
  $("#empLabel").html(`${fName} ${sName}`);
  $("#empInitials").html(`${initials}`);
  $("#grpLabel").html(`${grpName}`);
}
function capitalizeWord(name) {
  return name
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
function getInitials(firstname, surname) {
  let initials = "";
  var firstInitial = firstname.charAt(0);
  var lastInitial = surname.charAt(0);
  initials = `${firstInitial}${lastInitial}`;
  return initials.toUpperCase();
}

function exportTable() {
  const yr = $("#yearSel").val();
  TableToExcel.convert(document.getElementById("repTable"), {
    name: `Dispatch_Report_${yr}.xlsx`,
    sheet: {
      name: `${yr}`,
    },
  });
}
function toggleLoadingAnimation(show) {
  if (show) {
    $("#appendHere").append(`
          <div class="top-0 backdrop-blur-sm bg-gray/30 h-full flex justify-center items-center flex-col pb-5 absolute w-full" id="loadingAnimation">
              <div class="relative">
                  <div class="grayscale-[70%] w-[400px]">
                      <img src="../images/Frame 1.gif" alt="loader" class="w-full" />
                  </div>
                  <div class="absolute bottom-0 flex-col w-full text-center flex justify-center items-center gap-2">
                      <div class="title fw-semibold fs-5">
                          Loading data . . .
                      </div>
                      <div class="text">
                          Please wait while we fetch the dispatch report details.
                      </div>
                  </div>
              </div>
          </div>
      `);
  } else {
    $("#loadingAnimation").remove();
  }
}
function updateStatus(status) {
  console.log(printData);
  console.log(printData["dispatch_request"]["request_id"]);
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "PUT",
      url: "php/update_status.php",
      data: JSON.stringify({
        request_status: status,
        request_id: printData["dispatch_request"]["request_id"],
      }),
      contentType: "application/json",
      // dataType: "json",
      success: function (response) {
        console.log(response);
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while updating status.");
        }
      },
    });
  });
}
//#endregion
