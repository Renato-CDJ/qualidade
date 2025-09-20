import { db } from "./firebase.js"
import { 
  collection, addDoc, onSnapshot, serverTimestamp,
  deleteDoc, updateDoc, doc, query, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

let quadros = []
let deleteId = null
let quadroSelecionado = null

document.addEventListener("DOMContentLoaded", () => {
  const quadroForm = document.getElementById("quadroForm")
  const editForm = document.getElementById("editForm")
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn")

  // 👉 Adicionar novo registro
  if (quadroForm) {
    quadroForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const data = document.getElementById("quadroData").value
      const turno = document.getElementById("quadroTurno").value
      const total = parseInt(document.getElementById("quadroTotal").value, 10)
      const ferias = parseInt(document.getElementById("quadroFerias").value, 10)
      const desaparecidos = parseInt(document.getElementById("quadroDesaparecidos").value, 10)
      const afastamento = parseInt(document.getElementById("quadroAfastamento").value, 10)
      const inss = parseInt(document.getElementById("quadroINSS").value, 10)

      const ativos = total - (ferias + desaparecidos + afastamento + inss)

      try {
        await addDoc(collection(db, "quadro"), {
          tipo: quadroSelecionado,
          data,
          turno,
          total,
          ferias,
          desaparecidos,
          afastamento,
          inss,
          ativos,
          criadoEm: serverTimestamp()
        })
        quadroForm.reset()
      } catch (err) {
        console.error("Erro ao salvar quadro:", err)
        alert("Erro ao salvar no Firestore")
      }
    })
  }

  // 👉 Formulário de edição
  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const id = document.getElementById("editId").value
      const novoTotal = parseInt(document.getElementById("editTotal").value, 10)
      const novoFerias = parseInt(document.getElementById("editFerias").value, 10)
      const novoDesaparecidos = parseInt(document.getElementById("editDesaparecidos").value, 10)
      const novoAfastamento = parseInt(document.getElementById("editAfastamento").value, 10)
      const novoInss = parseInt(document.getElementById("editInss").value, 10)

      const novosAtivos = novoTotal - (novoFerias + novoDesaparecidos + novoAfastamento + novoInss)

      try {
        await updateDoc(doc(db, "quadro", id), {
          total: novoTotal,
          ferias: novoFerias,
          desaparecidos: novoDesaparecidos,
          afastamento: novoAfastamento,
          inss: novoInss,
          ativos: novosAtivos
        })
        fecharModal("editModal")
        alert("Registro atualizado com sucesso!")
      } catch (err) {
        console.error("Erro ao atualizar:", err)
        alert("Erro ao atualizar")
      }
    })
  }

  // 👉 Botão confirmar exclusão
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      if (!deleteId) return
      try {
        await deleteDoc(doc(db, "quadro", deleteId))
        fecharModal("deleteModal")
        alert("Registro excluído com sucesso!")
      } catch (err) {
        console.error("Erro ao excluir:", err)
        alert("Erro ao excluir")
      }
    })
  }
})

/* ========= SELEÇÃO DE QUADRO ========= */
window.selecionarQuadro = (tipo) => {
  quadroSelecionado = tipo
  document.getElementById("quadroTipo").value = tipo
  document.getElementById("quadroTitle").textContent = `Quadro Diário - ${tipo}`
  document.getElementById("quadroContent").classList.remove("hidden")

  // Estilizar botões
  document.getElementById("btnCaixa").classList.remove("active")
  document.getElementById("btnCobranca").classList.remove("active")
  if (tipo === "Caixa") {
    document.getElementById("btnCaixa").classList.add("active")
  } else {
    document.getElementById("btnCobranca").classList.add("active")
  }

  carregarQuadros()
}

function carregarQuadros() {
  if (!quadroSelecionado) return

  onSnapshot(
    query(collection(db, "quadro"), where("tipo", "==", quadroSelecionado)),
    (snapshot) => {
      quadros = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      renderStats()
      renderTables()
      renderCharts()
    }
  )
}

