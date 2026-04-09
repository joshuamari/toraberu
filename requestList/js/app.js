//#region APP
function initApp() {
  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      if (emp.isSuccess) {
        empDetails = emp.data;
        reqAccess = empDetails["request"];

        if (!reqAccess) {
          alert("Access Denied");
          window.location.href = `${rootFolder}/PCS`;
          return Promise.reject("Access Denied");
        }

        fillEmployeeDetails();

        return Promise.all([
          getGroups(),
          getRequests(),
          getCount(),
          getPresID(),
        ]);
      } else {
        alert(emp.message);
        window.location.href = `${rootFolder}`;
        return Promise.reject(emp.message);
      }
    })
    .then(([grps, reqs, counts, pres]) => {
      groupList = grps;
      fillGroups(groupList);
      reqList = reqs["data"];
      cardData = counts;
      presID = pres["data"];
      fillCards();
      $(".tab")[0].click();
    })
    .catch((error) => {
      if (error !== "Access Denied") {
        alert(`${error}`);
      }
    });
}
//#endregion
