const urlParams = new URLSearchParams(window.location.search);
const committeeVal = urlParams.get("committee");

let currentStep = 1;
let committeesList = [];
let countriesList = [];

const commAgendas = {
  "unep": "Harnessing Solar Energy for Equitable Access and Clean Air",
  "unicef": "Impact of Foreign Aid Reductions on Global Child Healthcare",
  "fao": "Addressing the Crisis of Food Insecurity in Conflict Areas",
  "unhrc": "Protecting Digital Rights during Conflicts",
  "un-women": "Addressing Challenges to Women’s Rights and Empowerment",
  "ecosoc": "Ensuring Transparency and Sustainability in Food Supply Chains in the Age of Online Commerce"
};

const commGrades = {
  "unep": [7, 8],
  "un-women": [7, 8],
  "fao": [7, 8],
  "unhrc": [9, 10],
  "unicef": [9, 10],
  "ecosoc": [9, 10]
};

function isCommForGrade(commId, gradeNum) {
  const allowed = commGrades[commId.toLowerCase()];
  return allowed ? allowed.includes(gradeNum) : true;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await DB.init();
    await AppState.loadData();
    committeesList = AppState.committees;
    countriesList = AppState.countries;
    
    setupPreferredCommitteeSelect();
    showStep(1);
  } catch (err) {
    console.error("Error setting up registration wizard:", err);
  }

  // Steps navigations
  document.getElementById("btn-prev-step").onclick = () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  };

  document.getElementById("btn-next-step").onclick = () => {
    try {
      if (validateStep(currentStep)) {
        if (currentStep === 1) {
          renderCountryPanels();
        } else if (currentStep === 2) {
          renderReviewSummary();
        }
        currentStep++;
        showStep(currentStep);
      }
    } catch (err) {
      console.error("Error transitioning wizard steps:", err);
      alert("Wizard Transition Error: " + err.message);
    }
  };

  // Form submission
  const form = document.getElementById("registration-form");
  form.onsubmit = async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById("btn-submit-reg");
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";

    const selectedComm = document.getElementById("field-preferred_committee").value;

    // Grab country preferences
    const country_preferences = [document.getElementById("field-c-1").value];

    // Enable temporarily for payload construction
    document.getElementById("field-grade").disabled = false;
    document.getElementById("field-preferred_committee").disabled = false;

    const regId = "PIS-2026-" + Math.floor(1000 + Math.random() * 9000);
    const formData = {
      id: regId,
      name: document.getElementById("field-name").value.trim(),
      grade: parseInt(document.getElementById("field-grade").value),
      section: document.getElementById("field-section").value.trim(),
      school: document.getElementById("field-school").value.trim(),
      email: document.getElementById("field-email").value.trim(),
      phone: document.getElementById("field-phone").value.trim(),
      portfolio_preference: document.getElementById("field-portfolio_preference").value,
      mun_experience: document.getElementById("field-mun_experience").value.trim() || "First time delegate",
      additional_info: document.getElementById("field-additional_info").value.trim() || "",
      preferred_committee: selectedComm,
      country_preferences: country_preferences,
      committee: "NOT ASSIGNED",
      assigned_country: "NOT ASSIGNED",
      status: "NOT ASSIGNED"
    };

    // Re-disable fields
    if (committeeVal) {
      document.getElementById("field-grade").disabled = true;
      document.getElementById("field-preferred_committee").disabled = true;
    }


  const btnCancel = document.getElementById("btn-cancel-wizard");
  if (btnCancel) {
    btnCancel.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

    try {
      const submission = await DB.submitRegistration(formData);
      localStorage.setItem("pmun_registration_id", submission.id);
      const commName = committeesList.find(c => c.id === selectedComm)?.name || selectedComm;
      window.location.href = `success.html?id=${submission.id}&name=${encodeURIComponent(submission.name)}&grade=${submission.grade}&committee=${encodeURIComponent(commName)}`;
    } catch (err) {
      alert("Submission failed: " + err.message);
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Registration ✓";
    }
  };
});

