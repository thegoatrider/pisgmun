function toggleMobileNav(btn) {
  const menu = btn.nextElementSibling;
  if (menu) {
    menu.classList.toggle("open");
  }
}

document.addEventListener("click", function(e) {
  if (!e.target.closest(".mobile-nav-wrapper")) {
    document.querySelectorAll(".mobile-dropdown-menu.open").forEach(m => m.classList.remove("open"));
  }
});

function selectRole(role) {
  if (role === 'delegate') {
    localStorage.setItem("pmun_session_role", "delegate");
    window.location.href = "delegate.html";
  } else {
    window.location.href = `login.html?role=${role}`;
  }
}

// Scroll-driven subtle Parallax Transition without washing out content
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY;
  const heroSection = document.getElementById('hero-section');
  const heroContent = document.getElementById('hero-content');
  const aboutSection = document.getElementById('about-section');

  if (heroSection) {
    heroSection.style.opacity = '1';
    if (heroContent) {
      heroContent.style.transform = `translateY(${scrollPos * 0.05}px)`;
    }
    heroSection.style.backgroundPositionY = `${50 + (scrollPos * 0.05)}%`;
  }

  if (aboutSection) {
    aboutSection.style.opacity = '1';
    aboutSection.style.transform = 'none';
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const brand = document.getElementById("navbar-brand");
  if (brand) {
    brand.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  const heroStart = document.getElementById("btn-hero-start");
  if (heroStart) {
    heroStart.addEventListener("click", () => {
      document.getElementById('portal-access').scrollIntoView({behavior: 'smooth'});
    });
  }

  const btnDelegate = document.getElementById("btn-delegate");
  if (btnDelegate) {
    btnDelegate.addEventListener("click", () => {
      selectRole('delegate');
    });
  }

  const btnInCharge = document.getElementById("btn-in-charge");
  if (btnInCharge) {
    btnInCharge.addEventListener("click", () => {
      window.location.href = 'in-charge-gate.html';
    });
  }

  const btnCoordinator = document.getElementById("btn-coordinator");
  if (btnCoordinator) {
    btnCoordinator.addEventListener("click", () => {
      selectRole('coordinator');
    });
  }
});

(async () => {
  await DB.init();
  
  // Trigger initial scroll calculation to verify state on reload
  window.dispatchEvent(new Event('scroll'));
})();
