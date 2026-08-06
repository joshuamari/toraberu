//#region CHANGE REQUEST WORKFLOW
const CHANGE_REQUEST_ENDPOINTS = {
  create: "../changeRequests/php/create_change_request.php",
};

function canRequestDispatchChange(request) {
  return resolveDispatchDisplayStatus(request) === "approved";
}

function hasPendingCancellationRequest(request) {
  return Boolean(request?.pending_cancellation_request);
}

function updateChangeRequestActionsVisibility(request) {
  const actionsEl = document.getElementById("changeRequestActions");
  const cancellationBtn = document.getElementById("btnRequestCancellation");

  if (!actionsEl || !cancellationBtn) {
    return;
  }

  const showCancellation =
    canRequestDispatchChange(request) &&
    !hasPendingCancellationRequest(request);

  if (!showCancellation) {
    actionsEl.classList.add("d-none");
    return;
  }

  actionsEl.classList.remove("d-none");
  cancellationBtn.classList.remove("d-none");
}

function formatLocationDisplay(request) {
  const specific = request.specific_loc || "";
  const country = request.location || "";

  if (specific && country) {
    return `${specific}, ${country}`;
  }

  return specific || country || "—";
}

function blurFocusedDescendant(container) {
  const active = document.activeElement;
  if (
    container &&
    active instanceof HTMLElement &&
    container.contains(active)
  ) {
    active.blur();
  }
}

function openChangeRequestModalFromRequest(changeRequestModalId, beforeShow) {
  const requestModalElement = document.getElementById("openModal");
  const changeRequestModalElement = document.getElementById(
    changeRequestModalId,
  );

  if (!requestModalElement || !changeRequestModalElement || !window.bootstrap) {
    return;
  }

  const requestModal =
    bootstrap.Modal.getOrCreateInstance(requestModalElement);
  const changeRequestModal = bootstrap.Modal.getOrCreateInstance(
    changeRequestModalElement,
  );

  const onRequestHidden = function () {
    requestModalElement.removeEventListener("hidden.bs.modal", onRequestHidden);

    if (typeof beforeShow === "function") {
      beforeShow();
    }

    changeRequestModal.show();
  };

  requestModalElement.addEventListener("hidden.bs.modal", onRequestHidden);
  requestModal.hide();
}

function returnToRequestModalFromChangeRequest(changeRequestModalId) {
  if (isChangeRequestSubmitting) {
    return;
  }

  const requestModalElement = document.getElementById("openModal");
  const changeRequestModalElement = document.getElementById(
    changeRequestModalId,
  );

  if (!requestModalElement || !changeRequestModalElement || !window.bootstrap) {
    return;
  }

  const requestModal =
    bootstrap.Modal.getOrCreateInstance(requestModalElement);
  const changeRequestModal = bootstrap.Modal.getOrCreateInstance(
    changeRequestModalElement,
  );

  blurFocusedDescendant(changeRequestModalElement);

  const onChangeRequestHidden = function () {
    changeRequestModalElement.removeEventListener(
      "hidden.bs.modal",
      onChangeRequestHidden,
    );

    const onRequestShown = function () {
      requestModalElement.removeEventListener("shown.bs.modal", onRequestShown);

      if (changeRequestTriggerElement instanceof HTMLElement) {
        changeRequestTriggerElement.focus();
      }
    };

    requestModalElement.addEventListener("shown.bs.modal", onRequestShown);
    requestModal.show();
  };

  changeRequestModalElement.addEventListener(
    "hidden.bs.modal",
    onChangeRequestHidden,
  );
  changeRequestModal.hide();
}

function clearFieldValidation(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);

  if (field) {
    field.classList.remove("is-invalid");
    field.setAttribute("aria-invalid", "false");
  }

  if (error) {
    error.textContent = "";
  }
}

function setFieldValidation(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);

  if (field) {
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");
  }

  if (error) {
    error.textContent = message;
  }
}

function hideFormLevelError(errorId) {
  const errorEl = document.getElementById(errorId);

  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.add("d-none");
    errorEl.classList.remove("alert-warning");
    errorEl.classList.add("alert-danger");
  }
}

function showFormLevelError(errorId, message) {
  const errorEl = document.getElementById(errorId);

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove("d-none", "alert-warning");
    errorEl.classList.add("alert-danger");
  }
}

