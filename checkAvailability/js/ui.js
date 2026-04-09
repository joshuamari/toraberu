//#region UI
function fillGroups(grps) {
  var grpSelect = $("#grpSel");
  grpSelect.html(`<option value=0>Select Group</option>`);
  $.each(grps, function (index, item) {
    var option = $("<option>")
      .attr("value", item.newID)
      .text(item.name)
      .attr("grp-id", item.newID);
    grpSelect.append(option);
  });
}

function fillEmployees(emps) {
  var empSelect = $("#empSel");
  empSelect.html("<option value='0' hidden>Select Employee</option>");
  $.each(emps, function (index, item) {
    var option = $("<option>").text(item.name).attr("emp-id", item.id);
    empSelect.append(option);
  });
}

function displayDays(cdays) {
  if (cdays.difference === 1) {
    $("#daysCount").text(" 1 day.");
  } else {
    $("#daysCount").text(`${cdays.difference} days`);
  }
  to_add = cdays.toAdd;
}

function fillPassport(pport) {
  if (Object.keys(pport).length > 0) {
    const pnum = pport.number;
    const pbday = pport.bday;
    const pissue = pport.issue;
    const pexpiry = pport.expiry;
    const pvalid = pport.valid;
    $("#passNo").text(pnum);
    $("#passBday").text(pbday);
    $("#passIssue").text(pissue);
    $("#passExp").text(pexpiry);
    if (pvalid) {
      $("#passStatus").removeClass("bg-danger");
      $("#passStatus").addClass("bg-[var(--tertiary)]");
      $("#passStatus").text("Valid");
    } else {
      $("#passStatus").removeClass("bg-[var(--tertiary)]");
      $("#passStatus").addClass("bg-danger");
      $("#passStatus").text("Expired");
    }
    $("#passDeets").removeClass("d-none");
    $("#passEmpty").addClass("d-none");
  } else {
    $("#passDeets").addClass("d-none");
    $("#passEmpty").removeClass("d-none");
  }
}

function fillVisa(vsa) {
  if (Object.keys(vsa).length > 0) {
    const vnum = vsa.number;
    const vissue = vsa.issue;
    const vexpiry = vsa.expiry;
    const vvalid = vsa.valid;
    $("#visaNo").text(vnum);
    $("#visaIssue").text(vissue);
    $("#visaExp").text(vexpiry);
    if (vvalid) {
      $("#visaStatus").removeClass("bg-danger");
      $("#visaStatus").addClass("bg-[var(--tertiary)]");
      $("#visaStatus").text("Valid");
    } else {
      $("#visaStatus").removeClass("bg-[var(--tertiary)]");
      $("#visaStatus").addClass("bg-danger");
      $("#visaStatus").text("Expired");
    }
    $("#visaDeets").removeClass("d-none");
    $("#visaEmpty").addClass("d-none");
  } else {
    $("#visaDeets").addClass("d-none");
    $("#visaEmpty").removeClass("d-none");
  }
}

function fillLocations(locs) {
  var locSelect = $("#locSel");
  locSelect.html("<option value='0'>Select Location</option>");
  $("#editentryLocation").empty();
  $.each(locs, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.name)
      .attr("loc-id", item.id);
    locSelect.append(option);
    $("#editentryLocation").append(option.clone());
  });
}

function clearInput() {
  $("#grpSel, #empSel, #locSel, #startDate, #endDate").removeClass(
    "bg-red-100  border-red-400",
  );
  $(".errTxt").remove();
  $("#grpSel, #empSel, #locSel").val(0);
  $("#startDate, #endDate").val("");
  to_add = 0;
  $("#daysCount").text("");
  $("#empSel").change();
}

function fillEmployeeDetails() {
  const fName = capitalizeWord(empDetails.empname.firstname);
  const sName = capitalizeWord(empDetails.empname.surname);
  const initials = getInitials(fName, sName);
  const grpName = empDetails.group;
  $("#empLabel").html(`${fName} ${sName}`);
  $("#empInitials").html(`${initials}`);
  $("#grpLabel").html(`${grpName}`);
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
                          Please wait while we fetch the employee details.
                      </div>
                  </div>
              </div>
          </div>
      `);
  } else {
    $("#loadingAnimation").remove();
  }
}
//#endregion
