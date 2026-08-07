//#region UTILS
function capitalizeWord(name) {
  return String(name || "")
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function getInitials(firstname, surname) {
  const firstInitial = String(firstname || "").charAt(0);
  const lastInitial = String(surname || "").charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

function formatDays(numberOfDays) {
  if (numberOfDays === 0) {
    return "Expired";
  } else if (numberOfDays >= 30) {
    const months = Math.floor(numberOfDays / 30);
    return months === 1 ? `${months} Month` : `${months} Months`;
  }
  return `${numberOfDays} days`;
}

/**
 * Document Alerts remaining-time wording.
 * Uses the same day→month threshold as formatDays (>= 30 days ⇒ months).
 */
function formatExpirationRelative(numberOfDays) {
  const days = Number(numberOfDays);
  if (!Number.isFinite(days)) {
    return "";
  }

  const absDays = Math.abs(days);
  const durationLabel = (() => {
    if (absDays >= 30) {
      const months = Math.floor(absDays / 30);
      return `${months} ${months === 1 ? "month" : "months"}`;
    }
    return `${absDays} ${absDays === 1 ? "day" : "days"}`;
  })();

  if (days < 0) {
    return `Expired ${durationLabel} ago`;
  }

  if (days === 0) {
    return "Expires today";
  }

  if (days === 1) {
    return "Expires tomorrow";
  }

  return `Expires in ${durationLabel}`;
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const raw = String(date).trim().split(/[\sT]/)[0];
  const parts = raw.split("-");

  if (parts.length !== 3) {
    return String(date);
  }

  const [year, month, day] = parts;
  const monthName = monthNames2[parseInt(month, 10) - 1] || month;
  return `${day} ${monthName} ${year}`;
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

function ajaxJsonErrorMessage(xhr, fallback) {
  if (xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  } else if (xhr.status === 500) {
    return "Internal Server Error: There was a server error.";
  }
  return fallback;
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
      return type === "cancellation_accepted" || type === "dispatch_cancelled";
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

  return `<span class="status ${config.className}">${config.label}</span>`;
}

function getChangeRequestStatusBadgeHtml(rawStatus) {
  const normalized = String(rawStatus || "")
    .trim()
    .toLowerCase();

  if (normalized === "approved" || normalized === "accepted") {
    return `<span class="status accepted">Accepted</span>`;
  }

  if (normalized === "denied" || normalized === "cancelled" || normalized === "declined") {
    return `<span class="status denied">Rejected</span>`;
  }

  return `<span class="status pending">Pending</span>`;
}

function getDispatchStatusCounts(requests) {
  const counts = {
    pending: 0,
    approved: 0,
    declined: 0,
    cancelled: 0,
    completed: 0,
    total: Array.isArray(requests) ? requests.length : 0,
  };

  (requests || []).forEach((request) => {
    const status = resolveDispatchDisplayStatus(request);
    if (Object.prototype.hasOwnProperty.call(counts, status)) {
      counts[status] += 1;
    }
  });

  return counts;
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

function getDateYear(dateValue) {
  if (!dateValue) {
    return null;
  }

  const dateOnly = String(dateValue).trim().split(/[\sT]/)[0];
  const year = parseInt(dateOnly.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

function dispatchOverlapsYear(request, year) {
  const fromYear = getDateYear(request.from || request.dispatch_from);
  const toYear = getDateYear(request.to || request.dispatch_to);

  if (fromYear === null && toYear === null) {
    return getDateYear(request.req_date) === year;
  }

  const start = fromYear === null ? toYear : fromYear;
  const end = toYear === null ? fromYear : toYear;

  return start <= year && end >= year;
}

/**
 * Years available for Dispatch Count by Group:
 * earliest year present in approved/completed dispatch date ranges
 * through the current calendar year (newest first). No future years.
 */
function getAvailableGroupDispatchYears(requests) {
  const currentYear = new Date().getFullYear();
  let earliest = currentYear;

  (requests || []).forEach((request) => {
    const status = resolveDispatchDisplayStatus(request);
    if (status !== "approved" && status !== "completed") {
      return;
    }

    const fromYear = getDateYear(request.from || request.dispatch_from);
    const toYear = getDateYear(request.to || request.dispatch_to);

    // Match dispatchOverlapsYear: fall back to req_date when period is absent.
    if (fromYear === null && toYear === null) {
      const reqYear = getDateYear(request.req_date);
      if (reqYear != null && reqYear <= currentYear && reqYear < earliest) {
        earliest = reqYear;
      }
      return;
    }

    [fromYear, toYear].forEach((year) => {
      if (year == null || year > currentYear) {
        return;
      }
      if (year < earliest) {
        earliest = year;
      }
    });
  });

  const years = [];
  for (let year = currentYear; year >= earliest; year -= 1) {
    years.push(year);
  }
  return years;
}

function countPendingChangeRequests(cancellations, dateChanges) {
  const isPending = (item) =>
    String(item?.status || "")
      .trim()
      .toLowerCase() === "pending";

  return (
    (cancellations || []).filter(isPending).length +
    (dateChanges || []).filter(isPending).length
  );
}

function countCompletedThisYear(requests, year) {
  return (requests || []).filter((request) => {
    const status = resolveDispatchDisplayStatus(request);
    if (status !== "completed") {
      return false;
    }

    const endYear = getDateYear(getDispatchEndDateString(request));
    return endYear === year;
  }).length;
}

function resolveGroupMemberCount(group) {
  if (!group || typeof group !== "object") {
    return null;
  }

  if (!Object.prototype.hasOwnProperty.call(group, "empCount")) {
    return null;
  }

  const members = Number(group.empCount);
  if (!Number.isFinite(members) || members < 0) {
    return null;
  }

  // Zero is a valid count; rate math still requires > 0 later.
  return members;
}

/**
 * Single normalized dataset for Dispatch Count by Group:
 * chart bars, tooltips, and bottom insight all consume this array.
 * Canonical join key: group.id / request.group_id
 */
function buildGroupDispatchDataset(requests, groups, year) {
  const datasetById = {};

  (groups || []).forEach((group) => {
    if (group == null || group.id === undefined || group.id === null || group.id === "") {
      return;
    }

    const id = String(group.id);
    const memberCount = resolveGroupMemberCount(group);

    datasetById[id] = {
      groupId: id,
      groupName: group.name || "Unknown",
      groupAbbreviation: group.abbreviation || group.name || "—",
      dispatchCount: 0,
      memberCount,
      dispatchRate: null,
    };
  });

  (requests || []).forEach((request) => {
    const status = resolveDispatchDisplayStatus(request);
    if (status !== "approved" && status !== "completed") {
      return;
    }

    if (!dispatchOverlapsYear(request, year)) {
      return;
    }

    const id = String(request.group_id ?? "");
    if (!id || !Object.prototype.hasOwnProperty.call(datasetById, id)) {
      // Only count against the canonical group master list (stable group_id).
      return;
    }

    datasetById[id].dispatchCount += 1;
  });

  return Object.values(datasetById)
    .map((row) => {
      if (row.memberCount != null && row.memberCount > 0) {
        row.dispatchRate = row.dispatchCount / row.memberCount;
      } else {
        row.dispatchRate = null;
      }
      return row;
    })
    .sort(
      (a, b) =>
        b.dispatchCount - a.dispatchCount ||
        a.groupAbbreviation.localeCompare(b.groupAbbreviation),
    );
}

function formatGroupDispatchCountClause(group) {
  const dispatchLabel = `${group.dispatchCount} dispatch${
    group.dispatchCount === 1 ? "" : "es"
  }`;

  if (group.memberCount != null && group.memberCount > 0 && group.dispatchRate != null) {
    const percent = Math.round(group.dispatchRate * 100);
    return `${dispatchLabel} among ${group.memberCount} member${
      group.memberCount === 1 ? "" : "s"
    } (${percent}% rate)`;
  }

  return dispatchLabel;
}

function formatTiedAbbreviations(groups) {
  const labels = groups.map((group) => group.groupAbbreviation);
  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

function computeGroupInsight(dataset) {
  if (!dataset.length) {
    return "No group data available for this year.";
  }

  const maxCount = Math.max(...dataset.map((row) => row.dispatchCount));
  const minCount = Math.min(...dataset.map((row) => row.dispatchCount));

  const highestGroups = dataset
    .filter((row) => row.dispatchCount === maxCount)
    .sort((a, b) => a.groupAbbreviation.localeCompare(b.groupAbbreviation));
  const lowestGroups = dataset
    .filter((row) => row.dispatchCount === minCount)
    .sort((a, b) => a.groupAbbreviation.localeCompare(b.groupAbbreviation));

  const highest = highestGroups[0];
  const lowest = lowestGroups[0];

  let highestText;
  if (highestGroups.length > 1) {
    highestText = `${formatTiedAbbreviations(highestGroups)} are tied for the highest dispatch count with ${highest.dispatchCount} dispatch${
      highest.dispatchCount === 1 ? "" : "es"
    }`;
  } else {
    highestText = `${highest.groupAbbreviation} has the highest dispatch count: ${formatGroupDispatchCountClause(highest)}`;
  }

  if (dataset.length === 1 || String(highest.groupId) === String(lowest.groupId)) {
    return `${highestText}.`;
  }

  if (lowestGroups.length > 1) {
    return `${highestText}, while ${formatTiedAbbreviations(lowestGroups)} are tied for the lowest with ${lowest.dispatchCount} dispatch${
      lowest.dispatchCount === 1 ? "" : "es"
    }.`;
  }

  return `${highestText}, while ${lowest.groupAbbreviation} has the lowest: ${formatGroupDispatchCountClause(lowest)}.`;
}

function getAlertSeverity(daysUntil) {
  if (daysUntil <= 30) {
    return "critical";
  }
  if (daysUntil <= 90) {
    return "high";
  }
  return "medium";
}

function buildDocumentAlerts(passports, visas, dispatches) {
  const alerts = [];

  (passports || []).forEach((item) => {
    const until = Number(item.until) || 0;
    alerts.push({
      empId: item.id,
      name: item.name,
      documentType: "passport",
      issue: "Passport expiration",
      meta: formatExpirationRelative(until),
      until,
      severity: getAlertSeverity(until),
      sortKey: until,
    });
  });

  (visas || []).forEach((item) => {
    const until = Number(item.until) || 0;
    alerts.push({
      empId: item.id,
      name: item.name,
      documentType: "visa",
      issue: "Visa expiration",
      meta: formatExpirationRelative(until),
      until,
      severity: getAlertSeverity(until),
      sortKey: until,
    });
  });

  (dispatches || []).forEach((item) => {
    if (item.passportStatus === "invalid") {
      alerts.push({
        empId: null,
        name: item.name,
        documentType: "passport",
        issue: "Missing / invalid passport for dispatch",
        meta: `${item.from} — ${item.to}`,
        until: 0,
        severity: "critical",
        sortKey: 0,
      });
    }

    if (item.visaStatus === "invalid") {
      alerts.push({
        empId: null,
        name: item.name,
        documentType: "visa",
        issue: "Missing / invalid visa for dispatch",
        meta: `${item.from} — ${item.to}`,
        until: 0,
        severity: "critical",
        sortKey: 0,
      });
    }

    // Only surface re-entry states already computed by the dashboard
    // (on process / expiring). Do not treat "invalid" as required-missing.
    if (item.reentryStatus === "on_process") {
      alerts.push({
        empId: null,
        name: item.name,
        documentType: "reentry",
        issue: "Re-entry permit on process",
        meta: `${item.location} · ${item.from} — ${item.to}`,
        until: 45,
        severity: "high",
        sortKey: 45,
      });
    } else if (item.reentryStatus === "valid_expiring") {
      alerts.push({
        empId: null,
        name: item.name,
        documentType: "reentry",
        issue: "Re-entry permit expiring",
        meta: `${item.location} · ${item.from} — ${item.to}`,
        until: 60,
        severity: "medium",
        sortKey: 60,
      });
    }
  });

  alerts.sort((a, b) => {
    const severityRank = { critical: 0, high: 1, medium: 2 };
    const rankDiff =
      (severityRank[a.severity] ?? 3) - (severityRank[b.severity] ?? 3);
    if (rankDiff !== 0) {
      return rankDiff;
    }
    return a.sortKey - b.sortKey;
  });

  return alerts;
}

function findDashboardEmployeeIdByName(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!normalized) {
    return null;
  }

  const matchFromList = (list, getId, getName) => {
    for (const item of list || []) {
      const itemName = String(getName(item) || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      if (itemName && itemName === normalized) {
        const id = getId(item);
        if (id !== undefined && id !== null && id !== "") {
          return id;
        }
      }
    }
    return null;
  };

  const fromPassport = matchFromList(
    dashboardPassportAlerts,
    (item) => item.id,
    (item) => item.name,
  );
  if (fromPassport !== null) {
    return fromPassport;
  }

  const fromVisa = matchFromList(
    dashboardVisaAlerts,
    (item) => item.id,
    (item) => item.name,
  );
  if (fromVisa !== null) {
    return fromVisa;
  }

  for (const request of dashboardRequestList || []) {
    const empName = String(request.emp_name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (!empName) {
      continue;
    }

    let comparable = empName;
    if (empName.includes(",")) {
      const [last, given] = empName.split(",");
      comparable = `${String(given || "").trim()} ${String(last || "").trim()}`
        .replace(/\s+/g, " ")
        .trim();
    }

    if (comparable === normalized || empName === normalized) {
      if (
        request.emp_number !== undefined &&
        request.emp_number !== null &&
        request.emp_number !== ""
      ) {
        return request.emp_number;
      }
    }
  }

  return null;
}

function resolveDocumentAlertEmployeeId(alert) {
  if (
    alert &&
    alert.empId !== undefined &&
    alert.empId !== null &&
    alert.empId !== ""
  ) {
    return alert.empId;
  }

  return findDashboardEmployeeIdByName(alert && alert.name);
}

function getEmployeeDetailsHref(employeeId) {
  return `./empDetails/?id=${encodeURIComponent(employeeId)}`;
}

function getDocumentAlertTypeMeta(documentType) {
  const types = {
    passport: {
      label: "Passport",
      iconClass: "bx bx-id-card",
    },
    visa: {
      label: "Visa",
      iconClass: "bx bx-globe",
    },
    reentry: {
      label: "Re-entry Permit",
      iconClass: "bx bx-log-in-circle",
    },
  };

  return (
    types[documentType] || {
      label: "Document",
      iconClass: "bx bx-id-card",
    }
  );
}

function getDocumentReadinessHtml(item) {
  const badges = [];

  if (Object.prototype.hasOwnProperty.call(item, "passValid")) {
    badges.push(
      item.passValid
        ? `<span class="doc-badge is-ok">Passport OK</span>`
        : `<span class="doc-badge is-missing">Missing Passport</span>`,
    );
  } else if (item.passportStatus) {
    badges.push(documentStatusBadge("Passport", item.passportStatus));
  }

  if (Object.prototype.hasOwnProperty.call(item, "visaValid")) {
    badges.push(
      item.visaValid
        ? `<span class="doc-badge is-ok">Visa OK</span>`
        : `<span class="doc-badge is-missing">Missing Visa</span>`,
    );
  } else if (item.visaStatus) {
    badges.push(documentStatusBadge("Visa", item.visaStatus));
  }

  // Always render Re-entry as the third Documents badge.
  badges.push(getReentryReadinessBadge(item));

  if (!badges.length) {
    return "—";
  }

  return `<div class="doc-readiness">${badges.join("")}</div>`;
}

/**
 * Re-entry badge for Recent Dispatch Activity Documents cell.
 * Status source: Emp Details latest permit (resolveReentryPermitStatus).
 */
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

  // No permit record — Emp Details empty state; same Missing-* pattern as Passport/Visa.
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

function formatDispatchRequestId(reqId) {
  return `REQ-${String(reqId).padStart(5, "0")}`;
}

function normalizeActivityReentryStatus(status) {
  if (status == null || status === "") {
    return "missing";
  }
  return String(status);
}

function buildActivityFeed(requests, cancellations, dateChanges) {
  const items = [];

  (requests || []).forEach((request) => {
    items.push({
      type: "dispatch",
      id: request.req_id,
      displayId: formatDispatchRequestId(request.req_id),
      empName: request.emp_name,
      reqDate: request.req_date,
      from: request.from,
      to: request.to,
      statusHtml: getStatusBadgeHtml(resolveDispatchDisplayStatus(request)),
      passValid: request.passValid,
      visaValid: request.visaValid,
      reentryStatus: normalizeActivityReentryStatus(request.reentryStatus),
      sortDate: request.req_date,
    });
  });

  (cancellations || []).forEach((request) => {
    items.push({
      type: "cancellation",
      id: request.req_id,
      displayId:
        request.display_id || `CR-${String(request.req_id).padStart(5, "0")}`,
      empName: request.emp_name,
      reqDate: request.req_date,
      from: request.from || request.old_date,
      to: request.to || request.old_date_to,
      statusHtml: getChangeRequestStatusBadgeHtml(request.status),
      passValid: request.passValid,
      visaValid: request.visaValid,
      reentryStatus: normalizeActivityReentryStatus(request.reentryStatus),
      sortDate: request.req_date,
    });
  });

  (dateChanges || []).forEach((request) => {
    items.push({
      type: "date_change",
      id: request.req_id,
      displayId:
        request.display_id || `DC-${String(request.req_id).padStart(5, "0")}`,
      empName: request.emp_name,
      reqDate: request.req_date,
      from: request.new_date || request.from,
      to: request.new_date_to || request.to,
      statusHtml: getChangeRequestStatusBadgeHtml(request.status),
      passValid: request.passValid,
      visaValid: request.visaValid,
      reentryStatus: normalizeActivityReentryStatus(request.reentryStatus),
      sortDate: request.req_date,
    });
  });

  items.sort((a, b) => {
    const dateDiff = new Date(b.sortDate) - new Date(a.sortDate);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return String(b.displayId).localeCompare(String(a.displayId));
  });

  return items;
}

function getActivityHref(item) {
  if (item.type === "dispatch") {
    return `./requestList/?open_request=${encodeURIComponent(item.id)}`;
  }

  if (item.type === "cancellation") {
    return `./changeRequests/?type=cancellation&openChangeRequestId=${encodeURIComponent(item.id)}`;
  }

  if (item.type === "date_change") {
    return `./changeRequests/?type=date_change&openChangeRequestId=${encodeURIComponent(item.id)}`;
  }

  return "#";
}

function computeTrendInsight(trendData) {
  if (!Array.isArray(trendData) || trendData.length === 0) {
    return "No dispatch trend data available.";
  }

  let peak = trendData[0];
  let low = trendData[0];
  let total = 0;

  trendData.forEach((row) => {
    const rate = Number(row.rate) || 0;
    total += rate;
    if (rate > (Number(peak.rate) || 0)) {
      peak = row;
    }
    if (rate < (Number(low.rate) || 0)) {
      low = row;
    }
  });

  const average = total / trendData.length;
  const peakRate = Number(peak.rate) || 0;

  if (peakRate === 0) {
    return "No members were on dispatch at month end across the year.";
  }

  return `Peak was ${peak.month} (${peakRate}), averaging ${average.toFixed(1)} members on dispatch at month end.`;
}

function computeStatusInsight(counts) {
  if (!counts || counts.total === 0) {
    return "No dispatch request status data available.";
  }

  const entries = [
    ["Pending", counts.pending],
    ["Approved", counts.approved],
    ["Completed", counts.completed],
    ["Declined", counts.declined],
    ["Cancelled", counts.cancelled],
  ].filter(([, value]) => value > 0);

  entries.sort((a, b) => b[1] - a[1]);
  const [label, value] = entries[0];
  const share = Math.round((value / counts.total) * 100);

  return `${label} is the largest share at ${value} of ${counts.total} requests (${share}%).`;
}
//#endregion
