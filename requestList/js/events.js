//#region EVENTS
function bindEvents() {
  bindChangeRequestEvents();

  $(document).on("input", "#search-bar", function () {
    searchEmployee();
  });

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
      <i class='bx bx-x text-[18px] ml-3 z-[100]' id="removeGroup"></i>`
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
        <i class='bx bx-chevron-down text-[18px] ml-3'></i>`
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

  $(document).on("click", "#dispatch-status-filter .tab", function () {
    setActiveDispatchStatusTab($(this));
    searchFilter(reqList);
  });

  $(document).on("click", ".mainTable tr", function () {
    var rowID = $(this).closest("tr").attr("req-id");
    fillOpenModal(rowID);
    getRequestData(rowID)
      .then((res) => {
        if (res.success) {
          printData = res.data;
          applyRequestDetailStatusToList(rowID, res.data);
          fillOpenModal(rowID);
          searchFilter(reqList);
        }
      })
      .catch((error) => {
        alert(`Error: ${error}`);
      });
  });

  $(document).on("click", "#openModal .btn-close", function () {
    $("#openModal").modal("hide");
  });

  $(document).on("click", "#attachment", function () {
    fillAttachment(printData);
    $("#openModal .btn-close").click();
    $("#attachmentModal").modal("show");
  });

  $(document).on("click", "#attachment2", function () {
    fillAttachment2(printData);
    $("#openModal .btn-close").click();
    $("#attachmentModal2").modal("show");
  });

  $(document).on("click", "#btnBack", function () {
    $("#attachmentModal .btn-close").click();
    $("#openModal").modal("show");
  });

  $(document).on("click", "#btnBack2", function () {
    $("#attachmentModal2 .btn-close").click();
    $("#openModal").modal("show");
  });

  $(document).on("click", "#btnPrint", function () {
    saveToPDF();
  });

  $(document).on("click", "#btnPrint2", function () {
    saveToPDF2();
  });

  $(document).on("input", "#searchbar", function () {
    searchFilter(reqList);
  });

  $(document).on("click", "#sortDate", function () {
    sortDateAsc = !sortDateAsc;
    searchFilter(reqList);
  });

  $(document).on("click", ".statusBtn", function () {
    const stat = parseInt($(this).attr("stat-id"));

    updateStatus(stat)
      .then((res) => {
        if (res.success) {
          Promise.all([getRequests(), getCount()])
            .then(([reqs, counts]) => {
              reqList = syncRequestListStatusFields(reqs["data"]);
              cardData = counts["data"];
              fillCards();
              searchFilter(reqList);
              $(".btn-reject").prop("disabled", false);
              $(".btn-accept").prop("disabled", false);
              $(".btn-reject").html(`Decline Request`);
              $(".btn-accept").html(`Approve Request`);
            })
            .catch((error) => {
              alert(`Error: ${error}`);
            });

          $("#openModal .btn-close").click();
        }
      })
      .catch((error) => {
        alert(`Error: ${error}`);
      });
  });

  $(document).on("click", ".btn-reject", function () {
    $(".statusBtn").prop("disabled", true);
    $(this).html(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25 text-slate-200" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-100 text-white" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Declining...`);
  });

  $(document).on("click", ".btn-accept", function () {
    $(".statusBtn").prop("disabled", true);
    $(this).html(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--dark)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
Approving...`);
  });

  bindStatusGuideEvents();
  bindRequestListPaginationEvents();
}

function bindRequestListPaginationEvents() {
  $(document)
    .off("click.requestPagination", '[data-pagination="requests"] [data-role="prev"]')
    .on(
      "click.requestPagination",
      '[data-pagination="requests"] [data-role="prev"]',
      function () {
        if ($(this).prop("disabled") || requestCurrentPage <= 1) {
          return;
        }
        requestCurrentPage -= 1;
        renderRequestListPage();
      },
    );

  $(document)
    .off("click.requestPagination", '[data-pagination="requests"] [data-role="next"]')
    .on(
      "click.requestPagination",
      '[data-pagination="requests"] [data-role="next"]',
      function () {
        if ($(this).prop("disabled")) {
          return;
        }

        const totalPages = Math.max(
          1,
          Math.ceil(filteredRequestList.length / REQUEST_ITEMS_PER_PAGE),
        );

        if (requestCurrentPage < totalPages) {
          requestCurrentPage += 1;
          renderRequestListPage();
        }
      },
    );

  $(document)
    .off(
      "click.requestPagination",
      '[data-pagination="requests"] [data-role="pages"] .table-pagination__page',
    )
    .on(
      "click.requestPagination",
      '[data-pagination="requests"] [data-role="pages"] .table-pagination__page',
      function () {
        const page = Number($(this).data("page"));
        if (!page || $(this).hasClass("is-active")) {
          return;
        }
        requestCurrentPage = page;
        renderRequestListPage();
      },
    );
}

function isStatusGuideOpen() {
  const popover = document.getElementById("statusGuidePopover");
  return Boolean(popover && !popover.classList.contains("d-none"));
}

function setStatusGuideOpen(isOpen) {
  const button = document.getElementById("dispatch-status-guide-trigger");
  const popover = document.getElementById("statusGuidePopover");

  if (!button || !popover) {
    return;
  }

  button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  popover.classList.toggle("d-none", !isOpen);
  popover.hidden = !isOpen;
}

function toggleStatusGuide(forceOpen) {
  const shouldOpen =
    typeof forceOpen === "boolean" ? forceOpen : !isStatusGuideOpen();
  setStatusGuideOpen(shouldOpen);

  if (shouldOpen) {
    renderStatusGuideIcons();
  }
}

function renderStatusGuideIcons() {
  if (!window.lucide || typeof window.lucide.createIcons !== "function") {
    return;
  }

  window.lucide.createIcons({
    attrs: {
      width: 14,
      height: 14,
      "stroke-width": 2,
    },
  });
}

function bindStatusGuideEvents() {
  $(document).on("click", "#dispatch-status-guide-trigger", function (event) {
    event.preventDefault();
    event.stopPropagation();
    toggleStatusGuide();
  });

  $(document).on("click", function (event) {
    if (!isStatusGuideOpen()) {
      return;
    }

    const wrap = document.getElementById("request-status-group");
    if (wrap && wrap.contains(event.target)) {
      return;
    }

    setStatusGuideOpen(false);
  });

  $(document).on("keydown", function (event) {
    if (event.key === "Escape" && isStatusGuideOpen()) {
      setStatusGuideOpen(false);
    }
  });
}
//#endregion