/* ========= VISÃO GERAL ========= */
function renderStats() {
  const statsContainer = document.getElementById("quadroStats")
  statsContainer.innerHTML = ""

  // pega o último registro de cada turno
  const ultimoManha = quadros.filter(q => q.turno === "Manhã").pop()
  const ultimoTarde = quadros.filter(q => q.turno === "Tarde").pop()

  const totalizador = { total: 0, ferias: 0, afastamento: 0, inss: 0, ativos: 0 }

  ;[ultimoManha, ultimoTarde].forEach(reg => {
    if (reg) {
      totalizador.total += reg.total
      totalizador.ferias += reg.ferias
      totalizador.afastamento += reg.afastamento
      totalizador.inss += reg.inss
      totalizador.ativos += reg.ativos
    }
  })

  const stats = [
    { label: "Total", value: totalizador.total, icon: "users" },
    { label: "Férias", value: totalizador.ferias, icon: "umbrella-beach" },
    { label: "Afastamento", value: totalizador.afastamento, icon: "user-injured" },
    { label: "INSS", value: totalizador.inss, icon: "file-medical" },
    { label: "Ativos", value: totalizador.ativos, icon: "user-check" }
  ]

  stats.forEach(stat => {
    const card = document.createElement("div")
    card.classList.add("stat-card")
    card.innerHTML = `
      <div class="stat-icon"><i class="fas fa-${stat.icon}"></i></div>
      <div class="stat-info">
        <h4>${stat.value}</h4>
        <p>${stat.label}</p>
      </div>
    `
    statsContainer.appendChild(card)
  })
}

/* ========= HISTÓRICO ========= */
function renderTables() {
  const container = document.getElementById("quadroTables")
  container.innerHTML = ""

  quadros
    .sort((a,b) => (a.data < b.data ? 1 : -1))
    .forEach(q => {
      const row = document.createElement("div")
      row.classList.add("table-row")
      row.innerHTML = `
        <div><strong>${q.data}</strong> - ${q.turno}</div>
        <div>${q.total} total | Ativos: ${q.ativos}</div>
        <div>
          <button class="btn btn-sm btn-primary" onclick="abrirModalEdicao('${q.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="abrirModalExclusao('${q.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
      container.appendChild(row)
    })
}

/* ========= MODAIS ========= */
window.abrirModalEdicao = (id) => {
  const registro = quadros.find(q => q.id === id)
  if (!registro) return

  document.getElementById("editId").value = registro.id
  document.getElementById("editTotal").value = registro.total
  document.getElementById("editFerias").value = registro.ferias
  document.getElementById("editDesaparecidos").value = registro.desaparecidos
  document.getElementById("editAfastamento").value = registro.afastamento
  document.getElementById("editInss").value = registro.inss

  document.getElementById("editModal").classList.remove("hidden")
}

window.abrirModalExclusao = (id) => {
  deleteId = id
  document.getElementById("deleteModal").classList.remove("hidden")
}

window.fecharModal = (modalId) => {
  document.getElementById(modalId).classList.add("hidden")
  if (modalId === "deleteModal") deleteId = null
}

/* ========= GRÁFICOS ========= */
let quadroTurnoChart, quadroStatusChart
function renderCharts() {
  const ctxTurno = document.getElementById("quadroTurnoChart").getContext("2d")
  const ctxStatus = document.getElementById("quadroStatusChart").getContext("2d")

  const totalManha = quadros.filter(q => q.turno === "Manhã").map(q => q.ativos).pop() || 0
  const totalTarde = quadros.filter(q => q.turno === "Tarde").map(q => q.ativos).pop() || 0

  if (quadroTurnoChart) quadroTurnoChart.destroy()
  quadroTurnoChart = new Chart(ctxTurno, {
    type: "doughnut",
    data: {
      labels: ["Manhã", "Tarde"],
      datasets: [{ data: [totalManha, totalTarde], backgroundColor: ["#36a2eb", "#ff6384"] }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Distribuição por Turno - ${quadroSelecionado}`
        }
      }
    }
  })

  const totalizador = { ferias: 0, afastamento: 0, inss: 0 }
  quadros.forEach(q => {
    totalizador.ferias += q.ferias
    totalizador.afastamento += q.afastamento
    totalizador.inss += q.inss
  })

  if (quadroStatusChart) quadroStatusChart.destroy()

const valores = [totalizador.ferias, totalizador.afastamento, totalizador.inss]
const total = valores.reduce((acc, v) => acc + v, 0)
const percentuais = valores.map(v => total > 0 ? ((v / total) * 100).toFixed(1) : 0)

quadroStatusChart = new Chart(ctxStatus, {
  type: "bar",
  data: {
    labels: ["Férias", "Afastamento", "INSS"],
    datasets: [{
      label: `Percentual - ${quadroSelecionado}`,
      data: percentuais,
      backgroundColor: ["#ffce56", "#4bc0c0", "#9966ff"]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex
            const valorAbsoluto = valores[index]
            const percentual = percentuais[index]
            return `${percentual}% (${valorAbsoluto} colaboradores)`
          }
        }
      },
      legend: { display: false },
      title: {
        display: true,
        text: `Férias / Afastamento / INSS - ${quadroSelecionado}`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + "%"
          }
        },
        title: {
          display: true,
          text: "Percentual (%)"
        }
      }
    }
  }
})

}
