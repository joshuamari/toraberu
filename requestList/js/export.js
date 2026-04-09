//#region EXPORT
function saveToPDF() {
  $("#toPrint .td").css("margin-top", "-1rem");
  $("#toPrint .up").css("margin-top", "-0.85rem");
  $("#toPrint .top").css("margin-top", "-0.5rem");
  $("#toPrint .bottom").css("margin-bottom", "0.5rem");
  $("#toPrint .down").css("margin-bottom", "0.85rem");
  $("#attachmentModal td p, #attachmentModal th p").css("margin-top", "-1rem");
  $("#attachmentModal td p.top").css("margin-top", "-0.5rem");
  $("#toPrint .alw").css("margin-top", "-0.2rem");
  $("#toPrint .copy").css("margin-top", "0.5rem");

  var str = $("#attachment").text();

  html2canvas($("#toPrint")[0], { scale: 2 }).then((canvas) => {
    var imgData = canvas.toDataURL("image/jpeg", 1.25);
    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      displayMode: "fullwidth",
      userUnit: 1,
    });

    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
    doc.save(str);
  });

  $("#toPrint .td").css("margin-top", "0");
  $("#toPrint .up").css("margin-top", "0");
  $("#toPrint .top").css("margin-top", "0");
  $("#toPrint .bottom").css("margin-bottom", "0");
  $("#toPrint .down").css("margin-bottom", "0");
  $("#attachmentModal td p, #attachmentModal th p").css("margin-top", "0");
  $("#attachmentModal td p.top").css("margin-top", "0");
  $("#toPrint .alw").css("margin-top", "0");
  $("#toPrint .copy").css("margin-top", "0");
}

function saveToPDF2() {
  $("#toPrint2 table td").css("padding", "0 10px 12px 10px");
  $("#toPrint2 table th").css("padding-top", "0");
  $("#toPrint2 table th").css("padding-bottom", "12px");
  var str = $("#attachment2").text();

  document.body.offsetHeight;

  html2canvas($("#toPrint2")[0], { scale: 2 }).then((canvas) => {
    var imgData = canvas.toDataURL("image/jpeg", 1.25);
    var doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      displayMode: "fullwidth",
      userUnit: 1,
    });

    doc.addImage(imgData, "JPEG", 0, 0, 210, 297);
    doc.save(str);
  });

  $("#toPrint2 table td").css("padding", "6px");
  $("#toPrint2 table th").css("padding-top", "6px");
  $("#toPrint2 table th").css("padding-bottom", "6px");
}

function exportTable() {
  const yr = $("#yearSel").val();
  TableToExcel.convert(document.getElementById("repTable"), {
    name: `Dispatch_Report_${yr}.xlsx`,
    sheet: {
      name: `${yr}`,
    },
  });
}
//#endregion
