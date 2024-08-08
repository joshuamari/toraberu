//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
var empID = 0;
var userPassD = [];
var userPassI = [];
var userVisaI = [];
var userVisaD = [];
const full = 183;
var empDetails = [];
var dHistory = [];
var wHistory = [];
var ename = "";
var editAccess = false;
// var dispatch_days = 0;
//#endregion

const url_string = window.location;
const url = new URL(url_string);
if (url.searchParams.get("id")) {
  empID = url.searchParams.get("id");
} else {
  window.location.href = "/PCS/";
}
checkAccess()
  .then((emp) => {
    if (emp.isSuccess) {
      empDetails = emp.data;
      $(document).ready(function () {
        fillEmployeeDetails();
        Promise.all([
          getEmployeeDetails(),
          getPassport(true),
          getPassport(false),
          getVisa(true),
          getVisa(false),
          getDispatchHistory(),
          getDispatchDays(),
          getYearly(),
          getLocations(),
          checkEditAccess(),
          getWorkHistory(),
        ])
          .then(
            ([
              emps,
              pportD,
              pportI,
              vsaD,
              vsaI,
              dlst,
              dd,
              yrl,
              locs,
              eAccess,
              wHist,
            ]) => {
              editAccess = eAccess;
              userPassD = pportD;
              userPassI = pportI;
              userVisaD = vsaD;
              userVisaI = vsaI;
              fillDetails(emps);
              passportDisplay(userPassD);
              passportInput(userPassI);
              visaDisplay(userVisaD);
              visaInput(userVisaI);
              dHistory = dlst;
              fillHistory(dHistory);
              displayDays(dd);
              fillYearly(yrl);
              fillLocations(locs);
              wHistory = wHist;
              fillWorkHistory(wHistory);
              if (editAccess === false) {
                $(".editThis").removeAttr("data-bs-target");
                $(".editThis").removeAttr("data-bs-toggle");
              }
              // dispatch_days = dd;
            }
          )
          .catch((error) => {
            alert(`${error}`);
          });
      });
    } else {
      alert(emp.message);
      window.location.href = `${rootFolder}`;
    }
  })
  .catch((error) => {
    alert(`${error}`);
  });
//#region BINDS
$(document).on("click", ".table-titles .title.first", function () {
  $(".table-titles .title.second, .table-two").removeClass("active");
  $(this).addClass("active");
  $(".table-one").addClass("active");
});
$(document).on("click", ".table-titles .title.second", function () {
  $(".table-titles .title.second, .table-two").addClass("active");
  $(".table-titles .title.first, .table-one").removeClass("active");
});
$(document).on("click", "#menu", function () {
  $(".navigation").addClass("open");
  $("body").addClass("overflow-hidden");
});
$(document).on("click", "#closeNav", function () {
  $(".navigation").removeClass("open");
  $("body").removeClass("overflow-hidden");
});
$(document).on("mouseenter", ".editThis", function () {
  if (editAccess === true) {
    $(this).addClass("hov");
  }
});
$(document).on("mouseleave", ".editThis", function () {
  if (editAccess === true) {
    $(this).removeClass("hov");
  }
});

