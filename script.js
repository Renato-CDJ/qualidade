import { firebaseOperations } from "./firebase.js"

// Data
const operators = [
  {
    id: "1",
    otd: "45904",
    name: "TESTE",
    cpf: "123.456.789-00",
    shift: "Manhã",
    wallet: "CAIXA",
    admission: "15/01/2024",
    companyTime: "5 dias",
    day1Training: "PRESENTE",
    day2Training: "PRESENTE",
    agentStatus: "ATIVO",
    trainingStatus: "Aplicado",
  },
  {
    id: "2",
    otd: "45905",
    name: "João Silva",
    cpf: "987.654.321-00",
    shift: "Tarde",
    wallet: "BMG",
    admission: "16/01/2024",
    companyTime: "4 dias",
    day1Training: "PRESENTE",
    day2Training: "NÃO COMPARECEU",
    agentStatus: "ATIVO",
    trainingStatus: "Em andamento",
  },
  {
    id: "3",
    otd: "45906",
    name: "Maria Santos",
    cpf: "456.789.123-00",
    shift: "Manhã",
    wallet: "MERCANTIL",
    admission: "17/01/2024",
    companyTime: "3 dias",
    day1Training: "PRESENTE",
    day2Training: "PENDENTE",
    agentStatus: "ATIVO",
    trainingStatus: "Em andamento",
  },
]

const quadroOperators = [
  {
    id: "q1",
    name: "ADILSON BIGANZOLI JUNIOR",
    cpf: "123.456.789-00",
    supervisor: "DIEGO EUCILDES",
    coordinator: "JOÃO SILVA",
    shift: "MANHÃ",
    wallet: "AFINZ",
    admission: "15/01/2024",
    companyTime: "30 dias",
    phone: "(11) 99999-9999",
    status: "ATIVO",
    monthlyAttendance: {
      1: "P",
      2: "P",
      3: "P",
      4: "FI",
      5: "P",
    },
  },
  {
    id: "q2",
    name: "ADRIELLE TAVARES DE PAULA",
    cpf: "987.654.321-00",
    supervisor: "DIEGO EUCILDES",
    coordinator: "MARIA SANTOS",
    shift: "TARDE",
    wallet: "AFINZ",
    admission: "20/01/2024",
    companyTime: "25 dias",
    phone: "(11) 88888-8888",
    status: "ATIVO",
    monthlyAttendance: {
      1: "P",
      2: "P",
      3: "P",
      4: "P",
      5: "AM",
    },
  },
]

let newOperators = []
let walletChart = null
let quadroChart = null
let isLoading = false

// Wallet colors
const walletColors = {
  CAIXA: "#3b82f6",
  BMG: "#ef4444",
  MERCANTIL: "#eab308",
  PAGBANK: "#22c55e",
  "YANAHA W.O": "#f97316",
  "WILL BANK EP": "#06b6d4",
  "WILL BANK VARIÁVEL": "#8b5cf6",
  AFINZ: "#ff0000",
  "ATIVOS G1 - CELTA": "#00ff00",
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  await loadDataFromFirebase()
  renderOperatorsTable()
  renderQuadroTable()
  updateStats()
  updateQuadroStats()
  renderWalletChart()
  renderQuadroChart()
  setupEventListeners()
  updateQuadroTitle()
}

async function loadDataFromFirebase() {
  try {
    isLoading = true
    showLoadingState()

    // Carregar treinamentos
    const trainingsData = await firebaseOperations.loadTrainings()
    if (trainingsData.length > 0) {
      operators.length = 0 // Limpar array atual
      operators.push(...trainingsData)
    }

    // Carregar dados do quadro
    const quadroData = await firebaseOperations.loadQuadroData()
    if (quadroData.length > 0) {
      quadroOperators.length = 0 // Limpar array atual
      quadroOperators.push(...quadroData)
    }

    hideLoadingState()
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
    hideLoadingState()
  } finally {
    isLoading = false
  }
}

