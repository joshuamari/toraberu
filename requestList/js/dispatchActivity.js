//#region DISPATCH ACTIVITY HISTORY
const DISPATCH_ACTIVITY_EVENT_LABELS = {
  dispatch_submitted: "Dispatch Request Submitted",
  dispatch_approved: "Dispatch Approved",
  dispatch_declined: "Dispatch Declined",
  date_change_requested: "Date Change Request Submitted",
  date_change_accepted: "Date Change Request Accepted",
  date_change_rejected: "Date Change Request Rejected",
  cancellation_requested: "Cancellation Request Submitted",
  cancellation_accepted: "Cancellation Request Accepted",
  cancellation_rejected: "Cancellation Request Rejected",
  dispatch_cancelled: "Dispatch Cancelled",
  dispatch_completed: "Dispatch Completed",
};

const DISPATCH_ACTIVITY_ACTOR_PREFIXES = {
  dispatch_submitted: "Submitted by",
  dispatch_approved: "Approved by",
  dispatch_declined: "Declined by",
  date_change_requested: "Requested by",
  date_change_accepted: "Accepted by",
  date_change_rejected: "Rejected by",
  cancellation_requested: "Requested by",
  cancellation_accepted: "Accepted by",
  cancellation_rejected: "Rejected by",
  dispatch_cancelled: "Cancelled by",
  dispatch_completed: "Completed by",
};

const DISPATCH_ACTIVITY_VISIBLE_STATUSES = [
  "approved",
  "declined",
  "cancelled",
  "completed",
];

const DISPATCH_ACTIVITY_MINIMUM_EVENT_TYPES = {
  approved: ["dispatch_submitted", "dispatch_approved"],
  declined: ["dispatch_submitted", "dispatch_declined"],
  cancelled: ["dispatch_submitted"],
  completed: ["dispatch_submitted", "dispatch_approved", "dispatch_completed"],
};

const DISPATCH_ACTIVITY_EVENT_SORT_ORDER = {
  dispatch_submitted: 10,
  dispatch_approved: 20,
  dispatch_declined: 20,
  date_change_requested: 30,
  date_change_accepted: 40,
  date_change_rejected: 40,
  cancellation_requested: 50,
  cancellation_accepted: 60,
  cancellation_rejected: 60,
  dispatch_cancelled: 70,
  dispatch_completed: 80,
};

const DISPATCH_ACTIVITY_MINIMUM_DESCRIPTIONS = {
  dispatch_submitted: "The dispatch request was submitted.",
  dispatch_approved: "The dispatch request was approved.",
  dispatch_declined: "The dispatch request was declined.",
  dispatch_cancelled: "The dispatch request was cancelled.",
  dispatch_completed: "The dispatch period has ended.",
};

function getDispatchApproverDisplayName() {
  if (
    typeof headerData !== "undefined" &&
    headerData &&
    headerData.president &&
    headerData.president.name
  ) {
    const prefix = String(headerData.president.prefix || "").trim();
    const name = String(headerData.president.name || "").trim();
    return prefix ? `${prefix} ${name}` : name;
  }

  return "KDT President";
}

function getDispatchActivity(dispatchRequest) {
  const requestId = String(dispatchRequest?.req_id ?? "").trim();

  if (!requestId) {
    return [];
  }

  return Array.isArray(dispatchRequest.activityLog)
    ? [...dispatchRequest.activityLog]
    : [];
}

function shouldShowDispatchActivity(normalizedStatus) {
  return DISPATCH_ACTIVITY_VISIBLE_STATUSES.includes(normalizedStatus);
}

function getMinimumDispatchActivityEventTypes(normalizedStatus) {
  return DISPATCH_ACTIVITY_MINIMUM_EVENT_TYPES[normalizedStatus] || [];
}

function normalizeActivityTimestampInput(value, fallbackTime) {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return `${raw}T${fallbackTime}`;
  }

  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
    const withT = raw.replace(" ", "T");
    return /([zZ]|[+-]\d{2}:?\d{2})$/.test(withT)
      ? withT
      : `${withT}+08:00`;
  }

  return raw;
}