$(document).on("click", "#btn-updateVisa", function () {
  $("#updateVisa").find("input").removeAttr("disabled");
  $(this).closest(".modal").find(".attach").removeClass("d-none");
  $(this).closest(".modal-footer").html(`
  <button type="button" class="btn btn-secondary"  id="cancelEditVisa">
            Cancel
          </button>
          <button type="button" class="btn btn-success" id="btn-saveVisa">
            Save Changes
          </button>
  `);
});
$(document).on("click", "#btn-updatePass", function () {
  $("#updatePass").find("input").removeAttr("disabled");
  $(this).closest(".modal").find(".attach").removeClass("d-none");
  $(this).closest(".modal-footer").html(`
  <button type="button" class="btn btn-secondary" id="cancelEditPass">
            Cancel
          </button>
          <button type="button" class="btn btn-success" id="btn-savePass">
            Save Changes
          </button>
  `);
});
$(document).on("click", ".btn-close", function () {
  $(this).closest(".modal").find(".attach").addClass("d-none");
  $(this).closest(".modal").find("input").attr("disabled", true);
  $("#btn-saveEntry").attr("e-id", 0);
});
$(document).on("click", ".btn-cancel", function () {
  $(this).closest(".modal").find(".btn-close").click();
  $("#btn-saveEntry").attr("e-id", 0);
});
$(document).on("click", "#updatePass .btn-close", function () {
  resetPassInput();
});
$(document).on("click", "#updateVisa .btn-close", function () {
  resetVisaInput();
});
$(document).on("click", ".btn-delete", function () {
  var num = $(this).closest("tr").find("td:first-of-type").html();

  var trID = $(this).closest("tr").attr("d-id");
  $("#storeId").html(num);
  $("#storeId").attr("del-id", trID);
  let sn = $(".surname").text();
  let fn = $(".givenname").text();
  const fullname = sn.concat(fn);
  $("#selectedEmp").text(fullname);
});
$(document).on("click", "#btn-deleteEntry", function () {
  deleteDispatch()
    .then((res) => {
      if (res.isSuccess) {
        showToast("success", `${res.message}`);
        Promise.all([getDispatchHistory(), getDispatchDays(), getYearly()])
          .then(([dlst, dd, yrl]) => {
            dHistory = dlst;
            fillHistory(dHistory);
            displayDays(dd);
            fillYearly(yrl);
            $("#deleteEntry .btn-close").click();
          })
          .catch((error) => {
            alert(`${error}`);
          });
      } else {
        showToast("error", `${res.message}`);
      }
    })
    .catch((error) => {
      showToast("error", `${error}`);
    });
});
$(document).on("click", "#btn-savePass", function () {
  savePass()
    .then((res) => {
      if (res.isSuccess) {
        showToast("success", res.message);
        getPassport(true)
          .then((pport) => {
            userPassD = pport;
            passportDisplay(userPassD);
            resetPassInput();
            // $("#updatePass .btn-close").click();
          })
          .catch((error) => {
            alert(`${error}`);
          });
        getPassport(false)
          .then((pport) => {
            userPassI = pport;
            passportInput(userPassI);
            resetPassInput();
            // $("#updatePass .btn-close").click();
          })
          .catch((error) => {
            alert(`${error}`);
          });
      } else {
        showToast("error", res.message);
      }
    })
    .catch((error) => {
      showToast("error", `${error}`);
    });
});
$(document).on("click", "#btn-saveVisa", function () {
  saveVisa()
    .then((res) => {
      if (res.isSuccess) {
        showToast("success", res.message);
        getVisa(true)
          .then((vsa) => {
            userVisaD = vsa;
            visaDisplay(userVisaD);
            resetVisaInput();
            // $("#updateVisa .btn-close").click();
          })
          .catch((error) => {
            alert(`${error}`);
          });
        getVisa(false)
          .then((vsa) => {
            userVisaI = vsa;
            visaInput(userVisaI);
            resetVisaInput();
            // $("#updateVisa .btn-close").click();
          })
          .catch((error) => {
            alert(`${error}`);
          });
      } else {
        showToast("error", res.message);
      }
    })
    .catch((error) => {
      showToast("error", `${error}`);
    });
});
$(document).on("click", "#cancelEditPass", function () {
  resetPassInput();
});
$(document).on("click", "#cancelEditVisa", function () {
  resetVisaInput();
});
$(document).on("click", "#upPassNo", function () {
  $(this).removeClass("border border-danger");
});
$(document).on("click", "#upPassBday", function () {
  $(this).removeClass("border border-danger");
});
$(document).on("click", "#upPassIssue", function () {
  $(this).removeClass("border border-danger");
});
$(document).on("click", "#upPassExp", function () {
  $(this).removeClass("border border-danger");
});
$(document).on("click", "#upPassBday", function () {
  $(this).removeClass("border border-danger");
});
$(document).on("click", "#upVisaNo", function () {
  $(this).removeClass("border border-danger");
});
$(document).on("click", "#upVisaIssue", function () {
  $(this).removeClass("border border-danger");
});
$(document).on("click", "#upVisaExp", function () {
  $(this).removeClass("border border-danger");
});
$(document).on("click", "#btn-saveEntry", function () {
  saveEditEntry()
    .then((res) => {
      if (res.isSuccess) {
        showToast("success", res.error);
        Promise.all([getDispatchHistory(), getDispatchDays(), getYearly()])
          .then(([dlst, dd, yrl]) => {
            dHistory = dlst;
            fillHistory(dHistory);
            displayDays(dd);
            fillYearly(yrl);
            $("#btn-saveEntry").closest(".modal").find(".btn-close").click();
          })
          .catch((error) => {
            alert(`${error}`);
          });
      } else {
        showToast("error", `${res.error}`);
      }
    })
    .catch((error) => {
      showToast("error", `${error}`);
    });
});
$(document).on("change", ".edit-date", function () {
  computeTotalDays();
});
$(document).on("change", "#editentryDateJ", function () {
  $("#editentryDateP").attr("min", $(this).val());
});
$(document).on("change", "#editentryDateP", function () {
  $("#editentryDateJ").attr("max", $(this).val());
});
$(document).on("click", ".btn-edit", function () {
  var trID = parseInt($(this).closest("tr").attr("d-id"));
  getEditDetails(trID);
  $("#editentryDateP, #editentryDateJ").prop("disabled", false);
  $("#editEntry").modal("show");
  $("#btn-saveEntry").attr("e-id", trID);
});
$(document).on("click", "#btnExport", function () {
  exportTable();
});
$(document).on("click", "#portalBtn", function () {
  window.location.href = `${rootFolder}`;
});
$(document).on("click", ".rmvToast", function () {
  $(this).closest(".toasty").remove();
});
$(document).on("click", ".add-work", function () {
  $(
    "#addcompanyName, #addStartMonthYear, #addEndMonthYear, #addcompanyBusiness, #addbusinessContent, #addworkLocation"
  ).prop("disabled", false);
  $("#addNewWork").modal("show");
});
$(document).on("click", ".btn-wh-close", function () {
  $("small").removeClass("block");
  $("small").addClass("hidden");
  clearAddWorkInputs();
  removeOutline();
});
$(document).on("click", ".btn-wh-cancel", function () {
  $(this).closest(".modal").find(".btn-wh-close").click();
});
$(document).on("click", "#btn-addWorkEntry", function () {
  addWorkHistory()
    .then((res) => {
      if (!res.isSuccess) {
        showToast("error", `${res.error}`);
      } else {
        getWorkHistory()
          .then((wlst) => {
            wHistory = wlst;
            fillWorkHistory(wHistory);
            clearAddWorkInputs();
            $("#btn-addWorkEntry")
              .closest(".modal")
              .find(".btn-wh-close")
              .click();
          })
          .catch((error) => {
            showToast("error", error);
          });
        showToast("success", "Successfully Added Work History");
      }
    })
    .catch((error) => {
      showToast("error", error);
    });
});
$(document).on(
  "click",
  "#addcompanyName, #addStartMonthYear, #addEndMonthYear, #addcompanyBusiness, #addbusinessContent, #addworkLocation",
  function () {
    $(this).removeClass("bg-red-100  border-red-400");
    if ($(this).hasClass("company-name")) {
      $(".compNameError").removeClass("block");
      $(".compNameError").addClass("hidden");
    } else if ($(this).hasClass("company-business")) {
      $(".BusiError").removeClass("block");
      $(".BusiError").addClass("hidden");
    } else if ($(this).hasClass("business-content")) {
      $(".ContentError").removeClass("block");
      $(".ContentError").addClass("hidden");
    } else if ($(this).hasClass("work-location")) {
      $(".LocError").removeClass("block");
      $(".LocError").addClass("hidden");
    } else {
      $(".dateError").removeClass("block");
      $(".dateError").addClass("hidden");
    }
  }
);
$(document).on("click", ".btn-delete-work", function () {
  let num = $(this).closest("tr").find("td:first-of-type").html();

  let WHtrID = $(this).closest("tr").attr("wh-id");
  $("#storeWorkId").html(num);
  $("#storeWorkId").attr("del-work-id", WHtrID);
  let sn = $(".surname").text();
  let fn = $(".givenname").text();
  const fullname = sn.concat(fn);
  $("#selectedEmpWH").text(fullname);
});
$(document).on("click", "#btn-deleteWorkHistory", function () {
  deleteWork().then((res) => {
    if (res.isSuccess) {
      showToast("success", res.error);
      getWorkHistory()
        .then((wlst) => {
          wHistory = wlst;
          fillWorkHistory(wHistory);
          $("#btn-deleteWorkHistory")
            .closest(".modal")
            .find(".btn-wh-close")
            .click();
        })
        .catch((error) => {
          showToast("error", error);
        });
    } else {
      showToast("error", res.error);
    }
  });
});
$(document).on("click", ".btn-edit-work", function () {
  var WHtrID = parseInt($(this).closest("tr").attr("wh-id"));
  getEditWorkHistDetails(WHtrID);
  $(
    "#edit-companyName, #edit-StartMonthYear, #edit-EndMonthYear, #edit-companyBusiness, #edit-businessContent, #edit-workLocation"
  ).prop("disabled", false);
  $("#editWorkHistory").modal("show");
  $("#btn-updateWorkEntry").attr("e-wh-id", WHtrID);
});
$(document).on(
  "click",
  "#edit-companyName, #edit-StartMonthYear, #edit-EndMonthYear, #edit-companyBusiness, #edit-businessContent, #edit-workLocation",
  function () {
    $(this).removeClass("bg-red-100  border-red-400");
    if ($(this).hasClass("company-name")) {
      $(".compNameError").removeClass("block");
      $(".compNameError").addClass("hidden");
    } else if ($(this).hasClass("company-business")) {
      $(".BusiError").removeClass("block");
      $(".BusiError").addClass("hidden");
    } else if ($(this).hasClass("business-content")) {
      $(".ContentError").removeClass("block");
      $(".ContentError").addClass("hidden");
    } else if ($(this).hasClass("work-location")) {
      $(".LocError").removeClass("block");
      $(".LocError").addClass("hidden");
    } else {
      $(".dateError").removeClass("block");
      $(".dateError").addClass("hidden");
    }
  }
);
$(document).on("keydown", "#allowance", function (e) {
  if (e.which === 38 || e.which === 40 || e.which === 189) {
    e.preventDefault();
  }
});
$(document).on("click", "#btn-updateWorkEntry", function () {
  saveEditWorkHistEntry()
    .then((res) => {
      if (res.isSuccess) {
        showToast("success", res.error);
        getWorkHistory()
          .then((wlst) => {
            wHistory = wlst;
            fillWorkHistory(wHistory);
            $("#btn-updateWorkEntry")
              .closest(".modal")
              .find(".btn-wh-close")
              .click();
          })
          .catch((error) => {
            showToast("error", error);
          });
      } else {
        showToast("error", res.error);
      }
    })
    .catch((error) => {
      showToast("error", error);
    });
});
//#endregion

