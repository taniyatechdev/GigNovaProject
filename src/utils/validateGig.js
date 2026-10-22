
export const validateGig = (form) => {
  const errors = {};

  const title = String(form.title ?? "").trim();
  const category = String(form.category ?? "").trim();
  const experience = String(form.experience ?? "").trim();
  const description = String(form.description ?? "").trim();

  const skills = Array.isArray(form.skills)
    ? form.skills
        .map((skill) => String(skill).trim())
        .filter(Boolean)
    : String(form.skills ?? "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

  if (!title) {
    errors.title = "Project title is required.";
  } else if (title.length < 10) {
    errors.title = "Title must have at least 10 characters.";
  }

  if (!category) {
    errors.category = "Please select a category.";
  }

  if (!experience) {
    errors.experience = "Please select an experience level.";
  }

  if (!description) {
    errors.description = "Project description is required.";
  } else if (description.length < 20) {
    errors.description =
      "Description must contain at least 20 characters.";
  }

  if (skills.length === 0) {
    errors.skills = "Please enter at least one skill.";
  }

  const currency = form.currency || "INR";
  const budget = String(form.budget ?? "").trim();

  if (!["INR", "USD", "unspecified"].includes(currency)) {
    errors.currency = "Please select a valid budget option.";
  }

  // Budget is optional.
  // Validate amount only when user enters one.
  if (currency !== "unspecified" && budget !== "") {
    const amount = Number(budget);

    if (!Number.isFinite(amount) || amount <= 0) {
      errors.budget = "Enter a valid amount greater than zero.";
    }
  }

  const validPaymentTypes = ["fixed", "hourly", "monthly"];

  if (!validPaymentTypes.includes(form.paymentType)) {
    errors.paymentType = "Select a valid payment structure.";
  }

  if (!form.deadline) {
    errors.deadline = "Please select a deadline.";
  } else {
    const date = new Date();

    const today = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    if (form.deadline < today) {
      errors.deadline = "Deadline cannot be in the past.";
    }
  }

  if (form.paymentType === "monthly") {
    const duration = Number(form.durationMonths);

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 60
    ) {
      errors.durationMonths =
        "Contract duration must be between 1 and 60 months.";
    }
  }

  return errors;
};
