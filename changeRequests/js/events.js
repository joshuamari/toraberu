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

  bindCancellationStatusTabs();
  bindDateChangeStatusTabs();
  bindDateChangeDetails();
  bindPaginationEvents();

  $(document).on("input", "#searchbar-datechange", function () {
    applyDateChangeRequestFilters();
  });

  $(document).on("change", "#grpSel-datechange", function () {
    var sel = $("#grpSel-datechange option:selected").text();
    var grphl = $(this).val().split(",").length;
    var grp = $(this).val();

    if (grphl === 1) {
      $(this).addClass("active");
    } else {
      $(this).removeClass("active");
    }

    $(".datechange-grpCont").html(
      `<i class='bx bx-group'></i>
      <span id="lblGrp-datechange">${sel}</span>
      <i class='bx bx-x text-[18px] ml-3 z-[100]' id="removeGroup-datechange"></i>`,
    );

    applyDateChangeRequestFilters();
  });

  $(document).on("click", "#removeGroup-datechange", function () {
    $("#grpSel-datechange").removeClass("active");
    $(".datechange-grpCont").html(
      `   <i class='bx bx-group'></i>
        <span id="lblGrp-datechange">All Groups</span>
        <i class='bx bx-chevron-down text-[18px] ml-3'></i>`,
    );
    $("#grpSel-datechange").val($("#grpSel-datechange option:first").val());
    $("#grpSel-datechange").change();
  });

  $(document).on("input", "#monthSel-datechange", function () {
    var [year, month] = $(this).val().split("-");
    $(this).removeClass("active");
    var monthName = monthNames[parseInt(month) - 1];
    let display = `Requested Month`;
    let iClass = `<i class='bx bx-chevron-down text-[18px] ml-3'></i>`;

    if (monthName) {
      $(this).addClass("active");
      display = `${monthName} ${year}`;
      iClass = `<i class='bx bx-x text-[18px] ml-3 z-[100]' id="removeMonth-datechange"></i>`;
    }

    $(".datechange-monthCont").html(`<i class='bx bx-calendar'></i>
                      <span id="monthLabel-datechange">${display}</span>
                      ${iClass}
                      `);
    applyDateChangeRequestFilters();
  });

  $(document).on("click", "#removeMonth-datechange", function () {
    $("#monthSel-datechange").removeClass("active");
    $(".datechange-monthCont").html(`<i class='bx bx-calendar'></i>
    <span id="monthLabel-datechange">Requested Month</span>
    <i class='bx bx-chevron-down text-[18px] ml-3'></i>
    `);
    $("#monthSel-datechange").val("");
    applyDateChangeRequestFilters();
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

  $(document).on("click", ".rmvToast", function () {
    $(this).closest(".toasty").remove();
  });
}

function bindCancellationStatusTabs() {
  $(document)
    .off("click.cancellationStatus", ".tab-cancellation")
    .on("click.cancellationStatus", ".tab-cancellation", function () {
      selectedCancellationStatus = String($(this).data("status") || "all")
        .trim()
        .toLowerCase();

      setActiveCancellationStatusTab(selectedCancellationStatus);
      searchFilter(reqList);
    });
}

function bindDateChangeStatusTabs() {
  $(document)
    .off("click.dateChangeStatus", ".tab-datechange")
    .on("click.dateChangeStatus", ".tab-datechange", function () {
      selectedDateChangeStatus = String($(this).data("status") || "all")
        .trim()
        .toLowerCase();

      setActiveDateChangeStatusTab(selectedDateChangeStatus);
      applyDateChangeRequestFilters();
    });
}

function bindDateChangeDetails() {
  $(document)
    .off("click.dateChangeRow", ".date-change-request-row")
    .on("click.dateChangeRow", ".date-change-request-row", function (event) {
      if (
        $(event.target).closest("button, a, input, select, textarea, label").length
      ) {
        return;
      }

      openDateChangeRequestByKey($(this).data("request-key"));
    });

  $(document)
    .off("click.dateChangeIcon", ".view-date-change-request")
    .on("click.dateChangeIcon", ".view-date-change-request", function (event) {
      event.preventDefault();
      event.stopPropagation();

      openDateChangeRequestByKey($(this).data("request-key"));
    });

  $(document)
    .off("keydown.dateChangeRow", ".date-change-request-row")
    .on("keydown.dateChangeRow", ".date-change-request-row", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDateChangeRequestByKey($(this).data("request-key"));
      }
    });
}

