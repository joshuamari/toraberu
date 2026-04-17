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
}
//#endregion