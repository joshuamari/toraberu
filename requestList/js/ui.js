//#region UI
function fillCards() {
  var pending = cardData.data.pending;
  var accepted = cardData.data.accepted;
  var cancelled = cardData.data.cancelled;
  var todayTotal = cardData.data.todaytotal;
  var todayAccept = cardData.data.todayaccept;
  var total = cardData.data.total;

  $("#tab-2 p").nextAll().remove();

  if (pending != 0) {
    $("#tab-2").append(`
         <small
                      class="rounded-full w-[14px] h-[14px] bg-[var(--dark)] text-white text-[8px] flex items-center justify-content-center font-semibold" >${pending}</small>
      `);
  }

  $("#cardPending").text(pending);
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

function fillAttachment(data) {
  $(".siteDispatch").empty();
  $("#printJap, #printPh, #printThird").text("");

  let date = data.dispatch_request.dh_date;
  let company = data.dispatch_request.company_name;
  let khi = data.dispatch_request.req_name;
  let khibu = data.dispatch_request.request_dept;
  let name = data.dispatch_request.emp_name;
  let from = data.dispatch_request.start;
  let to = data.dispatch_request.end;
  let country = data.dispatch_request.location_id;
  let loc = data.dispatch_request.specific_loc;
  let invitation = data.dispatch_request.invitation_id;
  let workOrder = data.dispatch_request.work_order;
  let project = data.dispatch_request.project_name;
  let siteDispatch = data.dispatch_request.site_dispatch;
  let salary = data.dispatch_request.allowance[0].amount;
  let salaryOthers = data.dispatch_request.allowance[1].amount;
  let khiTel = data.dispatch_request.req_tel;
  let khiFax = data.dispatch_request.req_fax;
  let gap = data.dispatch_request.gap_name;
  let cdcp = data.dispatch_request.cdcp_name;
  let gap_tel = data.dispatch_request.gap_tel;
  let cdcp_tel = data.dispatch_request.cdcp_tel;
  const departmentSelected = data.dispatch_request.dept_id;

  if (country == 1) {
    insertIconCountry(1);
    $("#printJap").text(loc);
  }
  if (country === 2) {
    insertIconCountry(2);
    $("#printPh").text(loc);
  }
  if (country === 3) {
    insertIconCountry(3);
    $("#printThird").text(loc);
  }

  if (invitation === 1) {
    insertIconInvitation(1);
  }
  if (invitation === 2) {
    insertIconInvitation(2);
  }
  if (invitation === 3) {
    insertIconInvitation(3);
  }

  if (siteDispatch === 1) {
    $(".siteDispatch").html(`<i class="bx bx-x down"></i>`);
  }
  if (siteDispatch === 0) {
    $(".siteDispatch").empty();
  }

  $("#printCompany").text(company);
  $("#printKHI").text(khi);
  $("#printBU").text(khibu);
  $("#printName").text(formatName(name));
  $("#printFrom").text(from);
  $("#printTo").text(to);
  $("#printWO").text(workOrder);
  $("#printProject").text(project);
  $("#printSalary").text(salary);
  $("#printSalaryOthers").text(salaryOthers);
  $("#printDate").text(date);
  $("#printTel").text(khiTel);
  $("#printFax").text(khiFax);
  $("#printGAPName").text(gap);
  $("#printCDCPName").text(cdcp);
  $("#printGAPNumber").text(gap_tel);
  $("#printCDCPNumber").text(cdcp_tel);

  if (departmentSelected == 15) {
    const newAddress = ": 1, Kawasaki cho, Sakaide city, Kagawa 762-8507 Japan";
    $("#disAddress").html(
      '<span id="location" class="font-semibold text-[10px]">SAKAIDE</span>' +
        newAddress,
    );
    $("#disPhone").text("Phone: 81-(0)877-46-0315");
    $("#disFax").text("Facsimile: 81-(0)877-46-4397");
    $("#printCopyInfoLabelOne")[0].firstChild.nodeValue =
      "Sakaide Personnel and Labor Sec., Ship&Offshore:";
    $("#printCopyInfoLabelTwo")[0].firstChild.nodeValue =
      "General Affairs & Personal Gr.:";
  } else {
    const newAddress =
      ": 1-1, Higashikawasaki 3-Chome, Chuo-ku, KOBE 650-8670 Japan";
    $("#disAddress").html(
      '<span id="location" class="font-semibold text-[10px]">KOBE</span>' +
        newAddress,
    );
    $("#disPhone").text("Phone: 81-(0)78-682-5202");
    $("#disFax").text("Facsimile:81-(0)78-682-5574");
    $("#printCopyInfoLabelOne")[0].firstChild.nodeValue =
      "General Affairs & Personal Gr.:";
    $("#printCopyInfoLabelTwo")[0].firstChild.nodeValue =
      "Control Dept Corporate Planning Gr.:";
  }
}

function fillAttachment2(data) {
  var dates = data.dispatch_request.date_request;
  var name = data.dispatch_request.emp_name;
  const departmentSelected = data.dispatch_request.dept_id;
  const company_desc =
    departmentSelected != 15 ? data.dispatch_request.company_desc : "坂出工場";
  const company_loc =
    departmentSelected != 15
      ? data.dispatch_request.company_loc
      : "高松入国管理局　様";
  const [day, monthName, year] = dates.split(" ");
  const month = monthNames2.indexOf(monthName);
  var str = "";

  $("#workHistoryTable tbody").empty();

  if (data.work_history.length != 0) {
    $.each(data.work_history, function (index, item) {
      if (item.end_year == null) {
        item.end_year = "";
      }
      if (item.end_month == null) {
        item.end_month = "";
      }
      if (item.end_year == "-0001") {
        item.end_year = "";
      }
      if (item.end_month == "11") {
        item.end_month = "";
      }
      str += `
      <tr>
        <td>${item.start_year}</td>
        <td>${item.start_month}</td>
        <td>${item.end_year}</td>
        <td>${item.end_month}</td>
        <td>${item.company_name}</td>
        <td>${item.company_business}</td>
        <td>${item.business_content}</td>
        <td>${item.location}</td>
      </tr>
    `;
    });
  } else {
    str = `
    <tr>
      <td colspan="9" class="text-center">
        No data found.
      </td>
    </tr>
    `;
  }

  $("#workHistoryTable tbody").append(str);
  $("#whYear").text(year);
  $("#whMonth").text(month + 1);
  $("#whDay").text(day);
  $("#whName").text(name);
  $("#whBusiness").text(data.dispatch_request.business);
  $("#dic").text(data.dispatch_request.dept_in_charge);
  $("#dic_name").text(data.dispatch_request.dic_name);
  $("#dic_tel").text(data.dispatch_request.dic_tel);
  $("#comp_jap").text(data.dispatch_request.company_jap);
  $("#comp_desc").text(company_desc);
  $("#comp_loc").text(company_loc);
  $("#company_n_desc").text(
    `${data.dispatch_request.company_jap} ${data.dispatch_request.company_desc}`,
  );
}

function insertIconCountry(id) {
  $(".countries").empty();

  const iconElement = $("<i>").addClass("bx bx-x down");

  const countriesContainers = $(".countries");
  if (id === 1) {
    countriesContainers.eq(0).append(iconElement);
  }
  if (id === 2) {
    countriesContainers.eq(1).append(iconElement);
  }
  if (id === 3) {
    countriesContainers.eq(2).append(iconElement);
  }
}

function insertIconInvitation(id) {
  $(".inv").empty();

  const iconElement = $("<i>").addClass("bx bx-x down");

  const countriesContainers = $(".inv");
  if (id === 1) {
    countriesContainers.eq(0).append(iconElement);
  }
  if (id === 2) {
    countriesContainers.eq(1).append(iconElement);
  }
  if (id === 3) {
    countriesContainers.eq(2).append(iconElement);
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
