function bindEvents() {
  $(document).on("change", "#grpSel", function () {
    var sel = $("#grpSel option:selected").text();
    var grphl = $(this).val().split(",").length;
    var grp = $(this).val();

    if (grphl === 1) {
      $(this).addClass("active");
      filterVar.group = grp;
    } else {
      $(this).removeClass("active");
      filterVar.group = null;
    }

    $(".grpCont").html(
      `<i class='bx bx-group'></i>
      <span id="lblGrp">${sel}</span>
      <i class='bx bx-x text-[18px] ml-3 z-[100]' id="removeGroup"></i>`,
    );

    toggleLoadingAnimation(true);
    searchFilter(reqList);
    toggleLoadingAnimation(false);
  });

  $(document).on("click", "#removeGroup", function () {
    $("#grpSel").removeClass("active");
    $(".grpCont").html(
      `   <i class='bx bx-group'></i>
        <span id="lblGrp">All Groups</span>
        <i class='bx bx-chevron-down text-[18px] ml-3'></i>`,
    );
    $("#grpSel").val($("#grpSel option:first").val());
    $("#grpSel").change();
  });

  $(document).on("input", "#monthSel", function () {
    var [year, month] = $(this).val().split("-");
    $(this).removeClass("active");
    var monthName = monthNames[parseInt(month) - 1];
    let display = `Requested Month`;
    let iClass = `<i class='bx bx-chevron-down text-[18px] ml-3'></i>`;

    if (monthName) {
      $(this).addClass("active");
      display = `${monthName} ${year}`;
      iClass = `<i class='bx bx-x text-[18px] ml-3 z-[100]' id="removeMonth"></i>`;
    }

    $(".monthCont").html(`<i class='bx bx-calendar'></i>
                      <span class="" id="monthLabel">${display}</span>
                      ${iClass}
                      `);
    searchFilter(reqList);
  });

  $(document).on("click", "#removeMonth", function () {
    $("#monthSel").removeClass("active");
    $(".monthCont").html(`<i class='bx bx-calendar'></i>
    <span class="" id="monthLabel">Requested Month</span>
    <i class='bx bx-chevron-down text-[18px] ml-3'></i>
    `);
    $("#monthSel").val("");
    searchFilter(reqList);
  });

  $(document).on("click", "#portalBtn", function () {
    window.location.href = `${rootFolder}`;
  });

  $(document).on("click", ".tab", function () {
    var indicator = document.querySelector(".indicator");
    var $this = $(this);
    var rect = $this[0].getBoundingClientRect();
    var parentRect = $this.parent()[0].getBoundingClientRect();

    indicator.style.width = rect.width + "px";
    indicator.style.left = rect.left - parentRect.left + "px";

    $(".tab p").removeClass("font-semibold text-[var(--dark)] active");
    $(this).find("p").addClass("font-semibold text-[var(--dark)] active");
    searchFilter(reqList);
  });

  $(document).on("click", ".tab-datechange", function () {
    var indicator = document.querySelector(".indicator-datechange");
    var $this = $(this);
    var rect = $this[0].getBoundingClientRect();
    var parentRect = $this.parent()[0].getBoundingClientRect();

    indicator.style.width = rect.width + "px";
    indicator.style.left = rect.left - parentRect.left + "px";

    $(".tab-datechange p").removeClass(
      "font-semibold text-[var(--dark)] active",
    );
    $(this).find("p").addClass("font-semibold text-[var(--dark)] active");
    searchFilter(reqList);
  });

  $(document).on("click", ".mainTable tr", function () {
    var rowID = $(this).closest("tr").attr("req-id");
    fillOpenModal(rowID);
    getRequestData(rowID)
      .then((res) => {
        if (res.isSuccess) {
          printData = res.data;
        }
      })
      .catch((error) => {
        alert(`Error: ${error}`);
      });
  });
  $(document).on("click", ".mainTable-datechange tr", function () {
    var rowID = $(this).closest("tr").attr("req-id");
    fillChangeDateModal(1);
  });

  $(document).on("click", "#openModal .btn-close", function () {
    $("#openModal").modal("hide");
  });
  $(document).on("input", "#searchbar", function () {
    searchFilter(reqList);
  });

  $(document).on("click", "#sortDate", function () {
    sortDateAsc = !sortDateAsc;
    searchFilter(reqList);
  });
}

