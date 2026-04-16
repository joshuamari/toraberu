function fillOpenModal(trID) {
  const req = reqList.find((req) => req.req_id == trID);
  const name = req.emp_name;
  const grp = req.group_name;
  const passValidity = req.passValid;
  const visaValidity = req.visaValid;
  const startDate = req.from;
  const endDate = req.to;
  const reqName = req.requester_name;
  const reqDate = req.req_date;
  const status = parseInt(req.status);
  const location = req.specific_loc;
  const country = req.location;
  const duration = req.duration;
  const reqGrp = req.requester_group;
  const empnum = req.emp_number;
  const [last, given] = name.split(",");
  const surname = last.toUpperCase();
  const first = given.replace(/\s+/g, "");
  const modi = req.modified;

  console.log(req);

  formatStatus(status);
  // formatVisaPassport(visaValidity, passValidity);
  $("#modalEmpName").text(name);
  $("#modalGroup").text(grp);
  $("#modalDateFrom").text(formatDate(startDate));
  $("#modalDateTo").text(formatDate(endDate));
  $("#modalReqName").text(reqName);
  $("#modalReqDate").text(formatDate(reqDate));
  $("#modalLoc").text(location);
  $("#modalCountry").text(country);
  $("#modalReqGrp").text(reqGrp);
  $("#attachment").text(`${empnum}_${surname}${first}_DispatchRequest`);
  $("#attachment2").text(`${empnum}_${surname}${first}_WorkHistory`);

  if (!modi) {
    $("#modalModiDate").text("");
  } else {
    var [date, time] = modi.split(" ");
    $("#modalModiDate").text(formatDate(date) + " " + time);
  }

  if (duration > 1) {
    $("#modalDuration").html(
      `<span class="text-[16px] font-semibold" >${duration}</span>
       <p>days in total</p>`,
    );
  } else {
    $("#modalDuration").html(
      `<span class="text-[16px] font-semibold" >${duration}</span>
       <p>day in total</p>`,
    );
  }

  if (status === null || isNaN(status)) {
    $("#modifyFooter").addClass("d-none");
  } else {
    $("#modifyFooter").removeClass("d-none");
  }

  // formatButtons(status);
  $("#openModal").modal("show");
}

function fillChangeDateModal(trID) {
  const req = reqList.find((req) => req.req_id == trID);
  const name = req.emp_name;

  $("#dateChangeModal").modal("show");
}

function fillTable(sampleData) {
  $("#tableBody").empty();
  var str = "";

  if (sampleData.length != 0) {
    $.each(sampleData, function (index, item) {
      str = `
    <tr req-id="${item.req_id}">
      <td>${item.emp_name}</td>
      <td>${formatDate(item.req_date)}</td>
      <td>${formatDate(item.from)}</td>
      <td>${formatDate(item.to)}</td>
      <td>${item.requester_name}</td>
      <td>${
        item.status === null
          ? ` <span class=" status pending ">
                        Pending
                      </span>`
          : item.status == 1
            ? `  <span class=" status accepted ">
                        Accepted
                      </span>`
            : `<span class=" status cancelled ">
                        Cancelled
                      </span>`
      }</td>
      <td>${
        item.passValid === true
          ? `  <span class="validity "><i class='bx bx-check text-[18px]   font-semibold'></i></span>`
          : ` <span class="validity "><i class='bx bx-x text-[18px] font-semibold'></i></span>`
      }</td>
        <td>${
          item.visaValid === true
            ? `  <span class="validity "><i class='bx bx-check text-[18px]   font-semibold'></i></span>`
            : ` <span class="validity "><i class='bx bx-x text-[18px] font-semibold'></i></span>`
        }</td>
      <td>
        <div class="openIcon " title="Open item">
           <i class='bx bx-link-external text-[16px] opacity-50'></i>
        </div>
      </td>
    </tr>`;

      $("#tableBody").append(str);
    });
  } else {
    str = `<td colspan="12" class="h-[530px]"><div class="flex items-center justify-center flex-col gap-3"><img src="../images/empty.png"   class="w-[150px] h-auto opacity-[0.75]" alt="empty">
    <h5 class="font-semibold text-[16px] text-[var(--gray-text)]">No item found.</h5>
    <p class="text-[var(--gray-text)]">Try adjusting your search or filter to find what you're looking for.</p>
    </div></td>`;
    $("#tableBody").append(str);
  }
}

function formatStatus(status) {
  let statusString =
    isNaN(status) || status === null
      ? "pending"
      : status === 1
        ? "accepted"
        : "cancelled";

  $("#titleModal").html(
    `  Dispatch Request<span class="status lg ${statusString} ms-3">${statusString}</span>`,
  );

  if (!isNaN(status) || status === null) {
    $("#modiLabel").text(`${statusString}`);
  }
}

function searchFilter(req_list) {
  const keyword = $("#searchbar").val().toLowerCase().trim();
  const grps = $("#grpSel").val().split(",").map(Number);
  const dateFilter = $("#monthSel").val();
  const activeTabId = $("button").has("p.active").attr("id");
  const tabFilters = {
    "tab-2": null,
    "tab-3": 1,
    "tab-4": 0,
  };
  const filter =
    tabFilters[activeTabId] !== undefined ? tabFilters[activeTabId] : undefined;

  const results = req_list.filter((emp) => {
    const searchMatch =
      emp.emp_name.toLowerCase().includes(keyword) ||
      emp.requester_name.toLowerCase().includes(keyword);

    const groupMatch = grps.includes(parseInt(emp.group_id));
    const dateMatch = dateFilter ? emp.req_date.startsWith(dateFilter) : true;
    const statusMatch = filter !== undefined ? emp.status == filter : true;

    return searchMatch && groupMatch && statusMatch && dateMatch;
  });

  results.sort((a, b) => {
    return sortDateAsc
      ? new Date(a.req_date) - new Date(b.req_date)
      : new Date(b.req_date) - new Date(a.req_date);
  });

  fillTable(results);
}

function fillGroups(grps) {
  const groupIDS = grps.map((obj) => obj.newID);
  var grpSelect = $("#grpSel");
  grpSelect.html(`<option value=${groupIDS}>All Groups</option>`);
  $.each(grps, function (index, item) {
    var option = $("<option>")
      .attr("value", item.newID)
      .text(item.abbreviation)
      .attr("grp-id", item.newID);
    grpSelect.append(option);
  });
}
