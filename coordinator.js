// Route Auth Guard
    (async () => {
      await DB.init();
      await AppState.loadData();
      if (!AppState.checkAuth("coordinator")) {
        window.location.href = "login.html?role=coordinator";
      }
    })();

let sortColumn = "created_at";
    let sortDirection = "desc";

    document.addEventListener("DOMContentLoaded", async () => {
      await DB.init();
      await AppState.loadData();

      // Setup sidebar routing
      document.querySelectorAll(".sidebar-menu li[data-pane]").forEach(li => {
        li.addEventListener("click", () => {
          document.querySelectorAll(".sidebar-menu li").forEach(item => item.classList.remove("active"));
          li.classList.add("active");

          const paneId = li.getAttribute("data-pane");
          document.querySelectorAll(".dashboard-pane").forEach(pane => pane.classList.remove("active"));
          document.getElementById(`${paneId}-pane`).classList.add("active");
        });
      });

      // Initialize all panels
      renderKPIs();
      renderCharts();
      setupRegistrationsTablePane();
      setupCommitteesPane();
      setupSettingsPanes();
      updateAllocationPanel();

      // Detail Modal Close
      const detailModal = document.getElementById("detail-modal");
      document.getElementById("btn-close-detail-modal").onclick = () => {
        detailModal.classList.remove("active");
      };
    });

    function renderKPIs() {
      const total = AppState.registrations.length;
      const grade8 = AppState.registrations.filter(r => parseInt(r.grade) === 8).length;
      const grade9 = AppState.registrations.filter(r => parseInt(r.grade) === 9).length;
      const grade10 = AppState.registrations.filter(r => parseInt(r.grade) === 10).length;

      document.getElementById("coord-kpi-total").innerText = total;
      document.getElementById("coord-kpi-grade8").innerText = grade8;
      document.getElementById("coord-kpi-grade9").innerText = grade9;
      document.getElementById("coord-kpi-grade10").innerText = grade10;
    }

    function renderCharts() {
      const grade8 = AppState.registrations.filter(r => parseInt(r.grade) === 8).length;
      const grade9 = AppState.registrations.filter(r => parseInt(r.grade) === 9).length;
      const grade10 = AppState.registrations.filter(r => parseInt(r.grade) === 10).length;
      const maxGrade = Math.max(grade8, grade9, grade10, 1);

      document.getElementById("bar-grade8-fill").style.width = `${(grade8 / maxGrade) * 100}%`;
      document.getElementById("bar-grade8-fill").innerText = grade8;
      document.getElementById("bar-grade9-fill").style.width = `${(grade9 / maxGrade) * 100}%`;
      document.getElementById("bar-grade9-fill").innerText = grade9;
      document.getElementById("bar-grade10-fill").style.width = `${(grade10 / maxGrade) * 100}%`;
      document.getElementById("bar-grade10-fill").innerText = grade10;

      // Committees charts
      const commGrid = document.getElementById("comm-chart-container");
      commGrid.innerHTML = "";
      AppState.committees.forEach(comm => {
        const count = AppState.registrations.filter(r => r.committee.toLowerCase().includes(comm.name.toLowerCase()) || r.committee.toLowerCase().includes(comm.id.toLowerCase())).length;
        const maxVal = Math.max(...AppState.committees.map(c => AppState.registrations.filter(r => r.committee.toLowerCase().includes(c.name.toLowerCase()) || r.committee.toLowerCase().includes(c.id.toLowerCase())).length), 1);
        const percent = (count / maxVal) * 100;
        
        commGrid.innerHTML += `
          <div class="chart-bar-row">
            <div class="chart-bar-label">${comm.id.toUpperCase().replace("-", " ")}</div>
            <div class="chart-bar-wrapper">
              <div class="chart-bar-fill" style="width: ${percent}%; background-color: var(--color-podar-blue);">${count}</div>
            </div>
            <div class="chart-bar-val">${count}</div>
          </div>
        `;
      });
    }

    function setupRegistrationsTablePane() {
      const searchInput = document.getElementById("coord-search");
      const filterGrade = document.getElementById("coord-grade-filter");
      const filterSchool = document.getElementById("coord-school-filter");
      const filterCommittee = document.getElementById("coord-committee-filter");
      const filterCountry = document.getElementById("coord-country-filter");
      const filterSection = document.getElementById("coord-section-filter");
      const filterStatus = document.getElementById("coord-status-filter");
      const filterPref = document.getElementById("coord-pref-filter");

      // Dynamic school options
      const schools = [...new Set(AppState.registrations.map(r => r.school).filter(Boolean))].sort();
      filterSchool.innerHTML = '<option value="ALL">All Schools</option>';
      schools.forEach(sch => {
        filterSchool.innerHTML += `<option value="${sch}">${sch}</option>`;
      });

      // Dynamic sections options
      const sections = [...new Set(AppState.registrations.map(r => r.section).filter(Boolean))].sort();
      filterSection.innerHTML = '<option value="ALL">All Sections</option>';
      sections.forEach(sec => {
        filterSection.innerHTML += `<option value="${sec}">${sec}</option>`;
      });

      // Dynamic country options
      const countries = [...new Set(AppState.countries.map(c => c.country_name).filter(Boolean))].sort();
      filterCountry.innerHTML = '<option value="ALL">All Countries</option>';
      countries.forEach(ctry => {
        filterCountry.innerHTML += `<option value="${ctry}">${ctry}</option>`;
      });

      const applyFilters = () => {
        const q = searchInput.value.toLowerCase();
        const grade = filterGrade.value;
        const school = filterSchool.value;
        const committee = filterCommittee.value;
        const country = filterCountry.value;
        const section = filterSection.value;
        const status = filterStatus.value;
        const prefVal = filterPref.value.toLowerCase();

        let filtered = AppState.registrations.filter(r => {
          const matchSearch = r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
          const matchGrade = grade === "ALL" || String(r.grade) === grade;
          const matchSchool = school === "ALL" || r.school === school;
          const matchCommittee = committee === "ALL" || (r.committee && r.committee.toLowerCase() === committee.toLowerCase());
          const matchCountry = country === "ALL" || (r.assigned_country && r.assigned_country.toLowerCase() === country.toLowerCase());
          const matchSection = section === "ALL" || (r.section && r.section.toLowerCase() === section.toLowerCase());
          const matchStatus = status === "ALL" || (r.status && r.status.toLowerCase() === status.toLowerCase());
          
          let matchPref = true;
          if (prefVal) {
            matchPref = false;
            if (r.country_preferences) {
              let allPrefs = [];
              if (Array.isArray(r.country_preferences)) {
                allPrefs = r.country_preferences;
              } else if (typeof r.country_preferences === 'object') {
                allPrefs = Object.values(r.country_preferences).flat();
              }
              matchPref = allPrefs.some(c => c && c.toLowerCase().includes(prefVal));
            }
          }

          return matchSearch && matchGrade && matchSchool && matchCommittee && matchCountry && matchSection && matchStatus && matchPref;
        });

        // Sorting
        filtered.sort((a, b) => {
          let valA = a[sortColumn];
          let valB = b[sortColumn];

          if (typeof valA === "string") {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
          }

          if (valA < valB) return sortDirection === "asc" ? -1 : 1;
          if (valA > valB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        });

        renderTable(filtered);
      };

      searchInput.oninput = applyFilters;
      filterGrade.onchange = applyFilters;
      filterSchool.onchange = applyFilters;
      filterCommittee.onchange = applyFilters;
      filterCountry.onchange = applyFilters;
      filterSection.onchange = applyFilters;
      filterStatus.onchange = applyFilters;
      filterPref.oninput = applyFilters;

      // Table headers sort toggle
      document.querySelectorAll("#coord-registrations-table th.sortable").forEach(th => {
        th.onclick = () => {
          const col = th.getAttribute("data-col");
          if (sortColumn === col) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
          } else {
            sortColumn = col;
            sortDirection = "asc";
          }

          document.querySelectorAll("#coord-registrations-table th.sortable").forEach(header => {
            header.classList.remove("sorting-asc", "sorting-desc");
          });
          th.classList.add(sortDirection === "asc" ? "sorting-asc" : "sorting-desc");

          applyFilters();
        };
      });

      applyFilters();

      // Export Master CSV
      document.getElementById("btn-coord-export").onclick = () => {
        const csvHeaders = ["Registration ID", "Name", "Grade", "Section", "School", "Committee", "Email", "Phone", "MUN Experience", "Preferred Position", "Additional Info", "Date Registered"];
        const csvRows = AppState.registrations.map(r => [
          r.id, r.name, r.grade, r.section, r.school, r.committee, r.email, r.phone, r.mun_experience, r.portfolio_preference, r.additional_info, new Date(r.created_at).toLocaleDateString()
        ]);
        triggerCsv(csvHeaders, csvRows, "PMUN_2026_All_Registrations.csv");
      };
    }

    function renderTable(regs) {
      const tbody = document.getElementById("coordinator-table-body");
      tbody.innerHTML = "";

      if (regs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="no-data-row" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">No matching registrations found.</td>
          </tr>
        `;
        return;
      }

      regs.forEach(reg => {
        const dateStr = new Date(reg.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric"
        });

        tbody.innerHTML += `
          <tr style="border-bottom: 1px solid var(--color-border);">
            <td style="padding: 1rem 1.5rem; font-weight: 600; color: var(--color-podar-blue);">${reg.id}</td>
            <td style="padding: 1rem 1.5rem; font-weight: 500;">${reg.name}</td>
            <td style="padding: 1rem 1.5rem;"><span class="table-badge grade-${reg.grade}">Grade ${reg.grade}</span></td>
            <td style="padding: 1rem 1.5rem; text-align: center;">${reg.section}</td>
            <td style="padding: 1rem 1.5rem;">${reg.school}</td>
            <td style="padding: 1rem 1.5rem;">${dateStr}</td>
            <td style="padding: 1rem 1.5rem;">
              <button class="btn-table-action" onclick="showDetailModal('${reg.id}')">View Details</button>
            </td>
          </tr>
        `;
      });
    }

    window.showDetailModal = function(regId) {
      const reg = AppState.registrations.find(r => r.id === regId);
      if (!reg) return;

      const modal = document.getElementById("detail-modal");
      const body = document.getElementById("detail-modal-body");

      const exp = reg.mun_experience ? reg.mun_experience : "No experience recorded.";
      const addInfo = reg.additional_info ? reg.additional_info : "None.";

      let prefHtml = "";
      if (reg.preferred_committee) {
        const commName = AppState.committees.find(c => c.id === reg.preferred_committee)?.name || reg.preferred_committee.toUpperCase();
        const countries = Array.isArray(reg.country_preferences) ? reg.country_preferences : [];
        prefHtml = `
          <div class="detail-item" style="grid-column: span 2; border-top:1px solid var(--color-border); padding-top:0.75rem;">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Committee & Country Choices</p>
            <div style="background-color: var(--color-bg-light); padding: 0.75rem; border-radius: 4px; font-size: 0.85rem; line-height: 1.5;">
              <div><strong>Registered Committee:</strong> ${commName}</div>
              <div style="margin-top:0.25rem;"><strong>Country Preferences:</strong> ${countries.join(", ")}</div>
            </div>
          </div>
        `;
      } else if (reg.committee_preferences && reg.country_preferences) {
        const p1 = reg.committee_preferences.pref1 || "None";
        const p2 = reg.committee_preferences.pref2 || "None";
        const p3 = reg.committee_preferences.pref3 || "None";
        const c1 = reg.country_preferences[p1] || [];
        const c2 = reg.country_preferences[p2] || [];
        const c3 = reg.country_preferences[p3] || [];
        
        const p1Name = AppState.committees.find(c => c.id === p1)?.name || p1.toUpperCase();
        const p2Name = AppState.committees.find(c => c.id === p2)?.name || p2.toUpperCase();
        const p3Name = AppState.committees.find(c => c.id === p3)?.name || p3.toUpperCase();

        prefHtml = `
          <div class="detail-item" style="grid-column: span 2; border-top:1px solid var(--color-border); padding-top:0.75rem;">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Committee & Country Choices (Legacy)</p>
            <div style="background-color: var(--color-bg-light); padding: 0.75rem; border-radius: 4px; font-size: 0.85rem; line-height: 1.5;">
              <div><strong>1. ${p1Name}:</strong> ${c1.join(", ")}</div>
              <div style="margin-top:0.25rem;"><strong>2. ${p2Name}:</strong> ${c2.join(", ")}</div>
              <div style="margin-top:0.25rem;"><strong>3. ${p3Name}:</strong> ${c3.join(", ")}</div>
            </div>
          </div>
        `;
      } else {
        prefHtml = `
          <div class="detail-item" style="grid-column: span 2; border-top:1px solid var(--color-border); padding-top:0.75rem;">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Preferred Committee (Legacy Format)</p>
            <p class="detail-val" style="margin:0;">First choice: ${reg.committee}</p>
          </div>
        `;
      }

      body.innerHTML = `
        <div class="detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-height: 75vh; overflow-y: auto;">
          <div class="detail-item">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Registration ID</p>
            <p class="detail-val" style="font-weight: 700; color: var(--color-podar-blue); font-size:1.1rem; margin:0;">${reg.id}</p>
          </div>
          <div class="detail-item">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Registration Date</p>
            <p class="detail-val" style="margin:0;">${new Date(reg.created_at).toLocaleString()}</p>
          </div>
          <div class="detail-item" style="grid-column: span 2; border-top:1px solid var(--color-border); padding-top:0.75rem;">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Full Name</p>
            <p class="detail-val" style="font-weight: 600; font-size:1.15rem; margin:0;">${reg.name}</p>
          </div>
          <div class="detail-item">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Grade & Section</p>
            <p class="detail-val" style="margin:0;">Grade ${reg.grade} - Section ${reg.section}</p>
          </div>
          <div class="detail-item">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">School</p>
            <p class="detail-val" style="margin:0;">${reg.school}</p>
          </div>
          <div class="detail-item">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Email</p>
            <p class="detail-val" style="margin:0;"><a href="mailto:${reg.email}" style="color:var(--color-podar-blue); text-decoration:underline;">${reg.email}</a></p>
          </div>
          <div class="detail-item">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Phone</p>
            <p class="detail-val" style="margin:0;">${reg.phone}</p>
          </div>
          <div class="detail-item" style="grid-column: span 2;">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Preferred Position</p>
            <p class="detail-val" style="margin:0;">${reg.portfolio_preference}</p>
          </div>
          <div class="detail-item" style="grid-column: span 2;">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Assigned Portfolio Status</p>
            <p class="detail-val" style="font-weight: 600; color: var(--color-podar-blue); margin:0;">
              ${reg.committee !== 'NOT ASSIGNED' ? `${AppState.committees.find(c => c.id === reg.committee)?.name || reg.committee} — ${reg.assigned_country} [${reg.status}]` : 'NOT ASSIGNED'}
            </p>
          </div>
          
          ${prefHtml}

          <div class="detail-item" style="grid-column: span 2; border-top:1px solid var(--color-border); padding-top:0.75rem;">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">MUN Experience</p>
            <p class="detail-val" style="background-color: var(--color-bg-light); padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; line-height: 1.4; margin:0;">${exp}</p>
          </div>
          <div class="detail-item" style="grid-column: span 2;">
            <p class="detail-label" style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.25rem;">Additional Notes</p>
            <p class="detail-val" style="background-color: var(--color-bg-light); padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; line-height: 1.4; margin:0;">${addInfo}</p>
          </div>

          <!-- MANUAL ASSIGNMENT PANEL -->
          <div class="detail-item" style="grid-column: span 2; border-top: 2px solid var(--color-podar-blue); padding-top: 1rem; margin-top: 0.5rem;">
            <h4 style="margin: 0 0 1rem 0; color: var(--color-navy); font-family: var(--font-serif); font-size: 1.1rem; font-weight: 700;">Manual Portfolio Assignment</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label style="font-size:0.75rem; font-weight:600; margin-bottom:0.25rem; display:block;">Assigned Committee</label>
                <select id="modal-assign-committee" class="input-field" onchange="updateModalCountrySelect('${reg.id}')">
                  <option value="NOT ASSIGNED">NOT ASSIGNED</option>
                  ${AppState.committees.map(c => `<option value="${c.id}" ${reg.committee === c.id ? 'selected' : ''}>${c.name}</option>`).join("")}
                </select>
              </div>
              <div class="form-group">
                <label style="font-size:0.75rem; font-weight:600; margin-bottom:0.25rem; display:block;">Assigned Country</label>
                <select id="modal-assign-country" class="input-field">
                  <!-- Populated dynamically -->
                </select>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: center; margin-bottom: 1.5rem;">
              <div class="form-group">
                <label style="font-size:0.75rem; font-weight:600; margin-bottom:0.25rem; display:block;">Assignment Status</label>
                <select id="modal-assign-status" class="input-field">
                  <option value="NOT ASSIGNED" ${reg.status === 'NOT ASSIGNED' ? 'selected' : ''}>NOT ASSIGNED</option>
                  <option value="ASSIGNED" ${reg.status === 'ASSIGNED' ? 'selected' : ''}>ASSIGNED</option>
                  <option value="WAITLISTED" ${reg.status === 'WAITLISTED' ? 'selected' : ''}>WAITLISTED</option>
                  <option value="REJECTED" ${reg.status === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
                </select>
              </div>
              <div class="form-group" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 1.25rem;">
                <input type="checkbox" id="modal-assign-override" style="width: 18px; height: 18px; margin:0;">
                <label for="modal-assign-override" style="font-size: 0.8rem; font-weight: 600; cursor: pointer; color: var(--color-navy);">Override country lock</label>
              </div>
            </div>

            <button class="btn-primary" onclick="saveManualAssignment('${reg.id}')" style="width: 100%; font-weight: 700; padding: 0.75rem; background-color: var(--color-navy); border-color: var(--color-navy); border-radius: 30px; cursor: pointer; color: white;">Save Portfolio Assignment ✓</button>
          </div>
        </div>
      `;

      updateModalCountrySelect(reg.id);
      modal.classList.add("active");
    };

    window.updateModalCountrySelect = function(regId) {
      const commSelect = document.getElementById("modal-assign-committee");
      const countrySelect = document.getElementById("modal-assign-country");
      if (!commSelect || !countrySelect) return;
      
      const commId = commSelect.value;
      if (commId === "NOT ASSIGNED") {
        countrySelect.innerHTML = '<option value="NOT ASSIGNED">NOT ASSIGNED</option>';
        return;
      }
      
      const reg = AppState.registrations.find(r => r.id === regId);
      const commCountries = AppState.countries.filter(c => c.committee_id.toLowerCase() === commId.toLowerCase());
      
      let optionsHtml = '<option value="NOT ASSIGNED">NOT ASSIGNED</option>';
      commCountries.forEach(c => {
        const isAssigned = c.assigned_to && c.assigned_to !== regId;
        const delegateName = isAssigned ? (AppState.registrations.find(r => r.id === c.assigned_to)?.name || "Another Delegate") : "";
        const label = isAssigned ? `${c.country_name} [Assigned to: ${delegateName}]` : c.country_name;
        
        optionsHtml += `<option value="${c.country_name}" ${reg.assigned_country === c.country_name ? 'selected' : ''}>${label}</option>`;
      });
      countrySelect.innerHTML = optionsHtml;
    };

    window.saveManualAssignment = async function(regId) {
      const commId = document.getElementById("modal-assign-committee").value;
      const countryName = document.getElementById("modal-assign-country").value;
      const status = document.getElementById("modal-assign-status").value;
      const override = document.getElementById("modal-assign-override").checked;

      const reg = AppState.registrations.find(r => r.id === regId);
      if (!reg) return;

      if (commId !== "NOT ASSIGNED" && countryName !== "NOT ASSIGNED") {
        const countryObj = AppState.countries.find(c => c.committee_id.toLowerCase() === commId.toLowerCase() && c.country_name.toLowerCase() === countryName.toLowerCase());
        if (countryObj && countryObj.assigned_to && countryObj.assigned_to !== regId && !override) {
          alert(`Error: The country ${countryName} is already assigned to another delegate. Check the "Override country lock" box if you wish to override this lock.`);
          return;
        }
      }

      const successReg = await DB.updateRegistration(regId, {
        committee: commId,
        assigned_country: countryName,
        status: status
      });

      if (!successReg) {
        alert("Failed to update delegate registration.");
        return;
      }

      // Free up old country
      if (reg.committee !== "NOT ASSIGNED" && reg.assigned_country !== "NOT ASSIGNED") {
        const oldCountry = AppState.countries.find(c => c.committee_id.toLowerCase() === reg.committee.toLowerCase() && c.country_name.toLowerCase() === reg.assigned_country.toLowerCase());
        if (oldCountry && oldCountry.assigned_to === regId) {
          await DB.updateCountry(oldCountry.id, { assigned_to: null, available: true });
        }
      }

      // Lock new country
      if (commId !== "NOT ASSIGNED" && countryName !== "NOT ASSIGNED") {
        const newCountry = AppState.countries.find(c => c.committee_id.toLowerCase() === commId.toLowerCase() && c.country_name.toLowerCase() === countryName.toLowerCase());
        if (newCountry) {
          await DB.updateCountry(newCountry.id, { assigned_to: regId, available: false });
        }
      }

      alert("Portfolio assignment saved successfully!");
      document.getElementById("detail-modal").classList.remove("active");
      
      await AppState.loadData();
      if (window.applyFilters) window.applyFilters();
      renderKPIs();
      renderCharts();
      if (window.updateAllocationPanel) window.updateAllocationPanel();
    };

    function setupCommitteesPane() {
      const commSelect = document.getElementById("mgr-select-committee");
      const commName = document.getElementById("mgr-name");
      const commAgenda = document.getElementById("mgr-agenda");
      const commDesc = document.getElementById("mgr-desc");
      const commChair = document.getElementById("mgr-chair");
      const commVice = document.getElementById("mgr-vice");
      const commRapp = document.getElementById("mgr-rapp");
      const commCap = document.getElementById("mgr-capacity");
      const commStatus = document.getElementById("mgr-status");

      const loadCommitteeConfig = () => {
        const commId = commSelect.value;
        const comm = AppState.committees.find(c => c.id === commId);
        if (!comm) return;

        commName.value = comm.name;
        commAgenda.value = comm.agenda;
        commDesc.value = comm.description;
        commChair.value = comm.eb_chair;
        commVice.value = comm.eb_vice_chair;
        commRapp.value = comm.eb_rapporteur;
        commCap.value = comm.capacity;
        commStatus.value = comm.status;
      };

      commSelect.onchange = loadCommitteeConfig;
      loadCommitteeConfig();

      document.getElementById("mgr-committee-form").onsubmit = async (e) => {
        e.preventDefault();
        const commId = commSelect.value;

        const updatedData = {
          name: commName.value.trim(),
          agenda: commAgenda.value.trim(),
          description: commDesc.value.trim(),
          eb_chair: commChair.value.trim(),
          eb_vice_chair: commVice.value.trim(),
          eb_rapporteur: commRapp.value.trim(),
          capacity: parseInt(commCap.value),
          status: commStatus.value
        };

        const success = await DB.updateCommittee(commId, updatedData);
        if (success) {
          alert("Committee details saved successfully!");
          await AppState.loadData();
          renderKPIs();
          renderCharts();
        } else {
          alert("Error saving committee details.");
        }
      };
    }

    function setupSettingsPanes() {
      // Global settings
      const cfgStatus = document.getElementById("cfg-status");
      const cfgDeadline = document.getElementById("cfg-deadline");
      const cfgAllowSwitch = document.getElementById("cfg-allow-switch");

      if (AppState.config) {
        cfgStatus.value = AppState.config.registration_status || "OPEN";
        if (AppState.config.deadline) {
          cfgDeadline.value = AppState.config.deadline.substring(0, 10);
        }
        cfgAllowSwitch.checked = AppState.config.allow_switch_committee;
      }

      document.getElementById("mgr-settings-form").onsubmit = async (e) => {
        e.preventDefault();
        
        const newConfig = {
          registration_status: cfgStatus.value,
          deadline: new Date(cfgDeadline.value).toISOString(),
          allow_switch_committee: cfgAllowSwitch.checked
        };

        const success = await DB.updateConfig(newConfig);
        if (success) {
          alert("Global settings updated successfully!");
          await AppState.loadData();
          renderKPIs();
        } else {
          alert("Error updating settings.");
        }
      };

      // Passwords Form
      const pwDel = document.getElementById("pw-delegate");
      const pwStaff8 = document.getElementById("pw-staff8");
      const pwStaff9 = document.getElementById("pw-staff9");
      const pwStaff10 = document.getElementById("pw-staff10");
      const pwAdmin = document.getElementById("pw-admin");

      document.getElementById("mgr-passwords-form").onsubmit = async (e) => {
        e.preventDefault();

        if (!pwDel.value.trim() || !pwStaff8.value.trim() || !pwStaff9.value.trim() || !pwStaff10.value.trim() || !pwAdmin.value.trim()) {
          alert("Password fields cannot be blank.");
          return;
        }

        const newPasswords = {
          delegate: pwDel.value.trim(),
          in_charge_8: pwStaff8.value.trim(),
          in_charge_9: pwStaff9.value.trim(),
          in_charge_10: pwStaff10.value.trim(),
          coordinator: pwAdmin.value.trim()
        };

        const success = await DB.updatePasswords(newPasswords);
        if (success) {
          alert("Access credentials updated successfully!");
          pwDel.value = "";
          pwStaff8.value = "";
          pwStaff9.value = "";
          pwStaff10.value = "";
          pwAdmin.value = "";
          await AppState.loadData();
        } else {
          alert("Error updating security passwords.");
        }
      };
    }

    window.updateAllocationPanel = function() {
      const selectEl = document.getElementById("anal-committee-select");
      const commId = selectEl.value;
      const tbody = document.getElementById("anal-country-table-body");
      const warningEl = document.getElementById("anal-balance-warning");
      
      if (!tbody) return;
      tbody.innerHTML = "";
      warningEl.style.display = "none";
      warningEl.innerText = "";
      
      const commObj = AppState.committees.find(c => c.id === commId);
      if (!commObj) return;

      const commCountries = AppState.countries.filter(c => c.committee_id.toLowerCase() === commId.toLowerCase());
      const assignedRegs = AppState.registrations.filter(r => r.committee === commId);
      const totalRegsForComm = AppState.registrations.filter(r => (r.preferred_committee === commId) || (r.committee_preferences && r.committee_preferences.pref1 === commId)).length;
      const assignedCount = assignedRegs.length;
      const unassignedCount = AppState.registrations.filter(r => ((r.preferred_committee === commId) || (r.committee_preferences && r.committee_preferences.pref1 === commId)) && r.status === "NOT ASSIGNED").length;
      const availableCountriesCount = commCountries.filter(c => !c.assigned_to).length;
      
      let preferenceDemandCount = 0;
      
      const countryRows = commCountries.map(c => {
        const prefCount = AppState.registrations.filter(r => {
          if (!r.country_preferences) return false;
          if (Array.isArray(r.country_preferences)) {
            const userComm = r.preferred_committee || (r.committee_preferences && r.committee_preferences.pref1);
            return userComm === commId && r.country_preferences.includes(c.country_name);
          } else {
            const commPrefs = r.country_preferences[commId] || [];
            return commPrefs.includes(c.country_name);
          }
        }).length;
        
        preferenceDemandCount += prefCount;
        
        const assignedReg = AppState.registrations.find(r => r.id === c.assigned_to);
        const assignedLabel = assignedReg ? `${assignedReg.name} (${assignedReg.id})` : "None";
        const availabilityBadge = c.assigned_to
          ? `<span class="table-badge" style="background-color:#fee2e2; color:#991b1b; padding:0.25rem 0.75rem; border-radius:12px; font-size:0.8rem; font-weight:600;">ASSIGNED</span>`
          : `<span class="table-badge" style="background-color:#dcfce7; color:#166534; padding:0.25rem 0.75rem; border-radius:12px; font-size:0.8rem; font-weight:600;">AVAILABLE</span>`;
        
        return {
          country_name: c.country_name,
          category: c.category,
          prefCount,
          assignedLabel,
          availabilityBadge
        };
      });

      countryRows.sort((a, b) => b.prefCount - a.prefCount);

      countryRows.forEach(row => {
        tbody.innerHTML += `
          <tr style="border-bottom: 1px solid var(--color-border);">
            <td style="padding: 1rem 1.5rem; font-weight: 600; color: var(--color-navy);">${row.country_name}</td>
            <td style="padding: 1rem 1.5rem; font-size: 0.9rem; color: var(--color-text-dark);">${row.category}</td>
            <td style="padding: 1rem 1.5rem; text-align: center; font-weight: bold; color: var(--color-podar-blue);">${row.prefCount}</td>
            <td style="padding: 1rem 1.5rem; font-size: 0.9rem; color: var(--color-text-dark);">${row.assignedLabel}</td>
            <td style="padding: 1rem 1.5rem;">${row.availabilityBadge}</td>
          </tr>
        `;
      });

      document.getElementById("anal-metric-total").innerText = totalRegsForComm;
      document.getElementById("anal-metric-available").innerText = `${availableCountriesCount} / 30`;
      document.getElementById("anal-metric-demand").innerText = preferenceDemandCount;
      document.getElementById("anal-metric-assigned").innerText = assignedCount;
      document.getElementById("anal-metric-unassigned").innerText = unassignedCount;

      const categoryCounts = {};
      assignedRegs.forEach(r => {
        if (!r.assigned_country) return;
        const countryObj = commCountries.find(c => c.country_name === r.assigned_country);
        if (countryObj) {
          categoryCounts[countryObj.category] = (categoryCounts[countryObj.category] || 0) + 1;
        }
      });

      if (commId === "unicef") {
        const donorCount = categoryCounts["Major donor countries"] || 0;
        const aidCount = categoryCounts["Aid-dependent / highly vulnerable countries"] || 0;
        if (donorCount >= 5 && aidCount <= 2) {
          warningEl.innerText = `⚠️ WARNING: UNICEF currently has ${donorCount} delegates assigned from donor countries and only ${aidCount} from aid-dependent countries. Consider rebalancing country assignments.`;
          warningEl.style.display = "block";
        }
      } else if (commId === "unep") {
        const leadersCount = categoryCounts["Renewable-energy leaders / potential technical donors"] || 0;
        const devCount = categoryCounts["Developing countries seeking greater energy access"] || 0;
        if (leadersCount >= 5 && devCount <= 2) {
          warningEl.innerText = `⚠️ WARNING: UNEP currently has ${leadersCount} delegates assigned from renewable-energy leaders and only ${devCount} from developing countries seeking energy access. Consider rebalancing country assignments.`;
          warningEl.style.display = "block";
        }
      } else {
        if (assignedCount >= 5) {
          for (const [cat, count] of Object.entries(categoryCounts)) {
            const ratio = count / assignedCount;
            if (ratio > 0.5) {
              warningEl.innerText = `⚠️ WARNING: ${commObj.name} currently has ${count} delegates assigned from the category "${cat}" representing ${Math.round(ratio * 100)}% of all allocations. Consider rebalancing for a healthier debate.`;
              warningEl.style.display = "block";
              break;
            }
          }
        }
      }
    };

    function triggerCsv(headers, rows, filename) {
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.map(h => `"${h}"`).join(",")]
          .concat(rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")))
          .join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }



document.addEventListener("DOMContentLoaded", () => {
  // Bind logout buttons
  document.querySelectorAll(".btn-logout[onclick*='AppState.logout']").forEach(btn => {
    btn.removeAttribute("onclick");
    btn.addEventListener("click", () => {
      AppState.logout();
    });
  });

  // Bind committee selection dropdown
  const committeeSelect = document.getElementById("anal-committee-select");
  if (committeeSelect) {
    committeeSelect.removeAttribute("onchange");
    committeeSelect.addEventListener("change", () => {
      updateAllocationPanel();
    });
  }
});
