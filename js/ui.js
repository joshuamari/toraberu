//#region UI
function fillEmployeeDetails() {
  const fName = capitalizeWord(empDetails.empname.firstname);
  const sName = capitalizeWord(empDetails.empname.surname);
  const initials = getInitials(fName, sName);
  const grpName = empDetails.group;

  $("#empLabel").text(`${fName} ${sName}`);
  $("#empInitials").text(initials);
  $("#grpLabel").text(grpName);
}

function fillSummaryCards(year, options) {
  const hasChangeData = !!(options && options.hasChangeData);

  $("#cardActiveDispatches").text(String(dashboardDispatchList.length));

  if (reqAccess) {
    const statusCounts = getDispatchStatusCounts(dashboardRequestList);
    $("#cardPendingDispatch").text(String(statusCounts.pending));
    $("#cardCompletedYear").text(
      String(countCompletedThisYear(dashboardRequestList, year)),
    );
  } else {
    $("#cardPendingDispatch").text("—");
    $("#cardCompletedYear").text("—");
  }

  if (hasChangeData) {
    $("#cardPendingChange").text(
      String(
        countPendingChangeRequests(
          dashboardCancellations,
          dashboardDateChanges,
        ),
      ),
    );
  } else {
    $("#cardPendingChange").text("—");
  }

  $(".crrntYear").text(`(${year})`);
  $("#completedYearValue").text(String(year));
}

function fillDocumentAlerts() {
  const $list = $("#documentAlertsList");
  $list.empty();

  const alerts = buildDocumentAlerts(
    dashboardPassportAlerts,
    dashboardVisaAlerts,
    dashboardDispatchList,
  );

  if (!alerts.length) {
    $list.html(
      `<p class="dashboard-alerts-empty">No document alerts found.</p>`,
    );
    return;
  }

  alerts.forEach((alert) => {
    const typeMeta = getDocumentAlertTypeMeta(alert.documentType);
    const empId = resolveDocumentAlertEmployeeId(alert);
    const isNavigable = empId !== null && empId !== undefined && empId !== "";

    const $row = $(`
      <div class="dashboard-alert-row${isNavigable ? "" : " is-static"}" ${
        isNavigable ? 'role="button" tabindex="0"' : ""
      }>
        <span class="alert-icon" aria-hidden="true">
          <i></i>
        </span>
        <div class="alert-body">
          <div class="alert-top">
            <p class="alert-name"></p>
            <span class="dashboard-alert-severity"></span>
          </div>
          <div class="alert-issue-row">
            <span class="alert-doc-type"></span>
            <p class="alert-issue"></p>
          </div>
          <p class="alert-meta"></p>
        </div>
      </div>
    `);

    $row
      .find(".alert-icon i")
      .attr("class", typeMeta.iconClass)
      .attr("aria-label", typeMeta.label);
    $row.attr("data-document-type", alert.documentType || "");
    $row.find(".alert-name").text(alert.name || "—");
    $row.find(".alert-doc-type").text(typeMeta.label);
    $row.find(".alert-issue").text(alert.issue);
    $row.find(".alert-meta").text(alert.meta);
    $row
      .find(".dashboard-alert-severity")
      .addClass(alert.severity)
      .text(alert.severity);

    if (isNavigable) {
      $row.attr("data-emp-id", empId);
    }

    $list.append($row);
  });
}

function fillActivityTablePage() {
  const $body = $("#activityTableBody");
  $body.empty();

  const pagination = renderPaginationBar(
    $("#activityPagination"),
    activityPaginationState,
    "activities",
  );

  activityPaginationState.currentPage = pagination.currentPage;

  const pageItems = dashboardActivityItems.slice(
    pagination.startIndex,
    pagination.endIndex,
  );

  if (!pageItems.length) {
    $body.append(`
      <tr>
        <td colspan="5">
          <div class="py-4 text-center text-[var(--gray-text)]">
            No recent activity found.
          </div>
        </td>
      </tr>
    `);
    return;
  }

  pageItems.forEach((item) => {
    const typeClass =
      item.type === "cancellation"
        ? "cancellation"
        : item.type === "date_change"
          ? "date-change"
          : "dispatch";

    const $row = $(`
      <tr data-activity-type="${item.type}" data-activity-id="${item.id}">
        <td>
          <span class="activity-id-badge ${typeClass}"></span>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    `);

    $row.find(".activity-id-badge").text(item.displayId);
    $row.children().eq(1).text(item.empName || "—");
    $row.children().eq(2).text(formatDate(item.reqDate));
    $row
      .children()
      .eq(3)
      .text(formatDispatchDateRange(item.from, item.to));
    $row.children().eq(4).html(item.statusHtml);

    $body.append($row);
  });
}

function setActivityPage(page) {
  activityPaginationState.currentPage = page;
  fillActivityTablePage();
}

function fillLatestDispatchTablePage() {
  const $body = $("#latestDispatchTableBody");
  $body.empty();

  const pagination = renderPaginationBar(
    $("#latestDispatchPagination"),
    latestDispatchPaginationState,
    "dispatches",
  );

  latestDispatchPaginationState.currentPage = pagination.currentPage;

  const pageItems = dashboardDispatchList.slice(
    pagination.startIndex,
    pagination.endIndex,
  );

  if (!pageItems.length) {
    $body.append(`
      <tr>
        <td colspan="5">
          <div class="py-4 text-center text-[var(--gray-text)]">
            No approved dispatches found.
          </div>
        </td>
      </tr>
    `);
    return;
  }

  pageItems.forEach((item) => {
    const requestId = item.requestId;
    const displayId =
      requestId != null && requestId !== ""
        ? formatDispatchRequestId(requestId)
        : "—";
    const hasRequestId = requestId != null && requestId !== "";

    const $row = $(`
      <tr ${hasRequestId ? `data-request-id="${requestId}"` : 'class="is-static"'}>
        <td>
          <span class="activity-id-badge dispatch"></span>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    `);

    $row.find(".activity-id-badge").text(displayId);
    $row.children().eq(1).text(item.name || "—");
    $row.children().eq(2).text(item.location || "—");
    $row
      .children()
      .eq(3)
      .text(formatDispatchDateRange(item.from, item.to));
    $row.children().eq(4).html(getDocumentReadinessHtml(item));

    if (!hasRequestId) {
      $row.find("td").css("cursor", "default");
    }

    $body.append($row);
  });
}

function setLatestDispatchPage(page) {
  latestDispatchPaginationState.currentPage = page;
  fillLatestDispatchTablePage();
}

function fillDashboardYearSelector(selector, years, selectedYear) {
  const $sel = $(selector);
  if (!$sel.length) {
    return;
  }

  const options = (years || []).map(
    (year) =>
      `<option value="${year}"${Number(year) === Number(selectedYear) ? " selected" : ""}>${year}</option>`,
  );

  $sel.html(options.join(""));
}

function fillGroupDispatchYearSelector(years, selectedYear) {
  fillDashboardYearSelector("#groupDispatchYearSel", years, selectedYear);
}

function fillDispatchTrendYearSelector(years, selectedYear) {
  fillDashboardYearSelector("#dispatchTrendYearSel", years, selectedYear);
}

function resolveDashboardSelectedYear(selectedYear, availableYears) {
  const currentYear = getcurrentYear();
  let year = selectedYear == null ? currentYear : Number(selectedYear);

  if (!Number.isFinite(year)) {
    year = currentYear;
  }

  if (!(availableYears || []).includes(year)) {
    year = (availableYears && availableYears[0]) || currentYear;
  }

  return year;
}
//#endregion
