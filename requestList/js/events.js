//#region EVENTS
function bindEvents() {
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

  $(document).on("click", ".mainTable tr", function () {
    var rowID = $(this).closest("tr").attr("req-id");
    fillOpenModal(rowID);
    getRequestData(rowID)
      .then((res) => {
        if (res.success) {
          printData = res.data;
          console.log(res)
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
              reqList = reqs["data"];
              cardData = counts;
              fillCards();
              searchFilter(reqList);
              $(".btn-reject").prop("disabled", false);
              $(".btn-accept").prop("disabled", false);
              $(".btn-reject").html(`Cancel`);
              $(".btn-accept").html(`Accept`);
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
    Cancelling...`);
  });

  $(document).on("click", ".btn-accept", function () {
    $(".statusBtn").prop("disabled", true);
    $(this).html(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[var(--dark)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
Accepting...`);
  });
}
//#endregion