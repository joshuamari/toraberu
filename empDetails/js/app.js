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
      if (emp.isSuccess) {
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
          checkEditAccess(),
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
        eAccess,
        wHist,
      ]) => {
        editAccess = eAccess;
        userPassD = pportD;
        userPassI = pportI;
        userVisaD = vsaD;
        userVisaI = vsaI;

        fillDetails(emps);
        passportDisplay(userPassD);
        passportInput(userPassI);
        visaDisplay(userVisaD);
        visaInput(userVisaI);

        dHistory = dlst;
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
