
export const validateProposal = (form) => {
  const errors = {};

  const amount = Number(form.bidAmount);
  const days = Number(form.deliveryDays);
  const letter = String(form.coverLetter ?? "").trim();

  if (!["INR", "USD"].includes(form.currency)) {
    errors.currency = "Please select INR or USD.";
  }

  if (String(form.bidAmount ?? "").trim() === "") {
    errors.bidAmount = "Please enter your proposed amount.";
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.bidAmount = "Amount must be greater than zero.";
  }

  if (String(form.deliveryDays ?? "").trim() === "") {
    errors.deliveryDays = "Please enter delivery time.";
  } else if (
    !Number.isInteger(days) ||
    days < 1 ||
    days > 3650
  ) {
    errors.deliveryDays =
      "Delivery time must be between 1 and 3650 days.";
  }

  if (!letter) {
    errors.coverLetter = "Cover letter is required.";
  } else if (letter.length < 20) {
    errors.coverLetter =
      "Cover letter must contain at least 20 characters.";
  } else if (letter.length > 3000) {
    errors.coverLetter =
      "Cover letter cannot exceed 3000 characters.";
  }

  return errors;
};
