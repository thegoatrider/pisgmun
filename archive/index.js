function selectRole(role) {
  if (role === 'delegate') {
    localStorage.setItem("pmun_session_role", "delegate");
    window.location.href = "delegate.html";
  } else {
    window.location.href = `login.html?role=${role}`;
  }
}

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
})();