function showLoadingState() {
  const loadingDiv = document.createElement("div")
  loadingDiv.id = "loading-overlay"
  loadingDiv.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;">
      <div style="background: white; padding: 2rem; border-radius: 0.5rem; text-align: center;">
        <div style="margin-bottom: 1rem;">Carregando dados...</div>
        <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      </div>
    </div>
  `
  document.body.appendChild(loadingDiv)
}

function hideLoadingState() {
  const loadingDiv = document.getElementById("loading-overlay")
  if (loadingDiv) {
    loadingDiv.remove()
  }
}

function setupEventListeners() {
  // Search and filters for training tab
  document.getElementById("search-input").addEventListener("input", renderOperatorsTable)
  document.getElementById("wallet-filter").addEventListener("change", renderOperatorsTable)
  document.getElementById("shift-filter").addEventListener("change", renderOperatorsTable)

  // Search and filters for quadro tab
  document.getElementById("quadro-search").addEventListener("input", renderQuadroTable)
  document.getElementById("quadro-wallet-filter").addEventListener("change", renderQuadroTable)
  document.getElementById("quadro-shift-filter").addEventListener("change", renderQuadroTable)
}

// Tab switching
function switchTab(tabName) {
  // Remove active class from all tabs and buttons
  document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"))
  document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))

  // Add active class to selected tab and button
  document.getElementById(tabName + "-tab").classList.add("active")
  event.target.classList.add("active")
}

// Render operators table
function renderOperatorsTable() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase()
  const walletFilter = document.getElementById("wallet-filter").value
  const shiftFilter = document.getElementById("shift-filter").value

  const filteredOperators = operators.filter((operator) => {
    const matchesSearch =
      operator.name.toLowerCase().includes(searchTerm) ||
      operator.otd.includes(searchTerm) ||
      operator.cpf.includes(searchTerm)
    const matchesWallet = walletFilter === "all" || operator.wallet === walletFilter
    const matchesShift = shiftFilter === "all" || operator.shift === shiftFilter

    return matchesSearch && matchesWallet && matchesShift
  })

  const tbody = document.getElementById("operators-tbody")
  tbody.innerHTML = ""

  filteredOperators.forEach((operator) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${operator.otd}</td>
            <td>${operator.name}</td>
            <td>${operator.cpf}</td>
            <td>${operator.shift}</td>
            <td><span class="badge" style="background-color: ${walletColors[operator.wallet]}15; border-color: ${walletColors[operator.wallet]}; color: ${walletColors[operator.wallet]}">${operator.wallet}</span></td>
            <td>${operator.admission}</td>
            <td>
                <select onchange="updateTrainingStatus('${operator.id}', 'day1Training', this.value)">
                    <option value="PRESENTE" ${operator.day1Training === "PRESENTE" ? "selected" : ""}>PRESENTE</option>
                    <option value="NÃO COMPARECEU" ${operator.day1Training === "NÃO COMPARECEU" ? "selected" : ""}>NÃO COMPARECEU</option>
                    <option value="PENDENTE" ${operator.day1Training === "PENDENTE" ? "selected" : ""}>PENDENTE</option>
                </select>
            </td>
            <td>
                <select onchange="updateTrainingStatus('${operator.id}', 'day2Training', this.value)">
                    <option value="PRESENTE" ${operator.day2Training === "PRESENTE" ? "selected" : ""}>PRESENTE</option>
                    <option value="NÃO COMPARECEU" ${operator.day2Training === "NÃO COMPARECEU" ? "selected" : ""}>NÃO COMPARECEU</option>
                    <option value="PENDENTE" ${operator.day2Training === "PENDENTE" ? "selected" : ""}>PENDENTE</option>
                </select>
            </td>
            <td><span class="badge ${getBadgeClass(operator.agentStatus)}">${operator.agentStatus}</span></td>
            <td>
                <select onchange="updateOperatorTrainingStatus('${operator.id}', this.value)">
                    <option value="Pendente" ${operator.trainingStatus === "Pendente" ? "selected" : ""}>Pendente</option>
                    <option value="Em andamento" ${operator.trainingStatus === "Em andamento" ? "selected" : ""}>Em andamento</option>
                    <option value="Aplicado" ${operator.trainingStatus === "Aplicado" ? "selected" : ""}>Aplicado</option>
                    <option value="Cancelado" ${operator.trainingStatus === "Cancelado" ? "selected" : ""}>Cancelado</option>
                </select>
            </td>
            <td>
                <div class="action-buttons">
                    <button onclick="editOperator('${operator.id}')" class="edit-btn" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteOperator('${operator.id}')" class="delete-btn" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `
    tbody.appendChild(row)
  })
}

