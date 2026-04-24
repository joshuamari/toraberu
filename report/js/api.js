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
function checkAccess() {
  return getJson("../api/session.php", "Failed to verify user session.");
}

function getGroups() {
  return new Promise((resolve, reject) => {
    getJson("../api/groups.php", "Failed to load groups.")
      .then((res) => {
        if (!res.success) {
          reject(res.message);
          return;
        }
        resolve(res.data);
      })
      .catch(reject);
  });
}

function getYear() {
  return new Promise((resolve, reject) => {
    getJson("api/get_year.php", "Failed to load years.")
      .then((res) => {
        if (!res.success) {
          reject(res.message);
          return;
        }
        resolve(res.data);
      })
      .catch(reject);
  });
}

function getReport() {
  const grpID = $("#grpSel").val();
  const yr = $("#yearSel").val();

  return new Promise((resolve, reject) => {
    postJson(
      "api/get_report.php",
      {
        groupID: grpID,
        yearSelected: yr,
      },
      "Failed to load report.",
    )
      .then((res) => {
        if (!res.success) {
          reject(res.message);
          return;
        }
        resolve(res.data);
      })
      .catch(reject);
  });
}
//#endregion