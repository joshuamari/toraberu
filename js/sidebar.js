//#region SIDEBAR
function initSidebar() {
  $(document).on("click", "#menu", function () {
    $(".navigation").addClass("open");
    $("body").addClass("overflow-hidden");
  });

  $(document).on("click", "#closeNav", function () {
    $(".navigation").removeClass("open");
    $("body").removeClass("overflow-hidden");
  });

  loadAppVersion();
}

function getAppVersionUrl() {
  const parts = window.location.pathname.replace(/\\/g, "/").split("/");
  const pcsIdx = parts.findIndex((part) => part.toLowerCase() === "pcs");
  if (pcsIdx === -1) {
    return "api/version.php";
  }
  return `${parts.slice(0, pcsIdx + 1).join("/")}/api/version.php`;
}

function setAppVersion(version) {
  if (!version) {
    return;
  }
  const label = `v${version}`;
  const $el = $("#appVersion");
  if ($el.length) {
    $el.text(label);
    return;
  }
  $(function () {
    $("#appVersion").text(label);
  });
}

function loadAppVersion() {
  $.getJSON(getAppVersionUrl()).done(function (res) {
    const version =
      res && res.success && res.data && res.data.version
        ? String(res.data.version)
        : "";
    setAppVersion(version);
  });
}
//#endregion