//#region FUNCTIONS
function getEmployeeDetails() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_emp_details.php",
      data: {
        empID: empID,
      },
      dataType: "json",
      success: function (response) {
        const emps = response;
        resolve(emps);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.1");
        }
      },
    });
  });
}
function fillDetails(empnum) {
  console.log(empnum);
  $("#empId").text(`${empnum.id}`);
  $(".surname").text(`${empnum.lastname},`);
  $(".givenname").text(`${empnum.firstname}`);
  $("#empPic").attr("src", empnum.pictureLink);
  if (empnum.dispatch == 0) {
    $("#dStat").addClass("bg-danger").removeClass("bg-success");
    $("#dStat").text("Non Dispatch");
  } else {
    $("#dStat").addClass("bg-success").removeClass("bg-danger");
    $("#dStat").text("For Dispatch");
  }

  $("#disModalEmpName").text(`${empnum.firstname} ${empnum.lastname}`);
  ename = `${empnum.firstname} ${empnum.lastname}`;
}
function getPassport(isDetails) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_passport.php",
      data: {
        empID: empID,
        isDetails: isDetails,
      },
      dataType: "json",
      success: function (response) {
        const pport = response;
        resolve(pport);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.2");
        }
      },
    });
  });
}

function passportDisplay(pport) {
  if (Object.keys(pport).length > 0) {
    const pnum = pport.number;
    const pbday = pport.bday;
    const pissue = pport.issue;
    const pexpiry = pport.expiry;
    const pvalid = pport.valid;
    $("#passNo").text(pnum);
    $("#passBday").text(pbday);
    $("#passIssue").text(pissue);
    $("#passExp").text(pexpiry);
    if (pvalid) {
      $("#passStatus").removeClass("bg-danger");
      $("#passStatus").addClass("bg-success");
      $("#passStatus").text("Valid");
    } else {
      $("#passStatus").removeClass("bg-success");
      $("#passStatus").addClass("bg-danger");
      $("#passStatus").text("Expired");
    }
    $("#passDeets").removeClass("d-none");
    $("#passEmpty").addClass("d-none");
  } else {
    $("#passDeets").addClass("d-none");
    $("#passEmpty").removeClass("d-none");
  }
}
function passportInput(pport) {
  const pnum = pport.number;
  const pbday = pport.bday;
  const pissue = pport.issue;
  const pexpiry = pport.expiry;
  const attach = pport.passportLink;
  $("#upPassNo").val(pnum);
  $("#upPassBday").val(pbday);
  $("#upPassIssue").val(pissue);
  $("#upPassExp").val(pexpiry);
  if (attach) {
    $("#wAttachPass").removeClass("d-none");
    $("#noAttachPass").addClass("d-none");
    $("#pAttach").html(
      `Click <a href="${attach}" target="_blank" style="color:var(--tertiary) !important;" class="fw-semibold">here</a> to view`
    );
    $("#passAttachView").attr("src", attach);
  } else {
    $("#noAttachPass").removeClass("d-none");
    $("#wAttachPass").addClass("d-none");
    $("#pAttach").html(`Attachment`);
  }
}
function getVisa(isDetails) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_visa.php",
      data: {
        empID: empID,
        isDetails: isDetails,
      },
      dataType: "json",
      success: function (response) {
        const vsa = response;
        resolve(vsa);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.3");
        }
      },
    });
  });
}
function fillVisa(vsa) {
  visaDisplay(vsa);
  visaInput(vsa);
}
function visaDisplay(vsa) {
  if (Object.keys(vsa).length > 0) {
    const vnum = vsa.number;
    const vissue = vsa.issue;
    const vexpiry = vsa.expiry;
    const vvalid = vsa.valid;
    $("#visaNo").text(vnum);
    $("#visaIssue").text(vissue);
    $("#visaExp").text(vexpiry);
    if (vvalid) {
      $("#visaStatus").removeClass("bg-danger");
      $("#visaStatus").addClass("bg-success");
      $("#visaStatus").text("Valid");
    } else {
      $("#visaStatus").removeClass("bg-success");
      $("#visaStatus").addClass("bg-danger");
      $("#visaStatus").text("Expired");
    }
    $("#visaDeets").removeClass("d-none");
    $("#visaEmpty").addClass("d-none");
  } else {
    $("#visaDeets").addClass("d-none");
    $("#visaEmpty").removeClass("d-none");
  }
}
function visaInput(vsa) {
  const vnum = vsa.number;
  const vissue = vsa.issue;
  const vexpiry = vsa.expiry;
  const attach = vsa.visaLink;
  $("#upVisaNo").val(vnum);
  $("#upVisaIssue").val(vissue);
  $("#upVisaExp").val(vexpiry);
  if (attach) {
    $("#wAttachVisa").removeClass("d-none");
    $("#noAttachVisa").addClass("d-none");
    $("#vAttach").html(
      `Click <a href="${attach}" target="_blank" style="color:var(--tertiary) !important;" class="fw-semibold">here</a> to view`
    );
    $("#visaAttachView").attr("src", attach);
  } else {
    $("#noAttachVisa").removeClass("d-none");
    $("#wAttachVisa").addClass("d-none");
    $("#vAttach").html(`Attachment`);
  }
}
function getDispatchHistory() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_dispatch_history.php",
      data: {
        empID: empID,
      },
      dataType: "json",
      success: function (response) {
        const dList = response;
        resolve(dList);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.haha");
        }
      },
    });
  });
}
function fillHistory(dlist) {
  var tableBody = $("#dList");
  tableBody.empty();
  if (dlist.length === 0) {
    var noDataRow = $(
      `<tr><td colspan='7' class="text-center">No data found</td></tr>`
    );
    tableBody.append(noDataRow);
  } else {
    $.each(dlist, function (index, item) {
      var row = $(`<tr d-id=${item.id}>`);
      row.append(`<td data-exclude="true">${index + 1}</td>`);
      row.append(
        `<td data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.locationName}</td>`
      );
      row.append(
        `<td data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.fromDate}</td>`
      );
      row.append(
        `<td data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.toDate}</td>`
      );
      row.append(
        `<td data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.duration}</td>`
      );
      row.append(
        `<td data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.pastOne}</td>`
      );

      row.append(`<td data-exclude="true">                            <div class="d-flex gap-3">
          <button
            class="btn-edit"
            title="Edit Entry"
            
          >
          <i class='bx bxs-edit fs-5' ></i>
          </button>
          <button
            class="btn-delete"
            title="Delete Entry"
            data-bs-toggle="modal"
            data-bs-target="#deleteEntry"
          >
            <i class="bx bx-trash fs-5"></i>
          </button>
        </div></td>`);

      tableBody.append(row);
    });
  }
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
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurreds.");
        }
      },
    });
  });
}
function displayDays(dd) {
  var countText = "";
  if (dd == 1) {
    countText = `1 day`;
  } else {
    countText = `${dd} days`;
  }
  $("#dCount").text(countText);
  setBar(dd);
  colorBar(dd);
}
function deleteDispatch() {
  const delID = $("#storeId").attr("del-id");
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/delete_dispatch_history.php",
      data: {
        dispatchID: delID,
      },
      dataType: "json",
      success: function (response) {
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while deleting entry.");
        }
      },
    });
  });
}
function setBar(dd) {
  const wd = (dd / full) * 100;
  $("#progBar").css("width", `${wd}%`);
}
function colorBar(dd) {
  $("#daysWarning").addClass("d-none");
  if (dd >= full) {
    $("#progBar").addClass("bg-danger").removeClass("bg-success bg-warning");
    if (dd > full) {
      $("#daysWarning").removeClass("d-none");
    }
  } else if (dd >= 150 && dd < full) {
    $("#progBar").addClass("bg-warning").removeClass("bg-success bg-danger");
  } else {
    $("#progBar").addClass("bg-success").removeClass("bg-warning bg-danger");
  }
}
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
    $.ajax({
      type: "POST",
      url: "php/update_passport.php",
      data: fd,
      contentType: false,
      cache: false,
      processData: false,
      dataType: "json",
      success: function (response) {
        // console.log(response);
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while updating passport.");
        }
      },
    });
  });
}
function resetPassInput() {
  passportDisplay(userPassD);
  passportInput(userPassI);
  $("#upPassNo").attr("disabled", true);
  $("#upPassBday").attr("disabled", true);
  $("#upPassIssue").attr("disabled", true);
  $("#upPassExp").attr("disabled", true);
  $("#upPassAttach").attr("disabled", true);
  $(".attach").addClass("d-none");
  $("#upPassExp, #upPassIssue, #upPassBday, #upPassNo ").removeClass(
    "border border-danger"
  );
  $("#updatePass .btn-close").closest(".modal").find(".modal-footer").html(`
  <button type="button" class="btn btn-cancel btn-secondary">
  Cancel
</button>
<button type="button" class="btn btn-update" id="btn-updatePass">
  Update Passport
</button>
  `);
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
    $.ajax({
      type: "POST",
      url: "php/update_visa.php",
      data: fd,
      contentType: false,
      cache: false,
      processData: false,
      dataType: "json",
      success: function (response) {
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while updating visa.");
        }
      },
    });
  });
}
function resetVisaInput() {
  visaDisplay(userVisaD);
  visaInput(userVisaI);
  $("#upVisaNo").attr("disabled", true);
  $("#upVisaIssue").attr("disabled", true);
  $("#upVisaExp").attr("disabled", true);
  $("#upVisaAttach").attr("disabled", true);
  $(".attach").addClass("d-none");
  $("#upVisaNo, #upVisaIssue, #upVisaExp").removeClass("border border-danger");
  $("#updateVisa .btn-close").closest(".modal").find(".modal-footer").html(`
  <button type="button" class="btn btn-cancel btn-secondary">
  Cancel
</button>
<button type="button" class="btn btn-update" id="btn-updateVisa">
  Update Visa
</button>
  `);
}
function checkAccess() {
  // const response = {
  //   isSuccess: true,
  //   data: {
  //     empNum: 464,
  //     empGroup: {
  //       id: 21,
  //       name: "System Group",
  //       acr: "SYS",
  //     },
  //     empName: {
  //       firstname: "Collene Keith",
  //       surname: "Medrano",
  //     },
  //   },
  // };
  // const response = {
  //   isSuccess: false,
  //   message: "Access Denied",
  // };
  // const response = {
  //   isSuccess: false,
  //   message: "Not logged in",
  // };
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "../global/check_login.php",
      dataType: "json",
      success: function (data) {
        const acc = data;
        resolve(acc);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.1");
        }
      },
    });
    // resolve(response);
  });
}
function fillEmployeeDetails() {
  const fName = empDetails.empname.firstname;
  const sName = empDetails.empname.surname;
  const initials = getInitials(fName, sName);
  const grpName = empDetails.group;
  $("#empLabel").html(`${fName} ${sName}`);
  $("#empInitials").html(`${initials}`);
  $("#grpLabel").html(`${grpName}`);
}
function getInitials(firstname, surname) {
  let initials = "";
  var firstInitial = firstname.charAt(0);
  var lastInitial = surname.charAt(0);
  initials = `${firstInitial}${lastInitial}`;
  return initials.toUpperCase();
}
function checkEditAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/check_edit_permission.php",
      dataType: "json",
      success: function (data) {
        const acc = data;
        resolve(acc);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.");
        }
      },
    });
  });
}

