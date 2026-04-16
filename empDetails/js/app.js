//#region APP
function initApp() {
  const url_string = window.location;
  const url = new URL(url_string);

  if (url.searchParams.get("id")) {
    empID = url.searchParams.get("id");
  } else {
    window.location.href = "/PCS/";
    return;
  }

  initSidebar();
  bindEvents();

  checkAccess()
    .then((emp) => {
      if (emp.success) {
        empDetails = emp.data;

        fillEmployeeDetails();

        return Promise.all([
          getEmployeeDetails(),
          getPassport(true),
          getPassport(false),
          getVisa(true),
          getVisa(false),
          getDispatchHistory(),
          getDispatchDays(),
          getYearly(),
          getLocations(),
          getWorkHistory(),
        ]);
      } else {
        alert(emp.message);
        window.location.href = `${rootFolder}`;
        throw new Error("Access denied");
      }
    })
    .then(
      ([
        emps,
        pportD,
        pportI,
        vsaD,
        vsaI,
        dlst,
        dd,
        yrl,
        locs,
        wHist,
      ]) => {
        editAccess = empDetails.permissions.hasEdit;
        userPassD = pportD.data;
        userPassI = pportI.data;
        userVisaD = vsaD.data;
        userVisaI = vsaI.data;

        fillDetails(emps.data);
        passportDisplay(userPassD);
        passportInput(userPassI);
        visaDisplay(userVisaD);
        visaInput(userVisaI);

        dHistory = dlst.data;
        fillHistory(dHistory);
        displayDays(dd);
        fillYearly(yrl);
        fillLocations(locs);

        wHistory = wHist;
        fillWorkHistory(wHistory);

        if (editAccess === false) {
          $(".editThis").removeAttr("data-bs-target");
          $(".editThis").removeAttr("data-bs-toggle");
        }
      },
    )
    .catch((error) => {
      if (error.message !== "Access denied") {
        alert(`${error}`);
      }
    });
}
//#endregion
