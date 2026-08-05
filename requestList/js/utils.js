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

  const today = new Date().toISOString().slice(0, 10);

  requests.forEach((request) => {
    const status = normalizeDispatchStatus(getRawDispatchStatus(request));

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
  const normalizedStatus = normalizeDispatchStatus(
    getRawDispatchStatus(request),
  );
  return getStatusBadgeHtml(normalizedStatus);
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
  const requestId = params.get("open_request");

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
//#endregion
