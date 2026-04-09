//#region GENERIC REQUEST HELPERS
function getJson(url, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: url,
      dataType: "json",
      success: function (response) {
        resolve(response);
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
        resolve(response);
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
  const yearNow = new Date().getFullYear();
  return yearNow;
}

function getDispatchlist() {
  return postJson(
    "php/get_dispatch_list.php",
    {
      empnum: empDetails["id"],
    },
    "An unspecified error occurred.1",
  );
}

function getExpiringPassport() {
  return postJson(
    "php/get_expiring_passport.php",
    {
      empnum: empDetails["id"],
    },
    "An unspecified error occurred.2",
  );
}

function getExpiringVisa() {
  return postJson(
    "php/get_expiring_visa.php",
    {
      empnum: empDetails["id"],
    },
    "An unspecified error occurred.3",
  );
}

function checkAccess() {
  return getJson("global/check_login.php", "An unspecified error occurred.4");
}

function getGraph() {
  return getJson(
    "php/get_summary.php",
    "An unspecified error occurred while fetching graph data.",
  );
}
//#endregion
