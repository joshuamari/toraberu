//#region RENDER / FILTER / SORT
function searchEmployee(elist) {
  const keyword = $("#empSearch").val().toLowerCase().trim();

  const results = elist.filter((emp) => {
    const searchMatch =
      emp.firstname.toLowerCase().includes(keyword) ||
      emp.lastname.toLowerCase().includes(keyword) ||
      emp.empID.toString().includes(keyword);

    return searchMatch;
  });

  fillEmployees(results);
}

function toggleSortNum() {
  sortNumAsc = !sortNumAsc;
  sortByNum(sortNumAsc);
}

function sortByNum(isAscending) {
  const sortedList = empList.slice().sort(function (a, b) {
    return isAscending ? a.empID - b.empID : b.empID - a.empID;
  });

  searchEmployee(sortedList);
}

function toggleSortName() {
  sortNameAsc = !sortNameAsc;
  sortByName(sortNameAsc);
}

function sortByName(isAscending) {
  const sortedList = empList.slice().sort(function (a, b) {
    const nameA = a.lastname.toUpperCase() + a.firstname.toUpperCase();
    const nameB = b.lastname.toUpperCase() + b.firstname.toUpperCase();

    return isAscending
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  searchEmployee(sortedList);
}
//#endregion
