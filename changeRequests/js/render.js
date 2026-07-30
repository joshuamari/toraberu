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
  const modi = req.modified;

  console.log(req);

  formatStatus(status);
  // formatVisaPassport(visaValidity, passValidity);
  $("#modalEmpName").text(name);
  $("#modalGroup").text(grp);
  $("#modalDateFrom").text(formatDate(startDate));
  $("#modalDateTo").text(formatDate(endDate));
  $("#modalReqName").text(reqName);
  $("#modalReqDate").text(formatDate(reqDate));
  $("#modalLoc").text(location);
  $("#modalCountry").text(country);
  $("#modalReqGrp").text(reqGrp);
  $("#cancelModalRequestIdBtn")
    .text(`REQ# ${req.req_id}`)
    .attr("data-request-id", req.req_id);

  if (!modi) {
    $("#modalModiDate").text("");
  } else {
    var [date, time] = modi.split(" ");
    $("#modalModiDate").text(formatDate(date) + " " + time);
  }

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

  if (status === null || isNaN(status)) {
    $("#modifyFooter").addClass("d-none");
  } else {
    $("#modifyFooter").removeClass("d-none");
  }

  // formatButtons(status);
  $("#openModal").modal("show");
}

function openDateChangeRequestByKey(requestKey) {
  const request = allDateChangeRequests.find(
    (item) => String(item.req_id) === String(requestKey),
  );

  if (!request) {
    console.error("Date Change Request not found:", requestKey);
    return;
  }

  openDateChangeRequestModal(request);
}

function fillChangeDateModal(trID) {
  openDateChangeRequestByKey(trID);
}

const DATE_CHANGE_STATUS_CONFIG = {
  pending: {
    label: "PENDING",
    className: "pending",
    finalizedMessage: "",
  },
  accepted: {
    label: "ACCEPTED",
    className: "accepted",
    finalizedMessage: "This date change request has already been accepted.",
  },
  cancelled: {
    label: "CANCELLED",
    className: "cancelled",
    finalizedMessage: "This date change request has been cancelled.",
  },
  denied: {
    label: "DENIED",
    className: "denied",
    finalizedMessage: "This date change request has been denied.",
  },
};

function normalizeDateChangeStatus(value) {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();

  const statusMap = {
    pending: "pending",
    accepted: "accepted",
    approved: "accepted",
    cancelled: "cancelled",
    canceled: "cancelled",
    denied: "denied",
    rejected: "denied",
    null: "pending",
    1: "accepted",
    0: "cancelled",
  };

  return statusMap[status] || status || "pending";
}

function getDateChangeStatusBadgeHtml(status) {
  const normalizedStatus = normalizeDateChangeStatus(status);
  const config =
    DATE_CHANGE_STATUS_CONFIG[normalizedStatus] ||
    DATE_CHANGE_STATUS_CONFIG.pending;

  return `<span class="status ${config.className}">${config.label.charAt(0) + config.label.slice(1).toLowerCase()}</span>`;
}

function renderDateChangeModalStatusBadge(normalizedStatus) {
  const config =
    DATE_CHANGE_STATUS_CONFIG[normalizedStatus] ||
    DATE_CHANGE_STATUS_CONFIG.pending;
  const $badge = $("#modalChangeStatus");

  $badge
    .removeClass("pending accepted cancelled denied")
    .addClass(config.className)
    .text(config.label);
}

function updateDateChangeModalActions(normalizedStatus) {
  const isPending = normalizedStatus === "pending";
  const config =
    DATE_CHANGE_STATUS_CONFIG[normalizedStatus] ||
    DATE_CHANGE_STATUS_CONFIG.pending;

  $("#dateChangeModalFooterReview").toggleClass("hidden", !isPending);
  $("#dateChangeModalFooterActions").toggleClass("hidden", !isPending);
  $("#dateChangeModalFooterMessage")
    .toggleClass("hidden", isPending)
    .text(isPending ? "" : config.finalizedMessage);
}

function resolveDateChangeModalData(request) {
  console.log("Date Change Request modal record:", request);

  let currentStartDate = request.old_date || null;
  let currentEndDate = request.old_date_to || null;

  const originalRequest = request.original_request_id
    ? reqList.find(
        (item) => String(item.req_id) === String(request.original_request_id),
      )
    : null;

  if ((!currentStartDate || !currentEndDate) && originalRequest) {
    currentStartDate = currentStartDate || originalRequest.from || null;
    currentEndDate = currentEndDate || originalRequest.to || null;
  }

  const proposedStartDate = request.new_date || null;
  const proposedEndDate = request.new_date_to || null;

  if (!currentStartDate || !currentEndDate) {
    console.warn("Original approved dates not found for request:", request);
  }

  return {
    currentStartDate,
    currentEndDate,
    proposedStartDate,
    proposedEndDate,
  };
}

