//#region API
function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "../api/session.php",
      dataType: "json",
      success: function (data) {
        resolve(data);
      },
      error: function (xhr) {
        const message =
          xhr.status === 404
            ? "Not Found Error: The requested resource was not found."
            : xhr.status === 500
            ? "Internal Server Error: There was a server error."
            : "An unspecified error occurred.1";
        reject(message);
      },
    });
  });
}

function getGroups() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "../api/groups.php",
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        reject(handleAjaxError(xhr));
      },
    });
  });
}

function getEmployees() {
  const grpID = $("#grpSel").val();
  const keyword = $("#empSearch").val();

  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "api/get_employee_list.php",
      data: {
        groupID: grpID,
        searchkey: keyword,
      },
      dataType: "json",
      success: function (response) {
        resolve(response);
      },
      error: function (xhr) {
        reject(handleAjaxError(xhr));
      },
    });
  });
}
//#endregion