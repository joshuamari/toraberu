//#region UI
function fillEmployeeDetails() {
  const fName = capitalizeWord(empDetails.empname.firstname);
  const sName = capitalizeWord(empDetails.empname.surname);
  const initials = getInitials(fName, sName);
  const grpName = empDetails.group;

  $("#empLabel").html(`${fName} ${sName}`);
  $("#empInitials").html(`${initials}`);
  $("#grpLabel").html(`${grpName}`);
}

function fillGroups(grps) {
  const grpSelect = $("#grpSel");
  grpSelect.html(`<option value="0">All Groups</option>`);

  $.each(grps, function (index, item) {
    const option = $("<option>")
      .attr("value", item.newID)
      .text(item.abbreviation)
      .attr("grp-id", item.newID);

    grpSelect.append(option);
  });
}

function fillYear(yr) {
  $("#yearSel").empty();

  yr.forEach((element) => {
    $("#yearSel").append(`<option>${element}</option>`);
  });

  const curYear = new Date().getFullYear();
  $("#yearSel").val(curYear);
  $("#selectedYear").text(curYear);
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
//#endregion