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
    "api/get_requests.php",
    {},
    "Failed to load request list.",
  );
}

function getCount() {
  return getJson(
    "api/get_count_requests.php",
    {},
    "Failed to load request counts.",
  );
}

function getRequestData(req_id) {
  return getJson(
    "api/get_request_data.php",
    {
      request_id: req_id,
    },
    "Failed to load request data.",
  );
}

function getPresID() {
  return getJson(
    "api/get_pres_id.php",
    {},
    "Failed to load president IDs.",
  );
}

function getGroups() {
  return getJson(
    "api/get_groups.php",
    {},
    "Failed to load groups.",
  );
}

function checkAccess() {
  return getJson(
    "../api/session.php",
    {},
    "Failed to verify user session.",
  );
}

function updateStatus(status) {
  return putJson(
    "api/update_status.php",
    {
      request_status: status,
      request_id: printData["dispatch_request"]["request_id"],
    },
    "Failed to update request status.",
  );
}

function getHeader() {
  return getJson(
    "api/get_header.php",
    {},
    "Failed to load header data.",
  );
}
//#endregion