// Get current month days
function getCurrentMonthDays() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = new Date(year, month, day)
    return {
      day: day.toString(),
      dayOfWeek: date.toLocaleDateString("pt-BR", { weekday: "short" }).toUpperCase(),
      fullDate: `${day}/${month + 1}/${year}`,
    }
  })
}

// Render quadro table
function renderQuadroTable() {
  const searchTerm = document.getElementById("quadro-search").value.toLowerCase()
  const walletFilter = document.getElementById("quadro-wallet-filter").value
  const shiftFilter = document.getElementById("quadro-shift-filter").value

  const filteredOperators = quadroOperators.filter((operator) => {
    const matchesSearch =
      operator.name.toLowerCase().includes(searchTerm) ||
      operator.cpf.includes(searchTerm) ||
      operator.supervisor.toLowerCase().includes(searchTerm)
    const matchesWallet = walletFilter === "all" || operator.wallet === walletFilter
    const matchesShift = shiftFilter === "all" || operator.shift === shiftFilter

    return matchesSearch && matchesWallet && matchesShift
  })

  const monthDays = getCurrentMonthDays()

  // Update header with month days
  const headerRow = document.getElementById("quadro-header-row")
  // Clear existing day headers
  const dayHeaders = headerRow.querySelectorAll(".day-header")
  dayHeaders.forEach((header) => header.remove())

  // Add day headers
  monthDays.forEach((dayInfo) => {
    const th = document.createElement("th")
    th.className = "day-header"
    th.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="font-size: 0.75rem;">${dayInfo.dayOfWeek}</span>
                <span>${dayInfo.day}</span>
            </div>
        `
    headerRow.appendChild(th)
  })

  const tbody = document.getElementById("quadro-tbody")
  tbody.innerHTML = ""

  filteredOperators.forEach((operator) => {
    const row = document.createElement("tr")

    let daysCells = ""
    monthDays.forEach((dayInfo) => {
      const attendance = operator.monthlyAttendance[dayInfo.day] || "P"
      daysCells += `
                <td style="padding: 0.25rem;">
                    <select class="attendance-${attendance.toLowerCase()}" onchange="updateAttendance('${operator.id}', '${dayInfo.day}', this.value)" style="width: 4rem; height: 2rem; font-size: 0.75rem;">
                        <option value="P" ${attendance === "P" ? "selected" : ""}>P</option>
                        <option value="FI" ${attendance === "FI" ? "selected" : ""}>FI</option>
                        <option value="AM" ${attendance === "AM" ? "selected" : ""}>AM</option>
                        <option value="D" ${attendance === "D" ? "selected" : ""}>D</option>
                        <option value="DESAP" ${attendance === "DESAP" ? "selected" : ""}>DESAP</option>
                        <option value="F" ${attendance === "F" ? "selected" : ""}>F</option>
                        <option value="AF" ${attendance === "AF" ? "selected" : ""}>AF</option>
                        <option value="R" ${attendance === "R" ? "selected" : ""}>R</option>
                        <option value="FQ" ${attendance === "FQ" ? "selected" : ""}>FQ</option>
                        <option value="PROM" ${attendance === "PROM" ? "selected" : ""}>PROM</option>
                        <option value="AP" ${attendance === "AP" ? "selected" : ""}>AP</option>
                    </select>
                </td>
            `
    })

    row.innerHTML = `
            <td>${operator.name}</td>
            <td>${operator.cpf}</td>
            <td>${operator.supervisor}</td>
            <td>${operator.coordinator}</td>
            <td>${operator.shift}</td>
            <td><span class="badge badge-gray">${operator.wallet}</span></td>
            <td>${operator.admission}</td>
            <td>${operator.companyTime}</td>
            <td>${operator.phone}</td>
            <td><span class="badge ${getBadgeClass(operator.status)}">${operator.status}</span></td>
            ${daysCells}
            <td>
                <div class="action-buttons">
                    <button onclick="editQuadroOperator('${operator.id}')" class="edit-btn" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button onclick="deleteQuadroOperator('${operator.id}')" class="delete-btn" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `
    tbody.appendChild(row)
  })
}

// Update stats
function updateStats() {
  const totalOperators = operators.length
  const day1Present = operators.filter((op) => op.day1Training === "PRESENTE").length
  const day2Present = operators.filter((op) => op.day2Training === "PRESENTE").length
  const pendingTraining = operators.filter(
    (op) => op.day1Training === "PENDENTE" || op.day2Training === "PENDENTE",
  ).length

  document.getElementById("total-operators").textContent = totalOperators
  document.getElementById("day1-present").textContent = day1Present
  document.getElementById("day2-present").textContent = day2Present
  document.getElementById("pending-training").textContent = pendingTraining
}

// Update quadro stats
function updateQuadroStats() {
  let totalPresent = 0
  let totalAbsent = 0
  let totalMedical = 0
  let totalVacation = 0
  let totalLeave = 0

  quadroOperators.forEach((operator) => {
    Object.values(operator.monthlyAttendance).forEach((status) => {
      switch (status) {
        case "P":
          totalPresent++
          break
        case "FI":
          totalAbsent++
          break
        case "AM":
          totalMedical++
          break
        case "F":
          totalVacation++
          break
        case "AF":
          totalLeave++
          break
      }
    })
  })

  const attendanceRate = totalPresent > 0 ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1) : "0"

  document.getElementById("quadro-total").textContent = quadroOperators.length
  document.getElementById("quadro-present").textContent = totalPresent
  document.getElementById("quadro-absent").textContent = totalAbsent
  document.getElementById("quadro-medical").textContent = totalMedical
  document.getElementById("quadro-rate").textContent = attendanceRate + "%"
}

// Update quadro title with current month
function updateQuadroTitle() {
  const now = new Date()
  const monthName = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).toUpperCase()
  document.getElementById("quadro-title").textContent = `Quadro de Operadores - ${monthName}`
}

// Render wallet chart
function renderWalletChart() {
  const walletData = {}
  operators.forEach((operator) => {
    walletData[operator.wallet] = (walletData[operator.wallet] || 0) + 1
  })

  const ctx = document.getElementById("wallet-chart").getContext("2d")

  if (walletChart) {
    walletChart.destroy()
  }

  walletChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(walletData),
      datasets: [
        {
          data: Object.values(walletData),
          backgroundColor: Object.keys(walletData).map((wallet) => walletColors[wallet]),
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((context.parsed / total) * 100).toFixed(1)
              return `${context.label}: ${context.parsed} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

// Render quadro chart
function renderQuadroChart() {
  let totalPresent = 0
  let totalAbsent = 0
  let totalMedical = 0
  let totalVacation = 0
  let totalLeave = 0

  quadroOperators.forEach((operator) => {
    Object.values(operator.monthlyAttendance).forEach((status) => {
      switch (status) {
        case "P":
          totalPresent++
          break
        case "FI":
          totalAbsent++
          break
        case "AM":
          totalMedical++
          break
        case "F":
          totalVacation++
          break
        case "AF":
          totalLeave++
          break
      }
    })
  })

  const ctx = document.getElementById("quadro-chart").getContext("2d")

  if (quadroChart) {
    quadroChart.destroy()
  }

  const chartData = [
    { label: "Presente", value: totalPresent, color: "#22c55e" },
    { label: "Falta Injustificada", value: totalAbsent, color: "#ef4444" },
    { label: "Atestado Médico", value: totalMedical, color: "#3b82f6" },
    { label: "Férias", value: totalVacation, color: "#a855f7" },
    { label: "Afastamento", value: totalLeave, color: "#eab308" },
  ].filter((item) => item.value > 0)

  quadroChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: chartData.map((item) => item.label),
      datasets: [
        {
          data: chartData.map((item) => item.value),
          backgroundColor: chartData.map((item) => item.color),
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((context.parsed / total) * 100).toFixed(1)
              return `${context.label}: ${context.parsed} (${percentage}%)`
            },
          },
        },
      },
    },
  })
}

