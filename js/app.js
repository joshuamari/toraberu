//#region APP
function initApp() {
  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      empDetails = emp;

      fillEmployeeDetails();

      return Promise.all([
        getDispatchlist(),
        getExpiringPassport(),
        getExpiringVisa(),
        getGraph(),
        getcurrentYear(),
      ]).then(([dList, epList, evList, dData, crrntYear]) => {
        fillDispatchList(dList);
        fillPassport(epList);
        fillVisa(evList);
        dispatchGraph(dData);
        $(".crrntYear").text(`(${crrntYear})`);

        // updated access logic
        editAccess = emp.permissions.hasEdit;

        if (!editAccess) {
          $("table tbody tr").css("cursor", "default");
        }
      });
    })
    .catch((error) => {
      alert(`${error}`);
      window.location.href = `${rootFolder}`;
    });
}
//#endregion