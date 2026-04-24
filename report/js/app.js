//#region APP
function initApp() {
  checkAccess()
    .then((emp) => {
      if (!emp.success) {
        alert(emp.message);
        window.location.href = `${rootFolder}`;
        throw new Error("Access denied");
      }

      empDetails = emp.data;
      fillEmployeeDetails();

      return Promise.all([getGroups(), getYear()]);
    })
    .then(([grps, yr]) => {
      groupList = grps;
      fillYear(yr);
      fillGroups(groupList);

      return getReport();
    })
    .then((rep) => {
      createTable(rep);
    })
    .catch((error) => {
      if (error.message !== "Access denied") {
        alert(`${error}`);
      }
    });
}
//#endregion