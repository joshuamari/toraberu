//#region APP
function initApp() {
  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      if (!emp.success) {
        alert(emp.message);
        window.location.href = `${rootFolder}`;
        return;
      }

      empDetails = emp.data;
      fillEmployeeDetails();

      getGroups()
        .then((grps) => {
          fillGroups(grps.data);

          getEmployees()
            .then((emps) => {
              empList = emps.data;
              fillEmployees(empList);
            })
            .catch((error) => {
              alert(`${error}`);
            });
        })
        .catch((error) => {
          alert(`${error}`);
        });
    })
    .catch((error) => {
      alert(`${error}`);
    });
}
//#endregion