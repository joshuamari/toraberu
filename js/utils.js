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

function ajaxJsonErrorMessage(xhr, fallback) {
  if (xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  } else if (xhr.status === 500) {
    return "Internal Server Error: There was a server error.";
  }
  return fallback;
}
//#endregion