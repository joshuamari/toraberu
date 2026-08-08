//#region UTILS
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

function formatDate(date) {
  var [year, month, day] = date.split("-");
  monthName = monthNames2[parseInt(month) - 1];

  return day + " " + monthName + " " + year;
}

function formatDispatchDateRange(startDate, endDate) {
  const start = startDate ? formatDate(startDate) : "";
  const end = endDate ? formatDate(endDate) : "";

  if (!start && !end) {
    return "—";
  }

  if (start && end) {
    return `${start} — ${end}`;
  }

  return start || end;
}

function getRawDispatchStatus(request) {
  if (!request || typeof request !== "object") {
    return undefined;
  }

  if (Object.prototype.hasOwnProperty.call(request, "request_status")) {
    return request.request_status;
  }

  if (Object.prototype.hasOwnProperty.call(request, "status")) {
    return request.status;
  }

  return undefined;
}

function normalizeDispatchStatus(rawStatus) {
  if (rawStatus === null || rawStatus === undefined) {
    return "pending";
  }

  const status = String(rawStatus).trim().toLowerCase();

  if (!status) {
    return "pending";
  }

  const map = {
    pending: "pending",

    accepted: "approved",
    approved: "approved",

    rejected: "declined",
    declined: "declined",
    denied: "declined",

    cancelled: "cancelled",
    canceled: "cancelled",

    completed: "completed",

    "0": "cancelled",
    "1": "approved",
  };

  return map[status] || "unknown";
}

function getLocalTodayDateString() {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch (e) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

function requestHasApprovedCancellation(request) {
  if (!request || typeof request !== "object") {
    return false;
  }

  if (request.has_approved_cancellation === true) {
    return true;
  }

  if (Array.isArray(request.activityLog)) {
    return request.activityLog.some((event) => {
      const type = String(event?.eventType || "").trim();
      return (
        type === "cancellation_accepted" || type === "dispatch_cancelled"
      );
    });
  }

  return false;
}

function getDispatchEndDateString(request) {
  if (!request || typeof request !== "object") {
    return null;
  }

  const raw =
    request.to !== undefined && request.to !== null && request.to !== ""
      ? request.to
      : request.dispatch_to;

  if (raw === undefined || raw === null || raw === "") {
    return null;
  }

  const dateOnly = String(raw).trim().split(/[\sT]/)[0];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return null;
  }

  return dateOnly;
}

function resolveDispatchDisplayStatus(request) {
  const status = normalizeDispatchStatus(getRawDispatchStatus(request));

  if (status === "cancelled") {
    return requestHasApprovedCancellation(request) ? "cancelled" : "declined";
  }

  if (status === "approved") {
    const endDate = getDispatchEndDateString(request);
    if (endDate && endDate < getLocalTodayDateString()) {
      return "completed";
    }
  }

  return status;
}

function getStatusBadgeHtml(normalizedStatus) {
  const statusConfig = {
    pending: { label: "Pending", className: "pending" },
    approved: { label: "Approved", className: "approved" },
    declined: { label: "Declined", className: "declined" },
    cancelled: { label: "Cancelled", className: "cancelled" },
    completed: { label: "Completed", className: "completed" },
    unknown: { label: "Unknown", className: "" },
  };

  const config = statusConfig[normalizedStatus] || statusConfig.unknown;

  return `<span class=" status ${config.className} ">
                        ${config.label}
                      </span>`;
}

function getDispatchStatusCounts(requests) {
  const counts = {
    pending: 0,
    approved: 0,
    declined: 0,
    cancelled: 0,
    completed: 0,
    total: requests.length,
    todaytotal: 0,
    todayaccept: 0,
  };

  const today = getLocalTodayDateString();

  requests.forEach((request) => {
    const status = resolveDispatchDisplayStatus(request);

    if (Object.prototype.hasOwnProperty.call(counts, status)) {
      counts[status] += 1;
    }

    if (request.req_date === today) {
      counts.todaytotal += 1;
    }

    if (status === "approved" && request.modified) {
      const modifiedDate = String(request.modified).split(" ")[0];
      if (modifiedDate === today) {
        counts.todayaccept += 1;
      }
    }
  });

  return counts;
}

function getRequestListStatusCode(rawStatus) {
  if (rawStatus === null || rawStatus === undefined) {
    return null;
  }

  if (rawStatus == 1) {
    return 1;
  }

  if (rawStatus == 0) {
    return 0;
  }

  return rawStatus;
}

