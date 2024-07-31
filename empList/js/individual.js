//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
const dispTableID = ["eList", "eListNon"];
// var sortNum = 1;
// var sortEmp = 4;
// var sortKey = 1;
let sortNumAsc = true;
let sortNameAsc = true;
let empDetails = [];
let empList = [];
//#endregion
checkAccess()
  .then((emp) => {
    if (emp.isSuccess) {
      empDetails = emp.data;
      $(document).ready(function () {
        fillEmployeeDetails();
        getGroups()
          .then((grps) => {
            fillGroups(grps);
            getEmployees()
              .then((emps) => {
                empList = emps;
                fillEmployees(empList);
              })
              .catch((error) => {
                alert(`${error}`);
              });
          })
          .catch((error) => {
            alert(`${error}`);
          });
      });
    } else {
      alert(emp.message);
      window.location.href = `${rootFolder}`;
    }
  })
  .catch((error) => {
    alert(`${error}`);
  });
//#region BINDS
$(document).on("click", "#menu", function () {
  $(".navigation").addClass("open");
  $("body").addClass("overflow-hidden");
});
$(document).on("click", "#closeNav", function () {
  $(".navigation").removeClass("open");
  $("body").removeClass("overflow-hidden");
});

$(document).on("click", ".seeMore", function () {
  var empID = $(this).attr("id");
  window.location.href = `../empDetails?id=${empID}`;
});
$(document).on("change", "#grpSel", function () {
  getEmployees()
    .then((emps) => {
      empList = emps;
      // fillEmployees(empList);
      searchEmployee(empList);
    })
    .catch((error) => {
      alert(`${error}`);
    });
});
$(document).on("input", "#empSearch", function () {
  searchEmployee(empList);
});
$(document).on("click", ".sortEmpNum", function () {
  toggleSortNum();
});
$(document).on("click", ".sortEmpName", function () {
  toggleSortName();
});
$(document).on("click", "#portalBtn", function () {
  window.location.href = `${rootFolder}`;
});
//#endregion

//#region FUNCTIONS
function getGroups() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "../global/get_groups.php",
      dataType: "json",
      success: function (response) {
        const grps = response;
        resolve(grps);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.");
        }
      },
    });
  });
}
function fillGroups(grps) {
  var grpSelect = $("#grpSel");
  grpSelect.html(`<option selected value=0>All Groups</option>`);
  $.each(grps, function (index, item) {
    var option = $("<option>")
      .attr("value", item.newID)
      .text(item.abbreviation)
      .attr("grp-id", item.newID);
    grpSelect.append(option);
  });
}
function getEmployees() {
  const grpID = $("#grpSel").val();
  const keyword = $("#empSearch").val();
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_employee_list.php",
      data: {
        groupID: grpID,
        searchkey: keyword,
      },
      dataType: "json",
      success: function (response) {
        // console.log(response);
        const emps = response;
        resolve(emps);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.");
        }
      },
    });
  });
}
function fillEmployees(emps) {
  var tableFD = $("#eList");
  var tableND = $("#eListNon");
  tableFD.empty();
  tableND.empty();
  $.each(emps, function (index, item) {
    var row = $(`<tr d-id=${item.empID}>`);
    row.append(`<td>${item.empID}</td>`);
    row.append(`<td>${item.lastname}, ${item.firstname}</td>`);
    row.append(`<td>${item.groupAbbr}</td>`);
    row.append(`<td>${item.passportExpiry}</td>`);
    row.append(`<td>${item.visaExpiry}</td>`);
    row.append(
      `<td><i class="bx bxs-user-detail fs-5 seeMore" id=${item.empID}></i></td>`
    );
    tableFD.append(row);
  });
  dispTableID.forEach((element) => {
    checkEmpty(element);
  });
}
function checkEmpty(tbodyID) {
  var tbodySelector = "#" + tbodyID;
  if ($(tbodySelector + " tr").length === 0) {
    var newRow = `<tr><td colspan="6" class="text-center">No data found</td></tr>`;
    $(tbodySelector).append(newRow);
  }
}
function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "../global/check_login.php",
      dataType: "json",
      success: function (data) {
        const acc = data;
        resolve(acc);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred.1");
        }
      },
    });
    // resolve(response);
  });
}
function fillEmployeeDetails() {
  const fName = empDetails.empname.firstname;
  const sName = empDetails.empname.surname;
  const initials = getInitials(fName, sName);
  const grpName = empDetails.group;
  $("#empLabel").html(`${fName} ${sName}`);
  $("#empInitials").html(`${initials}`);
  $("#grpLabel").html(`${grpName}`);
}
function getInitials(firstname, surname) {
  let initials = "";
  var firstInitial = firstname.charAt(0);
  var lastInitial = surname.charAt(0);
  initials = `${firstInitial}${lastInitial}`;
  return initials.toUpperCase();
}
function toggleSortNum() {
  sortNumAsc = !sortNumAsc;
  sortByNum(sortNumAsc);
}
function sortByNum(isAscending) {
  let sortedList = empList.slice().sort(function (a, b) {
    return isAscending ? a.empID - b.empID : b.empID - a.empID;
  });
  // fillEmployees(sortedList);
  searchEmployee(sortedList);
}
function toggleSortName() {
  sortNameAsc = !sortNameAsc;
  sortByName(sortNameAsc);
}
function sortByName(isAscending) {
  let sortedList = empList.slice().sort(function (a, b) {
    var nameA = a.lastname.toUpperCase() + a.firstname.toUpperCase();
    var nameB = b.lastname.toUpperCase() + b.firstname.toUpperCase();
    if (isAscending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
  // fillEmployees(sortedList);
  searchEmployee(sortedList);
}
function searchEmployee(elist) {
  const keyword = $("#empSearch").val().toLowerCase().trim();
  // const grp = $("#grpSel").val();
  const results = elist.filter((emp) => {
    const searchMatch =
      emp.firstname.toLowerCase().includes(keyword) ||
      emp.lastname.toLowerCase().includes(keyword) ||
      emp.empID.toString().includes(keyword);
    // const groupMatch = grp == 0 || emp.group.id == grp;
    return searchMatch;
  });
  fillEmployees(results);
}
//#endregion
