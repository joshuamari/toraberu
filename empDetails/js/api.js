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

function postFormData(url, formData, fallbackMessage) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: url,
      data: formData,
      contentType: false,
      cache: false,
      processData: false,
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
function getEmployeeDetails() {
  return postJson(
    "php/get_emp_details.php",
    { empID: empID },
    "An unspecified error occurred.1",
  );
}

function getPassport(isDetails) {
  return postJson(
    "php/get_passport.php",
    {
      empID: empID,
      isDetails: isDetails,
    },
    "An unspecified error occurred.2",
  );
}

function getVisa(isDetails) {
  return postJson(
    "php/get_visa.php",
    {
      empID: empID,
      isDetails: isDetails,
    },
    "An unspecified error occurred.3",
  );
}

function getDispatchHistory() {
  return postJson(
    "php/get_dispatch_history.php",
    { empID: empID },
    "An unspecified error occurred.haha",
  );
}

function getDispatchDays() {
  return new Promise((resolve, reject) => {
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

function deleteDispatch() {
  const delID = $("#storeId").attr("del-id");
  return postJson(
    "php/delete_dispatch_history.php",
    {
      dispatchID: delID,
    },
    "An unspecified error occurred while deleting entry.",
  );
}

function checkAccess() {
  return getJson(
    "../global/check_login.php",
    "An unspecified error occurred.1",
  );
}

function checkEditAccess() {
  return getJson(
    "php/check_edit_permission.php",
    "An unspecified error occurred.",
  );
}

function saveEditEntry() {
  const loc = $("#editentryLocation").val();
  const dateJapan = $("#editentryDateJ").val();
  const datePh = $("#editentryDateP").val();
  const editID = $("#btn-saveEntry").attr("e-id");

  return postJson(
    "php/update_dispatch_history.php",
    {
      dispatchID: editID,
      locID: loc,
      dateFrom: dateJapan,
      dateTo: datePh,
    },
    "An unspecified error occurred while updating entry.",
  );
}

function getYearly() {
  return postJson(
    "php/get_yearly.php",
    { empID: empID },
    "An unspecified error occurred.3",
  );
}

function getLocations() {
  return getJson("php/get_location.php", "An unspecified error occurred.2");
}

function getWorkHistory() {
  return new Promise((resolve, reject) => {
    if (empID === undefined) {
      resolve([]);
      return;
    }
    $.ajax({
      type: "POST",
      url: "php/get_work_history.php",
      data: {
        empID: empID,
      },
      dataType: "json",
      success: function (response) {
        const wList = response.result;
        resolve(wList);
      },
      error: function (xhr) {
        reject(
          ajaxJsonErrorMessage(
            xhr,
            "An unspecified error occurred while fetching work history.",
          ),
        );
      },
    });
  });
}

function deleteWork() {
  const delWorkID = $("#storeWorkId").attr("del-work-id");
  return postJson(
    "php/delete_work_history.php",
    {
      work_histID: delWorkID,
    },
    "An unspecified error occurred while deleting dispatch history.",
  );
}
//#endregion

//#region SAVE API
function savePass() {
  const passNo = $("#upPassNo").val();
  const passBday = $("#upPassBday").val();
  const passIssue = $("#upPassIssue").val();
  const passExp = $("#upPassExp").val();
  const fPath = $("#upPassAttach")[0].files[0];
  const upload = $("#upPassAttach").val();
  const extension = upload.slice(((upload.lastIndexOf(".") - 1) >>> 0) + 2);
  let ctr = 0;

  if (!passNo) {
    $("#upPassNo").addClass("border border-danger");
    ctr++;
  }
  if (!passBday) {
    $("#upPassBday").addClass("border border-danger");
    ctr++;
  }
  if (!passIssue) {
    $("#upPassIssue").addClass("border border-danger");
    ctr++;
  }
  if (!passExp) {
    $("#upPassExp").addClass("border border-danger");
    ctr++;
  }

  const startDate = new Date(passIssue);
  const endDate = new Date(passExp);

  return new Promise((resolve, reject) => {
    if (endDate < startDate) {
      $("#upPassExp").val("");
      return reject("Expiry must not be earlier than date of issue.");
    }
    if (fPath) {
      if (extension.toLowerCase() !== "pdf") {
        $("#upPassAttach").val("");
        return reject("Please attach PDF files only.");
      }
    }
    if (ctr > 0) {
      return reject("Complete all fields");
    }

    var fd = new FormData();
    fd.append("fileValue", fPath);
    fd.append("empID", empID);
    fd.append("number", passNo);
    fd.append("birthdate", passBday);
    fd.append("issued", passIssue);
    fd.append("expiry", passExp);

    postFormData(
      "php/update_passport.php",
      fd,
      "An unspecified error occurred while updating passport.",
    )
      .then(resolve)
      .catch(reject);
  });
}

function saveVisa() {
  const visaNo = $("#upVisaNo").val();
  const visaIssue = $("#upVisaIssue").val();
  const visaExp = $("#upVisaExp").val();
  const fPath = $("#upVisaAttach")[0].files[0];
  const upload = $("#upVisaAttach").val();
  const extension = upload.slice(((upload.lastIndexOf(".") - 1) >>> 0) + 2);
  let ctr = 0;

  if (!visaNo) {
    $("#upVisaNo").addClass("border border-danger");
    ctr++;
  }
  if (!visaIssue) {
    $("#upVisaIssue").addClass("border border-danger");
    ctr++;
  }
  if (!visaExp) {
    $("#upVisaExp").addClass("border border-danger");
    ctr++;
  }

  const startDate = new Date(visaIssue);
  const endDate = new Date(visaExp);

  return new Promise((resolve, reject) => {
    if (fPath) {
      if (extension.toLowerCase() !== "pdf") {
        $("#upVisaAttach").val("");
        return reject("Please attach PDF files only.");
      }
    }
    if (ctr > 0) {
      return reject("Complete all fields.");
    }
    if (endDate < startDate) {
      $("#upVisaExp").val("");
      return reject("End date must not be earlier than start date.");
    }

    var fd = new FormData();
    fd.append("fileValue", fPath);
    fd.append("empID", empID);
    fd.append("number", visaNo);
    fd.append("issued", visaIssue);
    fd.append("expiry", visaExp);

    postFormData(
      "php/update_visa.php",
      fd,
      "An unspecified error occurred while updating visa.",
    )
      .then(resolve)
      .catch(reject);
  });
}

function addWorkHistory() {
  const comp_name = $("#addcompanyName").val();
  const startMonthYear = $("#addStartMonthYear").val();
  const endMonthYear = $("#addEndMonthYear").val();
  const comp_business = $("#addcompanyBusiness").val();
  const business_cont = $("#addbusinessContent").val();
  const work_loc = $("#addworkLocation").val();
  let errcount = 0;

  if (!comp_name) {
    $("#addcompanyName").addClass("bg-red-100  border-red-400");
    $(".compNameError").removeClass("hidden");
    $(".compNameError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!startMonthYear) {
    $("#addStartMonthYear").addClass("bg-red-100  border-red-400");
    $(".dateError").removeClass("hidden");
    $(".dateError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!comp_business) {
    $("#addcompanyBusiness").addClass("bg-red-100  border-red-400");
    $(".BusiError").removeClass("hidden");
    $(".BusiError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!business_cont) {
    $("#addbusinessContent").addClass("bg-red-100  border-red-400");
    $(".ContentError").removeClass("hidden");
    $(".ContentError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!work_loc) {
    $("#addworkLocation").addClass("bg-red-100  border-red-400");
    $(".LocError").removeClass("hidden");
    $(".LocError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }

  $(".dateError").text("Please Complete the Fields");

  return new Promise((resolve, reject) => {
    if (endMonthYear && endMonthYear < startMonthYear) {
      $("#addEndMonthYear").val("");
      $("#addStartMonthYear").val("");
      $("#addEndMonthYear").addClass("bg-red-100  border-red-400");
      $("#addStartMonthYear").addClass("bg-red-100  border-red-400");
      $(".dateError").removeClass("hidden");
      $(".dateError").addClass("block flex items-center gap-1 text-red-600");
      $(".dateError").text(
        "Invalid Date. End date must not be earlier than Start date.",
      );
      reject("Invalid Date. End date must not be earlier than Start date.");
      return;
    }
    if (errcount > 0) {
      reject("Complete all fields.");
      return;
    }

    postJson(
      "php/insert_work_history.php",
      {
        empID: empID,
        comp_name: comp_name,
        date_monthYearStart: startMonthYear,
        date_monthYearEnd: endMonthYear,
        comp_business: comp_business,
        business_cont: business_cont,
        work_loc: work_loc,
      },
      "An unspecified error occurred while inserting work history.",
    )
      .then(resolve)
      .catch(reject);
  });
}

function saveEditWorkHistEntry() {
  var startMonthYear = $("#edit-StartMonthYear").val();
  var endMonthYear = $("#edit-EndMonthYear").val();
  var compName = $("#edit-companyName").val();
  var compBusiness = $("#edit-companyBusiness").val();
  var businesscont = $("#edit-businessContent").val();
  var workloc = $("#edit-workLocation").val();
  const editID = $("#btn-updateWorkEntry").attr("e-wh-id");
  let errcount = 0;

  if (!compName) {
    $("#edit-companyName").addClass("bg-red-100  border-red-400");
    $(".compNameError").removeClass("hidden");
    $(".compNameError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!startMonthYear) {
    $("#edit-StartMonthYear").addClass("bg-red-100  border-red-400");
    $(".dateError").removeClass("hidden");
    $(".dateError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!compBusiness) {
    $("#edit-companyBusiness").addClass("bg-red-100  border-red-400");
    $(".BusiError").removeClass("hidden");
    $(".BusiError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!businesscont) {
    $("#edit-businessContent").addClass("bg-red-100  border-red-400");
    $(".ContentError").removeClass("hidden");
    $(".ContentError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!workloc) {
    $("#edit-workLocation").addClass("bg-red-100  border-red-400");
    $(".LocError").removeClass("hidden");
    $(".LocError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }

  $(".dateError").text("Please Complete the Fields");

  return new Promise((resolve, reject) => {
    if (endMonthYear && endMonthYear < startMonthYear) {
      $("#edit-EndMonthYear").val("");
      $("#edit-StartMonthYear").val("");
      $("#edit-EndMonthYear").addClass("bg-red-100  border-red-400");
      $("#edit-StartMonthYear").addClass("bg-red-100  border-red-400");
      $(".dateError").removeClass("hidden");
      $(".dateError").addClass("block flex items-center gap-1 text-red-600");
      $(".dateError").text(
        "Invalid Date. End date must not be earlier than Start date.",
      );
      reject("Invalid Date. End date must not be earlier than Start date.");
      return;
    }
    if (errcount > 0) {
      reject("Complete all fields");
      return;
    }

    postJson(
      "php/update_work_history.php",
      {
        date_monthYearStart: startMonthYear,
        date_monthYearEnd: endMonthYear,
        comp_name: compName,
        comp_business: compBusiness,
        business_cont: businesscont,
        work_loc: workloc,
        work_histID: editID,
      },
      "An unspecified error occurred while updating dispatch data.",
    )
      .then(resolve)
      .catch(reject);
  });
}
//#endregion
