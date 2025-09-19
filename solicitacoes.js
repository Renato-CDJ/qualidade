import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Classe para controlar Solicitações
class SolicitacoesSystem {
  constructor() {
    this.data = [];
    this.carteiras = [];
    this.chart = null; // Chart.js instance
    this.init();
  }

  init() {
    this.loadData();
    this.loadCarteiras();
    this.setupEventListeners();
  }

  // 🔹 Buscar carteiras do Firestore
  loadCarteiras() {
    onSnapshot(collection(db, "carteiras"), (snapshot) => {
      this.carteiras = snapshot.docs.map(doc => doc.data().nome);
      this.updateCarteiraSelect();
    });
  }

  // 🔹 Popular select de carteiras dinamicamente
  updateCarteiraSelect() {
    const select = document.getElementById("solicitacaoCarteira");
    if (!select) return;

    const currentValue = select.value;
    select.querySelectorAll('option:not([value=""])').forEach(opt => opt.remove());

    this.carteiras.forEach(carteira => {
      const option = document.createElement("option");
      option.value = carteira;
      option.textContent = carteira;
      if (carteira === currentValue) option.selected = true;
      select.appendChild(option);
    });
  }

  // 🔹 Carregar solicitações do Firestore
  loadData() {
    onSnapshot(collection(db, "solicitacoes"), (snapshot) => {
      this.data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.renderTable();
      this.updateStats();
      this.updateCharts();
    });
  }

  setupEventListeners() {
    document.getElementById("addSolicitacaoForm")
      .addEventListener("submit", (e) => this.addSolicitacao(e));

    document.getElementById("refreshSolicitacoesBtn")
      .addEventListener("click", () => this.loadData());

    document.getElementById("searchSolicitacoes")
      .addEventListener("input", (e) => this.filterTable(e.target.value));

    document.getElementById("filterSolicitacoesStatus")
      .addEventListener("change", () => this.renderTable());

    document.getElementById("viewSolicitacoesTableBtn")?.addEventListener("click", () => {
      document.getElementById("solicitacoesMainOverviewSection").classList.add("hidden");
      document.getElementById("solicitacoesTableSection").classList.remove("hidden");
      document.getElementById("backToSolicitacoesMainBtn").classList.remove("hidden");
      this.renderTable();
    });

    document.getElementById("backToSolicitacoesMainBtn")
      .addEventListener("click", () => {
        document.getElementById("solicitacoesMainOverviewSection").classList.remove("hidden");
        document.getElementById("solicitacoesTableSection").classList.add("hidden");
        document.getElementById("backToSolicitacoesMainBtn").classList.add("hidden");
      });

    // 🔹 Atualizar status via <select>
    document.addEventListener("change", async (e) => {
      if (e.target.classList.contains("solicitacao-status-select")) {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;

        try {
          await updateDoc(doc(db, "solicitacoes", id), { status: newStatus });
          alert("Status atualizado com sucesso!");
        } catch (err) {
          console.error("Erro ao atualizar status:", err);
          alert("Erro ao atualizar status");
        }
      }
    });
  }

  // 🔹 Adicionar solicitação
  async addSolicitacao(e) {
    e.preventDefault();
    const solicitacao = {
      gestor: document.getElementById("solicitacaoGestor").value,
      carteira: document.getElementById("solicitacaoCarteira").value,
      operadores: document.getElementById("solicitacaoOperador").value
        .split(",")
        .map(op => op.trim())
        .filter(op => op !== ""), // tira espaços extras
      responsavel: document.getElementById("solicitacaoResponsavel").value,
      sobre: document.getElementById("solicitacaoSobre").value,
      status: document.getElementById("solicitacaoStatus").value,
      dataSolicitacao: new Date().toLocaleDateString("pt-BR"),
    };

    try {
      await addDoc(collection(db, "solicitacoes"), solicitacao);
      alert("Solicitação adicionada com sucesso!");
      e.target.reset();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar no Firestore");
    }
  }

