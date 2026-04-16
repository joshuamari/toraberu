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
        console.log("RESPONSE:", xhr.responseText);
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
    "api/get_emp_details.php",
    { empID: empID },
    "Failed to load employee details.",
  );
}

function getPassport(isDetails) {
  return new Promise((resolve, reject) => {
    postJson(
      "api/get_passport.php",
      {
        empID: empID,
        isDetails: isDetails,
      },
      "Failed to load passport details.",
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

function getVisa(isDetails) {
  return new Promise((resolve, reject) => {
    postJson(
      "api/get_visa.php",
      {
        empID: empID,
        isDetails: isDetails,
      },
      "Failed to load visa details.",
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

function getReentryPermit(isDetails) {
  return new Promise((resolve, reject) => {
    postJson(
      "api/get_reentry_permit.php",
      {
        empID: empID,
        isDetails: isDetails,
      },
      "Failed to load reentry permit details.",
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

function getDispatchHistory() {
  return postJson(
    "api/get_dispatch_history.php",
    {
      empID: empID,
    },
    "Failed to load dispatch history.",
  );
}

function getDispatchDays() {
  return postJson(
    "api/check_duration.php",
    { empID: empID },
    "Failed to load dispatch days."
  ).then((res) => {
    if (!res.success) throw res.message;
    return res.data;
  });
}

function deleteDispatch(dispatchID) {
  return postJson(
    "api/delete_dispatch.php",
    { dispatchID: dispatchID },
    "Failed to delete dispatch."
  ).then((res) => {
    if (!res.success) throw res.message;
    return true;
  });
}

function checkAccess() {
  return getJson(
    "../api/session.php",
    "An unspecified error occurred.1",
  );
}

function saveEditEntry() {
  const loc = $("#editentryLocation").val();
  const dateJapan = $("#editentryDateJ").val();
  const datePh = $("#editentryDateP").val();
  const editID = $("#btn-saveEntry").attr("e-id");

  return postJson(
    "api/update_dispatch_history.php",
    {
      dispatchID: editID,
      locID: loc,
      dateFrom: dateJapan,
      dateTo: datePh,
    },
    "Failed to update dispatch entry.",
  );
}

function getYearly() {
  return postJson(
    "api/get_yearly.php",
    { empID: empID },
    "Failed to load yearly dispatch totals.",
  ).then((res) => {
    if (!res.success) {
      throw res.message;
    }
    return res.data;
  });
}

function getLocations() {
  return getJson(
    "api/get_location.php",
    "Failed to load locations.",
  ).then((res) => {
    if (!res.success) {
      throw res.message;
    }
    return res.data;
  });
}

function getWorkHistory() {
  if (empID === undefined) {
    return Promise.resolve([]);
  }

  return postJson(
    "api/get_work_history.php",
    {
      empID: empID,
    },
    "Failed to load work history.",
  ).then((res) => {
    if (!res.success) {
      throw res.message;
    }
    return res.data;
  });
}

function deleteWork() {
  const delWorkID = $("#storeWorkId").attr("del-work-id");

  return postJson(
    "api/delete_work_history.php",
    {
      work_histID: delWorkID,
    },
    "Failed to delete work history.",
  );
}
//#endregion

//#region SAVE API
function savePass() {
  const passNo = $("#upPassNo").val();
  const passBday = $("#upPassBday").val();
  const passIssue = $("#upPassIssue").val();
  const passExp = $("#upPassExp").val();
  const isOnProcess = $("#upPassOnProcess").is(":checked");

  const fPath = $("#upPassAttach")[0].files[0];
  const upload = $("#upPassAttach").val();
  const extension = upload.slice(((upload.lastIndexOf(".") - 1) >>> 0) + 2);

  let ctr = 0;

  if (!isOnProcess) {
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
  }

  const startDate = new Date(passIssue);
  const endDate = new Date(passExp);

  return new Promise((resolve, reject) => {
    if (!isOnProcess && passIssue && passExp && endDate < startDate) {
      $("#upPassExp").val("");
      return reject("Expiry must not be earlier than date of issue.");
    }

    if (fPath && extension.toLowerCase() !== "pdf") {
      $("#upPassAttach").val("");
      return reject("Please attach PDF files only.");
    }

    if (!isOnProcess && ctr > 0) {
      return reject("Complete all fields");
    }

    const fd = new FormData();
    fd.append("fileValue", fPath);
    fd.append("empID", empID);
    fd.append("number", passNo);
    fd.append("birthdate", passBday);
    fd.append("issued", passIssue);
    fd.append("expiry", passExp);
    fd.append("on_process", isOnProcess ? 1 : 0);

    postFormData(
      "api/update_passport.php",
      fd,
      "Failed to update passport."
    )
      .then((res) => {
        if (!res.success) {
          reject(res.message);
          return;
        }
        resolve(res);
      })
      .catch(reject);
  });
}

function saveVisa() {
  const visaNo = $("#upVisaNo").val();
  const visaIssue = $("#upVisaIssue").val();
  const visaExp = $("#upVisaExp").val();
  const isOnProcess = $("#upVisaOnProcess").is(":checked");

  const fPath = $("#upVisaAttach")[0].files[0];
  const upload = $("#upVisaAttach").val();
  const extension = upload.slice(((upload.lastIndexOf(".") - 1) >>> 0) + 2);

  let ctr = 0;

  if (!isOnProcess) {
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
  }

  const startDate = new Date(visaIssue);
  const endDate = new Date(visaExp);

  return new Promise((resolve, reject) => {
    if (fPath && extension.toLowerCase() !== "pdf") {
      $("#upVisaAttach").val("");
      return reject("Please attach PDF files only.");
    }

    if (!isOnProcess && ctr > 0) {
      return reject("Complete all fields.");
    }

    if (!isOnProcess && visaIssue && visaExp && endDate < startDate) {
      $("#upVisaExp").val("");
      return reject("End date must not be earlier than start date.");
    }

    const fd = new FormData();
    fd.append("fileValue", fPath);
    fd.append("empID", empID);
    fd.append("number", visaNo);
    fd.append("issued", visaIssue);
    fd.append("expiry", visaExp);
    fd.append("on_process", isOnProcess ? 1 : 0);

    postFormData(
      "api/update_visa.php",
      fd,
      "Failed to update visa.",
    )
      .then((res) => {
        if (!res.success) {
          reject(res.message);
          return;
        }
        resolve(res);
      })
      .catch(reject);
  });
}

function saveReentryPermit() {
  const reentryExp = $("#upReentryExp").val();
  const isOnProcess = $("#upReentryOnProcess").is(":checked");

  const fPath = $("#upReentryAttach")[0].files[0];
  const upload = $("#upReentryAttach").val();
  const extension = upload.slice(((upload.lastIndexOf(".") - 1) >>> 0) + 2);

  let ctr = 0;

  if (!isOnProcess) {
    if (!reentryExp) {
      $("#upReentryExp").addClass("border border-danger");
      ctr++;
    }
  }

  return new Promise((resolve, reject) => {
    if (fPath && extension.toLowerCase() !== "pdf") {
      $("#upReentryAttach").val("");
      return reject("Please attach PDF files only.");
    }

    if (!isOnProcess && ctr > 0) {
      return reject("Expiry date is required.");
    }

    const fd = new FormData();
    fd.append("fileValue", fPath);
    fd.append("empID", empID);
    fd.append("expiry", reentryExp);
    fd.append("on_process", isOnProcess ? 1 : 0);

    postFormData(
      "api/update_reentry_permit.php",
      fd,
      "Failed to update re-entry permit.",
    )
      .then((res) => {
        if (!res.success) {
          reject(res.message);
          return;
        }
        resolve(res);
      })
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
    $("#addcompanyName").addClass("bg-red-100 border-red-400");
    $(".compNameError").removeClass("hidden");
    $(".compNameError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!startMonthYear) {
    $("#addStartMonthYear").addClass("bg-red-100 border-red-400");
    $(".dateError").removeClass("hidden");
    $(".dateError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!comp_business) {
    $("#addcompanyBusiness").addClass("bg-red-100 border-red-400");
    $(".BusiError").removeClass("hidden");
    $(".BusiError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!business_cont) {
    $("#addbusinessContent").addClass("bg-red-100 border-red-400");
    $(".ContentError").removeClass("hidden");
    $(".ContentError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!work_loc) {
    $("#addworkLocation").addClass("bg-red-100 border-red-400");
    $(".LocError").removeClass("hidden");
    $(".LocError").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }

  $(".dateError").text("Please Complete the Fields");

  return new Promise((resolve, reject) => {
    if (endMonthYear && endMonthYear < startMonthYear) {
      $("#addEndMonthYear").val("");
      $("#addStartMonthYear").val("");
      $("#addEndMonthYear").addClass("bg-red-100 border-red-400");
      $("#addStartMonthYear").addClass("bg-red-100 border-red-400");
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
      "api/insert_work_history.php",
      {
        empID: empID,
        comp_name: comp_name,
        date_monthYearStart: startMonthYear,
        date_monthYearEnd: endMonthYear,
        comp_business: comp_business,
        business_cont: business_cont,
        work_loc: work_loc,
      },
      "Failed to add work history.",
    )
      .then((res) => {
        if (!res.success) {
          reject(res.message || "Failed to add work history.");
          return;
        }
        resolve(res);
      })
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
    $("#edit-companyName").addClass("bg-red-100 border-red-400");
    $(".compNameError").removeClass("hidden").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!startMonthYear) {
    $("#edit-StartMonthYear").addClass("bg-red-100 border-red-400");
    $(".dateError").removeClass("hidden").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!compBusiness) {
    $("#edit-companyBusiness").addClass("bg-red-100 border-red-400");
    $(".BusiError").removeClass("hidden").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!businesscont) {
    $("#edit-businessContent").addClass("bg-red-100 border-red-400");
    $(".ContentError").removeClass("hidden").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }
  if (!workloc) {
    $("#edit-workLocation").addClass("bg-red-100 border-red-400");
    $(".LocError").removeClass("hidden").addClass("block flex items-center gap-1 text-red-600");
    errcount++;
  }

  $(".dateError").text("Please Complete the Fields");

  return new Promise((resolve, reject) => {
    if (endMonthYear && endMonthYear < startMonthYear) {
      $("#edit-EndMonthYear, #edit-StartMonthYear")
        .val("")
        .addClass("bg-red-100 border-red-400");

      $(".dateError")
        .removeClass("hidden")
        .addClass("block flex items-center gap-1 text-red-600")
        .text("Invalid Date. End date must not be earlier than Start date.");

      reject("Invalid Date. End date must not be earlier than Start date.");
      return;
    }

    if (errcount > 0) {
      reject("Complete all fields");
      return;
    }

    postJson(
      "api/update_work_history.php",
      {
        work_histID: editID,
        date_monthYearStart: startMonthYear,
        date_monthYearEnd: endMonthYear,
        comp_name: compName,
        comp_business: compBusiness,
        business_cont: businesscont,
        work_loc: workloc,
      },
      "Failed to update work history."
    )
      .then((res) => {
        if (!res.success) {
          reject(res.message);
          return;
        }
        resolve(res);
      })
      .catch(reject);
  });
}
//#endregion