function getDispatchSubmittedTimestamp(dispatchRequest) {
  return normalizeActivityTimestampInput(
    dispatchRequest?.req_date,
    "09:15:00+08:00",
  );
}

function getDispatchDecisionTimestamp(dispatchRequest) {
  const modified = normalizeActivityTimestampInput(
    dispatchRequest?.modified,
    "14:10:00+08:00",
  );

  if (modified) {
    return modified;
  }

  return normalizeActivityTimestampInput(
    dispatchRequest?.req_date,
    "14:10:00+08:00",
  );
}

function createMinimumDispatchActivityEvent(dispatchRequest, eventType) {
  const requestId = String(dispatchRequest?.req_id ?? "").trim() || "unknown";
  const requesterName = String(dispatchRequest?.requester_name || "").trim();
  const approverName = getDispatchApproverDisplayName();

  if (eventType === "dispatch_submitted") {
    return {
      activityId: `MIN-${requestId}-dispatch_submitted`,
      eventType: "dispatch_submitted",
      occurredAt: getDispatchSubmittedTimestamp(dispatchRequest),
      actorName: requesterName,
      description: DISPATCH_ACTIVITY_MINIMUM_DESCRIPTIONS.dispatch_submitted,
    };
  }

  const decisionTimestamp = getDispatchDecisionTimestamp(dispatchRequest);

  if (eventType === "dispatch_approved") {
    return {
      activityId: `MIN-${requestId}-dispatch_approved`,
      eventType: "dispatch_approved",
      occurredAt: decisionTimestamp,
      actorName: approverName,
      description: DISPATCH_ACTIVITY_MINIMUM_DESCRIPTIONS.dispatch_approved,
    };
  }

  if (eventType === "dispatch_declined") {
    return {
      activityId: `MIN-${requestId}-dispatch_declined`,
      eventType: "dispatch_declined",
      occurredAt: decisionTimestamp,
      actorName: approverName,
      description: DISPATCH_ACTIVITY_MINIMUM_DESCRIPTIONS.dispatch_declined,
    };
  }

  if (eventType === "dispatch_cancelled") {
    return {
      activityId: `MIN-${requestId}-dispatch_cancelled`,
      eventType: "dispatch_cancelled",
      occurredAt: decisionTimestamp,
      actorName: approverName,
      description: DISPATCH_ACTIVITY_MINIMUM_DESCRIPTIONS.dispatch_cancelled,
    };
  }

  if (eventType === "dispatch_completed") {
    const completedTimestamp =
      normalizeActivityTimestampInput(
        dispatchRequest?.to,
        "17:00:00+08:00",
      ) || decisionTimestamp;

    return {
      activityId: `MIN-${requestId}-dispatch_completed`,
      eventType: "dispatch_completed",
      occurredAt: completedTimestamp,
      actorName: "",
      description: DISPATCH_ACTIVITY_MINIMUM_DESCRIPTIONS.dispatch_completed,
    };
  }

  return null;
}

function ensureMinimumDispatchActivity(
  dispatchRequest,
  normalizedStatus,
  events,
) {
  const requiredTypes = [
    ...getMinimumDispatchActivityEventTypes(normalizedStatus),
  ];
  const presentTypes = new Set(
    (events || []).map((event) => event?.eventType).filter(Boolean),
  );

  if (normalizedStatus === "cancelled") {
    const hasDecisionEvent = [
      "dispatch_approved",
      "dispatch_declined",
      "dispatch_cancelled",
      "cancellation_accepted",
    ].some((eventType) => presentTypes.has(eventType));

    if (!hasDecisionEvent) {
      requiredTypes.push("dispatch_approved");
    }
  }

  const synthesized = [];

  requiredTypes.forEach((eventType) => {
    if (presentTypes.has(eventType)) {
      return;
    }

    const minimumEvent = createMinimumDispatchActivityEvent(
      dispatchRequest,
      eventType,
    );

    if (minimumEvent) {
      presentTypes.add(eventType);
      synthesized.push(minimumEvent);
    }
  });

  return [...(events || []), ...synthesized];
}

