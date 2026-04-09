//#region APP
function initApp() {
  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      if (emp.isSuccess) {
        empDetails = emp.data;
        fillEmployeeDetails();
        getYears();

        return getGroups()
          .then((grps) => {
            fillGroups(grps);
            return Promise.all([
              getEmployees(),
              getLocations(),
              checkEditAccess(),
            ]);
          })
          .then(([emps, locs, eAccess]) => {
            editAccess = eAccess;
            fillEmployees(emps);
            fillLocations(locs);
            if (eAccess === false) {
              $("#updateEmp").remove();
            }
          });
      } else {
        alert(emp.message);
        window.location.href = `${rootFolder}`;
      }
    })
    .catch((error) => {
      alert(`${error}`);
    });
}
//#endregion
