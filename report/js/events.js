//#region EVENTS
function bindEvents() {
  $(document).on("change", "#grpSel", function () {
    toggleLoadingAnimation(true);

    getReport()
      .then((rep) => {
        createTable(rep);
        toggleLoadingAnimation(false);
      })
      .catch((error) => {
        toggleLoadingAnimation(false);
        alert(`${error}`);
      });
  });

  $(document).on("change", "#yearSel", function () {
    toggleLoadingAnimation(true);
    $("#selectedYear").text($(this).val());

    getReport()
      .then((rep) => {
        createTable(rep);
        toggleLoadingAnimation(false);
      })
      .catch((error) => {
        toggleLoadingAnimation(false);
        alert(`${error}`);
      });
  });

  $(document).on("click", "#btnExport", function () {
    exportTable();
  });

  $(document).on("click", "#portalBtn", function () {
    window.location.href = `${rootFolder}`;
  });
}
//#endregion