function resolveDispatchActivity(dispatchRequest) {
  const normalizedStatus = resolveDispatchDisplayStatus(dispatchRequest);

  if (!shouldShowDispatchActivity(normalizedStatus)) {
    return [];
  }

  const sourceEvents = getDispatchActivity(dispatchRequest);
  return ensureMinimumDispatchActivity(
    dispatchRequest,
    normalizedStatus,
    sourceEvents,
  );
}

function parseActivityTimestamp(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).trim().replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getActivityEventSortOrder(eventType) {
  return DISPATCH_ACTIVITY_EVENT_SORT_ORDER[eventType] || 100;
}

function sortDispatchActivity(events) {
  return [...events].sort((a, b) => {
    const dateA = parseActivityTimestamp(a?.occurredAt);
    const dateB = parseActivityTimestamp(b?.occurredAt);

    if (!dateA && !dateB) {
      return (
        getActivityEventSortOrder(a?.eventType) -
        getActivityEventSortOrder(b?.eventType)
      );
    }

    if (!dateA) {
      return 1;
    }

    if (!dateB) {
      return -1;
    }

    const timeDiff = dateA - dateB;
    if (timeDiff !== 0) {
      return timeDiff;
    }

    return (
      getActivityEventSortOrder(a?.eventType) -
      getActivityEventSortOrder(b?.eventType)
    );
  });
}