function saveEditEntry() {
  const loc = $("#editentryLocation").val();
  const dateJapan = $("#editentryDateJ").val();
  const datePh = $("#editentryDateP").val();
  const editID = $("#btn-saveEntry").attr("e-id");
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/update_dispatch_history.php",
      data: {
        dispatchID: editID,
        locID: loc,
        dateFrom: dateJapan,
        dateTo: datePh,
      },
      dataType: "json",
      success: function (response) {
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while updating entry.");
        }
      },
    });
  });
}
function computeTotalDays() {
  var from = new Date($("#editentryDateJ").val());
  var to = new Date($("#editentryDateP").val());

  if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
    var differenceInTime = to.getTime() - from.getTime();
    var differenceInDays =
      Math.round(differenceInTime / (1000 * 3600 * 24)) + 1;

    $("#editentryDays").html(differenceInDays);
  }
}
function getEditDetails(editID) {
  const editItem = dHistory.find((item) => parseInt(item.id) === editID);
  var loc = editItem["locationName"];
  var japan = editItem["fromDate"];
  var parsedDateJap = new Date(japan);

  var formattedDateJap =
    parsedDateJap.getFullYear() +
    "-" +
    ("0" + (parsedDateJap.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + parsedDateJap.getDate()).slice(-2);
  var ph = editItem["toDate"];
  var parsedDatePh = new Date(ph);
  var formattedDatePh =
    parsedDatePh.getFullYear() +
    "-" +
    ("0" + (parsedDatePh.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + parsedDatePh.getDate()).slice(-2);

  var total = editItem["duration"];
  var totalpast = editItem["pastOne"];

  $("#editentryDateJ").val(formattedDateJap);
  $("#editentryDateJ").attr("max", formattedDatePh);
  $("#editentryDateP").val(formattedDatePh);
  $("#editentryDateP").attr("min", formattedDateJap);
  $("#editentryLocation option:contains(" + loc + ")").prop("selected", true);
  $(" #editentryDays").html(total);
}
function getYearly() {
  return new Promise((resolve, reject) => {
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
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.3");
        }
      },
    });
  });
}

