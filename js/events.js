//#region EVENTS
function bindEvents() {
  $(document).on("click", ".rowEmp", function () {
    if (!editAccess) return;

    const empID = $(this).data("emp-id");

    if (!empID) {
      console.warn("rowEmp clicked but emp-id is missing");
      return;
    }

    window.location.href = `./empDetails?id=${empID}`;
  });

  $(document).on("click", "#portalBtn", function () {
    window.location.href = `${rootFolder}`;
  });
}
//#endregion