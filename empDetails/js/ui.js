//#region UI
function fillDetails(empnum) {
  $("#empId").text(`${empnum.id}`);
  $(".surname").text(`${empnum.lastname},`);
  $(".givenname").text(`${empnum.firstname}`);
  $("#empPic").attr("src", empnum.pictureLink);
  if (empnum.dispatch == 0) {
    $("#dStat").addClass("bg-danger").removeClass("bg-success");
    $("#dStat").text("Non Dispatch");
  } else {
    $("#dStat").addClass("bg-success").removeClass("bg-danger");
    $("#dStat").text("For Dispatch");
  }

  $("#disModalEmpName").text(`${empnum.firstname} ${empnum.lastname}`);
  ename = `${empnum.firstname} ${empnum.lastname}`;
}

function passportDisplay(pport) {
  if (Object.keys(pport).length > 0) {
    const pnum = pport.number;
    const pbday = pport.bday;
    const pissue = pport.issue;
    const pexpiry = pport.expiry;
    const pvalid = pport.valid;
    $("#passNo").text(pnum);
    $("#passBday").text(pbday);
    $("#passIssue").text(pissue);
    $("#passExp").text(pexpiry);
    if (pvalid) {
      $("#passStatus").removeClass("bg-danger");
      $("#passStatus").addClass("bg-success");
      $("#passStatus").text("Valid");
    } else {
      $("#passStatus").removeClass("bg-success");
      $("#passStatus").addClass("bg-danger");
      $("#passStatus").text("Expired");
    }
    $("#passDeets").removeClass("d-none");
    $("#passEmpty").addClass("d-none");
  } else {
    $("#passDeets").addClass("d-none");
    $("#passEmpty").removeClass("d-none");
  }
}

function passportInput(pport) {
  const pnum = pport.number;
  const pbday = pport.bday;
  const pissue = pport.issue;
  const pexpiry = pport.expiry;
  const attach = pport.passportLink;
  $("#upPassNo").val(pnum);
  $("#upPassBday").val(pbday);
  $("#upPassIssue").val(pissue);
  $("#upPassExp").val(pexpiry);
  if (attach) {
    $("#wAttachPass").removeClass("d-none");
    $("#noAttachPass").addClass("d-none");
    $("#pAttach").html(
      `Click <a href="${attach}" target="_blank" style="color:var(--tertiary) !important;" class="fw-semibold">here</a> to view`
    );
    $("#passAttachView").attr("src", attach);
  } else {
    $("#noAttachPass").removeClass("d-none");
    $("#wAttachPass").addClass("d-none");
    $("#pAttach").html(`Attachment`);
  }
}

function fillVisa(vsa) {
  visaDisplay(vsa);
  visaInput(vsa);
}

function visaDisplay(vsa) {
  if (Object.keys(vsa).length > 0) {
    const vnum = vsa.number;
    const vissue = vsa.issue;
    const vexpiry = vsa.expiry;
    const vvalid = vsa.valid;
    $("#visaNo").text(vnum);
    $("#visaIssue").text(vissue);
    $("#visaExp").text(vexpiry);
    if (vvalid) {
      $("#visaStatus").removeClass("bg-danger");
      $("#visaStatus").addClass("bg-success");
      $("#visaStatus").text("Valid");
    } else {
      $("#visaStatus").removeClass("bg-success");
      $("#visaStatus").addClass("bg-danger");
      $("#visaStatus").text("Expired");
    }
    $("#visaDeets").removeClass("d-none");
    $("#visaEmpty").addClass("d-none");
  } else {
    $("#visaDeets").addClass("d-none");
    $("#visaEmpty").removeClass("d-none");
  }
}

