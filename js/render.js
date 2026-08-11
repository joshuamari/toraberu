//#region RENDER
function destroyChart(instance) {
  if (instance) {
    instance.destroy();
  }
  return null;
}

function dispatchGraph(dData) {
  const months = dData.map((data) => data.month);
  const rates = dData.map((data) => Number(data.rate) || 0);
  const canvas = document.getElementById("dispatchChart");

  if (!canvas) {
    return;
  }

  dispatchChartInstance = destroyChart(dispatchChartInstance);

  dispatchChartInstance = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Members on dispatch",
          data: rates,
          borderColor: "#212121",
          backgroundColor: "#212121",
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 4,
          pointBackgroundColor: "#212121",
          tension: 0.25,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#8d8d8d",
            font: { size: 11 },
          },
          grid: {
            color: "#efefef",
            drawBorder: false,
          },
        },
        x: {
          ticks: {
            color: "#8d8d8d",
            font: { size: 11 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const value = tooltipItem.raw;
              return (
                value +
                " " +
                (value === 1 ? "dispatch member" : "dispatch members")
              );
            },
          },
        },
      },
    },
  });

  $("#dispatchTrendInsight").text(computeTrendInsight(dData));
}

function refreshDispatchTrendChart() {
  const year = dashboardTrendYear || getcurrentYear();
  $("#trendYearValue").text(String(year));

  return getGraph(year)
    .then((data) => {
      dashboardTrendData = Array.isArray(data) ? data : [];
      dispatchGraph(dashboardTrendData);
    })
    .catch((error) => {
      console.error(error);
      dashboardTrendData = [];
      dispatchGraph([]);
    });
}

function renderGroupDispatchChart(dataset) {
  const $card = $("#groupChartCard");
  const canvas = document.getElementById("groupDispatchChart");

  if (!reqAccess || !canvas) {
    $card.addClass("d-none");
    return;
  }

  $card.removeClass("d-none");
  groupChartInstance = destroyChart(groupChartInstance);

  if (!dataset.length) {
    $("#groupDispatchInsight").text("No group data available for this year.");
    return;
  }

  const labels = dataset.map((item) => item.groupAbbreviation);
  const values = dataset.map((item) => item.dispatchCount);
  const colors = dataset.map(
    (_, index) => GROUP_CHART_COLORS[index % GROUP_CHART_COLORS.length],
  );

  groupChartInstance = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Dispatches",
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 4,
          maxBarThickness: 28,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#8d8d8d",
            font: { size: 11 },
          },
          grid: {
            color: "#efefef",
            drawBorder: false,
          },
        },
        x: {
          ticks: {
            color: "#8d8d8d",
            font: { size: 11 },
            maxRotation: 45,
            minRotation: 0,
            autoSkip: false,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: function (items) {
              const index = items[0].dataIndex;
              return dataset[index]?.groupName || items[0].label;
            },
            label: function (tooltipItem) {
              const group = dataset[tooltipItem.dataIndex];
              if (!group) {
                return `Dispatches: ${tooltipItem.raw}`;
              }

              const lines = [`Dispatches: ${group.dispatchCount}`];

              if (group.memberCount != null) {
                lines.push(`Members: ${group.memberCount}`);
              }

              if (group.dispatchRate != null) {
                lines.push(
                  `Dispatch Rate: ${Math.round(group.dispatchRate * 100)}%`,
                );
              }

              return lines;
            },
          },
        },
      },
    },
  });

  $("#groupDispatchInsight").text(computeGroupInsight(dataset));
}

function refreshGroupDispatchChart() {
  const year = dashboardGroupDispatchYear || getcurrentYear();
  const dataset = buildGroupDispatchDataset(
    dashboardRequestList,
    dashboardGroupList,
    year,
  );
  renderGroupDispatchChart(dataset);
}

