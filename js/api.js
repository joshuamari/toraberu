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

function postJson(url, data, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: url,
      data: data,
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

function getGraph() {
  return getJson(
    "api/get_summary.php",
    "Failed to load dashboard summary.",
  );
}
//#endregion