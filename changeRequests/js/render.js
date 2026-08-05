function fillOpenModal(trID) {
  const req = reqList.find((item) => item.req_id == trID);

  if (!req) {
    console.error("Cancellation request not found:", trID);
    return;
  }

  const name = req.emp_name || "";
  const grp = req.group_name || "";
  const startDate = req.from || req.old_date;
  const endDate = req.to || req.old_date_to;
  const reqName = req.requester_name || "";
  const reqDate = req.req_date;
  const normalizedStatus = normalizeDateChangeStatus(req.status);
  const locationLabel = req.location || req.specific_loc || "";
  const originalRequestId = req.original_request_id || req.req_id;
  const displayId =
    req.display_id || `CR-${String(req.req_id).padStart(5, "0")}`;
  const dispatchDates = formatDispatchDateRange(startDate, endDate);
  const formattedStartDate = isValidIsoDate(startDate)
    ? formatDate(startDate)
    : "Not available";
  const formattedEndDate = isValidIsoDate(endDate)
    ? formatDate(endDate)
    : "Not available";
  const formattedReqDate = isValidIsoDate(reqDate)
    ? formatPcsDate(reqDate)
    : "Not available";

  renderCancellationModalStatusBadge(normalizedStatus);
  updateCancellationModalActions(normalizedStatus);

  $("#cancelModalDisplayId").text(displayId);
  $("#modalEmpName").text(name);
  $("#modalEmpNumber").text(req.emp_number || "");
  $("#modalGroup").text(grp);
  $("#modalDispatchDates").text(dispatchDates);
  $("#modalLocCountry").text(locationLabel);
  $("#modalDateFrom").text(formattedStartDate);
  $("#modalDateTo").text(formattedEndDate);
  $("#modalReqName").text(reqName);
  $("#modalReqDate").text(formattedReqDate);
  $("#modalCancelReason").text(req.reason || "");
  $("#cancelModalRequestIdBtn")
    .text(originalRequestId ? `REQ# ${originalRequestId}` : "Not available")
    .attr("data-request-id", originalRequestId || "");

  $("#openModal").data("active-request-id", req.req_id);
  $("#openModal").modal("show");
}

function renderCancellationModalStatusBadge(normalizedStatus) {
  const config =
    DATE_CHANGE_STATUS_CONFIG[normalizedStatus] ||
    DATE_CHANGE_STATUS_CONFIG.pending;
  const $badge = $("#cancelModalStatus");

  $badge
    .removeClass("pending accepted cancelled denied")
    .addClass(config.className)
    .text(config.label);
}

