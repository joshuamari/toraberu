//#region UI
function fillGroups(grps) {
  const grpSelect = $("#grpSel");
  grpSelect.html(`<option selected value="0">All Groups</option>`);

  $.each(grps, function (index, item) {
    const option = $("<option>")
      .attr("value", item.newID)
      .attr("grp-id", item.newID)
      .text(item.abbreviation);

    grpSelect.append(option);
  });
}

function fillEmployees(emps) {
  const tableFD = $("#eList");
  const tableND = $("#eListNon");

  tableFD.empty();
  tableND.empty();

  $.each(emps, function (index, item) {
    const row = $(`<tr d-id="${item.empID}">`);
    row.append(`<td>${item.empID}</td>`);
    row.append(`<td>${item.lastname}, ${item.firstname}</td>`);
    row.append(`<td>${item.groupAbbr}</td>`);
    row.append(`<td>${item.passportExpiry}</td>`);
    row.append(`<td>${item.visaExpiry}</td>`);
    row.append(`<td>${item.reentryExpiry}</td>`);
    row.append(
      `<td><i class="bx bxs-user-detail fs-5 seeMore" id="${item.empID}"></i></td>`,
    );

    tableFD.append(row);
  });

  dispTableID.forEach((element) => {
    checkEmpty(element);
  });
}

function checkEmpty(tbodyID) {
  const tbodySelector = "#" + tbodyID;

  if ($(tbodySelector + " tr").length === 0) {
    const newRow = `<tr><td colspan="7" class="text-center">No data found</td></tr>`;
    $(tbodySelector).append(newRow);
  }
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
//#endregion
