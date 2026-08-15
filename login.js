const urlParams = new URLSearchParams(window.location.search);
const role = urlParams.get("role") || "delegate";

document.addEventListener("DOMContentLoaded", async () => {
  await DB.init();

  if (role === "delegate") {
    const currentRole = localStorage.getItem("pmun_session_role");
    if (currentRole === "delegate") {
      window.location.href = "delegate.html";
      return;
    }

    // Customize UI for delegate Registration ID login
    const titleEl = document.getElementById("password-role-label");
    if (titleEl) titleEl.innerText = "DELEGATE PORTAL ACCESS";
    
    const descEl = document.querySelector(".auth-card p");
    if (descEl) descEl.innerText = "Enter your Registration ID to access your portal.";

    const labelEl = document.querySelector("label[for='portal-password']");
    if (labelEl) labelEl.innerText = "Registration ID";

    const inputEl = document.getElementById("portal-password");
    if (inputEl) {
      inputEl.type = "text";
      inputEl.placeholder = "PIS-2026-XXXX";
    }

    const errorEl = document.getElementById("password-error");
    if (errorEl) errorEl.innerText = "Invalid Registration ID. Please check and try again.";
  } else {
    // Update label
    const label = document.getElementById("password-role-label");
    if (label) {
      if (role === "in_charge_8") label.innerText = "GRADE 8 IN-CHARGE ACCESS";
      else if (role === "in_charge_9") label.innerText = "GRADE 9 IN-CHARGE ACCESS";
      else if (role === "in_charge_10") label.innerText = "GRADE 10 IN-CHARGE ACCESS";
      else label.innerText = `${role.replace("_", "-").toUpperCase()} ACCESS`;
    }
  }

  // Back Button
  document.getElementById("btn-auth-back").addEventListener("click", () => {
    if (role.startsWith("in_charge_")) {
      window.location.href = "in-charge-gate.html";
    } else {
      window.location.href = "index.html";
    }
  });

  // Submit Form
  const form = document.getElementById("password-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputEl = document.getElementById("portal-password");
    const errorEl = document.getElementById("password-error");
    const textEl = document.getElementById("btn-login-text");
    const spinnerEl = document.getElementById("btn-login-spinner");

    errorEl.style.display = "none";
    textEl.innerText = "Verifying...";
    spinnerEl.style.display = "inline-block";

    const isValid = await DB.verifyPassword(role, inputEl.value.trim());

    textEl.innerText = "CONTINUE →";
    spinnerEl.style.display = "none";

    if (isValid) {
      if (role.startsWith("in_charge_")) {
        const gradeNum = role.split("_")[2];
        localStorage.setItem("pmun_session_incharge_grade", gradeNum);
        window.location.href = "in-charge.html";
      } else if (role === "delegate") {
        window.location.href = "delegate.html";
      } else if (role === "coordinator") {
        window.location.href = "coordinator.html";
      }
    } else {
      errorEl.style.display = "block";
      inputEl.value = "";
      inputEl.focus();
    }
  });
});
