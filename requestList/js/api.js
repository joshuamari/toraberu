//#region GENERIC REQUEST HELPERS
function getJson(url, data, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: url,
      data: data || {},
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
      data: data || {},
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

function putJson(url, data, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "PUT",
      url: url,
      data: JSON.stringify(data || {}),
      contentType: "application/json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr, status, error) {
        console.log("XHR RESPONSE:", xhr.responseText);
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject(
            `An unspecified error occurred while updating status: ${error}`,
          );
        }
      },
    });
  });
}
//#endregion

//#region API
function getRequests() {
  return getJson(
    "php/get_requests.php",
    {},
    "An unspecified error occurred while fetching requests.",
  );
}

function getCount() {
  return getJson(
    "php/get_count_requests.php",
    {},
    "An unspecified error occurred while fetching counts.",
  );
}

function getRequestData(req_id) {
  return getJson(
    "php/get_request_data.php",
    {
      request_id: req_id,
    },
    "An unspecified error occurred while fetching request data.",
  );
}

function getPresID() {
  return getJson(
    "php/get_pres_id.php",
    {},
    "An unspecified error occurred while fetching pres id.",
  );
}

function getGroups() {
  return getJson("php/get_groups.php", {}, "An unspecified error occurred.");
}

function checkAccess() {
  return getJson(
    "../global/check_login.php",
    {},
    "An unspecified error occurred.1",
  );
}

function updateStatus(status) {
  return putJson(
    "php/update_status.php",
    {
      request_status: status,
      request_id: printData["dispatch_request"]["request_id"],
    },
    "An unspecified error occurred while updating status.",
  );
}
//#endregion
