//#region UI
function fillDispatchList(dlist) {
  const tableBody = $("#dlist");
  tableBody.empty();

  if (dlist.length === 0) {
    const noDataRow = $("<tr>").append(
      $("<td>").attr("colspan", "6").text("No data found"),
    );
    tableBody.append(noDataRow);
    return;
  }

  $.each(dlist, function (index, item) {
    let passClass = "bg-success";
    let passVal = "Valid";
    let visaClass = "bg-success";
    let visaVal = "Valid";

    if (!item.passValid) {
      passClass = "bg-danger";
      passVal = "Invalid";
    }

    if (!item.visaValid) {
      visaClass = "bg-danger";
      visaVal = "Invalid";
    }

    const row = $("<tr>");
    row.append($("<td>").text(item.name));
    row.append($("<td>").text(item.location));
    row.append($("<td>").text(item.from));
    row.append($("<td>").text(item.to));
    row.append(
      $("<td>").append(
        $("<span>").addClass(`badge ${passClass}`).text(passVal),
      ),
    );
    row.append(
      $("<td>").append(
        $("<span>").addClass(`badge ${visaClass}`).text(visaVal),
      ),
    );

    tableBody.append(row);
  });
}

function fillPassport(eplist) {
  const tableBody = $("#eplist");
  tableBody.empty();

  if (eplist.length === 0) {
    const noDataRow = $("<tr>").append(
      $("<td>")
        .attr("colspan", "2")
        .addClass("text-center")
        .text("No expiring passports"),
    );
    tableBody.append(noDataRow);
    return;
  }

  $.each(eplist, function (index, item) {
    const untilText = formatDays(item.until);
    const isShort = item.until < 300 ? "short" : "";

    const row = $("<tr>")
      .addClass("rowEmp")
      .attr("data-emp-id", item.id);

    row.append($("<td>").text(item.name));
    row.append(
      $("<td>")
        .addClass(`expire ${isShort}`.trim())
        .text(untilText),
    );

    tableBody.append(row);
  });
}

function fillVisa(evlist) {
  const tableBody = $("#evlist");
  tableBody.empty();

  if (evlist.length === 0) {
    const noDataRow = $("<tr>").append(
      $("<td>")
        .attr("colspan", "2")
        .addClass("text-center")
        .text("No expiring visas"),
    );
    tableBody.append(noDataRow);
    return;
  }

  $.each(evlist, function (index, item) {
    const untilText = formatDays(item.until);
    const isShort = item.until < 210 ? "short" : "";

    const row = $("<tr>")
      .addClass("rowEmp")
      .attr("data-emp-id", item.id);

    row.append($("<td>").text(item.name));
    row.append(
      $("<td>")
        .addClass(`expire ${isShort}`.trim())
        .text(untilText),
    );

    tableBody.append(row);
  });
}

function fillEmployeeDetails() {
  const fName = capitalizeWord(empDetails.empname.firstname);
  const sName = capitalizeWord(empDetails.empname.surname);
  const initials = getInitials(fName, sName);
  const grpName = empDetails.group;

  $("#empLabel").text(`${fName} ${sName}`);
  $("#empInitials").text(initials);
  $("#grpLabel").text(grpName);
}
//#endregion