//#region EVENTS
function bindEvents() {
  $(document).on("click", ".seeMore", function () {
    const empID = $(this).attr("id");
    window.location.href = `../empDetails?id=${empID}`;
  });

  $(document).on("change", "#grpSel", function () {
    getEmployees()
      .then((emps) => {
        empList = emps;
        searchEmployee(empList);
      })
      .catch((error) => {
        alert(`${error}`);
      });
  });

  $(document).on("input", "#empSearch", function () {
    searchEmployee(empList);
  });

  $(document).on("click", ".sortEmpNum", function () {
    toggleSortNum();
  });

  $(document).on("click", ".sortEmpName", function () {
    toggleSortName();
  });

  $(document).on("click", "#portalBtn", function () {
    window.location.href = `${rootFolder}`;
  });
}
//#endregion