function openDateChangeRequestModal(request) {
  const normalizedStatus = normalizeDateChangeStatus(request.status);

  console.log("Clicked Date Change Request:", request);
  console.log("Table status:", request.status);
  console.log("Modal normalized status:", normalizedStatus);

  const modalData = resolveDateChangeModalData(request);

  const currentTotalDays = calculateInclusiveDays(
    modalData.currentStartDate,
    modalData.currentEndDate,
  );
  const proposedTotalDays = calculateInclusiveDays(
    modalData.proposedStartDate,
    modalData.proposedEndDate,
  );

  const netChange =
    currentTotalDays !== null && proposedTotalDays !== null
      ? proposedTotalDays - currentTotalDays
      : null;

  let diffText = "0 days";
  if (netChange !== null) {
    if (netChange > 0) {
      diffText = `+ ${netChange} days`;
    } else if (netChange < 0) {
      diffText = `− ${Math.abs(netChange)} days`;
    }
  }

  const originalRequestId = request.original_request_id || "";

  $("#modalDCEmpName").text(request.emp_name || "");
  $("#modalEmpNumber").text(request.emp_number || "");
  $("#modalDCGroup").text(request.group_name || "");
  $("#modalLocCountry").text(request.location || "");

  $("#modalOldDateFrom").text(formatModalDate(modalData.currentStartDate));
  $("#modalOldDateTo").text(formatModalDate(modalData.currentEndDate));
  $("#modalNewDateFrom").text(formatModalDate(modalData.proposedStartDate));
  $("#modalNewDateTo").text(formatModalDate(modalData.proposedEndDate));

  $("#modalChangeReqName").text(request.requester_name || "");
  $("#modalChangeReqDate").text(
    isValidIsoDate(request.req_date) ? formatDate(request.req_date) : "Not available",
  );
  $("#modalChangeReqGrp").text(request.requester_group || "");
  $("#modalReason").text(request.reason || "");

  renderDateChangeModalStatusBadge(normalizedStatus);
  updateDateChangeModalActions(normalizedStatus);

  $("#modalOldDuration").text(
    currentTotalDays !== null ? currentTotalDays : "—",
  );
  $("#modalNewDuration").text(
    proposedTotalDays !== null ? proposedTotalDays : "—",
  );

  $("#modalTotalDiff")
    .text(diffText)
    .removeClass("text-green-500 text-red-500 text-gray-500")
    .addClass(
      netChange !== null && netChange > 0
        ? "text-green-500"
        : netChange !== null && netChange < 0
          ? "text-red-500"
          : "text-gray-500",
    );

  $("#changeModalRequestIdBtn")
    .text(originalRequestId ? `REQ# ${originalRequestId}` : "Not available")
    .attr("data-request-id", originalRequestId);

  $("#dateChangeModal").data("active-request-id", request.req_id);
  $("#dateChangeModal").modal("show");
}

function fillCancellationConfirmModal(action) {
  pendingCancellationAction = action;

  const isApprove = action === "approve";

  $("#confirmCancelActionTitle").text(
    isApprove ? "Confirm Cancellation" : "Confirm Denial",
  );

  $("#confirmCancelHeading").text(
    isApprove
      ? "Approve this cancellation request?"
      : "Deny this cancellation request?",
  );

  $("#confirmCancelMessage").text(
    isApprove
      ? "This will cancel the approved dispatch. The original request will remain available for reference."
      : "This will keep the approved dispatch active.",
  );

  $("#confirmCancelFooterText").text(
    isApprove
      ? "Once approved, this dispatch will be cancelled."
      : "Once denied, the cancellation request will not be applied.",
  );

  $("#btnConfirmCancellationAction").text(
    isApprove ? "Approve Cancellation" : "Deny Request",
  );

  $("#confirmCancelRequestId").text($("#cancelModalRequestIdBtn").text());
  $("#confirmCancelEmpName").text($("#modalEmpName").text());
  $("#confirmCancelDispatch").text($("#modalLocCountry").text());
  $("#confirmCancelDates").text(
    `${$("#modalDateFrom").text()} — ${$("#modalDateTo").text()}`,
  );
  $("#confirmCancelReason").text($("#modalCancelReason").text());
}