// Get badge class
function getBadgeClass(status) {
  const classes = {
    PRESENTE: "badge-green",
    "NÃO COMPARECEU": "badge-red",
    PENDENTE: "badge-yellow",
    ATIVO: "badge-blue",
    INATIVO: "badge-red",
    Aplicado: "badge-green",
    "Em andamento": "badge-blue",
    Cancelado: "badge-red",
    AFASTADO: "badge-yellow",
    DESLIGADO: "badge-gray",
  }
  return classes[status] || "badge-gray"
}

async function updateTrainingStatus(operatorId, day, status) {
  const operator = operators.find((op) => op.id === operatorId)
  if (operator) {
    operator[day] = status

    // Salvar no Firebase
    try {
      await firebaseOperations.updateTraining(operatorId, operator)
    } catch (error) {
      console.error("Erro ao atualizar treinamento:", error)
    }

    updateStats()
    renderWalletChart()
  }
}

async function updateOperatorTrainingStatus(operatorId, status) {
  const operator = operators.find((op) => op.id === operatorId)
  if (operator) {
    operator.trainingStatus = status

    // Salvar no Firebase
    try {
      await firebaseOperations.updateTraining(operatorId, operator)
    } catch (error) {
      console.error("Erro ao atualizar status do treinamento:", error)
    }

    updateStats()
  }
}

