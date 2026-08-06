//#region APP
function initApp() {
  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      if (emp.success) {
        empDetails = emp.data;
        reqAccess = empDetails.permissions.hasRequestListAccess;

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
          getHeader(),
        ]);
      } else {
        alert(emp.message);
        window.location.href = `${rootFolder}`;
        return Promise.reject(emp.message);
      }
    })
    .then(([grps, reqs, counts, pres, header]) => {
      groupList = grps["data"];
      fillGroups(groupList);
      reqList = syncRequestListStatusFields(reqs["data"]);
      cardData = counts["data"];
      presID = pres["data"];
      headerData = header["data"] || null;
      fillCards();
      openRequestFromUrl();
      renderHeader(header["data"]);
      renderSalutation(header["data"]);
      initDispatchStatusFilter();
      searchFilter(reqList);
    })
    .catch((error) => {
      if (error !== "Access Denied") {
        alert(`${error}`);
      }
    });
}
//#endregion