function getRequestListStatusBadgeHtml(request) {
  return getStatusBadgeHtml(resolveDispatchDisplayStatus(request));
}

function syncRequestListStatusFields(requests) {
  if (!Array.isArray(requests)) {
    return [];
  }

  return requests.map(function (request) {
    if (!request || typeof request !== "object") {
      return request;
    }

    const hasStatus = Object.prototype.hasOwnProperty.call(request, "status");
    const hasRequestStatus = Object.prototype.hasOwnProperty.call(
      request,
      "request_status",
    );

    if (hasRequestStatus && !hasStatus) {
      request.status = request.request_status;
    }

    return request;
  });
}

function applyRequestDetailStatusToList(requestId, detailData) {
  const dispatchRequest = detailData && detailData.dispatch_request;

  if (!dispatchRequest) {
    return;
  }

  if (
    !Object.prototype.hasOwnProperty.call(dispatchRequest, "request_status")
  ) {
    return;
  }

  const req = reqList.find(
    (item) => String(item.req_id) === String(requestId),
  );

  if (!req) {
    return;
  }

  req.request_status = dispatchRequest.request_status;
  req.status = dispatchRequest.request_status;
}

function formatName(name) {
  const [last, given] = name.split(",");
  const surname = last.toUpperCase();
  return given + " " + surname;
}

function ajaxJsonErrorMessage(xhr, fallback) {
  if (xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  } else if (xhr.status === 500) {
    return "Internal Server Error: There was a server error.";
  }
  return fallback;
}

function openRequestFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requestId = params.get("open_request") || params.get("request_id");

  if (!requestId || requestId === "undefined") return;

  const req = reqList.find((item) => String(item.req_id) === String(requestId));

  if (!req) {
    $("#searchbar").val(requestId);
    searchFilter(reqList);
    return;
  }

  fillOpenModal(req.req_id);

  getRequestData(req.req_id).then((res) => {
    if (res.success) {
      printData = res.data;
      applyRequestDetailStatusToList(req.req_id, res.data);
      fillOpenModal(req.req_id);
    }
  });
}

/**
 * Documents cell badges — same readiness display as dashboard
 * Recent Dispatch Activity (passport, visa, re-entry).
 */
function getDocumentReadinessHtml(item) {
  const badges = [];

  if (item.passportStatus) {
    badges.push(documentStatusBadge("Passport", item.passportStatus));
  } else if (Object.prototype.hasOwnProperty.call(item, "passValid")) {
    badges.push(
      item.passValid
        ? `<span class="doc-badge is-ok">Passport OK</span>`
        : `<span class="doc-badge is-missing">Missing Passport</span>`,
    );
  }

  if (item.visaStatus) {
    badges.push(documentStatusBadge("Visa", item.visaStatus));
  } else if (Object.prototype.hasOwnProperty.call(item, "visaValid")) {
    badges.push(
      item.visaValid
        ? `<span class="doc-badge is-ok">Visa OK</span>`
        : `<span class="doc-badge is-missing">Missing Visa</span>`,
    );
  }

  badges.push(getReentryReadinessBadge(item));

  if (!badges.length) {
    return "—";
  }

  return `<div class="doc-readiness">${badges.join("")}</div>`;
}

function getReentryReadinessBadge(item) {
  const status =
    item && item.reentryStatus != null && item.reentryStatus !== ""
      ? String(item.reentryStatus)
      : "missing";

  if (status === "valid" || status === "valid_expiring") {
    return `<span class="doc-badge is-ok">Re-entry OK</span>`;
  }

  if (status === "on_process") {
    return `<span class="doc-badge is-process">Re-entry On Process</span>`;
  }

  if (status === "invalid") {
    return `<span class="doc-badge is-missing">Re-entry Expired</span>`;
  }

  return `<span class="doc-badge is-missing">Missing Re-entry</span>`;
}

function documentStatusBadge(label, status, isReentry) {
  if (isReentry) {
    return getReentryReadinessBadge({ reentryStatus: status });
  }

  if (status === "valid") {
    return `<span class="doc-badge is-ok">${label} OK</span>`;
  }

  if (status === "valid_expiring") {
    return `<span class="doc-badge is-expiring">${label} Expiring</span>`;
  }

  if (status === "on_process") {
    return `<span class="doc-badge is-process">${label} On Process</span>`;
  }

  return `<span class="doc-badge is-missing">Missing ${label}</span>`;
}
//#endregion
