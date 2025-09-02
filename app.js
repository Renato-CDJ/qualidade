import { loginWithGoogle, logout, onAuth, addTraining, getTrainings } from "./firebase.js";

// Navegação entre seções
document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(link.dataset.section).classList.add("active");
  });
});

// Botão logout
document.getElementById("logoutBtn").addEventListener("click", logout);

// Escuta autenticação
onAuth(user => {
  if (user) {
    console.log("Logado:", user.email);
    loadTrainings();
  } else {
    loginWithGoogle();
  }
});

// Carregar treinamentos
async function loadTrainings() {
  const trainings = await getTrainings();
  const list = document.getElementById("trainingsList");
  list.innerHTML = "";
  trainings.forEach(t => {
    const div = document.createElement("div");
    div.textContent = `${t.title} - ${t.area} (${t.status || "Sem status"})`;
    list.appendChild(div);
  });
}

// Importar Excel
document.getElementById("importExcelBtn").addEventListener("click", () => {
  const fileInput = document.getElementById("excelFile");
  const file = fileInput.files[0];
  if (!file) return alert("Selecione um arquivo Excel");

  const reader = new FileReader();
  reader.onload = async (e) => {
    const workbook = XLSX.read(e.target.result, { type: "binary" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      await addTraining({
        title: row.Treinamento || row.Title,
        area: row.Area,
        startDate: row.Data || row.StartDate,
        endDate: row.Fim || row.EndDate,
        hours: row.Horas || row.Hours,
        status: row.Status || "Planejado"
      });
    }
    loadTrainings();
  };
  reader.readAsBinaryString(file);
});
