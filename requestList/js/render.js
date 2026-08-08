//#region RENDER
function fillOpenModal(trID) {
  const req = reqList.find((req) => req.req_id == trID);
  const name = req.emp_name;
  const grp = req.group_name;
  const startDate = req.from;
  const endDate = req.to;
  const reqName = req.requester_name;
  const reqDate = req.req_date;
  const normalizedStatus = resolveDispatchDisplayStatus(req);
  const location = req.specific_loc;
  const country = req.location;
  const duration = req.duration;
  const reqGrp = req.requester_group;
  const empnum = req.emp_number;
  const [last, given] = name.split(",");
  const surname = last.toUpperCase();
  const first = given.replace(/\s+/g, "");
  const modi = req.modified;


  formatStatus(normalizedStatus);
  $("#openModalRequestId").text(
    req?.req_id != null
      ? `REQ-${String(req.req_id).padStart(5, "0")}`
      : "—",
  );
  formatDocumentStatuses(req);
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
       <p>days in total</p>`,
    );
  } else {
    $("#modalDuration").html(
      `<span class="text-[16px] font-semibold" >${duration}</span>
       <p>day in total</p>`,
    );
  }

  if (normalizedStatus === "pending" || !modi) {
    $("#modifyFooter").addClass("d-none");
  } else {
    $("#modifyFooter").removeClass("d-none");
    var [date, time] = modi.split(" ");
    $("#modalModiDate").text(formatDate(date) + " " + time);
  }

  if (normalizedStatus === "pending") {
    clearDispatchActivityTimeline();
  } else {
    renderDispatchActivityHistory(req);
  }

  selectedDispatchRequest = req;

  formatPresidentButtons(normalizedStatus);
  $("#openModal").modal("show");
}

function formatPresidentButtons(normalizedStatus) {
  $("#openModal .modal-footer.president-status-footer").remove();

  if (
    normalizedStatus === "pending" &&
    presID.includes(parseInt(empDetails["id"]))
  ) {
    $("#openModal .modal-content").append(`<div class="modal-footer president-status-footer flex-nowrap flex gap-2 border-0 w-100">
        <button
          class="statusBtn btn-reject transition w-50 flex overflow-hidden items-center justify-center disabled:pointer-events-none" stat-id="0">Decline Request</button>
        <button
          class="statusBtn btn-accept w-50 flex overflow-hidden items-center justify-center disabled:pointer-events-none" stat-id="1">Approve Request</button>
      </div>`);
  }
}

function formatStatus(normalizedStatus) {
  const statusLabels = {
    pending: "Pending",
    approved: "Approved",
    declined: "Declined",
    cancelled: "Cancelled",
    completed: "Completed",
    unknown: "Unknown",
  };
  const statusLabel = statusLabels[normalizedStatus] || statusLabels.unknown;
  const statusClass =
    normalizedStatus === "unknown" ? "unknown" : normalizedStatus;
  $("#titleModal").html(
    `Dispatch Request<span class="status lg ${statusClass} ms-3">${statusLabel}</span>`,
  );
}

function formatDocumentStatuses(req) {
  const docs = [
    {
      id: "#modalPassport",
      label: "Passport",
      status: resolveModalTravelDocStatus(req, "passport"),
    },
    {
      id: "#modalVisa",
      label: "Visa",
      status: resolveModalTravelDocStatus(req, "visa"),
    },
    {
      id: "#modalReentry",
      label: "Re-entry",
      status: resolveModalTravelDocStatus(req, "reentry"),
    },
  ];

  docs.forEach(({ id, label, status }) => {
    $(id).html(getModalDocumentStatusHtml(label, status));
  });
}

function resolveModalTravelDocStatus(req, type) {
  if (!req) {
    return "invalid";
  }

  if (type === "passport") {
    if (req.passportStatus) {
      return String(req.passportStatus);
    }
    return req.passValid ? "valid" : "invalid";
  }

  if (type === "visa") {
    if (req.visaStatus) {
      return String(req.visaStatus);
    }
    return req.visaValid ? "valid" : "invalid";
  }

  if (req.reentryStatus != null && req.reentryStatus !== "") {
    return String(req.reentryStatus);
  }

  return "missing";
}

function getModalDocumentStatusHtml(label, status) {
  const normalized = String(status || "invalid");

  if (normalized === "valid" || normalized === "valid_expiring") {
    return `
      <i class='bx bx-check text-[18px] text-[var(--darkest-100)]'></i>
      <p class="text-[14px] text-[var(--darkest-100)]">Valid ${label}</p>
    `;
  }

  if (normalized === "on_process") {
    return `
      <i class='bx bx-time-five text-[18px] text-[var(--yellow-200)]'></i>
      <p class="text-[14px] text-[var(--yellow-200)]">${label} On Process</p>
    `;
  }

  if (normalized === "missing") {
    return `
      <i class='bx bx-x text-[18px] text-[var(--red-200)]'></i>
      <p class="text-[14px] text-[var(--red-200)]">Missing ${label}</p>
    `;
  }

  // invalid / expired
  const invalidLabel = label === "Re-entry" ? "Expired Re-entry" : `Invalid ${label}`;
  return `
    <i class='bx bx-x text-[18px] text-[var(--red-200)]'></i>
    <p class="text-[14px] text-[var(--red-200)]">${invalidLabel}</p>
  `;
}

function fillTable(sampleData) {
  $("#tableBody").empty();
  var str = "";

  if (sampleData.length != 0) {
    $.each(sampleData, function (index, item) {
      str = `
    <tr req-id="${item.req_id}">
      <td><span class="activity-id-badge dispatch">REQ-${String(item.req_id).padStart(5, "0")}</span></td>
      <td>${item.emp_name}</td>
      <td>${formatDate(item.req_date)}</td>
      <td>${formatDispatchDateRange(item.from, item.to)}</td>
      <td>${getRequestListStatusBadgeHtml(item)}</td>
      <td>${getDocumentReadinessHtml(item)}</td>
      <td>
        <div class="openIcon " title="Open item">
           <i class='bx bx-link-external text-[16px] opacity-50'></i>
        </div>
      </td>
    </tr>`;

      $("#tableBody").append(str);
    });
  } else {
    str = `<tr><td colspan="7"><div class="request-list-empty flex items-center justify-center flex-col gap-3 py-5"><img src="../images/empty.png"   class="w-[150px] h-auto opacity-[0.75]" alt="empty">
    <h5 class="font-semibold text-[16px] text-[var(--gray-text)]">No item found.</h5>
    <p class="text-[var(--gray-text)]">Try adjusting your search or filter to find what you're looking for.</p>
    </div></td></tr>`;
    $("#tableBody").append(str);
  }
}

function renderRequestListPage() {
  const totalItems = filteredRequestList.length;
  const pagination = calculatePagination(
    totalItems,
    requestCurrentPage,
    REQUEST_ITEMS_PER_PAGE,
  );

  requestCurrentPage = pagination.currentPage;

  const pageRecords = filteredRequestList.slice(
    pagination.startIndex,
    pagination.endIndex,
  );

  fillTable(pageRecords);
  renderPaginationBar(
    $('[data-pagination="requests"]'),
    {
      currentPage: requestCurrentPage,
      itemsPerPage: REQUEST_ITEMS_PER_PAGE,
      totalItems,
    },
    "requests",
  );
}

function searchFilter(req_list) {
  const keyword = $("#searchbar").val().toLowerCase().trim();
  const grps = $("#grpSel").val().split(",").map(Number);
  const dateFilter = $("#monthSel").val();
  const activeTabId = $("button").has("span.active").attr("id");
  const tabFilters = {
    "tab-2": "pending",
    "tab-3": "approved",
    "tab-4": "declined",
    "tab-5": "cancelled",
    "tab-6": "completed",
  };
  const selectedStatus = tabFilters[activeTabId];

  const results = req_list.filter((emp) => {
    const searchMatch =
      String(emp.req_id).includes(keyword) ||
      emp.emp_name.toLowerCase().includes(keyword) ||
      emp.requester_name.toLowerCase().includes(keyword);

    const groupMatch = grps.includes(parseInt(emp.group_id));
    const dateMatch = dateFilter ? emp.req_date.startsWith(dateFilter) : true;
    const normalizedStatus = resolveDispatchDisplayStatus(emp);
    const statusMatch =
      selectedStatus === undefined || normalizedStatus === selectedStatus;

    return searchMatch && groupMatch && statusMatch && dateMatch;
  });

  results.sort((a, b) => {
    return sortDateAsc
      ? new Date(a.req_date) - new Date(b.req_date)
      : new Date(b.req_date) - new Date(a.req_date);
  });

  filteredRequestList = results;
  requestCurrentPage = 1;
  renderRequestListPage();
}

function fillGroups(grps) {
  const groupIDs = grps.map((obj) => obj.id);
  const grpSelect = $("#grpSel");

  grpSelect.html(`<option value="${groupIDs.join(",")}">All Groups</option>`);

  $.each(grps, function (index, item) {
    const option = $("<option>")
      .attr("value", item.id)
      .text(item.abbreviation)
      .attr("grp-id", item.id);

    grpSelect.append(option);
  });
}

function renderHeader(data) {
  const pres = data?.president;
  const co = data?.care_of;

  if (!pres?.name) {
    $("#requestHeader").empty();
    return;
  }

  $("#requestHeader").html(`
    <p class="font-semibold font-['Arial']">
      ${pres.prefix} ${pres.name} (President)
    </p>
    ${
      co?.name
        ? `<p class="font-semibold font-['Arial']">(c/o ${co.prefix} ${co.name})</p>`
        : ""
    }
  `);
}

function renderSalutation(data) {
  const pres = data?.president;

  let salutation = "Dear Sir,";

  if (pres?.prefix === "Ms.") {
    salutation = "Dear Madam,";
  }

  $("#requestSalutation").text(salutation);
}
//#endregion
