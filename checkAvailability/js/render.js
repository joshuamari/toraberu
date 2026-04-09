//#region RENDER
function fillHistory(dlist) {
  var tableBody = $("#dList");
  tableBody.empty();
  if (dlist.length === 0) {
    var noDataRow = $(
      "<tr><td colspan='7' class='text-center'>No data found</td></tr>",
    );
    tableBody.append(noDataRow);
  } else {
    $.each(dlist, function (index, item) {
      var row = $(`<tr d-id=${item.id}>`);
      row.append(`<td data-exclude='true'>${index + 1}</td>`);
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.locationName}</td>`,
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.fromDate}</td>`,
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.toDate}</td>`,
      );
      if (item.duration > 183) {
        row.append(
          `<td class="redText" data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000" data-f-color="FFFF0000">${item.duration}</td>`,
        );
      } else {
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.duration}</td>`,
        );
      }

      if (item.pastOne > 183) {
        row.append(
          `<td class="redText" data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000" data-f-color="FFFF0000">${item.pastOne}</td>`,
        );
      } else {
        row.append(
          `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000" >${item.pastOne}</td>`,
        );
      }

      row.append(`<td data-exclude='true'>
        <div class="d-flex gap-2">
        <button
          class="btn-edit"
          title="Edit Entry"
          
        >
        <i class='bx bxs-edit fs-5' ></i>
        </button>
        <button
          class="btn-delete"
          title="Delete Entry"
          data-bs-toggle="modal"
          data-bs-target="#deleteEntry"
        >
          <i class="bx bx-trash fs-5"></i>
        </button>
      </div></td>`);

      tableBody.append(row);
    });
  }
}

function countTotal() {
  const daysCount = parseInt(to_add, 10);
  const dispDays = parseInt(dispatch_days, 10);
  var countText = "";
  const dd = daysCount + dispDays;

  if (dd == 1) {
    countText = `1 day`;
  } else {
    if (dd > 183) {
      $("#rangeCount").addClass("redText");
      countText = `${dd} days`;
    } else {
      $("#rangeCount").removeClass("redText");
      countText = `${dd} days`;
    }
  }

  $("#rangeCount").text(countText);
  setBar(dd);
  colorBar(dd);
}

function setBar(dd) {
  const wd = (dd / full) * 100;
  $("#progBar").css("width", `${wd}%`);
}

function colorBar(dd) {
  $("#daysWarning span").text(
    "Warning: Total dispatch days exceeds 183 days for this year.",
  );
  $("#daysWarning").addClass("d-none");
  if (dd >= full) {
    $("#progBar")
      .addClass("bg-danger")
      .removeClass("bg-[var(--tertiary)] bg-warning");
    if (dd > full) {
      $("#daysWarning").removeClass("d-none");
    }
  } else if (dd >= 150 && dd < full) {
    $("#progBar")
      .addClass("bg-warning")
      .removeClass("bg-[var(--tertiary)] bg-danger");
  } else {
    $("#progBar")
      .addClass("bg-[var(--tertiary)]")
      .removeClass("bg-warning bg-danger");
  }
}

function computeTotalDays() {
  var from = new Date($("#editentryDateJ").val());
  var to = new Date($("#editentryDateP").val());

  if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
    var differenceInTime = to.getTime() - from.getTime();
    var differenceInDays =
      Math.round(differenceInTime / (1000 * 3600 * 24)) + 1;

    $("#editentryDays").html(differenceInDays);
  }
}

function getEditDetails(editID) {
  const editItem = dHistory.find((item) => parseInt(item.id) === editID);
  var loc = editItem["locationName"];
  var japan = editItem["fromDate"];
  var parsedDateJap = new Date(japan);

  var formattedDateJap =
    parsedDateJap.getFullYear() +
    "-" +
    ("0" + (parsedDateJap.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + parsedDateJap.getDate()).slice(-2);
  var ph = editItem["toDate"];
  var parsedDatePh = new Date(ph);
  var formattedDatePh =
    parsedDatePh.getFullYear() +
    "-" +
    ("0" + (parsedDatePh.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + parsedDatePh.getDate()).slice(-2);

  var total = editItem["duration"];

  $("#editentryDateJ").val(formattedDateJap);
  $("#editentryDateJ").attr("max", formattedDatePh);
  $("#editentryDateP").val(formattedDatePh);
  $("#editentryDateP").attr("min", formattedDateJap);
  $("#editentryLocation option:contains(" + loc + ")").prop("selected", true);
  $(" #editentryDays").html(total);
}

function fillYearly(yrl) {
  var x = 1;
  var yrRow = `<tr class='d-none'></tr><tr class='d-none'>
  <tr class='d-none'><td data-f-name='Arial' data-f-sz='9' data-f-bold='true' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000'>Year</td>
  <td data-f-name="Arial" data-f-sz="9" data-f-bold="true" data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">Total Days in Japan</td> </tr>`;
  Object.entries(yrl).forEach(([key, value]) => {
    $(`#y${x}`).text(key);
    $(`#y${x}-days`).text(value);

    if (value > 183) {
      $(`#y${x}-days`).addClass("redText");
      yrRow += `<tr class='d-none'><td data-f-name='Arial' data-f-sz='9' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000'>${key}</td><td data-f-name='Arial' data-f-sz='9' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000' data-f-color='FFFF0000'>${value}</td></tr>`;
    } else {
      $(`#y${x}-days`).removeClass("redText");
      yrRow += `<tr class='d-none'><td data-f-name='Arial' data-f-sz='9' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000'>${key}</td><td data-f-name='Arial' data-f-sz='9' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000'>${value}</td></tr>`;
    }
    x++;
  });
  $("#histTable").append(yrRow);
}

function getYears() {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const nextYear = currentYear + 1;
  $("#y1").text(previousYear);
  $("#y2").text(currentYear);
  $("#y3").text(nextYear);
}

function exportTable() {
  const empID = $("#empSel").find("option:selected").attr("emp-id");
  const ename = arrangeName($("#empSel").val());
  TableToExcel.convert(document.getElementById("histTable"), {
    name: `Dispatch_History_${empID}.xlsx`,
    sheet: {
      name: `${ename}`,
    },
  });
}
//#endregion
