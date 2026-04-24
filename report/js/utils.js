//#region UTILS
function ajaxJsonErrorMessage(xhr, fallbackMessage) {
  if (xhr.status === 404) {
    return "Not Found Error: The requested resource was not found.";
  }
  if (xhr.status === 500) {
    return "Internal Server Error: There was a server error.";
  }
  return fallbackMessage || "An unspecified error occurred.";
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
  const firstInitial = firstname.charAt(0);
  const lastInitial = surname.charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
}
//#endregion