function bindPaginationEvents() {
  refreshPaginationIcons($("[data-pagination]"));

  $(document)
    .off("click.pagination", '[data-pagination] [data-role="prev"]')
    .on("click.pagination", '[data-pagination] [data-role="prev"]', function () {
      const tableKey = $(this).closest("[data-pagination]").data("pagination");

      if (tableKey === "cancellation" && cancellationCurrentPage > 1) {
        cancellationCurrentPage -= 1;
        renderCancellationRequests();
        return;
      }

      if (tableKey === "datechange" && dateChangeCurrentPage > 1) {
        dateChangeCurrentPage -= 1;
        renderDateChangeRequests();
      }
    });

  $(document)
    .off("click.pagination", '[data-pagination] [data-role="next"]')
    .on("click.pagination", '[data-pagination] [data-role="next"]', function () {
      const tableKey = $(this).closest("[data-pagination]").data("pagination");

      if (tableKey === "cancellation") {
        const totalPages = Math.max(
          1,
          Math.ceil(
            filteredCancellationRequests.length / cancellationItemsPerPage,
          ),
        );

        if (cancellationCurrentPage < totalPages) {
          cancellationCurrentPage += 1;
          renderCancellationRequests();
        }
        return;
      }

      if (tableKey === "datechange") {
        const totalPages = Math.max(
          1,
          Math.ceil(filteredDateChangeRequests.length / dateChangeItemsPerPage),
        );

        if (dateChangeCurrentPage < totalPages) {
          dateChangeCurrentPage += 1;
          renderDateChangeRequests();
        }
      }
    });

  $(document)
    .off("click.pagination", '[data-pagination] [data-role="pages"] .table-pagination__page')
    .on(
      "click.pagination",
      '[data-pagination] [data-role="pages"] .table-pagination__page',
      function () {
        const tableKey = $(this).closest("[data-pagination]").data("pagination");
        const page = Number($(this).data("page"));

        if (!page || $(this).hasClass("is-active")) {
          return;
        }

        if (tableKey === "cancellation") {
          cancellationCurrentPage = page;
          renderCancellationRequests();
          return;
        }

        if (tableKey === "datechange") {
          dateChangeCurrentPage = page;
          renderDateChangeRequests();
        }
      },
    );

  $(document)
    .off("change.pagination", '[data-pagination] [data-role="per-page"]')
    .on("change.pagination", '[data-pagination] [data-role="per-page"]', function () {
      const tableKey = $(this).closest("[data-pagination]").data("pagination");
      const itemsPerPage = Number($(this).val()) || 10;

      if (tableKey === "cancellation") {
        cancellationItemsPerPage = itemsPerPage;
        cancellationCurrentPage = 1;
        renderCancellationRequests();
        return;
      }

      if (tableKey === "datechange") {
        dateChangeItemsPerPage = itemsPerPage;
        dateChangeCurrentPage = 1;
        renderDateChangeRequests();
      }
    });
}

//#region confirmation modal
$(document).on("show.bs.modal", "#confirmDateChangeActionModal", function () {
  syncConfirmDateChangeModalFields();
});

