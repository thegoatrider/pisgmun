// Route Auth Guard
(async () => {
  await DB.init();
  await AppState.loadData();
  if (!AppState.checkAuth("delegate")) {
    window.location.href = "login.html?role=delegate";
  }
})();

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const name = urlParams.get("name");
const grade = urlParams.get("grade");
const committee = urlParams.get("committee");
const regDate = new Date().toLocaleDateString();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("receipt-id").innerText = id || "";
  document.getElementById("receipt-name").innerText = name || "";
  document.getElementById("receipt-grade").innerText = `Grade ${grade}` || "";
  document.getElementById("receipt-committee").innerText = committee || "";
  document.getElementById("receipt-date").innerText = regDate;

  const btnViewComm = document.getElementById("btn-view-comm");
  if (btnViewComm) {
    btnViewComm.addEventListener("click", () => {
      window.location.href = `committee-detail.html?grade=${grade || 8}`;
    });
  }
});