  // 🔹 Excluir solicitação
  async deleteSolicitacao(id) {
    if (!confirm("Deseja excluir esta solicitação?")) return;
    try {
      await deleteDoc(doc(db, "solicitacoes", id));
      alert("Solicitação excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir");
    }
  }

  // 🔹 Renderizar tabela
  renderTable() {
  const tbody = document.querySelector("#solicitacoesTable tbody");
  tbody.innerHTML = "";

  let filtered = [...this.data];
  const filtroStatus = document.getElementById("filterSolicitacoesStatus").value;
  const search = document.getElementById("searchSolicitacoes").value.toLowerCase();

  if (filtroStatus) filtered = filtered.filter(s => s.status === filtroStatus);
  if (search) filtered = filtered.filter(s => s.gestor.toLowerCase().includes(search));

  filtered.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.gestor}</td>
      <td>${item.carteira}</td>
      <td>${(item.operadores && item.operadores.length > 0) ? item.operadores.join(", ") : "-"}</td>
      <td>${item.responsavel || "-"}</td>
      <td>${item.sobre || "-"}</td>
      <td>${item.dataSolicitacao}</td>
      <td>
        <select class="solicitacao-status-select" data-id="${item.id}">
          <option value="Pendente" ${item.status === "Pendente" ? "selected" : ""}>Pendente</option>
          <option value="Aplicado" ${item.status === "Aplicado" ? "selected" : ""}>Aplicado</option>
        </select>
      </td>
      <td class="admin-only">
        <div class="action-buttons">
          <button class="btn btn-sm btn-success salvar-status hidden" data-id="${item.id}">
            <i class="fas fa-save"></i> Salvar
          </button>
          <button class="btn btn-sm btn-danger cancelar-status hidden" data-id="${item.id}">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button class="btn btn-sm btn-danger" onclick="solicitacoesSystem.deleteSolicitacao('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(row);

    const select = row.querySelector(".solicitacao-status-select");
    const salvarBtn = row.querySelector(".salvar-status");
    const cancelarBtn = row.querySelector(".cancelar-status");

    let originalValue = item.status;

    select.addEventListener("change", () => {
      salvarBtn.classList.remove("hidden");
      cancelarBtn.classList.remove("hidden");
    });

    salvarBtn.addEventListener("click", async () => {
      try {
        await updateDoc(doc(db, "solicitacoes", item.id), { status: select.value });
        originalValue = select.value; // atualiza o valor original
        alert("Status atualizado com sucesso!");
        salvarBtn.classList.add("hidden");
        cancelarBtn.classList.add("hidden");
      } catch (err) {
        console.error("Erro ao atualizar status:", err);
        alert("Erro ao atualizar status");
      }
    });

    cancelarBtn.addEventListener("click", () => {
      select.value = originalValue; // volta pro valor antigo
      salvarBtn.classList.add("hidden");
      cancelarBtn.classList.add("hidden");
    });
  });
}


  // 🔹 Atualizar estatísticas
  updateStats() {
    document.getElementById("totalSolicitacoes").textContent = this.data.length;
    document.getElementById("pendentesSolicitacoes").textContent = this.data.filter(s => s.status === "Pendente").length;
    document.getElementById("concluidasSolicitacoes").textContent = this.data.filter(s => s.status === "Aplicado").length;
  }

  // 🔹 Atualizar gráfico (Chart.js)
  updateCharts() {
    const pendentes = this.data.filter(s => s.status === "Pendente").length;
    const concluidas = this.data.filter(s => s.status === "Aplicado").length;

    const ctx = document.getElementById("solicitacoesStatusChart").getContext("2d");

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Pendentes", "Aplicadas"],
        datasets: [{
          data: [pendentes, concluidas],
          backgroundColor: ["#f39c12", "#27ae60"],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }
}

// Instância global
window.solicitacoesSystem = new SolicitacoesSystem();