function visaInput(vsa) {
  const vnum = vsa.number;
  const vissue = vsa.issue;
  const vexpiry = vsa.expiry;
  const attach = vsa.visaLink;
  $("#upVisaNo").val(vnum);
  $("#upVisaIssue").val(vissue);
  $("#upVisaExp").val(vexpiry);
  if (attach) {
    $("#wAttachVisa").removeClass("d-none");
    $("#noAttachVisa").addClass("d-none");
    $("#vAttach").html(
      `Click <a href="${attach}" target="_blank" style="color:var(--tertiary) !important;" class="fw-semibold">here</a> to view`
    );
    $("#visaAttachView").attr("src", attach);
  } else {
    $("#noAttachVisa").removeClass("d-none");
    $("#wAttachVisa").addClass("d-none");
    $("#vAttach").html(`Attachment`);
  }
}

function fillEmployeeDetails() {
  const fName = empDetails.empname.firstname;
  const sName = empDetails.empname.surname;
  const initials = getInitials(fName, sName);
  const grpName = empDetails.group;
  $("#empLabel").html(`${fName} ${sName}`);
  $("#empInitials").html(`${initials}`);
  $("#grpLabel").html(`${grpName}`);
}

function fillLocations(locs) {
  var locSelect = $("#editentryLocation");
  locSelect.empty();
  $.each(locs, function (index, item) {
    var option = $("<option>")
      .attr("value", item.id)
      .text(item.name)
      .attr("loc-id", item.id);
    locSelect.append(option);
  });
}

function resetPassInput() {
  passportDisplay(userPassD);
  passportInput(userPassI);
  $("#upPassNo").attr("disabled", true);
  $("#upPassBday").attr("disabled", true);
  $("#upPassIssue").attr("disabled", true);
  $("#upPassExp").attr("disabled", true);
  $("#upPassAttach").attr("disabled", true);
  $(".attach").addClass("d-none");
  $("#upPassExp, #upPassIssue, #upPassBday, #upPassNo ").removeClass(
    "border border-danger"
  );
  $("#updatePass .btn-close").closest(".modal").find(".modal-footer").html(`
  <button type="button" class="btn btn-cancel btn-secondary">
  Cancel
</button>
<button type="button" class="btn btn-update" id="btn-updatePass">
  Update Passport
</button>
  `);
}

function resetVisaInput() {
  visaDisplay(userVisaD);
  visaInput(userVisaI);
  $("#upVisaNo").attr("disabled", true);
  $("#upVisaIssue").attr("disabled", true);
  $("#upVisaExp").attr("disabled", true);
  $("#upVisaAttach").attr("disabled", true);
  $(".attach").addClass("d-none");
  $("#upVisaNo, #upVisaIssue, #upVisaExp").removeClass("border border-danger");
  $("#updateVisa .btn-close").closest(".modal").find(".modal-footer").html(`
  <button type="button" class="btn btn-cancel btn-secondary">
  Cancel
</button>
<button type="button" class="btn btn-update" id="btn-updateVisa">
  Update Visa
</button>
  `);
}

function removeOutline() {
  $("#edit-companyName").removeClass("bg-red-100  border-red-400");
  $("#edit-StartMonthYear").removeClass("bg-red-100  border-red-400");
  $("#edit-EndMonthYear").removeClass("bg-red-100  border-red-400");
  $("#edit-companyBusiness").removeClass("bg-red-100  border-red-400");
  $("#edit-businessContent").removeClass("bg-red-100  border-red-400");
  $("#edit-workLocation").removeClass("bg-red-100  border-red-400");
  $("#addcompanyName").removeClass("bg-red-100  border-red-400");
  $("#addStartMonthYear").removeClass("bg-red-100  border-red-400");
  $("#addEndMonthYear").removeClass("bg-red-100  border-red-400");
  $("#addcompanyBusiness").removeClass("bg-red-100  border-red-400");
  $("#addbusinessContent").removeClass("bg-red-100  border-red-400");
  $("#addworkLocation").removeClass("bg-red-100  border-red-400");
}

function clearAddWorkInputs() {
  $(
    "#addcompanyName, #addStartMonthYear, #addEndMonthYear, #addcompanyBusiness, #addbusinessContent, #addworkLocation"
  ).removeClass("bg-red-100  border-red-400");
  $(
    "#addcompanyName, #addStartMonthYear, #addEndMonthYear, #addcompanyBusiness, #addbusinessContent, #addworkLocation"
  ).val("");
}
//#endregion