async function updateAttendance(operatorId, day, status) {
  const operator = quadroOperators.find((op) => op.id === operatorId)
  if (operator) {
    operator.monthlyAttendance[day] = status

    // Salvar no Firebase
    try {
      await firebaseOperations.updateQuadroData(operatorId, operator)
    } catch (error) {
      console.error("Erro ao atualizar presença:", error)
    }

    updateQuadroStats()
    renderQuadroChart()
    renderQuadroTable()
  }
}

// Modal functions
function openAddTrainingModal() {
  document.getElementById("add-training-modal").style.display = "block"
}

function closeAddTrainingModal() {
  document.getElementById("add-training-modal").style.display = "none"
  newOperators = []
  renderNewOperatorsTable()
}

function addOperatorRow() {
  newOperators.push({
    otd: "",
    name: "",
    cpf: "",
    shift: "Manhã",
    wallet: "CAIXA",
    trainingStatus: "Pendente",
  })
  renderNewOperatorsTable()
}

function removeOperatorRow(index) {
  newOperators.splice(index, 1)
  renderNewOperatorsTable()
}

function updateNewOperator(index, field, value) {
  newOperators[index][field] = value
}

function renderNewOperatorsTable() {
  const tbody = document.getElementById("new-operators-tbody")
  tbody.innerHTML = ""

  newOperators.forEach((operator, index) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td><input type="text" value="${operator.otd}" onchange="updateNewOperator(${index}, 'otd', this.value)" placeholder="Ex: 45910" style="width: 100%; padding: 0.25rem; border: 1px solid #d1d5db; border-radius: 0.25rem;"></td>
            <td><input type="text" value="${operator.name}" onchange="updateNewOperator(${index}, 'name', this.value)" placeholder="Nome completo" style="width: 100%; padding: 0.25rem; border: 1px solid #d1d5db; border-radius: 0.25rem;"></td>
            <td><input type="text" value="${operator.cpf}" onchange="updateNewOperator(${index}, 'cpf', this.value)" placeholder="000.000.000-00" style="width: 100%; padding: 0.25rem; border: 1px solid #d1d5db; border-radius: 0.25rem;"></td>
            <td>
                <select onchange="updateNewOperator(${index}, 'shift', this.value)" style="width: 100%; padding: 0.25rem; border: 1px solid #d1d5db; border-radius: 0.25rem;">
                    <option value="Manhã" ${operator.shift === "Manhã" ? "selected" : ""}>Manhã</option>
                    <option value="Tarde" ${operator.shift === "Tarde" ? "selected" : ""}>Tarde</option>
                    <option value="Noite" ${operator.shift === "Noite" ? "selected" : ""}>Noite</option>
                </select>
            </td>
            <td>
                <select onchange="updateNewOperator(${index}, 'wallet', this.value)" style="width: 100%; padding: 0.25rem; border: 1px solid #d1d5db; border-radius: 0.25rem;">
                    <option value="CAIXA" ${operator.wallet === "CAIXA" ? "selected" : ""}>CAIXA</option>
                    <option value="BMG" ${operator.wallet === "BMG" ? "selected" : ""}>BMG</option>
                    <option value="MERCANTIL" ${operator.wallet === "MERCANTIL" ? "selected" : ""}>MERCANTIL</option>
                    <option value="PAGBANK" ${operator.wallet === "PAGBANK" ? "selected" : ""}>PAGBANK</option>
                    <option value="YANAHA W.O" ${operator.wallet === "YANAHA W.O" ? "selected" : ""}>YANAHA W.O</option>
                    <option value="WILL BANK EP" ${operator.wallet === "WILL BANK EP" ? "selected" : ""}>WILL BANK EP</option>
                    <option value="WILL BANK VARIÁVEL" ${operator.wallet === "WILL BANK VARIÁVEL" ? "selected" : ""}>WILL BANK VARIÁVEL</option>
                </select>
            </td>
            <td>
                <select onchange="updateNewOperator(${index}, 'trainingStatus', this.value)" style="width: 100%; padding: 0.25rem; border: 1px solid #d1d5db; border-radius: 0.25rem;">
                    <option value="Pendente" ${operator.trainingStatus === "Pendente" ? "selected" : ""}>Pendente</option>
                    <option value="Em andamento" ${operator.trainingStatus === "Em andamento" ? "selected" : ""}>Em andamento</option>
                    <option value="Aplicado" ${operator.trainingStatus === "Aplicado" ? "selected" : ""}>Aplicado</option>
                    <option value="Cancelado" ${operator.trainingStatus === "Cancelado" ? "selected" : ""}>Cancelado</option>
                </select>
            </td>
            <td><button onclick="removeOperatorRow(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;">&times;</button></td>
        `
    tbody.appendChild(row)
  })
}

async function saveNewOperators() {
  const validOperators = newOperators.filter((op) => op.otd && op.name && op.cpf)

  try {
    for (const op of validOperators) {
      const newOperator = {
        otd: op.otd,
        name: op.name,
        cpf: op.cpf,
        shift: op.shift,
        wallet: op.wallet,
        admission: new Date().toLocaleDateString("pt-BR"),
        companyTime: "0 dias",
        day1Training: "PENDENTE",
        day2Training: "PENDENTE",
        agentStatus: "ATIVO",
        trainingStatus: op.trainingStatus,
      }

      // Salvar no Firebase
      const id = await firebaseOperations.saveTraining(newOperator)
      newOperator.id = id
      operators.push(newOperator)
    }

    renderOperatorsTable()
    updateStats()
    renderWalletChart()
    closeAddTrainingModal()
  } catch (error) {
    console.error("Erro ao salvar operadores:", error)
    alert("Erro ao salvar operadores. Tente novamente.")
  }
}

// Export to Excel
function exportToExcel() {
  const monthDays = getCurrentMonthDays()

  const csvContent = [
    // Header
    [
      "Colaborador",
      "CPF",
      "Supervisor",
      "Coordenador",
      "Turno",
      "Carteira",
      "Admissão",
      "Tempo Empresa",
      "Telefone",
      "Status",
      ...monthDays.map((d) => d.day),
    ].join(","),
    // Data
    ...quadroOperators.map((operator) =>
      [
        operator.name,
        operator.cpf,
        operator.supervisor,
        operator.coordinator,
        operator.shift,
        operator.wallet,
        operator.admission,
        operator.companyTime,
        operator.phone,
        operator.status,
        ...monthDays.map((d) => operator.monthlyAttendance[d.day] || ""),
      ].join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `quadro_operadores_${new Date().toISOString().slice(0, 7)}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Import file
function importFile() {
  document.getElementById("file-input").click()
}

function handleFileImport(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      console.log("Arquivo importado:", text)
      alert("Funcionalidade de importação será implementada em breve!")
    }
    reader.readAsText(file)
  }
}