function showStep(stepNum) {
  document.querySelectorAll(".wizard-step").forEach(el => el.style.display = "none");
  document.getElementById(`step-${stepNum}-container`).style.display = "block";
  
  // Update nodes
  document.querySelectorAll(".step-node").forEach(node => {
    const step = parseInt(node.getAttribute("data-step"));
    const stepNumCircle = node.querySelector(".step-num");
    const stepLabel = node.querySelector(".step-label");
    
    if (step < stepNum) {
      stepNumCircle.style.backgroundColor = "var(--color-success)";
      stepNumCircle.style.borderColor = "var(--color-success)";
      stepNumCircle.style.color = "white";
      stepNumCircle.innerText = "✓";
      stepLabel.style.color = "var(--color-navy)";
      stepLabel.style.fontWeight = "600";
    } else if (step === stepNum) {
      stepNumCircle.style.backgroundColor = "var(--color-podar-blue)";
      stepNumCircle.style.borderColor = "var(--color-podar-blue)";
      stepNumCircle.style.color = "white";
      stepNumCircle.innerText = step;
      stepLabel.style.color = "var(--color-navy)";
      stepLabel.style.fontWeight = "700";
    } else {
      stepNumCircle.style.backgroundColor = "var(--color-white)";
      stepNumCircle.style.borderColor = "var(--color-border)";
      stepNumCircle.style.color = "var(--color-text-muted)";
      stepNumCircle.innerText = step;
      stepLabel.style.color = "var(--color-text-muted)";
      stepLabel.style.fontWeight = "500";
    }
  });

  const fillPercent = ((stepNum - 1) / 3) * 100;
  document.getElementById("progress-bar-fill").style.width = `${fillPercent}%`;

  document.getElementById("btn-prev-step").style.display = stepNum === 1 ? "none" : "block";
  document.getElementById("btn-next-step").style.display = stepNum === 3 ? "none" : "block";
  document.getElementById("btn-submit-reg").style.display = stepNum === 3 ? "block" : "none";
  document.getElementById("btn-cancel-wizard").style.display = stepNum === 1 ? "block" : "none";
}

function validateStep(stepNum) {
  try {
    if (stepNum === 1) {
      const fields = ["field-name", "field-grade", "field-section", "field-school", "field-email", "field-phone", "field-preferred_committee"];
      for (let id of fields) {
        const input = document.getElementById(id);
        if (!input) continue;
        if (!input.checkValidity()) {
          input.reportValidity();
          return false;
        }
      }
      return true;
    }
    
    if (stepNum === 2) {
      const selectEl = document.getElementById("field-c-1");
      if (!selectEl || !selectEl.value) {
        alert("Please choose your country preference.");
        return false;
      }
      return true;
    }
  } catch (err) {
    console.error("Error in validation step:", err);
    alert("Validation error: " + err.message);
    return false;
  }
  return true;
}

function setupPreferredCommitteeSelect() {
  const select = document.getElementById("field-preferred_committee");
  select.innerHTML = '<option value="" disabled selected>Select Committee</option>';
  
  // Categorize options into 7th & 8th and 9th & 10th
  const cat1List = committeesList.filter(c => ["unep", "un-women", "fao"].includes(c.id.toLowerCase()));
  const cat2List = committeesList.filter(c => ["unhrc", "unicef", "ecosoc"].includes(c.id.toLowerCase()));

  if (cat1List.length > 0) {
    let group1 = `<optgroup label="7th & 8th Grade Committees">`;
    cat1List.forEach(comm => {
      group1 += `<option value="${comm.id}">${comm.name}</option>`;
    });
    group1 += `</optgroup>`;
    select.innerHTML += group1;
  }

  if (cat2List.length > 0) {
    let group2 = `<optgroup label="9th & 10th Grade Committees">`;
    cat2List.forEach(comm => {
      group2 += `<option value="${comm.id}">${comm.name}</option>`;
    });
    group2 += `</optgroup>`;
    select.innerHTML += group2;
  }

  function updateGradeOptions(commId) {
    const gradeSelect = document.getElementById("field-grade");
    if (!gradeSelect) return;
    const cleanComm = commId ? commId.toLowerCase() : "";
    const allowedGrades = commGrades[cleanComm];

    Array.from(gradeSelect.options).forEach(opt => {
      if (!opt.value) return;
      const gradeNum = parseInt(opt.value);
      if (!allowedGrades || allowedGrades.includes(gradeNum)) {
        opt.disabled = false;
        opt.hidden = false;
        opt.style.display = "";
      } else {
        opt.disabled = true;
        opt.hidden = true;
        opt.style.display = "none";
      }
    });

    if (allowedGrades) {
      const currentGrade = parseInt(gradeSelect.value);
      if (!currentGrade || !allowedGrades.includes(currentGrade)) {
        gradeSelect.value = allowedGrades[0].toString();
      }
    }
  }

  updateGradeOptions(select.value);

  select.addEventListener("change", () => {
    updateGradeOptions(select.value);
  });

  document.getElementById("field-grade").addEventListener("change", () => {
    let selectedGrade = parseInt(document.getElementById("field-grade").value);
    if (!selectedGrade) return;

    const currentComm = select.value.toLowerCase();
    if (currentComm && !isCommForGrade(currentComm, selectedGrade)) {
      select.value = "";
    }

    Array.from(select.options).forEach(opt => {
      if (!opt.value) return;
      const optCommId = opt.value.toLowerCase();
      if (isCommForGrade(optCommId, selectedGrade)) {
        opt.disabled = false;
        opt.style.display = "block";
      } else {
        opt.disabled = true;
        opt.style.display = "none";
      }
    });
  });

  if (committeeVal) {
    const lowercaseCommVal = committeeVal.toLowerCase();
    const found = committeesList.find(c => c.id.toLowerCase() === lowercaseCommVal);
    if (found) {
      select.value = found.id;
      select.disabled = true;
      updateGradeOptions(lowercaseCommVal);
    }
  }
}