function updateCancellationModalActions(normalizedStatus) {
  const isPending = normalizedStatus === "pending";

  $("#cancelModalActionFooter").toggleClass("d-none", !isPending);
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
    label: "REJECTED",
    className: "denied",
    finalizedMessage: "This date change request has been rejected.",
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
    declined: "denied",
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

  $("#dateChangeModalFooterPending").toggleClass("d-none", !isPending);
  $("#dateChangeModalFooterMessage")
    .toggleClass("d-none", isPending)
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

  const netChangeDisplay = formatNetChangeDisplay(netChange ?? 0);
  const formatTotalDaysLabel = (days) => {
    if (days === null) {
      return "—";
    }

    const unit = days === 1 ? "day" : "days";
    return `${days} ${unit}`;
  };

  let symbol = "";
  let totalDiffValue = "0";
  if (netChange !== null) {
    if (netChange > 0) {
      symbol = "+";
      totalDiffValue = String(netChange);
    } else if (netChange < 0) {
      symbol = "−";
      totalDiffValue = String(Math.abs(netChange));
    }
  }

  const displayId =
    request.display_id || `DC-${String(request.req_id).padStart(5, "0")}`;
  const originalRequestId = request.original_request_id || "";

  $("#dateChangeModalDisplayId").text(displayId);
  $("#modalOriginalRequestId").text(displayId);
  $("#modalDCEmpName").text(request.emp_name || "");
  $("#modalDCEmpNumber").text(request.emp_number || "");
  $("#modalDCGroup").text(request.group_name || "");
  $("#modalLocCountry").text(request.location || "");

  $("#modalDCCurrentDates").text(
    formatDispatchDateRange(modalData.currentStartDate, modalData.currentEndDate),
  );
  $("#modalDCProposedDates").text(
    formatDispatchDateRange(modalData.proposedStartDate, modalData.proposedEndDate),
  );
  $("#modalDCCurrentTotalDays").text(formatTotalDaysLabel(currentTotalDays));
  $("#modalDCProposedTotalDays").text(formatTotalDaysLabel(proposedTotalDays));

  $("#modalDCNetChange")
    .text(netChangeDisplay.text)
    .removeClass("net-change-positive net-change-negative net-change-neutral")
    .addClass(netChangeDisplay.className);

  $("#modalOldDateFrom").text(formatModalDate(modalData.currentStartDate));
  $("#modalOldDateTo").text(formatModalDate(modalData.currentEndDate));
  $("#modalNewDateFrom").text(formatModalDate(modalData.proposedStartDate));
  $("#modalNewDateTo").text(formatModalDate(modalData.proposedEndDate));

  $("#modalChangeReqName").text(request.requester_name || "");
  $("#modalChangeReqDate").text(
    isValidIsoDate(request.req_date) ? formatPcsDate(request.req_date) : "Not available",
  );
  $("#modalReason").text(request.reason || "");

  renderDateChangeModalStatusBadge(normalizedStatus);
  updateDateChangeModalActions(normalizedStatus);

  $("#modalOldDuration").text(
    currentTotalDays !== null ? currentTotalDays : "—",
  );
  $("#modalNewDuration").text(
    proposedTotalDays !== null ? proposedTotalDays : "—",
  );

  $("#modalSymbol").text(symbol);
  $("#modalTotalDiff").text(totalDiffValue);

  $("#changeModalRequestIdBtn")
    .text(originalRequestId ? `REQ# ${originalRequestId}` : "Not available")
    .attr("data-request-id", originalRequestId);

  $("#dateChangeModal").data("active-request-id", request.req_id);
  $("#dateChangeModal").modal("show");
}

