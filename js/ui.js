//#region UI
function fillDispatchList(dlist) {
  var tableBody = $("#dlist");
  tableBody.empty();

  if (dlist.length === 0) {
    var noDataRow = $("<tr><td colspan='4'>No data found</td></tr>");
    tableBody.append(noDataRow);
  } else {
    $.each(dlist, function (index, item) {
      var passClass = "bg-success";
      var passVal = "Valid";
      var visaClass = "bg-success";
      var visaVal = "Valid";

      if (!item.passValid) {
        passClass = "bg-danger";
        passVal = "Invalid";
      }

      if (!item.visaValid) {
        visaClass = "bg-danger";
        visaVal = "Invalid";
      }

      var row = $("<tr>");
      row.append(`<td>${item.name}</td>`);
      row.append(`<td>${item.location}</td>`);
      row.append(`<td>${item.from}</td>`);
      row.append(`<td>${item.to}</td>`);
      row.append(`<td><span class="badge ${passClass}">${passVal}</span></td>`);
      row.append(`<td><span class="badge ${visaClass}">${visaVal}</span></td>`);
      tableBody.append(row);
    });
  }
}

function fillPassport(eplist) {
  var tableBody = $("#eplist");
  tableBody.empty();

  if (eplist.length === 0) {
    var noDataRow = $(
      "<tr><td colspan='2' class='text-center'>No expiring passports</td></tr>"
    );
    tableBody.append(noDataRow);
  } else {
    $.each(eplist, function (index, item) {
      var row = $(`<tr class="rowEmp" emp-id="${item.id}">`);
      var untilText = formatDays(item.until);
      var isShort = item.until < 300 ? "short" : "";
      row.append(`<td>${item.name}</td>`);
      row.append(`<td class="expire ${isShort}">${untilText}</td>`);
      tableBody.append(row);
    });
  }
}

function fillVisa(evlist) {
  var tableBody = $("#evlist");
  tableBody.empty();

  if (evlist.length === 0) {
    var noDataRow = $(
      "<tr><td colspan='2' class='text-center'>No expiring visa</td></tr>"
    );
    tableBody.append(noDataRow);
  } else {
    $.each(evlist, function (index, item) {
      var row = $(`<tr class="rowEmp" emp-id="${item.id}">`);
      var untilText = formatDays(item.until);
      var isShort = item.until < 210 ? "short" : "";
      row.append(`<td>${item.name}</td>`);
      row.append(`<td class="expire ${isShort}">${untilText}</td>`);
      tableBody.append(row);
    });
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