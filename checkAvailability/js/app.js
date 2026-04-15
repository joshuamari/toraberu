function initApp() {
  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      if (!emp.success) {
        alert(emp.message);
        window.location.href = `${rootFolder}`;
        throw new Error("Access denied");
      }

      empDetails = emp.data;
      fillEmployeeDetails();
      getYears();

      return getGroups();
    })
    .then((grps) => {
      fillGroups(grps.data);

      return Promise.all([
        getEmployees(),
        getLocations(),
      ]);
    })
    .then(([emps, locs]) => {
      editAccess = empDetails.permissions.hasEdit;

      fillEmployees(emps);
      fillLocations(locs);

      if (editAccess === false) {
        $("#updateEmp").remove();
      }
    })
    .catch((error) => {
      if (error.message !== "Access denied") {
        alert(`${error}`);
      }
    });
}