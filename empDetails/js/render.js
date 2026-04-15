//#region RENDER
function fillHistory(dlist) {
  var tableBody = $("#dList");
  tableBody.empty();
  if (dlist.length === 0) {
    var noDataRow = $(
      `<tr><td colspan='6' class="text-center">No data found</td></tr>`,
    );
    tableBody.append(noDataRow);
  } else {
    $.each(dlist, function (index, item) {
      var row = $(`<tr data-dispatch-id="${item.id}">`);
      row.append(`<td data-exclude="true">${index + 1}</td>`);
      row.append(
        `<td data-f-name="Arial" data-f-sz="9" data-a-h="center" data-a-v="middle" data-b-a-s="thin" data-b-a-c="000000">${item.locationName}</td>`,
      );
      row.append(
        `<td data-f-name="Arial" data-f-sz="9" data-a-h="center" data-a-v="middle" data-b-a-s="thin" data-b-a-c="000000">${item.fromDate}</td>`,
      );
      row.append(
        `<td data-f-name="Arial" data-f-sz="9" data-a-h="center" data-a-v="middle" data-b-a-s="thin" data-b-a-c="000000">${item.toDate}</td>`,
      );
      row.append(
        `<td data-f-name="Arial" data-f-sz="9" data-a-h="center" data-a-v="middle" data-b-a-s="thin" data-b-a-c="000000">${item.duration}</td>`,
      );

      row.append(`<td data-exclude="true">
        <div class="d-flex gap-3">
          <button class="btn-edit" title="Edit Entry">
            <i class='bx bxs-edit fs-5'></i>
          </button>
          <button
            class="btn-delete"
            title="Delete Entry"
            data-bs-toggle="modal"
            data-bs-target="#deleteEntry"
          >
            <i class="bx bx-trash fs-5"></i>
          </button>
        </div>
      </td>`);

      tableBody.append(row);
    });
  }
}

function displayDays(dd) {
  var countText = "";
  if (dd == 1) {
    countText = `1 day`;
  } else {
    countText = `${dd} days`;
  }
  $("#dCount").text(countText);
  setBar(dd);
  colorBar(dd);
}

function setBar(dd) {
  const wd = (dd / full) * 100;
  $("#progBar").css("width", `${wd}%`);
}

function colorBar(dd) {
  $("#daysWarning").addClass("d-none");
  if (dd >= full) {
    $("#progBar").addClass("bg-danger").removeClass("bg-success bg-warning");
    if (dd > full) {
      $("#daysWarning").removeClass("d-none");
    }
  } else if (dd >= 150 && dd < full) {
    $("#progBar").addClass("bg-warning").removeClass("bg-success bg-danger");
  } else {
    $("#progBar").addClass("bg-success").removeClass("bg-warning bg-danger");
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
  var totalpast = editItem["pastOne"];

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

    yrRow += `<tr class='d-none'><td data-f-name='Arial' data-f-sz='9' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000'>${key}</td><td data-f-name='Arial' data-f-sz='9' data-a-h='center' data-a-v='middle' data-b-a-s='thin' data-b-a-c='000000'>${value}</td></tr>`;
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

function fillWorkHistory(wList) {
  let tableBody = $("#wList");
  let count = 0;
  tableBody.empty();
  if (wList.length === 0) {
    let noDataRow = $(
      "<tr><td colspan='10' class='text-center'>No data found</td></tr>",
    );
    tableBody.append(noDataRow);
    let addDataRow = $(
      "<tr> <td colspan='10' class='add-work text-center'> + Add New Item</td></tr>",
    );
    tableBody.append(addDataRow);
  } else {
    $.each(wList, function (index, item) {
      if (item.end_year == 0) {
        item.end_year = null;
      }
      if (item.end_month == 0) {
        item.end_month = null;
      }
      let row = $(`<tr wh-id=${item.id}>`);
      row.append(`<td data-exclude='true'>${index + 1}</td>`);
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.start_year}</td>`,
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.start_month}</td>`,
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${
          item.end_year ? item.end_year : ""
        }</td>`,
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${
          item.end_month ? item.end_month : ""
        }</td>`,
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.comp_name}</td>`,
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.comp_business}</td>`,
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.business_cont}</td>`,
      );
      row.append(
        `<td  data-f-name="Arial" data-f-sz="9"  data-a-h="center" data-a-v="middle" 	data-b-a-s="thin" data-b-a-c="000000">${item.work_loc}</td>`,
      );

      row.append(`<td data-exclude='true'>
          <div class="d-flex gap-2">
            <button
              class="btn-edit-work"
              title="Edit Work Entry"
              
            >
            <i class='bx bxs-edit fs-5' ></i>
            </button>
            <button
              class="btn-delete-work"
              title="Delete Work Entry"
              data-bs-toggle="modal"
              data-bs-target="#deleteWorkHistory"
            >
              <i class="bx bx-trash fs-5"></i>
            </button>
          </div></td>`);

      tableBody.append(row);
      count++;
    });
    if (count < 3) {
      let addDataRow = $(
        "<tr> <td colspan='10' class='add-work text-center'> + Add New Item</td></tr>",
      );
      tableBody.append(addDataRow);
    }
  }
}

function getEditWorkHistDetails(editworkID) {
  const editItem = wHistory.find((item) => parseInt(item.id) === editworkID);
  var st_year = editItem["start_year"];
  var st_month = editItem["start_month"];
  var end_year = editItem["end_year"];
  var end_month = editItem["end_month"];
  var comp_name = editItem["comp_name"];
  var comp_business = editItem["comp_business"];
  var business_cont = editItem["business_cont"];
  var work_loc = editItem["work_loc"];
  let newStMonth = "";
  let newEndMonth = "";

  if (st_month < 10) {
    newStMonth = "0" + st_month;
  } else {
    newStMonth = st_month;
  }
  if (end_month < 10) {
    newEndMonth = "0" + end_month;
  } else {
    newEndMonth = end_month;
  }
  const stMonthYear = `${st_year}-${newStMonth}`;
  const endMonthYear = `${end_year}-${newEndMonth}`;
  $("#edit-StartMonthYear").val(stMonthYear);
  $("#edit-EndMonthYear").val(endMonthYear);
  $("#edit-companyName").val(comp_name);
  $("#edit-companyBusiness").val(comp_business);
  $("#edit-businessContent").val(business_cont);
  $("#edit-workLocation").val(work_loc);
}
//#endregion