function renderCountryPanels() {
  const wrapper = document.getElementById("country-panels-wrapper");
  wrapper.innerHTML = "";

  const commId = document.getElementById("field-preferred_committee").value;
  if (!commId) return;
  const commObj = committeesList.find(c => c.id && c.id.toLowerCase() === commId.toLowerCase());
  const name = commObj ? commObj.name : commId.toUpperCase();
  
  const commCountries = countriesList.filter(c => c.committee_id && c.committee_id.toLowerCase() === commId.toLowerCase());
  const availableCount = commCountries.filter(c => !c.assigned_to && c.available !== false).length;
  
  let selectHtml = `
    <div class="form-group" style="grid-column: span 5;">
      <label for="field-c-1">Country Preference * <span style="font-weight: normal; color: var(--color-podar-blue); font-size: 0.82rem;">(${availableCount} / ${commCountries.length} countries available)</span></label>
      <select id="field-c-1" class="input-field c-pref" data-index="1" required style="width: 100%;">
        <option value="" disabled selected>Choose Country</option>
        ${commCountries.map(c => {
          const isTaken = c.assigned_to || c.available === false;
          if (isTaken) {
            return `<option value="${c.country_name}" disabled style="color: var(--color-text-muted); font-style: italic;">${c.country_name} — Already Taken</option>`;
          } else {
            return `<option value="${c.country_name}">${c.country_name}</option>`;
          }
        }).join("")}
      </select>
    </div>
  `;

  const panel = document.createElement("div");
  panel.style.marginBottom = "2.5rem";
  panel.style.backgroundColor = "var(--color-bg-light)";
  panel.style.padding = "1.5rem";
  panel.style.borderRadius = "12px";
  panel.style.border = "1px solid var(--color-border)";
  panel.innerHTML = `
    <h4 style="font-family: var(--font-serif); color: var(--color-navy); margin: 0 0 0.5rem 0; font-size: 1.15rem; font-weight: 700;">
      Country Assignment for: ${name}
    </h4>
    <p style="font-size: 0.8rem; color: var(--color-text-muted); margin: 0 0 1.25rem 0;">Topic: ${commAgendas[commId.toLowerCase()] || 'Topic not found'}</p>
    
    <!-- Search filter box -->
    <div style="margin-bottom: 1rem; position: relative;">
      <input type="text" id="country-search-filter" class="input-field" placeholder="🔍 Type country name to filter list below..." style="font-size: 0.85rem; padding: 0.5rem 1rem;">
    </div>

    <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
      ${selectHtml}
    </div>
  `;
  wrapper.appendChild(panel);
  
  // Attach search filter programmatically
  const searchInput = panel.querySelector("#country-search-filter");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterDropdowns(searchInput);
    });
  }
}

function filterDropdowns(inputEl) {
  const filter = inputEl.value.toLowerCase();
  document.querySelectorAll(".c-pref").forEach(select => {
    const currentVal = select.value;
    Array.from(select.options).forEach(opt => {
      if (!opt.value) return;
      const match = opt.value.toLowerCase().includes(filter);
      if (match) {
        opt.style.display = "block";
      } else {
        opt.style.display = "none";
      }
    });
  });
}

function renderReviewSummary() {
  const summary = document.getElementById("review-summary-box");
  const commId = document.getElementById("field-preferred_committee").value;
  const commName = committeesList.find(c => c.id === commId)?.name || commId;

  const country = document.getElementById("field-c-1").value;

  summary.innerHTML = `
    <h4 style="font-family: var(--font-serif); color: var(--color-navy); margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; font-weight: 700; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Personal Details</h4>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; font-size: 0.9rem;">
      <div><strong>Name:</strong> \${document.getElementById("field-name").value}</div>
      <div><strong>Grade & Section:</strong> Grade \${document.getElementById("field-grade").value} - \${document.getElementById("field-section").value}</div>
      <div><strong>School:</strong> \${document.getElementById("field-school").value}</div>
      <div><strong>Email:</strong> \${document.getElementById("field-email").value}</div>
      <div><strong>Phone:</strong> \${document.getElementById("field-phone").value}</div>
      <div><strong>Position:</strong> \${document.getElementById("field-portfolio_preference").value}</div>
    </div>

    <h4 style="font-family: var(--font-serif); color: var(--color-navy); margin-bottom: 1rem; font-size: 1.1rem; font-weight: 700; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem;">Committee & Country Choices</h4>
    
    <div style="margin-bottom: 0.5rem;">
      <h5 style="margin:0 0 0.25rem 0; font-size: 0.95rem; color: var(--color-podar-blue);">Registered Committee: \${commName}</h5>
      <p style="margin:0 0 0.5rem 0; font-size:0.85rem; font-weight: 600; color: var(--color-text-dark);">Preferred Country: \${country}</p>
    </div>
  `;
}
