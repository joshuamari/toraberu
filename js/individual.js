//#region GLOBALS
const rootFolder = `//${document.location.hostname}`;
let empDetails = [];
let editAccess = false;
//#endregion
checkAccess()
  .then((emp) => {
    if (emp.isSuccess) {
      empDetails = emp.data;
      $(document).ready(function () {
        fillEmployeeDetails();
        Promise.all([
          getDispatchlist(),
          getExpiringPassport(),
          getExpiringVisa(),
          getGraph(),
        ])
          .then(([dList, epList, evList, dData]) => {
            fillDispatchList(dList);
            fillPassport(epList);
            fillVisa(evList);
            dispatchGraph(dData);
            editAccess = emp.data.edit;
            if (!editAccess) {
              $("table tbody tr").css("cursor", "default");
            }
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
$(document).on("click", ".rowEmp", function () {
  if (editAccess) {
    var empID = $(this).attr("emp-id");
    window.location.href = `./empDetails?id=${empID}`;
  }
});
$(document).on("click", "#portalBtn", function () {
  window.location.href = `${rootFolder}`;
});
//#endregion

//#region FUNCTIONS
function getDispatchlist() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_dispatch_list.php",
      data: {
        empnum: empDetails["id"],
      },
      dataType: "json",
      success: function (data) {
        const dList = data;
        resolve(dList);
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
function getExpiringPassport() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_expiring_passport.php",
      data: {
        empnum: empDetails["id"],
      },
      dataType: "json",
      success: function (data) {
        const epList = data;
        resolve(epList);
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
function getExpiringVisa() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "php/get_expiring_visa.php",
      data: {
        empnum: empDetails["id"],
      },
      dataType: "json",
      success: function (data) {
        const evList = data;
        resolve(evList);
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
function formatDays(numberOfDays) {
  if (numberOfDays === 0) {
    return "Expired";
  } else if (numberOfDays >= 30) {
    const months = Math.floor(numberOfDays / 30);

    if (months === 1) {
      return `${months} Month`;
    } else {
      return `${months} Months`;
    }
  } else {
    return `${numberOfDays} days`;
  }
}
function checkAccess() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "global/check_login.php",
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
          reject("An unspecified error occurred.");
        }
      },
    });
    // resolve(response);
  });
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
function capitalizeWord(name) {
  return name
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
function getInitials(firstname, surname) {
  let initials = "";
  var firstInitial = firstname.charAt(0);
  var lastInitial = surname.charAt(0);
  initials = `${firstInitial}${lastInitial}`;
  return initials.toUpperCase();
}
function getGraph() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: "php/get_summary.php",
      dataType: "json",
      success: function (data) {
        // console.log(data);s
        const acc = data;
        resolve(acc);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          reject("Not Found Error: The requested resource was not found.");
        } else if (xhr.status === 500) {
          reject("Internal Server Error: There was a server error.");
        } else {
          reject("An unspecified error occurred while fetching graph data.");
        }
      },
    });
  });
}
function dispatchGraph(dData) {
  // const dispatchData = [
  //   { month: "January", rate: 5 },
  //   { month: "February", rate: 12 },
  //   { month: "March", rate: 0 },
  //   { month: "April", rate: 0 },
  //   { month: "May", rate: 0 },
  //   { month: "June", rate: 0 },
  //   { month: "July", rate: 0 },
  //   { month: "August", rate: 0 },
  //   { month: "September", rate: 15 },
  //   { month: "October", rate: 0 },
  //   { month: "November", rate: 0 },
  //   { month: "December", rate: 0 },
  // ];

  // Extracting months and rates from the data
  const months = dData.map((data) => data.month);
  const rates = dData.map((data) => data.rate);

  // Creating the line chart
  const ctx = document.getElementById("dispatchChart").getContext("2d");
  const dispatchChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "(End of month)",
          data: rates,
          backgroundColor: "#dcfce7", // Fill color under the line
          borderColor: "#22c55e", // Line color
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false, // Disable the legend
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              var value = tooltipItem.raw;
              return (
                value +
                " " +
                (value > 1 ? "dispatch members" : "dispatch member")
              );
            },
          },
        },
      },
    },
  });
}
//#endregion
