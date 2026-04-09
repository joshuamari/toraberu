//#region UTILS
function capitalizeWord(name) {
  return String(name || "")
    .split(" ")
    .map((word) => {
      if (!word) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function getInitials(firstname, surname) {
  const firstInitial = String(firstname || "").charAt(0);
  const lastInitial = String(surname || "").charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

function handleAjaxError(xhr) {
  if (xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  } else if (xhr.status === 500) {
    return "Internal Server Error: There was a server error.";
  }
  return "An unspecified error occurred.";
}
//#endregion