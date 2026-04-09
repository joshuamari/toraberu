//#region EVENTS
function bindEvents() {
  $(document).on("click", ".table-titles .title.first", function () {
    $(".table-titles .title.second, .table-two").removeClass("active");
    $(this).addClass("active");
    $(".table-one").addClass("active");
  });

  $(document).on("click", ".table-titles .title.second", function () {
    $(".table-titles .title.second, .table-two").addClass("active");
    $(".table-titles .title.first, .table-one").removeClass("active");
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
            })
            .catch((error) => {
              alert(`${error}`);
            });
          getPassport(false)
            .then((pport) => {
              userPassI = pport;
              passportInput(userPassI);
              resetPassInput();
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
            })
            .catch((error) => {
              alert(`${error}`);
            });
          getVisa(false)
            .then((vsa) => {
              userVisaI = vsa;
              visaInput(userVisaI);
              resetVisaInput();
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
      "#addcompanyName, #addStartMonthYear, #addEndMonthYear, #addcompanyBusiness, #addbusinessContent, #addworkLocation",
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
    },
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
      "#edit-companyName, #edit-StartMonthYear, #edit-EndMonthYear, #edit-companyBusiness, #edit-businessContent, #edit-workLocation",
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
    },
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
}
//#endregion