function resetCancellationFormState() {
  const form = document.getElementById("cancellationRequestForm");

  if (!form) {
    return;
  }

  form.reset();
  clearFieldValidation("crReason", "crReasonError");
  hideFormLevelError("cancellationFormError");
  setCancellationSubmitting(false);
}

function populateCancellationRequestForm(request) {
  if (!request) {
    return;
  }

  resetCancellationFormState();

  $("#crEmpName").text(request.emp_name || "—");
  $("#crEmpNumber").text(request.emp_number ?? "—");
  $("#crGroupName").text(request.group_name || "—");
  $("#crRequestId").text(request.req_id ?? "—");
  $("#crCurrentStart").text(formatDate(request.from));
  $("#crCurrentEnd").text(formatDate(request.to));
  $("#crLocation").text(formatLocationDisplay(request));
  $("#crRequestedBy").text(request.requester_name || "—");
}

function validateCancellationForm() {
  let isValid = true;

  clearFieldValidation("crReason", "crReasonError");
  hideFormLevelError("cancellationFormError");

  const reason = String($("#crReason").val() || "").trim();

  if (!reason) {
    setFieldValidation(
      "crReason",
      "crReasonError",
      "Cancellation reason is required.",
    );
    const reasonField = document.getElementById("crReason");
    if (reasonField instanceof HTMLElement) {
      reasonField.focus();
    }
    isValid = false;
  }

  return {
    isValid,
    reason,
  };
}

function setCancellationSubmitting(isSubmitting) {
  isChangeRequestSubmitting = isSubmitting;
  $("#btnSubmitCancellation").prop("disabled", isSubmitting);
  $("#btnCancellationBack").prop("disabled", isSubmitting);
  $("#btnSubmitCancellationSpinner").toggleClass("d-none", !isSubmitting);
}

async function refreshRequestListAfterChangeRequest() {
  const [reqs, counts] = await Promise.all([getRequests(), getCount()]);
  reqList = syncRequestListStatusFields(reqs["data"]);
  cardData = counts["data"];
  fillCards();
  searchFilter(reqList);

  if (selectedDispatchRequest?.req_id) {
    const refreshed = reqList.find(
      (item) =>
        String(item.req_id) === String(selectedDispatchRequest.req_id),
    );
    if (refreshed) {
      selectedDispatchRequest = refreshed;
    }
  }
}

async function handleCancellationSubmit() {
  if (isChangeRequestSubmitting || !selectedDispatchRequest) {
    return;
  }

  const validation = validateCancellationForm();

  if (!validation.isValid) {
    return;
  }

  setCancellationSubmitting(true);
  hideFormLevelError("cancellationFormError");

  try {
    const response = await createChangeRequest({
      change_type: "cancellation",
      request_id: selectedDispatchRequest.req_id,
      reason: validation.reason,
    });

    if (!response || response.isSuccess === false) {
      throw new Error(
        (response && response.message) ||
          "Unable to submit the cancellation request.",
      );
    }

    await refreshRequestListAfterChangeRequest();

    const cancellationModalElement = document.getElementById(
      "cancellationRequestModal",
    );
    if (cancellationModalElement && window.bootstrap) {
      blurFocusedDescendant(cancellationModalElement);
      bootstrap.Modal.getOrCreateInstance(cancellationModalElement).hide();
    }

    if (selectedDispatchRequest?.req_id) {
      fillOpenModal(selectedDispatchRequest.req_id);
    }
  } catch (error) {
    showFormLevelError(
      "cancellationFormError",
      error.message || "Unable to submit the cancellation request.",
    );
  } finally {
    setCancellationSubmitting(false);
  }
}

function bindChangeRequestEvents() {
  $(document).on("click", "#btnRequestCancellation", function (event) {
    changeRequestTriggerElement = event.currentTarget;
    openChangeRequestModalFromRequest("cancellationRequestModal", function () {
      populateCancellationRequestForm(selectedDispatchRequest);
    });
  });

  $(document).on(
    "click",
    "#btnCancellationBack, #btnCancellationClose",
    function () {
      returnToRequestModalFromChangeRequest("cancellationRequestModal");
    },
  );

  $(document).on("click", "#btnSubmitCancellation", function () {
    handleCancellationSubmit();
  });

  $(document).on("submit", "#cancellationRequestForm", function (event) {
    event.preventDefault();
    handleCancellationSubmit();
  });
}
//#endregion
