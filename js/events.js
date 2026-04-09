//#region EVENTS
function bindEvents() {
  $(document).on("click", ".rowEmp", function () {
    if (editAccess) {
      var empID = $(this).attr("emp-id");
      window.location.href = `./empDetails?id=${empID}`;
    }
  });

  $(document).on("click", "#portalBtn", function () {
    window.location.href = `${rootFolder}`;
  });
}
//#endregion