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
//#endregion

//#region API
function getGroups() {
  return getJson("../global/get_groups.php", "An unspecified error occurred.7");
}

function getEmployees() {
  const grpID = $("#grpSel").val();
  dispatch_days = 0;
  return postJson(
    "php/get_employees.php",
    { grpID: grpID },
    "An unspecified error occurred.6",
  );
}

function countDays(strt, end) {
  return postJson(
    "php/check_add_duration.php",
    {
      dateFrom: strt,
      dateTo: end,
    },
    "An unspecified error occurred.5",
  );
}

function getPassport() {
  const empID = $("#empSel").find("option:selected").attr("emp-id");
  const sDate = $("#startDate").val();
  const eDate = $("#endDate").val();

  return new Promise((resolve, reject) => {
    if (empID === undefined) {
      resolve([]);
      return;
    }

    $.ajax({
      type: "POST",
      url: "php/get_passport.php",
      data: {
        empID: empID,
        sDate: sDate,
        eDate: eDate,
      },
      dataType: "json",
      success: function (response) {
        const pport = response;
        resolve(pport);
      },
      error: function (xhr) {
        reject(ajaxJsonErrorMessage(xhr, "An unspecified error occurred.4"));
      },
    });
  });
}

function getVisa() {
  const empID = $("#empSel").find("option:selected").attr("emp-id");
  const sDate = $("#startDate").val();
  const eDate = $("#endDate").val();

  return new Promise((resolve, reject) => {
    if (empID === undefined) {
      resolve([]);
      return;
    }

    $.ajax({
      type: "POST",
      url: "php/get_visa.php",
      data: {
        empID: empID,
        sDate: sDate,
        eDate: eDate,
      },
      dataType: "json",
      success: function (response) {
        const visa = response;
        resolve(visa);
      },
      error: function (xhr) {
        reject(ajaxJsonErrorMessage(xhr, "An unspecified error occurred.3"));
      },
    });
  });
}

function getDispatchHistory() {
  const empID = $("#empSel").find("option:selected").attr("emp-id");
  const yScope = $("#dToggle").val();

  return new Promise((resolve, reject) => {
    if (empID === undefined) {
      resolve([]);
      return;
    }

    $.ajax({
      type: "POST",
      url: "php/get_dispatch_history.php",
      data: {
        empID: empID,
        yScope: yScope,
      },
      dataType: "json",
      success: function (response) {
        const dList = response;
        resolve(dList);
      },
      error: function (xhr) {
        reject(ajaxJsonErrorMessage(xhr, "An unspecified error occurred.haha"));
      },
    });
  });
}

function getDispatchDays() {
  const empID = $("#empSel").find("option:selected").attr("emp-id");

  return new Promise((resolve, reject) => {
    if (empID === undefined) {
      resolve(0);
      return;
    }

    $.ajax({
      type: "POST",
      url: "php/check_duration.php",
      data: {
        empID: empID,
      },
      success: function (response) {
        const dDays = response;
        resolve(dDays);
      },
      error: function (xhr) {
        reject(ajaxJsonErrorMessage(xhr, "An unspecified error occurreds."));
      },
    });
  });
}

function getLocations() {
  return getJson("php/get_location.php", "An unspecified error occurred.2");
}

function checkAccess() {
  return getJson("../global/check_login.php", "An unspecified error occurred.");
}

function checkEditAccess() {
  return getJson(
    "php/check_edit_permission.php",
    "An unspecified error occurred.1",
  );
}

function getYearly() {
  const empID = $("#empSel").find("option:selected").attr("emp-id");

  return new Promise((resolve, reject) => {
    if (empID === undefined) {
      resolve([]);
      return;
    }

    $.ajax({
      type: "POST",
      url: "php/get_yearly.php",
      data: {
        empID: empID,
      },
      dataType: "json",
      success: function (response) {
        const yrly = response;
        resolve(yrly);
      },
      error: function (xhr) {
        reject(ajaxJsonErrorMessage(xhr, "An unspecified error occurred.3"));
      },
    });
  });
}
//#endregion