// Close modal when clicking outside
window.onclick = (event) => {
  const modal = document.getElementById("add-training-modal")
  if (event.target === modal) {
    closeAddTrainingModal()
  }
}

// Edit and delete functions for operators
async function editOperator(operatorId) {
  const operator = operators.find((op) => op.id === operatorId)
  if (!operator) return

  const newName = prompt("Nome do Colaborador:", operator.name)
  if (newName === null) return

  const newCpf = prompt("CPF:", operator.cpf)
  if (newCpf === null) return

  const newOtd = prompt("OTD:", operator.otd)
  if (newOtd === null) return

  const newShift = prompt("Turno (Manhã/Tarde/Noite):", operator.shift)
  if (newShift === null) return

  const newWallet = prompt("Carteira:", operator.wallet)
  if (newWallet === null) return

  const newAgentStatus = prompt("Status do Agente (ATIVO/INATIVO):", operator.agentStatus)
  if (newAgentStatus === null) return

  // Atualizar dados
  operator.name = newName
  operator.cpf = newCpf
  operator.otd = newOtd
  operator.shift = newShift
  operator.wallet = newWallet
  operator.agentStatus = newAgentStatus

  try {
    await firebaseOperations.updateTraining(operatorId, operator)
    renderOperatorsTable()
    updateStats()
    renderWalletChart()
    alert("Operador atualizado com sucesso!")
  } catch (error) {
    console.error("Erro ao atualizar operador:", error)
    alert("Erro ao atualizar operador. Tente novamente.")
  }
}

