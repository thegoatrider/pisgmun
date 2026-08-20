// Route Auth Guard
    (async () => {
      await DB.init();
      await AppState.loadData();
      if (!AppState.checkAuth("in_charge")) {
        window.location.href = "login.html?role=in_charge";
      }
    })();

let currentGrade = localStorage.getItem("pmun_session_incharge_grade");
    const sessionRole = localStorage.getItem("pmun_session_role");

    document.addEventListener("DOMContentLoaded", async () => {
      await DB.init();
      await AppState.loadData();
      
      const selectView = document.getElementById("incharge-select");
      const dashboardView = document.getElementById("incharge-dashboard");

      // Verify or force grade based on logged-in credentials
      if (sessionRole === "in_charge_8") {
        currentGrade = "8";
        localStorage.setItem("pmun_session_incharge_grade", "8");
      } else if (sessionRole === "in_charge_9") {
        currentGrade = "9";
        localStorage.setItem("pmun_session_incharge_grade", "9");
      } else if (sessionRole === "in_charge_10") {
        currentGrade = "10";
        localStorage.setItem("pmun_session_incharge_grade", "10");
      }

      if (!currentGrade) {
        selectView.style.display = "flex";
        dashboardView.style.display = "none";
      } else {
        selectView.style.display = "none";
        dashboardView.style.display = "block";
        renderDashboard(parseInt(currentGrade));
      }
    });

    function selectGrade(grade) {
      localStorage.setItem("pmun_session_incharge_grade", grade);
      window.location.reload();
    }

    function switchCommittee() {
      localStorage.removeItem("pmun_session_incharge_grade");
      window.location.reload();
    }

    function renderDashboard(grade) {
      // 1. Set Title
      document.getElementById("incharge-grade-title").innerText = `Grade ${grade} Committee Dashboard`;

      // Switch button show/hide based on config: only coordinator can switch
      const switchBtn = document.getElementById("btn-incharge-switch");
      if (switchBtn) {
        if (sessionRole === "coordinator") {
          switchBtn.style.display = "inline-block";
        } else {
          switchBtn.style.display = "none";
        }
      }

      // Filter registrations
      const gradeRegs = AppState.registrations.filter(r => parseInt(r.grade) === grade);
      const gradeCommittees = AppState.committees.filter(c => parseInt(c.grade) === grade);
      const capacity = gradeCommittees.reduce((acc, c) => acc + (c.capacity || 0), 0) || 100;

      // KPIs
      document.getElementById("incharge-kpi-count").innerText = gradeRegs.length;
      document.getElementById("incharge-kpi-capacity").innerText = capacity;
      document.getElementById("incharge-kpi-remaining").innerText = Math.max(0, capacity - gradeRegs.length);

      // Render Table content
      renderTable(gradeRegs);

      // Render Portfolio Table
      const portfolioBody = document.getElementById("incharge-portfolio-table-body");
      if (portfolioBody) {
        portfolioBody.innerHTML = "";
        
        const commIds = gradeCommittees.map(c => c.id.toLowerCase());
        const gradeCountries = AppState.countries.filter(c => commIds.includes(c.committee_id.toLowerCase()));
        
        gradeCountries.sort((a, b) => {
          if (a.committee_id < b.committee_id) return -1;
          if (a.committee_id > b.committee_id) return 1;
          if (a.country_name < b.country_name) return -1;
          if (a.country_name > b.country_name) return 1;
          return 0;
        });

        gradeCountries.forEach(c => {
          const commName = AppState.committees.find(com => com.id === c.committee_id)?.name || c.committee_id.toUpperCase();
          const prefCount = AppState.registrations.filter(r => {
            if (!r.country_preferences) return false;
            if (Array.isArray(r.country_preferences)) {
              const userComm = r.preferred_committee || (r.committee_preferences && r.committee_preferences.pref1);
              return userComm === c.committee_id && r.country_preferences.includes(c.country_name);
            } else {
              const commPrefs = r.country_preferences[c.committee_id] || [];
              return commPrefs.includes(c.country_name);
            }
          }).length;
          
          const assignedReg = AppState.registrations.find(r => r.id === c.assigned_to);
          const assignedLabel = assignedReg ? `${assignedReg.name} (${assignedReg.id})` : "None";
          const statusBadge = c.assigned_to
            ? `<span class="table-badge" style="background-color:#fee2e2; color:#991b1b; padding:0.25rem 0.75rem; border-radius:12px; font-size:0.8rem; font-weight:600;">ASSIGNED</span>`
            : `<span class="table-badge" style="background-color:#dcfce7; color:#166534; padding:0.25rem 0.75rem; border-radius:12px; font-size:0.8rem; font-weight:600;">AVAILABLE</span>`;

          portfolioBody.innerHTML += `
            <tr style="border-bottom: 1px solid var(--color-border);">
              <td style="padding: 1rem 1.5rem; font-weight: 500;">${commName}</td>
              <td style="padding: 1rem 1.5rem; font-weight: 600; color: var(--color-navy);">${c.country_name}</td>
              <td style="padding: 1rem 1.5rem; text-align: center; font-weight: 700; color: var(--color-podar-blue);">${prefCount}</td>
              <td style="padding: 1rem 1.5rem; font-size: 0.9rem; color: var(--color-text-dark);">${assignedLabel}</td>
              <td style="padding: 1rem 1.5rem;">${statusBadge}</td>
            </tr>
          `;
        });
      }

      // Filter & Search setup
      const searchInput = document.getElementById("incharge-search");
      const secFilter = document.getElementById("incharge-sec-filter");

      // Dynamic sections
      const sections = [...new Set(gradeRegs.map(r => r.section).filter(Boolean))].sort();
      secFilter.innerHTML = '<option value="ALL">All Sections</option>';
      sections.forEach(sec => {
        secFilter.innerHTML += `<option value="${sec}">${sec}</option>`;
      });

      const filterTable = () => {
        const q = searchInput.value.toLowerCase();
        const sec = secFilter.value;
        
        const filtered = gradeRegs.filter(r => {
          const matchSearch = r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.school.toLowerCase().includes(q);
          const matchSec = sec === "ALL" || r.section === sec;
          return matchSearch && matchSec;
        });

        renderTable(filtered);
      };

      searchInput.oninput = filterTable;
      secFilter.onchange = filterTable;

      // Export CSV
      const exportBtn = document.getElementById("btn-incharge-export");
      exportBtn.onclick = () => {
        const csvHeaders = ["Registration ID", "Name", "Grade", "Section", "School", "Committee", "Email", "Phone", "MUN Experience", "Date Registered"];
        const csvRows = gradeRegs.map(r => [
          r.id, r.name, r.grade, r.section, r.school, r.committee, r.email, r.phone, r.mun_experience, new Date(r.created_at).toLocaleDateString()
        ]);
        triggerCsv(csvHeaders, csvRows, `PMUN_Grade_${grade}_Registrations.csv`);
      };
    }

    function renderTable(regs) {
      const tbody = document.getElementById("incharge-table-body");
      tbody.innerHTML = "";

      if (regs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="no-data-row" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">No matching registrations found.</td>
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
          </tr>
        `;
      });
    }

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
  // Bind selectGrade buttons
  document.querySelectorAll(".incharge-select-btn[onclick]").forEach(btn => {
    const clickCode = btn.getAttribute("onclick");
    if (clickCode && clickCode.includes("selectGrade")) {
      btn.removeAttribute("onclick");
      const match = clickCode.match(/\((\d+)\)/);
      if (match) {
        const grade = parseInt(match[1]);
        btn.addEventListener("click", () => {
          selectGrade(grade);
        });
      }
    }
  });

  // Bind logout buttons
  document.querySelectorAll("button[onclick*='AppState.logout']").forEach(btn => {
    btn.removeAttribute("onclick");
    btn.addEventListener("click", () => {
      AppState.logout();
    });
  });

  // Bind switch committee button
  const switchBtn = document.getElementById("btn-incharge-switch");
  if (switchBtn) {
    switchBtn.removeAttribute("onclick");
    switchBtn.addEventListener("click", () => {
      switchCommittee();
    });
  }
});