function fillYearly(yrl) {
  var x = 1;
  var yrRow = `<tr class='d-none'></tr><tr class='d-none'>
  <tr class='d-none'><td data-f-name='Arial' data-f-sz='9' data-f-bold='true' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000'>Year</td>
  <td data-f-name="Arial" data-f-sz="9" data-f-bold="true" data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">Total Days in Japan</td> </tr>`;
  Object.entries(yrl).forEach(([key, value]) => {
    $(`#y${x}`).text(key);
    $(`#y${x}-days`).text(value);

    yrRow += `<tr class='d-none'><td data-f-name='Arial' data-f-sz='9' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000'>${key}</td><td data-f-name='Arial' data-f-sz='9' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000'>${value}</td></tr>`;
    x++;
  });
  $("#histTable").append(yrRow);
}
function getYears() {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const nextYear = currentYear + 1;
  $("#y1").text(previousYear);
  $("#y2").text(currentYear);
  $("#y3").text(nextYear);
}
function exportTable() {
  TableToExcel.convert(document.getElementById("histTable"), {
    name: `Dispatch_History_${empID}.xlsx`,
    sheet: {
      name: `${ename}`,
    },
  });
}
function getLocations() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_location.php",
      dataType: "json",
      success: function (response) {
        const locs = response;
        resolve(locs);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.2");
        }
      },
    });
  });
}
function fillLocations(locs) {
  var locSelect = $("#editentryLocation");
  locSelect.empty();
  $.each(locs, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.name)
      .attr("loc-id", item.id);
    locSelect.append(option);
  });
}
//3 TYPES OF TOAST TO USE(success, error, warn)
//EXAMPLE showToast("error", "error message eto")
function showToast(type, str) {
  let toast = document.createElement("div");
  if (type === "success") {
    toast.classList.add("toasty");
    toast.classList.add("success");
    toast.innerHTML = `
    <i class='bx bx-check text-xl text-[var(--tertiary)]'></i>
  <div class="flex flex-col py-3">
    <h5 class="text-md font-semibold leading-2">Success</h5>
    <p class="text-gray-600 text-sm">${str}</p>
    <span><i class='rmvToast bx bx-x absolute top-[10px] right-[10px] text-[16px] cursor-pointer' ></i></span>
  </div>
    `;
  }
  if (type === "error") {
    toast.classList.add("toasty");
    toast.classList.add("error");
    toast.innerHTML = `
    <i class='bx bx-x text-xl text-[var(--red-color)]'></i>
  <div class="flex flex-col py-3">
    <h5 class="text-md font-semibold leading-2">Error</h5>
    <p class="text-gray-600 text-sm">${str}</p>
    <span><i class='rmvToast bx bx-x absolute top-[10px] right-[10px] text-[16px] cursor-pointer' ></i></span>
  </div>
    `;
  }
  if (type === "warn") {
    toast.classList.add("toasty");
    toast.classList.add("warn");
    toast.innerHTML = `
    <i class='bx bx-info-circle text-lg text-[#ffaa33]'></i>
    <div class="flex flex-col py-3">
      <h5 class="text-md font-semibold leading-2">Warning</h5>
      <p class="text-gray-600 text-sm">${str}</p>
      <span><i class='rmvToast bx bx-x absolute top-[10px] right-[10px] text-[16px] cursor-pointer' ></i></span>
    </div>
      `;
  }
  $(".toastBox").append(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
function getWorkHistory() {
  return new Promise((resolve, reject) => {
    if (empID === undefined) {
      resolve([]);
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
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching work history.");
        }
      },
    });
  });
}
function fillWorkHistory(wList) {
  let tableBody = $("#wList");
  let count = 0;
  tableBody.empty();
  if (wList.length === 0) {
    let noDataRow = $(
      "<tr><td colspan='10' class='text-center'>No data found</td></tr>"
    );
    tableBody.append(noDataRow);
    let addDataRow = $(
      "<tr> <td colspan='10' class='add-work text-center'> + Add New Item</td></tr>"
    );
    tableBody.append(addDataRow);
  } else {
    $.each(wList, function (index, item) {
      if (item.end_year == 0) {
        item.end_year = null;
      }
      if (item.end_month == 0) {
        item.end_month = null;
      }
      let row = $(`<tr wh-id=${item.id}>`);
      row.append(`<td data-exclude='true'>${index + 1}</td>`);
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.start_year}</td>`
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.start_month}</td>`
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${
          item.end_year ? item.end_year : ""
        }</td>`
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${
          item.end_month ? item.end_month : ""
        }</td>`
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.comp_name}</td>`
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.comp_business}</td>`
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.business_cont}</td>`
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.work_loc}</td>`
      );

      row.append(`<td data-exclude='true'>
          <div class="d-flex gap-2">
            <button
              class="btn-edit-work"
              title="Edit Work Entry"
              
            >
            <i class='bx bxs-edit fs-5' ></i>
            </button>
            <button
              class="btn-delete-work"
              title="Delete Work Entry"
              data-bs-toggle="modal"
              data-bs-target="#deleteWorkHistory"
            >
              <i class="bx bx-trash fs-5"></i>
            </button>
          </div></td>`);

      tableBody.append(row);
      count++;
    });
    if (count < 3) {
      let addDataRow = $(
        "<tr> <td colspan='10' class='add-work text-center'> + Add New Item</td></tr>"
      );
      tableBody.append(addDataRow);
    }
  }
}
function removeOutline() {
  $("#edit-companyName").removeClass("bg-red-100  border-red-400");
  $("#edit-StartMonthYear").removeClass("bg-red-100  border-red-400");
  $("#edit-EndMonthYear").removeClass("bg-red-100  border-red-400");
  $("#edit-companyBusiness").removeClass("bg-red-100  border-red-400");
  $("#edit-businessContent").removeClass("bg-red-100  border-red-400");
  $("#edit-workLocation").removeClass("bg-red-100  border-red-400");
  $("#addcompanyName").removeClass("bg-red-100  border-red-400");
  $("#addStartMonthYear").removeClass("bg-red-100  border-red-400");
  $("#addEndMonthYear").removeClass("bg-red-100  border-red-400");
  $("#addcompanyBusiness").removeClass("bg-red-100  border-red-400");
  $("#addbusinessContent").removeClass("bg-red-100  border-red-400");
  $("#addworkLocation").removeClass("bg-red-100  border-red-400");
}
function clearAddWorkInputs() {
  $(
    "#addcompanyName, #addStartMonthYear, #addEndMonthYear, #addcompanyBusiness, #addbusinessContent, #addworkLocation"
  ).removeClass("bg-red-100  border-red-400");
  $(
    "#addcompanyName, #addStartMonthYear, #addEndMonthYear, #addcompanyBusiness, #addbusinessContent, #addworkLocation"
  ).val("");
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
        "Invalid Date. End date must not be earlier than Start date."
      );
      reject("Invalid Date. End date must not be earlier than Start date.");
      return;
    }
    if (errcount > 0) {
      reject("Complete all fields.");
      return;
    }
    $.ajax({
      type: "POST",
      url: "php/insert_work_history.php",
      data: {
        empID: empID,
        comp_name: comp_name,
        date_monthYearStart: startMonthYear,
        date_monthYearEnd: endMonthYear,
        comp_business: comp_business,
        business_cont: business_cont,
        work_loc: work_loc,
      },
      dataType: "json",
      success: function (response) {
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while inserting work history.");
        }
      },
    });
  });
}
function deleteWork() {
  const delWorkID = $("#storeWorkId").attr("del-work-id");
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/delete_work_history.php",
      dataType: "json",
      data: {
        work_histID: delWorkID,
      },
      success: function (response) {
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject(
            "An unspecified error occurred while deleting dispatch history."
          );
        }
      },
    });
  });
}
function getEditWorkHistDetails(editworkID) {
  const editItem = wHistory.find((item) => parseInt(item.id) === editworkID);
  var st_year = editItem["start_year"];
  var st_month = editItem["start_month"];
  var end_year = editItem["end_year"];
  var end_month = editItem["end_month"];
  var comp_name = editItem["comp_name"];
  var comp_business = editItem["comp_business"];
  var business_cont = editItem["business_cont"];
  var work_loc = editItem["work_loc"];
  let newStMonth = "";
  let newEndMonth = "";

  if (st_month < 10) {
    newStMonth = "0" + st_month;
  } else {
    newStMonth = st_month;
  }
  if (end_month < 10) {
    newEndMonth = "0" + end_month;
  } else {
    newEndMonth = end_month;
  }
  const stMonthYear = `${st_year}-${newStMonth}`;
  const endMonthYear = `${end_year}-${newEndMonth}`;
  $("#edit-StartMonthYear").val(stMonthYear);
  $("#edit-EndMonthYear").val(endMonthYear);
  $("#edit-companyName").val(comp_name);
  $("#edit-companyBusiness").val(comp_business);
  $("#edit-businessContent").val(business_cont);
  $("#edit-workLocation").val(work_loc);
}
function saveEditWorkHistEntry() {
  var startMonthYear = $("#edit-StartMonthYear").val();
  var endMonthYear = $("#edit-EndMonthYear").val();
  var compName = $("#edit-companyName").val();
  var compBusiness = $("#edit-companyBusiness").val();
  var businesscont = $("#edit-businessContent").val();
  var workloc = $("#edit-workLocation").val();
  // const empID = $("#empSel").find("option:selected").attr("emp-id");
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
        "Invalid Date. End date must not be earlier than Start date."
      );
      reject("Invalid Date. End date must not be earlier than Start date.");
      return;
    }
    if (errcount > 0) {
      reject("Complete all fields");
      return;
    }
    $.ajax({
      type: "POST",
      url: "php/update_work_history.php",
      data: {
        date_monthYearStart: startMonthYear,
        date_monthYearEnd: endMonthYear,
        comp_name: compName,
        comp_business: compBusiness,
        business_cont: businesscont,
        work_loc: workloc,
        work_histID: editID,
      },
      dataType: "json",
      success: function (response) {
        const res = response;
        resolve(res);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while updating dispatch data.");
        }
      },
    });
  });
}
//#endregion