function formatActivityDateTime(occurredAt) {
  const date = parseActivityTimestamp(occurredAt);

  if (!date) {
    return occurredAt || "—";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = monthNames2[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }

  return `${day} ${month} ${year}, ${hours}:${minutes} ${meridiem}`;
}

function getActivityEventLabel(eventType) {
  return DISPATCH_ACTIVITY_EVENT_LABELS[eventType] || "Activity Event";
}

function getActivityActorText(event) {
  const actorName = String(event?.actorName || "").trim();

  if (!actorName) {
    return "";
  }

  const prefix =
    DISPATCH_ACTIVITY_ACTOR_PREFIXES[event.eventType] || "Updated by";
  return `${prefix} ${actorName}`;
}

function buildChangeRequestDeepLinkUrl(event) {
  const changeRequestId = event?.changeRequestId;
  const changeRequestType = String(event?.changeRequestType || "")
    .trim()
    .toLowerCase();

  if (
    changeRequestId === null ||
    changeRequestId === undefined ||
    String(changeRequestId).trim() === "" ||
    !changeRequestType
  ) {
    return null;
  }

  let typeParam = changeRequestType;

  if (
    changeRequestType === "datechange" ||
    changeRequestType === "date-change"
  ) {
    typeParam = "date_change";
  }

  if (typeParam !== "cancellation" && typeParam !== "date_change") {
    return null;
  }

  return `../changeRequests/?type=${encodeURIComponent(
    typeParam,
  )}&openChangeRequestId=${encodeURIComponent(String(changeRequestId).trim())}`;
}

function getActivityChangeRequestBadgeClass(changeRequestType) {
  const type = String(changeRequestType || "")
    .trim()
    .toLowerCase();

  if (type === "cancellation") {
    return "cancellation";
  }

  if (
    type === "date_change" ||
    type === "datechange" ||
    type === "date-change"
  ) {
    return "date-change";
  }

  return "";
}

function formatActivityChangeRequestDisplayId(event) {
  const reference = String(event?.changeRequestReference || "").trim();
  if (reference) {
    return reference;
  }

  const changeRequestId = String(event?.changeRequestId || "").trim();
  if (!changeRequestId) {
    return "";
  }

  const badgeClass = getActivityChangeRequestBadgeClass(
    event?.changeRequestType,
  );

  if (badgeClass === "cancellation") {
    return `CR-${changeRequestId.padStart(5, "0")}`;
  }

  if (badgeClass === "date-change") {
    return `DC-${changeRequestId.padStart(5, "0")}`;
  }

  return "";
}

function escapeActivityHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildActivityEventMarkup(event) {
  const eventType = event?.eventType || "";
  const title = escapeActivityHtml(getActivityEventLabel(eventType));
  const occurredAt = escapeActivityHtml(
    formatActivityDateTime(event?.occurredAt),
  );
  const actorText = getActivityActorText(event);
  const description = String(event?.description || "").trim();
  const displayId = formatActivityChangeRequestDisplayId(event);
  const badgeClass = getActivityChangeRequestBadgeClass(
    event?.changeRequestType,
  );
  const deepLinkUrl = buildChangeRequestDeepLinkUrl(event);

  let actorMarkup = "";
  if (actorText) {
    actorMarkup = `<p class="dispatch-activity-actor">${escapeActivityHtml(
      actorText,
    )}</p>`;
  }

  let descriptionMarkup = "";
  if (description) {
    descriptionMarkup = `<p class="dispatch-activity-description">${escapeActivityHtml(
      description,
    )}</p>`;
  }

  let referenceMarkup = "";
  if (displayId && badgeClass && deepLinkUrl) {
    referenceMarkup = `<p class="dispatch-activity-reference"><a href="${escapeActivityHtml(
      deepLinkUrl,
    )}" class="activity-id-badge ${badgeClass}" aria-label="Open ${escapeActivityHtml(
      displayId,
    )}">${escapeActivityHtml(displayId)}</a></p>`;
  }

  return `
    <div class="dispatch-activity-item">
      <div class="dispatch-activity-rail" aria-hidden="true">
        <span class="dispatch-activity-marker"></span>
        <span class="dispatch-activity-line"></span>
      </div>
      <div class="dispatch-activity-content">
        <p class="dispatch-activity-title">${title}</p>
        <p class="dispatch-activity-meta">${occurredAt}</p>
        ${actorMarkup}
        ${descriptionMarkup}
        ${referenceMarkup}
      </div>
    </div>
  `;
}

function setDispatchModalActivityLayout(hasActivity) {
  const modalDialog = document.querySelector("#openModal .modal-dialog");
  const bodyLayout = document.getElementById("dispatchModalBodyLayout");
  const activitySection = document.getElementById("dispatchActivityHistory");

  if (modalDialog) {
    modalDialog.classList.toggle(
      "dispatch-modal-dialog--with-activity",
      hasActivity,
    );
  }

  if (bodyLayout) {
    bodyLayout.classList.toggle("has-activity", hasActivity);
  }

  if (activitySection) {
    activitySection.classList.toggle("d-none", !hasActivity);
    activitySection.hidden = !hasActivity;
  }
}

function clearDispatchActivityTimeline() {
  const $timeline = $("#dispatchActivityTimeline");

  if ($timeline.length) {
    $timeline.empty();
  }

  setDispatchModalActivityLayout(false);
}

function getValidDispatchActivityEvents(dispatchRequest) {
  const activityEvents = sortDispatchActivity(
    resolveDispatchActivity(dispatchRequest),
  );

  return activityEvents.filter((event) =>
    parseActivityTimestamp(event?.occurredAt),
  );
}

function renderDispatchActivityHistory(dispatchRequest) {
  const $timeline = $("#dispatchActivityTimeline");

  if (!$timeline.length) {
    setDispatchModalActivityLayout(false);
    return;
  }

  const activityEvents = getValidDispatchActivityEvents(dispatchRequest);

  if (!activityEvents.length) {
    clearDispatchActivityTimeline();
    return;
  }

  setDispatchModalActivityLayout(true);
  $timeline.html(activityEvents.map(buildActivityEventMarkup).join(""));
}
//#endregion
