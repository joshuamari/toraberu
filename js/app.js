//#region APP
function initApp() {
  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      empDetails = emp;
      editAccess = !!(emp.permissions && emp.permissions.hasEdit);
      reqAccess = !!(emp.permissions && emp.permissions.hasRequestListAccess);

      fillEmployeeDetails();

      const coreLoads = [
        softLoad(getDispatchlist()),
        softLoad(getExpiringPassport()),
        softLoad(getExpiringVisa()),
        softLoad(getGraph()),
      ];

      const requestLoads = reqAccess
        ? [
            softLoad(getRequestListData()),
            softLoad(getRequestListGroups()),
            softLoad(getChangeRequestData()),
          ]
        : [
            Promise.resolve({ ok: false, data: null }),
            Promise.resolve({ ok: false, data: null }),
            Promise.resolve({ ok: false, data: null }),
          ];

      return Promise.all([...coreLoads, ...requestLoads]).then(
        ([dListRes, epRes, evRes, trendRes, reqRes, groupsRes, changeRes]) => {
          if (!dListRes.ok) {
            throw dListRes.error || "Failed to load dispatch list.";
          }
          if (!epRes.ok) {
            throw epRes.error || "Failed to load expiring passport list.";
          }
          if (!evRes.ok) {
            throw evRes.error || "Failed to load expiring visa list.";
          }
          if (!trendRes.ok) {
            throw trendRes.error || "Failed to load dashboard summary.";
          }

          dashboardDispatchList = dListRes.data || [];
          dashboardPassportAlerts = epRes.data || [];
          dashboardVisaAlerts = evRes.data || [];
          dashboardTrendData = trendRes.data || [];

          const hasRequestData = reqAccess && reqRes.ok;
          const hasGroupData = reqAccess && groupsRes.ok;
          const hasChangeData = reqAccess && changeRes.ok;

          dashboardRequestList = hasRequestData
            ? syncRequestListStatusFields(reqRes.data || [])
            : [];
          dashboardGroupList = hasGroupData ? groupsRes.data || [] : [];

          if (hasChangeData) {
            const changeData = changeRes.data || {};
            dashboardCancellations = Array.isArray(changeData.cancellation)
              ? changeData.cancellation
              : [];
            dashboardDateChanges = Array.isArray(changeData.date_change)
              ? changeData.date_change
              : [];
          } else {
            dashboardCancellations = [];
            dashboardDateChanges = [];
          }

          // Charts/status still need request-list payload; activity can also
          // render change-request rows when that payload loaded successfully.
          reqAccess = hasRequestData;

          if (
            emp.permissions &&
            emp.permissions.hasRequestListAccess &&
            (!hasRequestData || !hasChangeData || !hasGroupData)
          ) {
            console.warn(
              "Some request-list dashboard sections could not be loaded.",
              {
                requests: hasRequestData,
                groups: hasGroupData,
                changes: hasChangeData,
              },
            );
          }

          renderDashboard(getcurrentYear(), {
            hasChangeData,
            hasRequestData,
          });
        },
      );
    })
    .catch((error) => {
      console.error(error);
      window.location.href = `${rootFolder}`;
    });
}
//#endregion
