//#region APP
function initApp() {
  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      if (!emp.isSuccess) {
        alert(emp.message);
        window.location.href = `${rootFolder}`;
        return;
      }

      empDetails = emp.data;
      fillEmployeeDetails();

      getGroups()
        .then((grps) => {
          fillGroups(grps);

          getEmployees()
            .then((emps) => {
              empList = emps;
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