async function deleteOperator(operatorId) {
  if (!confirm("Tem certeza que deseja excluir este operador?")) return

  try {
    await firebaseOperations.deleteTraining(operatorId)
    const index = operators.findIndex((op) => op.id === operatorId)
    if (index > -1) {
      operators.splice(index, 1)
    }
    renderOperatorsTable()
    updateStats()
    renderWalletChart()
    alert("Operador excluído com sucesso!")
  } catch (error) {
    console.error("Erro ao excluir operador:", error)
    alert("Erro ao excluir operador. Tente novamente.")
  }
}

// Edit and delete functions for quadro operators
async function editQuadroOperator(operatorId) {
  const operator = quadroOperators.find((op) => op.id === operatorId)
  if (!operator) return

  const newName = prompt("Nome do Colaborador:", operator.name)
  if (newName === null) return

  const newCpf = prompt("CPF:", operator.cpf)
  if (newCpf === null) return

  const newSupervisor = prompt("Supervisor:", operator.supervisor)
  if (newSupervisor === null) return

  const newCoordinator = prompt("Coordenador:", operator.coordinator)
  if (newCoordinator === null) return

  const newShift = prompt("Turno:", operator.shift)
  if (newShift === null) return

  const newWallet = prompt("Carteira:", operator.wallet)
  if (newWallet === null) return

  const newPhone = prompt("Telefone:", operator.phone)
  if (newPhone === null) return

  const newStatus = prompt("Status:", operator.status)
  if (newStatus === null) return

  // Atualizar dados
  operator.name = newName
  operator.cpf = newCpf
  operator.supervisor = newSupervisor
  operator.coordinator = newCoordinator
  operator.shift = newShift
  operator.wallet = newWallet
  operator.phone = newPhone
  operator.status = newStatus

  try {
    await firebaseOperations.updateQuadroData(operatorId, operator)
    renderQuadroTable()
    updateQuadroStats()
    renderQuadroChart()
    alert("Operador atualizado com sucesso!")
  } catch (error) {
    console.error("Erro ao atualizar operador:", error)
    alert("Erro ao atualizar operador. Tente novamente.")
  }
}

async function deleteQuadroOperator(operatorId) {
  if (!confirm("Tem certeza que deseja excluir este operador do quadro?")) return

  try {
    await firebaseOperations.deleteQuadroData(operatorId)
    const index = quadroOperators.findIndex((op) => op.id === operatorId)
    if (index > -1) {
      quadroOperators.splice(index, 1)
    }
    renderQuadroTable()
    updateQuadroStats()
    renderQuadroChart()
    alert("Operador excluído com sucesso!")
  } catch (error) {
    console.error("Erro ao excluir operador:", error)
    alert("Erro ao excluir operador. Tente novamente.")
  }
}

function setupColumnToggle() {
  document.querySelectorAll(".column-toggle input").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const column = checkbox.dataset.column;
      const isVisible = checkbox.checked;
      
      // Cabeçalho
      document.querySelectorAll(`#operators-table thead th[data-column="${column}"]`)
        .forEach((th) => th.style.display = isVisible ? "" : "none");

      // Linhas
      document.querySelectorAll(`#operators-table tbody td[data-column="${column}"]`)
        .forEach((td) => td.style.display = isVisible ? "" : "none");
    });
  });
}


// EXPOR FUNÇÕES PARA O HTML
// -------------------------
window.switchTab = switchTab
window.openAddTrainingModal = openAddTrainingModal
window.closeAddTrainingModal = closeAddTrainingModal
window.addOperatorRow = addOperatorRow
window.removeOperatorRow = removeOperatorRow
window.updateNewOperator = updateNewOperator
window.saveNewOperators = saveNewOperators
window.exportToExcel = exportToExcel
window.updateTrainingStatus = updateTrainingStatus
window.updateOperatorTrainingStatus = updateOperatorTrainingStatus
window.updateAttendance = updateAttendance
window.editOperator = editOperator
window.deleteOperator = deleteOperator
window.editQuadroOperator = editQuadroOperator
window.deleteQuadroOperator = deleteQuadroOperator
window.importFile = importFile
window.handleFileImport = handleFileImport