function openCancellationConfirmModal(action) {
  fillCancellationConfirmModal(action);

  const parentModal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("openModal"),
  );

  const confirmModal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("confirmCancellationActionModal"),
  );

  parentModal.hide();

  $("#openModal").one("hidden.bs.modal", function () {
    confirmModal.show();
  });
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
           <i class='bx bx-link-external text-[16px] opacity-50'></i>
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

function fillTableDateChange(sampleData) {
  $("#datechangeTableBody").empty();

  if (sampleData.length !== 0) {
    $.each(sampleData, function (index, item) {
      const currentTotalDays = calculateInclusiveDays(
        item.old_date,
        item.old_date_to,
      );
      const proposedTotalDays = calculateInclusiveDays(
        item.new_date,
        item.new_date_to,
      );
      const totalDiff =
        currentTotalDays !== null && proposedTotalDays !== null
          ? proposedTotalDays - currentTotalDays
          : 0;

      const diffSign = totalDiff > 0 ? "+" : totalDiff < 0 ? "−" : "";
      const diffValue = Math.abs(totalDiff);

      const diffBadgeClass =
        totalDiff > 0
          ? "change-badge change-badge-positive"
          : totalDiff < 0
            ? "change-badge change-badge-negative"
            : "change-badge change-badge-neutral";

      const statusHtml = getDateChangeStatusBadgeHtml(item.status);

      const proposedFrom = item.new_date ? formatDate(item.new_date) : "";
      const proposedTo = item.new_date_to ? formatDate(item.new_date_to) : "";
      const displayId = item.display_id || `DC-${String(item.req_id).padStart(4, "0")}`;

      const row = `
        <tr
          class="date-change-request-row"
          data-request-key="${item.req_id}"
          tabindex="0"
          role="button"
          aria-label="View Date Change Request details"
        >
          <td class="text-sm uppercase">${displayId}</td>

          <td>
            <div>
              <p class="font-normal">${item.emp_name || ""}</p>
              <p class="uppercase opacity-60 text-xs">${item.emp_number || ""}</p>
            </div>
          </td>

          <td class="dates">
            <div class="flex gap-2 items-center whitespace-nowrap">
              <p class="font-normal">${proposedFrom}</p>
              <span class="font-bold bg-[var(--secondary)] w-4 h-[4px]"></span>
              <p class="font-normal">${proposedTo}</p>
            </div>
          </td>

          <td>
            <span class="${diffBadgeClass}">
              <span class="change-symbol">${diffSign}</span>
              <span class="change-value">${diffValue}</span>
            </span>
          </td>

          <td>${item.requester_name || ""}</td>

          <td>${statusHtml}</td>

          <td>
            <button
              type="button"
              class="view-date-change-request openIcon"
              data-request-key="${item.req_id}"
              aria-label="View request details"
              title="Open item"
            >
              <i class="bx bx-link-external text-[16px] opacity-50"></i>
            </button>
          </td>
        </tr>
      `;

      $("#datechangeTableBody").append(row);
    });
  } else {
    const emptyRow = `
      <tr>
        <td colspan="7" class="h-[530px]">
          <div class="flex items-center justify-center flex-col gap-3">
            <img src="../images/empty.png" class="w-[150px] h-auto opacity-[0.75]" alt="empty">
            <h5 class="font-semibold text-[16px] text-[var(--gray-text)]">No item found.</h5>
            <p class="text-[var(--gray-text)]">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        </td>
      </tr>
    `;

    $("#datechangeTableBody").append(emptyRow);
  }
}

function formatStatus(status) {
  let statusString = "pending";

  if (status === 1) {
    statusString = "accepted";
  } else if (status === 0) {
    statusString = "cancelled";
  }

  $("#cancelModalStatus").html(
    `
     <span class="status lg ${statusString} ms-3">
       ${statusString}
     </span>`,
  );
}

function searchFilter(req_list) {
  const keyword = $("#searchbar").val().toLowerCase().trim();
  const grps = $("#grpSel").val().split(",").map(Number);
  const dateFilter = $("#monthSel").val();
  const activeTabId = $("button.tab").has("p.active").attr("id");
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

  filteredCancellationRequests = results;
  cancellationCurrentPage = 1;
  renderCancellationRequests();
}

