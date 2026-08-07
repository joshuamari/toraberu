//#region GENERIC REQUEST HELPERS
function getJson(url, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: url,
      dataType: "json",
      success: function (response) {
        if (!response.success) {
          reject(response.message || fallbackMessage);
          return;
        }
        resolve(response.data);
      },
      error: function (xhr) {
        reject(ajaxJsonErrorMessage(xhr, fallbackMessage));
      },
    });
  });
}

function getLegacyJson(url, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: url,
      dataType: "json",
      success: function (response) {
        if (response && response.isSuccess === false) {
          reject(response.message || fallbackMessage);
          return;
        }
        resolve(response);
      },
      error: function (xhr) {
        reject(ajaxJsonErrorMessage(xhr, fallbackMessage));
      },
    });
  });
}

function softLoad(promise) {
  return promise.then(
    (data) => ({ ok: true, data }),
    (error) => ({ ok: false, error }),
  );
}
//#endregion

//#region API
function getcurrentYear() {
  return new Date().getFullYear();
}

function getDispatchlist() {
  return getJson(
    "api/get_dispatch_list.php",
    "Failed to load dispatch list.",
  );
}

function getExpiringPassport() {
  return getJson(
    "api/get_expiring_passport.php",
    "Failed to load expiring passport list.",
  );
}

function getExpiringVisa() {
  return getJson(
    "api/get_expiring_visa.php",
    "Failed to load expiring visa list.",
  );
}

function checkAccess() {
  return getJson(
    "api/session.php",
    "Failed to verify user session.",
  );
}

function getGraph(year) {
  const selectedYear =
    year == null || year === "" ? getcurrentYear() : Number(year);
  const query = Number.isFinite(selectedYear)
    ? `?year=${encodeURIComponent(selectedYear)}`
    : "";

  return getJson(
    `api/get_summary.php${query}`,
    "Failed to load dashboard summary.",
  );
}

function getRequestListData() {
  return getJson(
    "requestList/api/get_requests.php",
    "Failed to load request list.",
  );
}

function getRequestListGroups() {
  return getJson(
    "requestList/api/get_groups.php",
    "Failed to load groups.",
  );
}

function getChangeRequestData() {
  return getLegacyJson(
    "changeRequests/php/get_requests.php",
    "Failed to load change requests.",
  ).then((response) => response.data || { cancellation: [], date_change: [] });
}
//#endregion