//#region DIRECT ACTION API
function insertDispatch() {
  const grp = $("#grpSel").find("option:selected").attr("grp-id");
  const empID = $("#empSel").find("option:selected").attr("emp-id");
  const locID = $("#locSel").find("option:selected").attr("loc-id");
  const startD = $("#startDate").val();
  const endD = $("#endDate").val();
  let ctr = 0;

  toggleLoadingAnimation(true);

  if (!grp) {
    $("#grpSel").addClass("bg-red-100  border-red-400");
    ctr++;
  }
  if (!empID) {
    $("#empSel").addClass("bg-red-100  border-red-400");
    ctr++;
  }
  if (!locID) {
    $("#locSel").addClass("bg-red-100  border-red-400");
    ctr++;
  }
  if (!startD) {
    $("#startDate").addClass("bg-red-100  border-red-400");
    ctr++;
  }
  if (!endD) {
    $("#endDate").addClass("bg-red-100  border-red-400");
    ctr++;
  }

  if (ctr > 0) {
    $(".form").append(`
    <div class="errTxt mb-3 flex items-center gap-1">
    <i class='bx bx-info-circle text-red-600'></i>
    <p class="text-red-600">Please complete all fields.</p>
    </div>`);
    toggleLoadingAnimation(false);
    return;
  }

  const startDate = new Date(startD);
  const endDate = new Date(endD);

  if (endDate < startDate) {
    alert("End date must not be earlier than start date.");
    $("#endDate").val("");
    to_add = 0;
    countTotal();
    $("#daysCount").text("");
    toggleLoadingAnimation(false);
    return;
  }

  $.ajax({
    type: "POST",
    url: "php/insert_dispatch.php",
    data: {
      empID: empID,
      locID: locID,
      dateFrom: startD,
      dateTo: endD,
    },
    dataType: "json",
    success: function (response) {
      const isSuccess = response.isSuccess;
      if (!isSuccess) {
        toggleLoadingAnimation(false);
        showToast("error", `${response.error}`);
      } else {
        Promise.all([getDispatchHistory(), getDispatchDays(), getYearly()])
          .then(([dlst, dd, yrl]) => {
            dHistory = dlst;
            fillHistory(dHistory);
            dispatch_days = dd;
            fillYearly(yrl);
            $("#startDate").val("");
            $("#endDate").val("");
            $("#daysCount").text("");
            to_add = 0;
            countTotal();
            showToast("success", "Successfully added a dispatch entry.");
            toggleLoadingAnimation(false);
          })
          .catch((error) => {
            toggleLoadingAnimation(false);
            alert(`${error}`);
          });
      }
    },
    error: function (xhr) {
      if (xhr.status === 404) {
        alert("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        alert("Internal Server Error: There was a server error.");
      } else {
        alert("An unspecified error occurredxdxd.");
      }
    },
  });
}

function deleteDispatch() {
  const delID = $("#storeId").attr("del-id");
  $.ajax({
    type: "POST",
    url: "php/delete_dispatch_history.php",
    data: {
      dispatchID: delID,
    },
    success: function () {
      Promise.all([getDispatchHistory(), getDispatchDays(), getYearly()])
        .then(([dlst, dd, yrl]) => {
          dHistory = dlst;
          fillHistory(dHistory);
          dispatch_days = dd;
          fillYearly(yrl);
          countTotal();
          $("#deleteEntry .btn-close").click();
          showToast("success", "Entry deleted");
        })
        .catch((error) => {
          alert(`${error}`);
        });
    },
    error: function (xhr) {
      if (xhr.status === 404) {
        alert("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        alert("Internal Server Error: There was a server error.");
      } else {
        alert("An unspecified error occurreds.");
      }
    },
  });
}

function saveEditEntry() {
  var loc = $("#editentryLocation").val();
  var dateJapan = $("#editentryDateJ").val();
  var datePh = $("#editentryDateP").val();
  const empID = $("#empSel").find("option:selected").attr("emp-id");
  const editID = $("#btn-saveEntry").attr("e-id");

  $.ajax({
    type: "POST",
    url: "php/update_dispatch_history.php",
    data: {
      dispatchID: editID,
      locID: loc,
      dateFrom: dateJapan,
      dateTo: datePh,
      empID: empID,
    },
    dataType: "json",
    success: function (response) {
      const isSuccess = response.isSuccess;
      if (!isSuccess) {
        showToast("error", `${response.error}`);
      } else {
        Promise.all([getDispatchHistory(), getDispatchDays(), getYearly()])
          .then(([dlst, dd, yrl]) => {
            dHistory = dlst;
            fillHistory(dHistory);
            dispatch_days = dd;
            fillYearly(yrl);
            countTotal();
            $("#btn-saveEntry").closest(".modal").find(".btn-close").click();
            showToast("success", "Entry saved");
          })
          .catch((error) => {
            alert(`${error}`);
          });
      }
    },
    error: function (xhr) {
      if (xhr.status === 404) {
        alert("Not Found Error: The requested resource was not found.");
      } else if (xhr.status === 500) {
        alert("Internal Server Error: There was a server error.");
      } else {
        alert("An unspecified error occurreds.");
      }
    },
  });
}
//#endregion