$(document).on("click", "#confirmDateChangeOriginalDispatchIdBtn", function () {
  const requestId = $(this).attr("data-request-id");

  if (!requestId) {
    console.error("Missing original request id on confirm date change modal button");
    return;
  }

  window.location.href = `../requestList/?open_request=${encodeURIComponent(requestId)}`;
});

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
    .removeClass("text-rose-500")
    .addClass("text-green-500");

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
    .removeClass("bg-rose-500 hover:bg-rose-600 text-white")
    .addClass(" bg-green-400 hover:bg-green-500");

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
    .removeClass(" bg-green-400 hover:bg-green-500")
    .addClass("bg-rose-500 hover:bg-rose-600 text-white");

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
  const changeRequestId = $("#dateChangeModal").data("active-request-id");
  const action = pendingDateChangeAction;

  if (!changeRequestId || (action !== "approve" && action !== "deny")) {
    showToast("error", "Missing change request details.");
    return;
  }

  const $btn = $(this);
  const $modal = $("#confirmDateChangeActionModal");
  const restoreLabel =
    action === "approve" ? "Approve Change" : "Deny Request";
  setConfirmActionButtonLoading($btn, action);
  setConfirmModalControlsDisabled($modal, true);

  updateChangeRequestStatus(changeRequestId, action)
    .then(() => refreshChangeRequests())
    .then(() => {
      $("#dateChangeModal").data("keep-closed", true);
      $("#confirmDateChangeActionModal").modal("hide");
      showToast(
        "success",
        action === "approve"
          ? "Date change request approved."
          : "Date change request declined.",
      );
    })
    .catch((error) => {
      showToast("error", error || "Failed to update date change request.");
    })
    .finally(() => {
      setConfirmModalControlsDisabled($modal, false);
      $btn.prop("disabled", false).text(restoreLabel);
      pendingDateChangeAction = null;
    });
});

$(document).on("click", "#cancelModalRequestIdBtn", function () {
  const requestId = $(this).attr("data-request-id");

  if (!requestId) {
    console.error("Missing original request id on cancellation modal button");
    return;
  }

  window.location.href = `../requestList/?open_request=${encodeURIComponent(requestId)}`;
});

$(document).on("click", "#confirmCancelOriginalDispatchIdBtn", function () {
  const requestId = $(this).attr("data-request-id");

  if (!requestId) {
    console.error("Missing original request id on confirm cancellation modal button");
    return;
  }

  window.location.href = `../requestList/?open_request=${encodeURIComponent(requestId)}`;
});
$(document).on("click", "#changeModalRequestIdBtn", function () {
  const requestId = $(this).attr("data-request-id");

  if (!requestId) {
    console.error("Missing original request id on date change modal button");
    return;
  }

  window.location.href = `../requestList/?open_request=${encodeURIComponent(requestId)}`;
});
$(document).on("click", "#btnApproveCancellation", function () {
  openCancellationConfirmModal("approve");
});

$(document).on("click", "#btnDenyCancellation", function () {
  openCancellationConfirmModal("deny");
});

$(document).on("click", "#btnConfirmCancellationAction", function () {
  const changeRequestId = $("#openModal").data("active-request-id");
  const action = pendingCancellationAction;

  if (!changeRequestId || (action !== "approve" && action !== "deny")) {
    showToast("error", "Missing change request details.");
    return;
  }

  const $btn = $(this);
  const $modal = $("#confirmCancellationActionModal");
  const restoreLabel =
    action === "approve" ? "Approve Cancellation" : "Deny Request";
  setConfirmActionButtonLoading($btn, action);
  setConfirmModalControlsDisabled($modal, true);

  updateChangeRequestStatus(changeRequestId, action)
    .then(() => refreshChangeRequests())
    .then(() => {
      const confirmModal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("confirmCancellationActionModal"),
      );
      confirmModal.hide();
      $("#openModal").modal("hide");
      showToast(
        "success",
        action === "approve"
          ? "Cancellation request approved."
          : "Cancellation request declined.",
      );
    })
    .catch((error) => {
      showToast("error", error || "Failed to update cancellation request.");
    })
    .finally(() => {
      setConfirmModalControlsDisabled($modal, false);
      $btn.prop("disabled", false).text(restoreLabel);
      pendingCancellationAction = null;
    });
});
$(document).on("click", "#btnBackToCancellationModal", function () {
  document.activeElement.blur();

  const confirmModal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("confirmCancellationActionModal"),
  );

  const parentModal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("openModal"),
  );

  confirmModal.hide();

  $("#confirmCancellationActionModal").one("hidden.bs.modal", function () {
    parentModal.show();
  });
});

$(document).on("click", "#btnCloseConfirmCancelModal", function () {
  document.activeElement.blur();

  const confirmModal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("confirmCancellationActionModal"),
  );

  const parentModal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("openModal"),
  );

  confirmModal.hide();

  $("#confirmCancellationActionModal").one("hidden.bs.modal", function () {
    parentModal.show();
  });
});
//#endregion
