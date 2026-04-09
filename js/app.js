//#region APP
function initApp() {
  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      if (emp.isSuccess) {
        empDetails = emp.data;
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
          editAccess = emp.data.edit;
          if (!editAccess) {
            $("table tbody tr").css("cursor", "default");
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