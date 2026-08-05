//#region UTILS
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

function formatDate(date) {
  var [year, month, day] = date.split("-");
  monthName = monthNames2[parseInt(month) - 1];

  return day + " " + monthName + " " + year;
}

function isValidIsoDate(value) {
  if (!value || typeof value !== "string") {
    return false;
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsedDate.getTime());
}

function calculateInclusiveDays(startDate, endDate) {
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    return null;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = Math.round((end - start) / 86400000) + 1;

  return diff > 0 ? diff : null;
}

function formatPcsDate(date) {
  if (!isValidIsoDate(date)) {
    return "";
  }

  const [year, month, day] = date.split("-");
  const monthName = monthNames2[parseInt(month, 10) - 1];
  const dayNum = parseInt(day, 10);

  return `${monthName} ${dayNum}, ${year}`;
}

function formatModalDate(value) {
  if (!isValidIsoDate(value)) {
    return "Not available";
  }

  return formatDate(value);
}

function formatDateRange(startDate, endDate) {
  const start = isValidIsoDate(startDate) ? formatPcsDate(startDate) : "";
  const end = isValidIsoDate(endDate) ? formatPcsDate(endDate) : "";

  if (!start && !end) {
    return "—";
  }

  if (start && end) {
    return `${start} — ${end}`;
  }

  return start || end;
}

function formatDispatchDateRange(startDate, endDate) {
  const start = isValidIsoDate(startDate) ? formatDate(startDate) : "";
  const end = isValidIsoDate(endDate) ? formatDate(endDate) : "";

  if (!start && !end) {
    return "—";
  }

  if (start && end) {
    return `${start} — ${end}`;
  }

  return start || end;
}

function formatNetChangeDisplay(totalDiff) {
  const value = Number(totalDiff) || 0;
  const absValue = Math.abs(value);
  const unit = absValue === 1 ? "day" : "days";

  if (value > 0) {
    return {
      text: `+${absValue} ${unit}`,
      className: "net-change-positive",
    };
  }

  if (value < 0) {
    return {
      text: `−${absValue} ${unit}`,
      className: "net-change-negative",
    };
  }

  return {
    text: `0 days`,
    className: "net-change-neutral",
  };
}

function formatName(name) {
  const [last, given] = name.split(",");
  const surname = last.toUpperCase();
  return given + " " + surname;
}

function ajaxJsonErrorMessage(xhr, fallback) {
  if (xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  } else if (xhr.status === 500) {
    return "Internal Server Error: There was a server error.";
  }
  return fallback;
}
//#endregion