function renderStatusDonut(counts) {
  const $card = $("#statusChartCard");
  const canvas = document.getElementById("statusDonutChart");

  if (!reqAccess || !canvas) {
    $card.addClass("d-none");
    return;
  }

  $card.removeClass("d-none");
  statusChartInstance = destroyChart(statusChartInstance);

  const segments = [
    { key: "pending", label: "Pending", value: counts.pending },
    { key: "approved", label: "Approved", value: counts.approved },
    { key: "completed", label: "Completed", value: counts.completed },
    { key: "declined", label: "Declined", value: counts.declined },
    { key: "cancelled", label: "Cancelled", value: counts.cancelled },
  ].filter((item) => item.value > 0);

  $("#statusDonutTotal").text(String(counts.total || 0));

  const $legend = $("#statusDonutLegend");
  $legend.empty();

  if (!segments.length) {
    $("#statusDonutInsight").text("No dispatch request status data available.");
    return;
  }

  segments.forEach((segment) => {
    $legend.append(`
      <span class="dashboard-donut-legend-item">
        <span class="dashboard-donut-legend-swatch" style="background:${STATUS_CHART_COLORS[segment.key]}"></span>
        ${segment.label} (${segment.value})
      </span>
    `);
  });

  statusChartInstance = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: segments.map((item) => item.label),
      datasets: [
        {
          data: segments.map((item) => item.value),
          backgroundColor: segments.map(
            (item) => STATUS_CHART_COLORS[item.key],
          ),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      cutout: "68%",
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const value = tooltipItem.raw;
              const total = counts.total || 1;
              const pct = Math.round((value / total) * 100);
              return `${tooltipItem.label}: ${value} (${pct}%)`;
            },
          },
        },
      },
    },
  });

  $("#statusDonutInsight").text(computeStatusInsight(counts));
}

function renderDashboard(year, options) {
  const opts = options || {};
  fillSummaryCards(year, opts);
  fillDocumentAlerts();

  const $chartsGrid = $(".dashboard-charts-grid");
  const $activityCard = $(".dashboard-activity-card");

  // Activity must always remain visible below the analytics grid.
  $activityCard.removeClass("d-none");

  const availableYears = getAvailableGroupDispatchYears(dashboardRequestList);

  dashboardTrendYear = resolveDashboardSelectedYear(
    dashboardTrendYear,
    availableYears,
  );
  fillDispatchTrendYearSelector(availableYears, dashboardTrendYear);
  $("#trendYearValue").text(String(dashboardTrendYear));

  // Initial payload is the current year; only refetch when the selection differs.
  if (
    dashboardTrendYear === getcurrentYear() &&
    Array.isArray(dashboardTrendData) &&
    dashboardTrendData.length
  ) {
    dispatchGraph(dashboardTrendData);
  } else {
    refreshDispatchTrendChart();
  }

  if (reqAccess) {
    $("#groupChartCard").removeClass("d-none");
    $chartsGrid.removeClass("dashboard-charts-grid--single");

    dashboardGroupDispatchYear = resolveDashboardSelectedYear(
      dashboardGroupDispatchYear,
      availableYears,
    );
    fillGroupDispatchYearSelector(
      availableYears,
      dashboardGroupDispatchYear,
    );
    refreshGroupDispatchChart();
  } else {
    $("#groupChartCard").addClass("d-none");
    $chartsGrid.addClass("dashboard-charts-grid--single");
  }

  dashboardActivityItems = buildActivityFeed(
    reqAccess ? dashboardRequestList : [],
    opts.hasChangeData ? dashboardCancellations : [],
    opts.hasChangeData ? dashboardDateChanges : [],
  );

  activityPaginationState = {
    currentPage: 1,
    itemsPerPage: ACTIVITY_PAGE_SIZE,
    totalItems: dashboardActivityItems.length,
  };

  latestDispatchPaginationState = {
    currentPage: 1,
    itemsPerPage: LATEST_DISPATCH_PAGE_SIZE,
    totalItems: dashboardDispatchList.length,
  };

  fillLatestDispatchTablePage();
  fillActivityTablePage();
}
//#endregion