function syncConfirmDateChangeModalFields() {
  $("#confirmOldDateFrom").text($("#modalOldDateFrom").text());
  $("#confirmOldDateTo").text($("#modalOldDateTo").text());
  $("#confirmNewDateFrom").text($("#modalNewDateFrom").text());
  $("#confirmNewDateTo").text($("#modalNewDateTo").text());
  $("#confirmDateChangeCurrentDates").text($("#modalDCCurrentDates").text());
  $("#confirmDateChangeRequestedBy").text($("#modalChangeReqName").text());
  $("#confirmDateChangeRequestedDate").text($("#modalChangeReqDate").text());
  $("#confirmDateChangeReason").text($("#modalReason").text());
  $("#confirmDateChangeCurrentDays").text($("#modalDCCurrentTotalDays").text());
  $("#confirmDateChangeProposedDays").text($("#modalDCProposedTotalDays").text());
  $("#confirmDateChangeOriginalDispatchIdBtn")
    .text($("#changeModalRequestIdBtn").text() || "Not available")
    .attr("data-request-id", $("#changeModalRequestIdBtn").attr("data-request-id") || "");
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
      ? "This action will cancel the approved dispatch. The original dispatch request will remain available for reference."
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

  $("#confirmCancelCancellationId").text($("#cancelModalDisplayId").text());
  $("#confirmCancelEmpName").text($("#modalEmpName").text());
  $("#confirmCancelGroup").text($("#modalGroup").text());
  $("#confirmCancelDates").text($("#modalDispatchDates").text());
  $("#confirmCancelReason").text($("#modalCancelReason").text());
  $("#confirmCancelOriginalDispatchIdBtn")
    .text($("#cancelModalRequestIdBtn").text() || "Not available")
    .attr("data-request-id", $("#cancelModalRequestIdBtn").attr("data-request-id") || "");
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

function getCancellationStatusBadgeHtml(status) {
  const normalized = normalizeDateChangeStatus(status);

  if (normalized === "accepted") {
    return `<span class="status accepted">Accepted</span>`;
  }

  if (normalized === "denied" || normalized === "cancelled") {
    return `<span class="status denied">Rejected</span>`;
  }

  return `<span class="status pending">Pending</span>`;
}

function fillTable(sampleData) {
  $("#tableBody").empty();
  var str = "";

  if (sampleData.length != 0) {
    $.each(sampleData, function (index, item) {
      const displayId =
        item.display_id || `CR-${String(item.req_id).padStart(5, "0")}`;
      const dispatchDates = formatDispatchDateRange(item.from, item.to);
      const dateRequested = item.req_date ? formatPcsDate(item.req_date) : "—";

      str = `
    <tr req-id="${item.req_id}">
      <td>${displayId}</td>
      <td>${item.emp_name || ""}</td>
      <td>${dispatchDates}</td>
      <td>${dateRequested}</td>
      <td>${getCancellationStatusBadgeHtml(item.status)}</td>
      <td>
        <div class="openIcon " title="Open item">
           <i class='bx bx-link-external text-[16px] opacity-50'></i>
        </div>
      </td>
    </tr>`;

      $("#tableBody").append(str);
    });
  } else {
    str = `<tr><td colspan="6" class="change-requests-empty-state"><div class="flex items-center justify-center flex-col gap-3"><img src="../images/empty.png" class="w-[150px] h-auto opacity-[0.75]" alt="empty">
    <h5 class="font-semibold text-[16px] text-[var(--gray-text)]">No item found.</h5>
    <p class="text-[var(--gray-text)]">Try adjusting your search or filter to find what you're looking for.</p>
    </div></td></tr>`;
    $("#tableBody").append(str);
  }
}

function fillTableDateChange(sampleData) {
  $("#datechangeTableBody").empty();

  if (sampleData.length !== 0) {
    $.each(sampleData, function (index, item) {
      const statusHtml = getDateChangeStatusBadgeHtml(item.status);
      const displayId =
        item.display_id || `DC-${String(item.req_id).padStart(5, "0")}`;
      const currentDates = formatDateRange(item.old_date, item.old_date_to);
      const proposedDates = formatDateRange(item.new_date, item.new_date_to);
      const dateRequested = item.req_date ? formatPcsDate(item.req_date) : "—";

      const row = `
        <tr
          class="date-change-request-row"
          data-request-key="${item.req_id}"
          tabindex="0"
          role="button"
          aria-label="View Date Change Request details"
        >
          <td>${displayId}</td>

          <td>${item.emp_name || ""}</td>

          <td>${currentDates}</td>

          <td>${proposedDates}</td>

          <td>${dateRequested}</td>

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
        <td colspan="7" class="change-requests-empty-state">
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

  const results = req_list.filter((emp) => {
    const searchMatch =
      (emp.emp_name || "").toLowerCase().includes(keyword) ||
      (emp.requester_name || "").toLowerCase().includes(keyword);

    const groupMatch = grps.includes(parseInt(emp.group_id));
    const dateMatch = dateFilter
      ? String(emp.req_date || "").startsWith(dateFilter)
      : true;
    const normalizedStatus = normalizeDateChangeStatus(emp.status);
    const statusMatch =
      selectedCancellationStatus === "all" ||
      normalizedStatus === selectedCancellationStatus;

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

function updateCancellationStatusIndicator($tab) {
  if (!$tab || !$tab.length) {
    return;
  }

  const $container = $tab.closest(".tabs:not(.tabs-datechange)");
  const indicator = $container.find(".indicator")[0];

  if (!indicator) {
    return;
  }

  const rect = $tab[0].getBoundingClientRect();
  const parentRect = $container[0].getBoundingClientRect();
  indicator.style.width = rect.width + "px";
  indicator.style.left = rect.left - parentRect.left + "px";
}

function setActiveCancellationStatusTab(status) {
  const normalizedStatus = String(status || "all").trim().toLowerCase();

  $(".tab-cancellation .tab-segment__label").removeClass(
    "font-semibold text-[var(--dark)] active",
  );
  const $activeTab = $(
    `.tab-cancellation[data-status="${normalizedStatus}"]`,
  );
  $activeTab
    .find(".tab-segment__label")
    .addClass("font-semibold text-[var(--dark)] active");
  updateCancellationStatusIndicator($activeTab);
}

function initCancellationRequestsTable() {
  selectedCancellationStatus = "all";
  setActiveCancellationStatusTab("all");
  searchFilter(reqList);
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

  $(".tab-datechange .tab-segment__label").removeClass(
    "font-semibold text-[var(--dark)] active",
  );
  const $activeTab = $(`.tab-datechange[data-status="${normalizedStatus}"]`);
  $activeTab
    .find(".tab-segment__label")
    .addClass("font-semibold text-[var(--dark)] active");
  updateDateChangeStatusIndicator($activeTab);
}

function initDateChangeRequestsTable() {
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
