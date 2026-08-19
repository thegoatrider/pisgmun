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

// Scroll-driven Opacity/Parallax Transition between Hero and About sections
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY;
  const heroSection = document.getElementById('hero-section');
  const heroContent = document.getElementById('hero-content');
  const aboutSection = document.getElementById('about-section');

  // 1. Fade out and translate Hero content/background based on scroll position
  if (heroSection) {
    const fadeThreshold = 320;
    const opacity = Math.max(0, 1 - (scrollPos / fadeThreshold));
    heroSection.style.opacity = opacity;
    
    if (heroContent) {
      heroContent.style.transform = `translateY(${scrollPos * 0.22}px)`;
    }
    
    // Parallax effect on the background banner image
    heroSection.style.backgroundPositionY = `${50 + (scrollPos * 0.08)}%`;
  }

  // 2. Fade in and slide up About Section dynamically according to scroll speed
  if (aboutSection) {
    const startFade = 30;
    const endFade = 220;
    
    let aboutOpacity = 0;
    if (scrollPos > startFade) {
      aboutOpacity = Math.min(1, (scrollPos - startFade) / (endFade - startFade));
    }
    
    aboutSection.style.opacity = aboutOpacity;
    
    // Translate from translateY(35px) to translateY(0px) based on scroll
    const translateOffset = Math.max(0, 35 - (aboutOpacity * 35));
    aboutSection.style.transform = `translateY(${translateOffset}px)`;
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
