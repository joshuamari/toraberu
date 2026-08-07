//#region EVENTS
function bindEvents() {
  $(document).on("click", ".dashboard-alert-row", function () {
    const empID = $(this).data("emp-id");
    if (empID === undefined || empID === null || empID === "") {
      return;
    }

    window.location.href = getEmployeeDetailsHref(empID);
  });

  $(document).on("keydown", ".dashboard-alert-row", function (event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const empID = $(this).data("emp-id");
    if (empID === undefined || empID === null || empID === "") {
      return;
    }

    event.preventDefault();
    window.location.href = getEmployeeDetailsHref(empID);
  });

  $(document).on("click", "#activityTableBody tr[data-activity-id]", function () {
    const type = $(this).data("activity-type");
    const id = $(this).data("activity-id");
    const item = dashboardActivityItems.find(
      (entry) =>
        String(entry.id) === String(id) && String(entry.type) === String(type),
    );

    if (!item) {
      return;
    }

    window.location.href = getActivityHref(item);
  });

  $(document).on("click", "#activityPagination [data-role='prev']", function () {
    if ($(this).prop("disabled")) {
      return;
    }
    setActivityPage(activityPaginationState.currentPage - 1);
  });

  $(document).on("click", "#activityPagination [data-role='next']", function () {
    if ($(this).prop("disabled")) {
      return;
    }
    setActivityPage(activityPaginationState.currentPage + 1);
  });

  $(document).on(
    "click",
    "#activityPagination [data-page]",
    function () {
      const page = Number($(this).attr("data-page"));
      if (!Number.isFinite(page)) {
        return;
      }
      setActivityPage(page);
    },
  );

  $(document).on("click", "#portalBtn", function () {
    window.location.href = `${rootFolder}`;
  });

  $(document).on("change", "#groupDispatchYearSel", function () {
    const year = Number($(this).val());
    if (!Number.isFinite(year)) {
      return;
    }
    dashboardGroupDispatchYear = year;
    refreshGroupDispatchChart();
  });

  $(document).on("change", "#dispatchTrendYearSel", function () {
    const year = Number($(this).val());
    if (!Number.isFinite(year)) {
      return;
    }
    dashboardTrendYear = year;
    refreshDispatchTrendChart();
  });
}
//#endregion
