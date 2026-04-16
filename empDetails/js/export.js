function exportTable() {
  TableToExcel.convert(document.getElementById("histTable"), {
    name: `Dispatch_History_${empID}.xlsx`,
    sheet: {
      name: `${ename}`,
    },
  });
}