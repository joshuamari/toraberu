function countPendingRequests(list) {
  return (list || []).filter(function (item) {
    return (
      String(item.status || "")
        .trim()
        .toLowerCase() === "pending"
    );
  }).length;
}

function renderPendingTabBadge($tab, count) {
  if (!$tab || !$tab.length) {
    return;
  }

  $tab.find(".tab-segment__badge").remove();

  if (count > 0) {
    $tab.append(`<span class="tab-segment__badge">${count}</span>`);
  }
}

function fillCards() {
  var data = (cardData && cardData.data) || {};
  var pendingCancellations = countPendingRequests(reqList);
  var pendingDateChanges = countPendingRequests(allDateChangeRequests);
  var accepted = data.accepted || 0;
  var cancelled = data.cancelled || 0;
  var todayTotal = data.todaytotal || 0;
  var todayAccept = data.todayaccept || 0;
  var total = data.total || 0;

  renderPendingTabBadge($("#tab-2"), pendingCancellations);
  renderPendingTabBadge($("#datechange-tab-2"), pendingDateChanges);

  $("#cardPending").text(pendingCancellations);
  $("#cardAccepted").text(accepted);

  if (todayAccept != 0) {
    $("#cardTodayAccepted").html(
      `<small class="font-semibold" >+${todayAccept} today</small>`,
    );
  }

  $("#cardCancelled").text(cancelled);

  if (todayTotal != 0) {
    $("#cardTodayTotal").html(
      `<small class="font-semibold" >+${todayTotal} today</small>`,
    );
  }

  $("#cardTotal").text(total);
}

function fillEmployeeDetails() {
  const fName = capitalizeWord(empDetails.empname.firstname);
  const sName = capitalizeWord(empDetails.empname.surname);
  const initials = getInitials(fName, sName);
  const grpName = empDetails.group;
  $("#empLabel").html(`${fName} ${sName}`);
  $("#empInitials").html(`${initials}`);
  $("#grpLabel").html(`${grpName}`);
  if (typeof setAppVersion === "function") {
    setAppVersion(empDetails && empDetails.app_version);
  }
}

function toggleLoadingAnimation(show) {
  if (show) {
    $("#appendHere").append(`
          <div class="top-0 backdrop-blur-sm bg-gray/30 h-full flex justify-center items-center flex-col pb-5 absolute w-full" id="loadingAnimation">
              <div class="relative">
                  <div class="grayscale-[70%] w-[400px]">
                      <img src="../images/Frame 1.gif" alt="loader" class="w-full" />
                  </div>
                  <div class="absolute bottom-0 flex-col w-full text-center flex justify-center items-center gap-2">
                      <div class="title fw-semibold fs-5">
                          Loading data . . .
                      </div>
                      <div class="text">
                          Please wait while we fetch the dispatch report details.
                      </div>
                  </div>
              </div>
          </div>
      `);
  } else {
    $("#loadingAnimation").remove();
  }
}
