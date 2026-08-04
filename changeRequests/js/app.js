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
      groupList = Array.isArray(grps) ? grps : [];
      fillGroups(groupList);

      if (!reqs || reqs.isSuccess === false) {
        throw reqs && reqs.message
          ? reqs.message
          : "Failed to load change requests.";
      }

      const changeData = reqs.data || {};
      reqList = Array.isArray(changeData.cancellation)
        ? changeData.cancellation
        : [];
      allDateChangeRequests = Array.isArray(changeData.date_change)
        ? changeData.date_change
        : [];

      cardData = counts || {};
      presID = (pres && pres.data) || [];
      fillCards();
      initDateChangeRequestsTable();

      if ($(".tab").length) {
        $(".tab")[0].click();
      }
    })
    .catch((error) => {
      if (error !== "Access Denied") {
        alert(`${error}`);
      }
    });
}