//#region confirmation modal
$(document).on("click", "#btnApproveDateChange", function () {
  pendingDateChangeAction = "approve";

  $("#confirmActionTitle").text("Confirm Approval");
  $("#confirmActionHeading").text("Approve this date change request?");
  $("#confirmActionMessage").text(
    "This will update the original approved dispatch dates to the newly proposed schedule.",
  );

  $("#confirmRequestId").text($("#modalOriginalRequestId").text());
  $("#confirmEmpName").text($("#modalDCEmpName").text());
  $("#confirmDateChangeRange").text(
    `${$("#modalOldDateFrom").text()} - ${$("#modalOldDateTo").text()} → ${$("#modalNewDateFrom").text()} - ${$("#modalNewDateTo").text()}`,
  );
  $("#confirmNetChange")
    .text(`${$("#modalSymbol").text()}${$("#modalTotalDiff").text()} days`)
    .removeClass("text-[var(--red-200)]")
    .addClass("text-[var(--tertiary)]");

  $("#confirmActionIconWrap")
    .removeClass("bg-[var(--red-100)]")
    .addClass("bg-[var(--main)]");
  $("#confirmActionIcon")
    .removeClass("bx-x text-[var(--red-200)]")
    .addClass("bx-check text-[var(--tertiary)]");

  $("#confirmActionFooterText").text(
    "Once approved, the original dispatch dates will be updated.",
  );
  $("#btnConfirmDateChangeAction")
    .text("Approve Change")
    .removeClass("bg-[var(--red-200)] hover:bg-[var(--red-color)]")
    .addClass("bg-[var(--tertiary)] hover:bg-[var(--darkest)]");

  $("#confirmActionNoteWrap").addClass("hidden");

  $("#dateChangeModal").modal("hide");
  $("#confirmDateChangeActionModal").modal("show");
});

$(document).on("click", "#btnDenyDateChange", function () {
  pendingDateChangeAction = "deny";

  $("#confirmActionTitle").text("Confirm Denial");
  $("#confirmActionHeading").text("Deny this date change request?");
  $("#confirmActionMessage").text(
    "This will keep the current approved dispatch dates unchanged.",
  );

  $("#confirmRequestId").text($("#modalOriginalRequestId").text());
  $("#confirmEmpName").text($("#modalEmpName").text());
  $("#confirmDateChangeRange").text(
    `${$("#modalOldDateFrom").text()} - ${$("#modalOldDateTo").text()} → ${$("#modalNewDateFrom").text()} - ${$("#modalNewDateTo").text()}`,
  );
  $("#confirmNetChange")
    .text(`${$("#modalSymbol").text()}${$("#modalTotalDiff").text()} days`)
    .removeClass("text-[var(--tertiary)]")
    .addClass("text-[var(--red-200)]");

  $("#confirmActionIconWrap")
    .removeClass("bg-[var(--main)]")
    .addClass("bg-[var(--red-100)]");
  $("#confirmActionIcon")
    .removeClass("bx-check text-[var(--tertiary)]")
    .addClass("bx-x text-[var(--red-200)]");

  $("#confirmActionFooterText").text(
    "Once denied, the proposed date change request will not be applied.",
  );
  $("#btnConfirmDateChangeAction")
    .text("Deny Request")
    .removeClass("bg-[var(--tertiary)] hover:bg-[var(--darkest)]")
    .addClass("bg-[var(--red-200)] hover:bg-[var(--red-color)]");

  $("#confirmActionNoteWrap").addClass("hidden");

  $("#dateChangeModal").modal("hide");
  $("#confirmDateChangeActionModal").modal("show");
});

$(document).on("hidden.bs.modal", "#confirmDateChangeActionModal", function () {
  if ($("#dateChangeModal").data("keep-closed") !== true) {
    $("#dateChangeModal").modal("show");
  }
});

$(document).on("click", "#btnConfirmDateChangeAction", function () {
  if (pendingDateChangeAction === "approve") {
    // call your approve API here
    console.log("APPROVE DATE CHANGE");
  }

  if (pendingDateChangeAction === "deny") {
    // call your deny API here
    console.log("DENY DATE CHANGE");
  }

  $("#dateChangeModal").data("keep-closed", true);
  $("#confirmDateChangeActionModal").modal("hide");
});
//#endregion
