function selectInchargeRole(role) {
  window.location.href = `login.html?role=${role}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const card8 = document.getElementById("card-in-charge-8");
  if (card8) {
    card8.addEventListener("click", () => selectInchargeRole('in_charge_8'));
  }
  const card9 = document.getElementById("card-in-charge-9");
  if (card9) {
    card9.addEventListener("click", () => selectInchargeRole('in_charge_9'));
  }
  const card10 = document.getElementById("card-in-charge-10");
  if (card10) {
    card10.addEventListener("click", () => selectInchargeRole('in_charge_10'));
  }
  const btnBack = document.getElementById("btn-back-gate");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});

(async () => {
  await DB.init();
})();
