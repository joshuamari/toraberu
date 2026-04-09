function initSidebar() {
  $("#menu").on("click", function () {
    $(".navigation").addClass("open");
    $("body").addClass("overflow-hidden");
  });

  $("#closeNav").on("click", function () {
    $(".navigation").removeClass("open");
    $("body").removeClass("overflow-hidden");
  });
}