//#region EVENTS
function bindEvents() {
  $(document).on("change", "#grpSel", function () {
    getEmployees().then((emps) => {
      fillEmployees(emps);
    });
  });

  $(document).on("click", ".btn-close", function () {
    $(this).closest(".modal").find("input").attr("disabled", true);
    $("#btn-saveEntry").attr("e-id", 0);
  });

  $(document).on("click", ".btn-cancel", function () {
    $(this).closest(".modal").find(".btn-close").click();
  });

  $(document).on("change", ".ddates", function () {
    var startD = $("#startDate").val();
    var endD = $("#endDate").val();

    if (!startD || !endD) {
      return;
    }

    countDays(startD, endD)
      .then((cd) => {
        displayDays(cd);
        countTotal();
      })
      .catch((error) => {
        alert(`${error}`);
      });
  });

  $(document).on("change", "#empSel", function () {
    toggleLoadingAnimation(true);
    Promise.all([
      getPassport(),
      getVisa(),
      getDispatchHistory(),
      getDispatchDays(),
      getYearly(),
    ])
      .then(([pass, vsa, dlst, dd, yrl]) => {
        fillPassport(pass);
        fillVisa(vsa);
        dispatch_days = dd;
        dHistory = dlst;
        fillHistory(dHistory);
        countTotal();
        fillYearly(yrl);
        toggleLoadingAnimation(false);
      })
      .catch((error) => {
        alert(`${error}`);
        toggleLoadingAnimation(false);
      });

    if ($(this).val() === 0) {
      $("#empDetails__name").text("");
      $(".emptyState").removeClass("d-none");
      $(".withContent").addClass("d-none");
    } else {
      const empID = $("#empSel").find("option:selected").attr("emp-id");
      $("#empDetails__id").text(empID);
      $("#empDetails__name").text($("#empSel option:selected").text());
      $(".emptyState").addClass("d-none");
      $(".withContent").removeClass("d-none");
    }
  });

  $(document).on("change", "#dToggle", function () {
    getDispatchHistory()
      .then((dlst) => {
        dHistory = dlst;
        fillHistory(dHistory);
      })
      .catch((error) => {
        alert(`${error}`);
      });
  });

  $(document).on("click", "#btnApply", function () {
    insertDispatch();
  });

  $(document).on("click", ".btn-clear", function () {
    dispatch_days = 0;
    clearInput();
    $(".emptyState").removeClass("d-none");
    $(".withContent").addClass("d-none");
  });

  $(document).on("click", ".btn-delete", function () {
    var num = $(this).closest("tr").find("td:first-of-type").html();
    var trID = $(this).closest("tr").attr("d-id");
    $("#storeId").html(num);
    $("#storeId").attr("del-id", trID);
  });

  $(document).on("click", "#btn-deleteEntry", function () {
    deleteDispatch();
  });

  $(document).on("click", "#updateEmp", function () {
    const empID = $("#empSel").find("option:selected").attr("emp-id");
    if (!empID) {
      return;
    } else {
      window.location.href = `../empDetails?id=${empID}`;
    }
  });

  $(document).on("click", "#btn-saveEntry", function () {
    saveEditEntry();
  });

  $(document).on("change", ".edit-date", function () {
    computeTotalDays();
  });

  $(document).on("change", "#editentryDateP", function () {
    $("#editentryDateJ").attr("max", $(this).val());
  });

  $(document).on("change", "#editentryDateJ", function () {
    $("#editentryDateP").attr("min", $(this).val());
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

  $(document).on(
    "click",
    "#grpSel, #empSel, #locSel, #startDate, #endDate",
    function () {
      $(this).removeClass("bg-red-100  border-red-400");
      $(".errTxt").remove();
    },
  );

  $(document).on("change", "#startDate", function () {
    const sdate = $(this).val();
    $("#endDate").attr("min", sdate);
  });
}
//#endregion
