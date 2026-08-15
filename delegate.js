// Route Auth Guard
    (async () => {
      const isPublic = new URLSearchParams(window.location.search).get("public") === "true";
      if (isPublic) return;
      
      await DB.init();
      await AppState.loadData();
      if (!AppState.checkAuth("delegate")) {
        window.location.href = "login.html?role=delegate";
      }
    })();

// Chapter Reader Controller for Resources Tab
    function switchResourceChapter(chapterId) {
      // Hide all resource content panes
      document.querySelectorAll(".res-content-pane").forEach(pane => {
        pane.classList.remove("active-pane");
      });
      // Deactivate all resource buttons
      document.querySelectorAll(".res-nav-btn").forEach(btn => {
        btn.classList.remove("active-res");
      });
      
      // Show the selected chapter content pane
      const targetPane = document.getElementById(`res-ch-${chapterId}`);
      if (targetPane) {
        targetPane.classList.add("active-pane");
      }
      // Highlight the selected nav button
      const targetBtn = document.getElementById(`res-btn-${chapterId}`);
      if (targetBtn) {
        targetBtn.classList.add("active-res");
      }
    }

    // Sub-tab Controller for Chapter 5 (Document Samples)
    function toggleDocTab(tabId) {
      // Hide all document panes
      document.querySelectorAll(".doc-pane").forEach(pane => {
        pane.style.display = "none";
      });
      // Reset button formatting
      document.getElementById("btn-doc-pos").style.color = "var(--color-text-muted)";
      document.getElementById("btn-doc-pos").style.borderBottom = "none";
      document.getElementById("btn-doc-speech").style.color = "var(--color-text-muted)";
      document.getElementById("btn-doc-speech").style.borderBottom = "none";
      document.getElementById("btn-doc-res").style.color = "var(--color-text-muted)";
      document.getElementById("btn-doc-res").style.borderBottom = "none";
      
      // Show target document pane
      document.getElementById(tabId).style.display = "flex";
      // Highlight active button
      let btnId = "btn-doc-pos";
      if (tabId === "doc-speech") btnId = "btn-doc-speech";
      if (tabId === "doc-resolution") btnId = "btn-doc-res";
      document.getElementById(btnId).style.color = "var(--color-podar-blue)";
      document.getElementById(btnId).style.borderBottom = "2px solid var(--color-podar-blue)";
    }

    function renderAssignmentCard(reg) {
      const homeTab = document.getElementById("home-tab");
      if (!homeTab) return;
      
      const cardDiv = document.createElement("div");
      cardDiv.style.maxWidth = "750px";
      cardDiv.style.margin = "0 auto 2.5rem auto";
      cardDiv.style.borderRadius = "20px";
      cardDiv.style.border = "1px solid var(--color-border)";
      cardDiv.style.padding = "2rem";
      cardDiv.style.boxShadow = "var(--shadow-lg)";
      
      let title = "Portfolio Allocation Status";
      let desc = "";
      let bgColor = "var(--color-white)";
      let borderColor = "var(--color-border)";
      let textColor = "var(--color-navy)";
      
      if (reg.status === "ASSIGNED") {
        bgColor = "linear-gradient(135deg, #0b3c66 0%, #001f3f 100%)";
        textColor = "var(--color-white)";
        borderColor = "var(--color-navy)";
        
        const commObj = AppState.committees.find(c => c.id === reg.committee);
        const commName = commObj ? commObj.name : reg.committee.toUpperCase();
        
        cardDiv.innerHTML = `
          <div style="color: ${textColor}; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 1rem; margin-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; color: var(--color-podar-blue); font-weight: 700;">CONGRATULATIONS</span>
                <h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin: 0.25rem 0 0 0; color: #fff;">Confirmed PMUN Portfolio Allocation</h3>
              </div>
              <div style="background-color: var(--color-success); color: white; padding: 0.35rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">CONFIRMED</div>
            </div>
            
            <p style="font-size: 0.95rem; margin-top: 0; line-height: 1.5; opacity: 0.9;">Your PMUN 2026 registration has been successfully processed. You have been assigned the following country portfolio:</p>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0; background: rgba(255,255,255,0.06); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <div>
                <span style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-border); display: block; margin-bottom: 0.25rem; font-weight: 600;">Committee</span>
                <strong style="font-size: 1.15rem; color: #fff;">${commName}</strong>
              </div>
              <div>
                <span style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-border); display: block; margin-bottom: 0.25rem; font-weight: 600;">Portfolio Country</span>
                <strong style="font-size: 1.15rem; color: #fff;">${reg.assigned_country}</strong>
              </div>
              <div>
                <span style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-border); display: block; margin-bottom: 0.25rem; font-weight: 600;">Position</span>
                <strong style="font-size: 1.15rem; color: #fff;">${reg.portfolio_preference}</strong>
              </div>
            </div>
            
            <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem; font-size: 0.9rem; opacity: 0.85;">
              <span>Delegate ID: <strong>${reg.id}</strong></span>
              <span>•</span>
              <span>Institution: <strong>${reg.school}</strong></span>
            </div>
          </div>
        `;
      } else if (reg.status === "WAITLISTED") {
        bgColor = "#fffbeb";
        borderColor = "#fef3c7";
        cardDiv.innerHTML = `
          <div style="display: flex; gap: 1.25rem; align-items: flex-start; text-align: left;">
            <div style="background-color: #fef3c7; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: #b45309; flex-shrink: 0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <h3 style="font-family: var(--font-serif); font-size: 1.3rem; margin: 0 0 0.5rem 0; color: #92400e;">Portfolio Allocation Status: Waitlisted</h3>
              <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: #b45309;">Your registration (ID: <strong>${reg.id}</strong>) is currently waitlisted due to capacity bounds. We are working to review and rebalance country portfolios. Please check back later or contact the coordinator for updates.</p>
            </div>
          </div>
        `;
      } else if (reg.status === "REJECTED") {
        bgColor = "#fef2f2";
        borderColor = "#fee2e2";
        cardDiv.innerHTML = `
          <div style="display: flex; gap: 1.25rem; align-items: flex-start; text-align: left;">
            <div style="background-color: #fee2e2; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: #b91c1c; flex-shrink: 0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <div>
              <h3 style="font-family: var(--font-serif); font-size: 1.3rem; margin: 0 0 0.5rem 0; color: #991b1b;">Registration Status: Rejected / Closed</h3>
              <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: #b91c1c;">Your registration (ID: <strong>${reg.id}</strong>) could not be accommodated for PMUN 2026. This may be due to double submissions or incomplete verification details. Please contact the MUN Coordinator for assistance.</p>
            </div>
          </div>
        `;
      } else {
        bgColor = "var(--color-bg-light)";
        borderColor = "var(--color-border)";
        cardDiv.innerHTML = `
          <div style="display: flex; gap: 1.25rem; align-items: flex-start; text-align: left;">
            <div style="background-color: var(--color-border); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: var(--color-navy); flex-shrink: 0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div>
              <h3 style="font-family: var(--font-serif); font-size: 1.3rem; margin: 0 0 0.5rem 0; color: var(--color-navy);">Portfolio Status: Pending Allocation</h3>
              <p style="margin: 0; font-size: 0.95rem; line-height: 1.5; color: var(--color-text-muted);">Your PMUN registration (ID: <strong>${reg.id}</strong>) has been submitted successfully. Your committee and country assignment will be communicated after the selection process.</p>
            </div>
          </div>
        `;
      }
      
      cardDiv.style.background = bgColor;
      cardDiv.style.borderColor = borderColor;
      
      homeTab.insertBefore(cardDiv, homeTab.firstChild);
    }

    // Tab Controller based on URL Query Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const isPublic = urlParams.get("public") === "true";
    const activeTab = urlParams.get("tab") || (isPublic ? "committees" : "home");

    document.addEventListener("DOMContentLoaded", async () => {

      if (isPublic) {
        // Load database details for database-driven features
        try {
          await DB.init();
          await AppState.loadData();
        } catch (e) {
          console.warn("Public view data fetch error", e);
        }

        // Hide navigation bar container
        const nav = document.querySelector(".nav-container");
        if (nav) nav.style.display = "none";
        
        // Hide watermark
        const watermark = document.querySelector('div[style*="opacity: 0.08"]');
        if (watermark) watermark.style.display = "none";
        
        // Hide delegate header
        const delegateHeader = document.querySelector(".delegate-header");
        if (delegateHeader) delegateHeader.style.display = "none";

        // Show public header
        const publicHeader = document.getElementById("public-header");
        if (publicHeader) {
          publicHeader.style.display = "flex";
          const activeLink = document.getElementById("pub-link-" + activeTab);
          if (activeLink) activeLink.classList.add("active");
          const brandLogo = document.getElementById("brand-logo-container-public");
          if (brandLogo) {
            brandLogo.addEventListener("click", () => {
              window.location.href = "index.html";
            });
          }
        }
        
        // Rewrite committees-tab back button to go back to main homepage
        const backBtn = document.querySelector("#committees-tab .btn-back");
        if (backBtn) {
          backBtn.removeAttribute("onclick");
          backBtn.addEventListener("click", () => {
            window.location.href = 'index.html';
          });
        }
      }
 else {
        // Verify registration status to render portfolio status cards
        try {
          await DB.init();
          await AppState.loadData();
          const myRegId = localStorage.getItem("pmun_registration_id");
          if (myRegId) {
            const myReg = AppState.registrations.find(r => r.id === myRegId);
            if (myReg) {
              renderAssignmentCard(myReg);
            }
          }
        } catch (err) {
          console.error("Error setting up delegate status card:", err);
        }
      }


      // Map rules parameter to resources tab content
      let targetTab = activeTab;
      if (activeTab === "rules") {
        targetTab = "resources";
      }

      // Hide all tabs, show the active one
      document.querySelectorAll(".tab-content").forEach(el => {
        el.classList.remove("active");
      });
      const target = document.getElementById(`${targetTab}-tab`);
      if (target) {
        target.classList.add("active");
      }

      if (activeTab === "rules") {
        switchResourceChapter('rules');
      }

      // Programmatic listeners to replace inline onclick attributes:
      // 1. Committee Cards (inside Committees tab)
      document.querySelectorAll(".grade-card[onclick]").forEach(card => {
        const clickCode = card.getAttribute("onclick");
        if (clickCode && clickCode.includes("committee-detail.html")) {
          card.removeAttribute("onclick");
          const match = clickCode.match(/committee=([a-zA-Z0-9_-]+)/);
          if (match) {
            const comm = match[1];
            card.addEventListener("click", () => {
              const isPublicView = new URLSearchParams(window.location.search).get("public") === "true";
              const prefix = isPublicView ? "public=true&" : "";
              window.location.href = `committee-detail.html?${prefix}committee=${comm}`;
            });
          }
        }
      });

      // 2. Register Now buttons on Home tab
      document.querySelectorAll("button[onclick]").forEach(btn => {
        const clickCode = btn.getAttribute("onclick");
        if (clickCode && clickCode.includes("register.html?committee=")) {
          btn.removeAttribute("onclick");
          const match = clickCode.match(/committee=([a-zA-Z0-9_-]+)/);
          if (match) {
            const comm = match[1];
            btn.addEventListener("click", () => {
              window.location.href = `register.html?committee=${comm}`;
            });
          }
        }
      });

      // 3. Back to Home buttons
      document.querySelectorAll("button[onclick]").forEach(btn => {
        const clickCode = btn.getAttribute("onclick");
        if (clickCode && clickCode.includes("delegate.html?tab=home")) {
          btn.removeAttribute("onclick");
          btn.addEventListener("click", () => {
            window.location.href = 'delegate.html?tab=home';
          });
        }
      });

      // 4. Resources Sidebar Navigation Chapters List
      document.querySelectorAll(".res-nav-btn[onclick]").forEach(btn => {
        const clickCode = btn.getAttribute("onclick");
        if (clickCode && clickCode.includes("switchResourceChapter")) {
          btn.removeAttribute("onclick");
          const match = clickCode.match(/'([a-zA-Z0-9_-]+)'/);
          if (match) {
            const chapter = match[1];
            btn.addEventListener("click", () => {
              switchResourceChapter(chapter);
            });
          }
        }
      });

      // 5. Document samples sub-tabs
      document.querySelectorAll("button[onclick]").forEach(btn => {
        const clickCode = btn.getAttribute("onclick");
        if (clickCode && clickCode.includes("toggleDocTab")) {
          btn.removeAttribute("onclick");
          const match = clickCode.match(/'([a-zA-Z0-9_-]+)'/);
          if (match) {
            const docTab = match[1];
            btn.addEventListener("click", () => {
              toggleDocTab(docTab);
            });
          }
        }
      });

      // 6. Logout Link
      const logoutLink = document.querySelector('a[onclick*="AppState.logout"]');
      if (logoutLink) {
        logoutLink.removeAttribute("onclick");
        logoutLink.addEventListener("click", (e) => {
          e.preventDefault();
          AppState.logout();
        });
      }


      // 2. Mark active nav link
      document.querySelectorAll(".nav-links li[data-tab]").forEach(li => {
        li.classList.remove("active");
        const link = li.querySelector("a");
        if (link) {
          link.style.backgroundColor = "transparent";
          link.style.borderRadius = "0";
        }
        if (li.getAttribute("data-tab") === activeTab) {
          li.classList.add("active");
          if (link) {
            link.style.backgroundColor = "#0b3c66"; // capsule background highlight
            link.style.borderRadius = "20px";
            link.style.color = "var(--color-white)";
          }
        }
      });
    });