function renderCancellationRequests() {
  const totalItems = filteredCancellationRequests.length;
  const pagination = calculatePagination(
    totalItems,
    cancellationCurrentPage,
    cancellationItemsPerPage,
  );

  cancellationCurrentPage = pagination.currentPage;

  const pageRecords = filteredCancellationRequests.slice(
    pagination.startIndex,
    pagination.endIndex,
  );

  fillTable(pageRecords);
  renderPaginationBar($('[data-pagination="cancellation"]'), {
    currentPage: cancellationCurrentPage,
    itemsPerPage: cancellationItemsPerPage,
    totalItems,
  });
}

function updateDateChangeStatusIndicator($tab) {
  const indicator = document.querySelector(".indicator-datechange");
  if (!indicator || !$tab || !$tab.length) {
    return;
  }

  const rect = $tab[0].getBoundingClientRect();
  const parentRect = $tab.parent()[0].getBoundingClientRect();
  indicator.style.width = rect.width + "px";
  indicator.style.left = rect.left - parentRect.left + "px";
}

function setActiveDateChangeStatusTab(status) {
  const normalizedStatus = String(status || "all").trim().toLowerCase();

  $(".tab-datechange p").removeClass("font-semibold text-[var(--dark)] active");
  const $activeTab = $(`.tab-datechange[data-status="${normalizedStatus}"]`);
  $activeTab.find("p").addClass("font-semibold text-[var(--dark)] active");
  updateDateChangeStatusIndicator($activeTab);
}

function initDateChangeRequestsTable() {
  allDateChangeRequests = [...originalDateChangeRequestData];
  filteredDateChangeRequests = [...allDateChangeRequests];
  selectedDateChangeStatus = "all";
  setActiveDateChangeStatusTab("all");
  applyDateChangeRequestFilters();
}

function renderDateChangeRequests() {
  const totalItems = filteredDateChangeRequests.length;
  const pagination = calculatePagination(
    totalItems,
    dateChangeCurrentPage,
    dateChangeItemsPerPage,
  );

  dateChangeCurrentPage = pagination.currentPage;

  const pageRecords = filteredDateChangeRequests.slice(
    pagination.startIndex,
    pagination.endIndex,
  );

  fillTableDateChange(pageRecords);
  renderPaginationBar($('[data-pagination="datechange"]'), {
    currentPage: dateChangeCurrentPage,
    itemsPerPage: dateChangeItemsPerPage,
    totalItems,
  });
}

function applyDateChangeRequestFilters() {
  let results = [...allDateChangeRequests];

  const keyword = $("#searchbar-datechange").val().toLowerCase().trim();
  const dateFilter = $("#monthSel-datechange").val();
  const grpVal = $("#grpSel-datechange").val();

  if (keyword) {
    results = results.filter((request) => {
      const empName = (request.emp_name || "").toLowerCase();
      const requesterName = (request.requester_name || "").toLowerCase();
      const requestId = String(request.req_id || "");
      const displayId = (request.display_id || "").toLowerCase();

      return (
        empName.includes(keyword) ||
        requesterName.includes(keyword) ||
        requestId.includes(keyword) ||
        displayId.includes(keyword)
      );
    });
  }

  if (dateFilter) {
    results = results.filter((request) =>
      String(request.req_date || "").startsWith(dateFilter),
    );
  }

  if (grpVal) {
    const grps = grpVal
      .split(",")
      .map(Number)
      .filter((groupId) => !Number.isNaN(groupId));

    if (grps.length === 1) {
      results = results.filter(
        (request) =>
          request.group_id == null || grps.includes(Number(request.group_id)),
      );
    }
  }

  results = results.filter((request) => {
    const requestStatus = normalizeDateChangeStatus(request.status);
    const matchesStatus =
      selectedDateChangeStatus === "all" ||
      requestStatus === selectedDateChangeStatus;

    return matchesStatus;
  });

  results.sort((a, b) => new Date(b.req_date) - new Date(a.req_date));

  filteredDateChangeRequests = results;
  dateChangeCurrentPage = 1;
  renderDateChangeRequests();
}

function fillGroups(grps) {
  const groupIDS = grps.map((obj) => obj.newID);

  ["#grpSel", "#grpSel-datechange"].forEach((selector) => {
    const grpSelect = $(selector);
    grpSelect.html(`<option value=${groupIDS}>All Groups</option>`);
    $.each(grps, function (index, item) {
      const option = $("<option>")
        .attr("value", item.newID)
        .text(item.abbreviation)
        .attr("grp-id", item.newID);
      grpSelect.append(option);
    });
  });
}
