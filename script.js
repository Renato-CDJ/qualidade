import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { auth } from "./firebase.js"

// Sistema de Gerenciamento de Treinamentos
class TrainingSystem {
  constructor() {
    this.isAdmin = true // Simular usuário admin
    this.currentUser = null
    this.charts = {}
    this.carteiras = ["Caixa", "Carrefour"] // Default carteiras
    this.hiddenCarteiras = new Set() // Track hidden carteiras
    this.customStatus = JSON.parse(localStorage.getItem("customStatus") || '["Ativo", "Desligado", "Remanejado"]')
    this.data = {
      training: JSON.parse(localStorage.getItem("training") || "[]"),
      tracking: JSON.parse(localStorage.getItem("tracking") || "[]"),
      trained: JSON.parse(localStorage.getItem("trained") || "[]"),
      desligamentos: JSON.parse(localStorage.getItem("desligamentos") || "[]"),
      trainingStatus: JSON.parse(localStorage.getItem("trainingStatus") || "[]"),
    }
    this.init()
  }

  init() {
    this.loadData()
    this.loadCarteiraSettings()
    this.renderTable("training")
    this.renderTable("tracking")
    this.renderTable("trained")
    this.renderTable("desligamentos")
    this.renderTrainingStatusTable()
    this.updateCharts()
    this.updateTrainingStats()
    this.updateTrainedStats()
    this.updateDesligadosStats()
    this.updateCarteiraStats()
    this.setupEventListeners()
    this.loadTheme()
    this.applyUserPermissions()
    this.setupModalEvents()
    this.setupToggleFeatures()
  }

  setupEventListeners() {
    this.setupStatusManagement()
    // Login
    document.getElementById("loginForm").addEventListener("submit", (e) => this.login(e))
    document.getElementById("logoutBtn").addEventListener("click", () => this.logout())

    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => this.toggleTheme())

    // Tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.switchTab(e.currentTarget.dataset.tab))

    })

    // Training section buttons
    document
      .getElementById("addTrainingBtn")
      .addEventListener("click", () => this.showOnlySection("newTrainingSection"))
    document.getElementById("trackingBtn").addEventListener("click", () => this.showOnlySection("trackingSection"))
    document
      .getElementById("viewTrainingStatusBtn")
      .addEventListener("click", () => this.showOnlySection("trainingStatusSection"))

    // Trained section buttons
    document
      .getElementById("viewTrainedTableBtn")
      .addEventListener("click", () => this.showOnlySection("trainedTableSection", "treinados"))

    // Desligados section buttons
    document
      .getElementById("viewDesligadosTableBtn")
      .addEventListener("click", () => this.showOnlySection("desligadosTableSection", "desligamentos"))

    // Back buttons
    document.getElementById("backToMainBtn").addEventListener("click", () => this.showMainOverview())
    document.getElementById("backToTrainedMainBtn").addEventListener("click", () => this.showMainOverview("treinados"))
    document
      .getElementById("backToDesligadosMainBtn")
      .addEventListener("click", () => this.showMainOverview("desligamentos"))

    // Refresh buttons
    document.getElementById("refreshBtn").addEventListener("click", () => this.refreshData())
    document.getElementById("refreshTrainedBtn").addEventListener("click", () => this.refreshData())
    document.getElementById("refreshDesligadosBtn").addEventListener("click", () => this.refreshData())

    // Forms
    document.getElementById("addTrainingForm").addEventListener("submit", (e) => this.addTraining(e))
    document.getElementById("addTrackingForm").addEventListener("submit", (e) => this.addTracking(e))
    document.getElementById("addTrainedForm").addEventListener("submit", (e) => this.addTrained(e))
    document.getElementById("addDesligamentoForm").addEventListener("submit", (e) => this.addDesligamento(e))

    // Excel imports
    document
      .getElementById("importTrainingBtn")
      .addEventListener("click", () => document.getElementById("importTrainingExcel").click())
    document
      .getElementById("importTrackingBtn")
      .addEventListener("click", () => document.getElementById("importTrackingExcel").click())
    document
      .getElementById("importTrainedBtn")
      .addEventListener("click", () => document.getElementById("importTrainedExcel").click())
    document
      .getElementById("importDesligamentosBtn")
      .addEventListener("click", () => document.getElementById("importDesligamentosExcel").click())

    document
      .getElementById("importTrainingExcel")
      .addEventListener("change", (e) => this.handleExcelImport(e, "training"))
    document
      .getElementById("importTrackingExcel")
      .addEventListener("change", (e) => this.handleExcelImport(e, "tracking"))
    document
      .getElementById("importTrainedExcel")
      .addEventListener("change", (e) => this.handleExcelImport(e, "trained"))
    document
      .getElementById("importDesligamentosExcel")
      .addEventListener("change", (e) => this.handleExcelImport(e, "desligamentos"))

    // Search and filter
    document
      .getElementById("searchTraining")
      .addEventListener("input", (e) => this.filterTable("training", e.target.value))
    document
      .getElementById("searchTracking")
      .addEventListener("input", (e) => this.filterTable("tracking", e.target.value))
    document
      .getElementById("searchTrained")
      .addEventListener("input", (e) => this.filterTable("trained", e.target.value))
    document
      .getElementById("searchDesligamentos")
      .addEventListener("input", (e) => this.filterTable("desligamentos", e.target.value))
    document
      .getElementById("searchTrainingStatus")
      .addEventListener("input", (e) => this.filterTrainingStatusTable(e.target.value))
    document
      .getElementById("searchTrainingStatusTable")
      .addEventListener("input", (e) => this.filterTrainingStatusTable(e.target.value))

    document.getElementById("filterTurno").addEventListener("change", (e) => this.applyFilters("training"))
    document.getElementById("filterCarteira").addEventListener("change", (e) => this.applyFilters("training"))
    document.getElementById("filterTrackingTurno").addEventListener("change", (e) => this.applyFilters("tracking"))
    document.getElementById("filterTrackingStatus").addEventListener("change", (e) => this.applyFilters("tracking"))
    document.getElementById("filterTrainedTurno").addEventListener("change", (e) => this.applyFilters("trained"))
    document.getElementById("filterSupervisor").addEventListener("input", (e) => this.applyFilters("trained"))
    document
      .getElementById("filterDesligamentosCarteira")
      .addEventListener("change", (e) => this.applyFilters("desligamentos"))
    document
      .getElementById("filterDesligamentosStatus")
      .addEventListener("change", (e) => this.applyFilters("desligamentos"))
    document.getElementById("filterTrainingStatus").addEventListener("change", (e) => this.filterTrainingStatusTable())
    document
      .getElementById("filterTrainingStatusTable")
      .addEventListener("change", (e) => this.filterTrainingStatusTable())

    this.updateStatusSelects()
  }

  setupToggleFeatures() {
    // Toggle charts functionality
    document
      .getElementById("toggleCharts")
      .addEventListener("click", () => this.toggleCharts("chartsContainer", "toggleCharts"))
    document
      .getElementById("toggleTrainedCharts")
      .addEventListener("click", () => this.toggleCharts("trainedChartsContainer", "toggleTrainedCharts"))
    document
      .getElementById("toggleDesligadosCharts")
      .addEventListener("click", () => this.toggleCharts("desligadosChartsContainer", "toggleDesligadosCharts"))

    // Toggle carteira stats functionality
    document
      .getElementById("manageCarteirasBtn")
      .addEventListener("click", () => this.showCarteiraManagement("carteira"))
    document
      .getElementById("manageTrainedCarteirasBtn")
      .addEventListener("click", () => this.showCarteiraManagement("trained"))
    document
      .getElementById("manageDesligadosCarteirasBtn")
      .addEventListener("click", () => this.showCarteiraManagement("desligados"))

    document
      .getElementById("closeCarteiraManagement")
      .addEventListener("click", () => this.hideCarteiraManagement("carteira"))
    document
      .getElementById("closeTrainedCarteiraManagement")
      .addEventListener("click", () => this.hideCarteiraManagement("trained"))
    document
      .getElementById("closeDesligadosCarteiraManagement")
      .addEventListener("click", () => this.hideCarteiraManagement("desligados"))

    document.getElementById("addCarteiraBtn").addEventListener("click", () => this.addCarteira("carteira"))
    document.getElementById("addTrainedCarteiraBtn").addEventListener("click", () => this.addCarteira("trained"))
    document.getElementById("addDesligadosCarteiraBtn").addEventListener("click", () => this.addCarteira("desligados"))
  }

  toggleCharts(containerId, buttonId) {
    const container = document.getElementById(containerId)
    const button = document.getElementById(buttonId)
    const icon = button.querySelector("i")

    if (container.style.display === "none") {
      container.style.display = "grid"
      icon.className = "fas fa-eye-slash"
      button.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Gráficos'
    } else {
      container.style.display = "none"
      icon.className = "fas fa-eye"
      button.innerHTML = '<i class="fas fa-eye"></i> Mostrar Gráficos'
    }
  }

  showCarteiraManagement(type) {
    const panelId =
      type === "carteira"
        ? "carteiraManagementPanel"
        : type === "trained"
          ? "trainedCarteiraManagementPanel"
          : "desligadosCarteiraManagementPanel"

    const panel = document.getElementById(panelId)
    panel.classList.remove("hidden")

    this.updateCarteiraVisibilityList(type)
  }

  hideCarteiraManagement(type) {
    const panelId =
      type === "carteira"
        ? "carteiraManagementPanel"
        : type === "trained"
          ? "trainedCarteiraManagementPanel"
          : "desligadosCarteiraManagementPanel"

    const panel = document.getElementById(panelId)
    panel.classList.add("hidden")
  }

  updateCarteiraVisibilityList(type) {
    const listId =
      type === "carteira"
        ? "carteiraVisibilityList"
        : type === "trained"
          ? "trainedCarteiraVisibilityList"
          : "desligadosCarteiraVisibilityList"

    const list = document.getElementById(listId)

    list.innerHTML = this.carteiras
      .map(
        (carteira) => `
      <div class="carteira-visibility-item">
        <label class="carteira-checkbox">
          <input type="checkbox" 
                 ${!this.hiddenCarteiras.has(carteira) ? "checked" : ""} 
                 onchange="system.toggleCarteiraVisibility('${carteira}', '${type}')">
          <span class="carteira-name">${carteira}</span>
        </label>
        <button class="btn btn-sm btn-danger" onclick="system.deleteCarteira('${carteira}', '${type}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `,
      )
      .join("")
  }

  toggleCarteiraVisibility(carteira, type) {
    if (this.hiddenCarteiras.has(carteira)) {
      this.hiddenCarteiras.delete(carteira)
    } else {
      this.hiddenCarteiras.add(carteira)
    }

    // Update the specific carteira stats based on type
    if (type === "carteira") {
      this.updateTrainingCarteiraStats()
    } else if (type === "trained") {
      this.updateTrainedCarteiraStats()
    } else if (type === "desligados") {
      this.updateDesligadosCarteiraStats()
    }

    this.saveCarteiraSettings()
  }

  addCarteira(type) {
    const inputId =
      type === "carteira"
        ? "newCarteiraName"
        : type === "trained"
          ? "newTrainedCarteiraName"
          : "newDesligadosCarteiraName"

    const input = document.getElementById(inputId)
    const carteiraName = input.value.trim()

    if (!carteiraName) {
      this.showNotification("Por favor, insira um nome para a carteira", "error")
      return
    }

    if (this.carteiras.includes(carteiraName)) {
      this.showNotification("Esta carteira já existe", "error")
      return
    }

    this.carteiras.push(carteiraName)
    input.value = ""

    // Update all select elements with new carteira
    this.updateCarteiraSelects()

    // Update visibility list
    this.updateCarteiraVisibilityList(type)

    // Update stats
    this.updateCarteiraStats()

    this.saveCarteiraSettings()
    this.showNotification(`Carteira "${carteiraName}" adicionada com sucesso!`, "success")
  }

  deleteCarteira(carteira, type) {
    if (this.carteiras.length <= 1) {
      this.showNotification("Deve haver pelo menos uma carteira", "error")
      return
    }

    if (confirm(`Tem certeza que deseja excluir a carteira "${carteira}"?`)) {
      this.carteiras = this.carteiras.filter((c) => c !== carteira)
      this.hiddenCarteiras.delete(carteira)

      // Update all select elements
      this.updateCarteiraSelects()

      // Update visibility list
      this.updateCarteiraVisibilityList(type)

      // Update stats
      this.updateCarteiraStats()

      this.saveCarteiraSettings()
      this.showNotification(`Carteira "${carteira}" excluída com sucesso!`, "success")
    }
  }

  updateCarteiraSelects() {
    const selects = [
      "carteiraSelect",
      "filterCarteira",
      "editCarteira",
      "filterTrainedCarteira",
      "filterDesligamentosCarteira",
      "desligamentoCarteira",
      "trackingCarteira",
    ]

    selects.forEach((selectId) => {
      const select = document.getElementById(selectId)
      if (select) {
        const currentValue = select.value
        const options = select.querySelectorAll('option:not([value=""])')
        options.forEach((option) => option.remove())

        this.carteiras.forEach((carteira) => {
          const option = document.createElement("option")
          option.value = carteira
          option.textContent = carteira
          if (carteira === currentValue) option.selected = true
          select.appendChild(option)
        })
      }
    })
  }

  saveCarteiraSettings() {
    localStorage.setItem("carteiras", JSON.stringify(this.carteiras))
    localStorage.setItem("hiddenCarteiras", JSON.stringify([...this.hiddenCarteiras]))
  }

  loadCarteiraSettings() {
    const savedCarteiras = localStorage.getItem("carteiras")
    const savedHiddenCarteiras = localStorage.getItem("hiddenCarteiras")

    if (savedCarteiras) {
      this.carteiras = JSON.parse(savedCarteiras)
    }

    if (savedHiddenCarteiras) {
      this.hiddenCarteiras = new Set(JSON.parse(savedHiddenCarteiras))
    }

    this.updateCarteiraSelects()
  }

  login(e) {
  e.preventDefault()
  const email = document.getElementById("loginEmail").value.trim()
  const password = document.getElementById("loginPassword").value.trim()

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user

      // Define usuário logado
      this.currentUser = user.email
      this.isAdmin = (user.email === "qualidade@grupo.com")

      // Exibe sistema e esconde login
      document.getElementById("loginScreen").classList.add("hidden")
      document.getElementById("mainSystem").classList.remove("hidden")
      document.getElementById("userWelcome").textContent = `Bem-vindo, ${this.currentUser}`

      // Ajusta a interface conforme o tipo de usuário
      this.updateUIForUserType()
      this.renderAllTables()
      this.updateCharts()
    })
    .catch((error) => {
      alert("Erro no login: " + error.message)
    })
}


  logout() {
    this.currentUser = null
    this.isAdmin = false
    document.getElementById("loginScreen").classList.remove("hidden")
    document.getElementById("mainSystem").classList.add("hidden")
    document.getElementById("loginForm").reset()
  }

  updateUIForUserType() {
  const adminElements = document.querySelectorAll(".admin-only")
  if (this.isAdmin) {
    adminElements.forEach(el => el.classList.remove("hidden"))
  } else {
    adminElements.forEach(el => el.classList.add("hidden"))
  }
}


  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", newTheme)

    const themeIcon = document.querySelector("#themeToggle i")
    themeIcon.className = newTheme === "dark" ? "fas fa-sun" : "fas fa-moon"

    localStorage.setItem("theme", newTheme)

    // Atualizar gráficos com novo tema
    setTimeout(() => this.updateCharts(), 100)
  }

  switchTab(tabName) {
  const tabMap = {
    treinamento: "training",
    treinados: "trained",
    desligamentos: "desligamentos"
  }
  const normalizedTab = tabMap[tabName] || tabName

  // Atualizar botões
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  // Atualizar conteúdo
  document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))
  document.getElementById(tabName).classList.add("active")

  // Renderizar tabela da aba ativa
  this.renderTable(normalizedTab)
  this.updateCharts()
}


  showOnlySection(sectionId, tabName = "treinamento") {
  // Esconde a visão geral da aba ativa
  const mainOverview = document.getElementById(
    tabName === "treinados"
      ? "trainedMainOverviewSection"
      : tabName === "desligamentos"
      ? "desligadosMainOverviewSection"
      : "mainOverviewSection"
  )
  if (mainOverview) {
    mainOverview.classList.add("hidden")
  }

  // Esconde todas as outras sections da aba
  const allSections = document.querySelectorAll(`#${tabName} .section`)
  allSections.forEach((section) => {
    if (section.id !== sectionId && !section.id.includes("mainOverviewSection")) {
      section.classList.add("hidden")
    }
  })

  // Mostra apenas a seção solicitada
  const targetSection = document.getElementById(sectionId)
  if (targetSection) {
    targetSection.classList.remove("hidden")
  }

  // Mostra o botão "Voltar" correto
  const backBtnId =
    tabName === "treinados"
      ? "backToTrainedMainBtn"
      : tabName === "desligamentos"
      ? "backToDesligadosMainBtn"
      : "backToMainBtn"

  const backBtn = document.getElementById(backBtnId)
  if (backBtn) {
    backBtn.classList.remove("hidden")
  }

  // 🔑 Renderizar tabelas específicas se necessário
  if (sectionId === "trainedTableSection") {
    this.renderTable("trained")
  } else if (sectionId === "desligadosTableSection") {
    this.renderTable("desligamentos")
  } else if (sectionId === "trainingTableSection") {
    this.renderTable("training")
  }
}


  showMainOverview(tabName = "treinamento") {
  // Mostra a visão geral correta
  const mainOverview = document.getElementById(
    tabName === "treinados"
      ? "trainedMainOverviewSection"
      : tabName === "desligamentos"
      ? "desligadosMainOverviewSection"
      : "mainOverviewSection"
  )
  if (mainOverview) {
    mainOverview.classList.remove("hidden")
  }

  // Esconde as outras sections (corrigido para minúsculo)
  const allSections = document.querySelectorAll(`#${tabName} .section`)
  allSections.forEach((section) => {
    if (!section.id.includes("mainOverviewSection") &&
        !section.id.includes("trainedMainOverviewSection") &&
        !section.id.includes("desligadosMainOverviewSection")) {
      section.classList.add("hidden")
    }
  })

  // Esconde o botão voltar correto
  const backBtnId =
    tabName === "treinados"
      ? "backToTrainedMainBtn"
      : tabName === "desligamentos"
      ? "backToDesligadosMainBtn"
      : "backToMainBtn"

  const backBtn = document.getElementById(backBtnId)
  if (backBtn) {
    backBtn.classList.add("hidden")
  }

  // 🔑 Forçar atualização da aba
  if (tabName === "treinados") {
    this.renderTable("trained")
    this.updateTrainedStats()
    this.updateTrainedCarteiraStats?.()
  } else if (tabName === "desligamentos") {
    this.renderTable("desligamentos")
    this.updateDesligadosStats()
    this.updateDesligadosCarteiraStats?.()
  } else {
    this.renderTable("training")
    this.updateTrainingStats()
    this.updateTrainingCarteiraStats?.()
  }

  // Atualiza os gráficos globais
  this.updateCharts()
}


  refreshPage() {
    location.reload()
  }

  refreshData() {
  // Re-renderiza todas as tabelas
  this.renderAllTables()

  // Atualiza estatísticas específicas por aba
  this.updateTrainingStats()
  if (this.updateTrainingCarteiraStats) {
    this.updateTrainingCarteiraStats()
  }

  this.updateTrainedStats()
  if (this.updateTrainedCarteiraStats) {
    this.updateTrainedCarteiraStats()
  }

  this.updateDesligadosStats()
  if (this.updateDesligadosCarteiraStats) {
    this.updateDesligadosCarteiraStats()
  }

  // Atualiza gráficos globais
  this.updateCharts()
}


  // Gerenciamento de Dados
  addTraining(e) {
    e.preventDefault()
    if (!this.isAdmin) return

    const formData = new FormData(e.target)
    const training = {
      id: Date.now(),
      colaborador: document.getElementById("colaboradorName").value,
      turno: document.getElementById("turnoSelect").value,
      carteira: document.getElementById("carteiraSelect").value,
      dataAdicionado: new Date().toLocaleDateString("pt-BR"),
    }

    this.data.training.push(training)

    const existingStatus = this.data.trainingStatus.find((item) => item.colaborador === training.colaborador)
    if (!existingStatus) {
      this.data.trainingStatus.push({
        id: Date.now() + 1,
        colaborador: training.colaborador,
        turno: training.turno,
        carteira: training.carteira,
        dataAdicionado: training.dataAdicionado,
        status: "Pendente",
      })
      this.saveData("trainingStatus")
    }

    this.saveData("training")
    this.renderTable("training")
    this.renderTrainingStatusTable()
    this.updateCharts()
    this.updateTrainingStats()
    this.updateTrainedStats()
    this.updateDesligadosStats()
    e.target.reset()

    this.showNotification("Treinamento adicionado com sucesso!", "success")
  }

  addTracking(e) {
    e.preventDefault()
    if (!this.isAdmin) return

    const tracking = {
      id: Date.now(),
      colaborador: document.getElementById("trackingColaborador").value,
      cpf: document.getElementById("trackingCPF").value,
      turno: document.getElementById("trackingTurno").value,
      carteira: document.getElementById("trackingCarteira").value,
      primeiroDia: document.getElementById("tracking1Dia").value,
      segundoDia: document.getElementById("tracking2Dia").value,
      status: document.getElementById("trackingStatus").value,
      dataAdicionado: new Date().toLocaleDateString("pt-BR"),
    }

    this.data.tracking.push(tracking)
    this.saveData("tracking")
    this.renderTable("tracking")
    this.updateCharts()
    e.target.reset()

    this.showNotification("Acompanhamento adicionado com sucesso!", "success")
  }

  addTrained(e) {
    e.preventDefault()
    if (!this.isAdmin) return

    const admissaoDate = new Date(document.getElementById("trainedAdmissao").value)
    const hoje = new Date()
    const tempoEmpresa = Math.floor((hoje - admissaoDate) / (1000 * 60 * 60 * 24))

    const trained = {
      id: Date.now(),
      nome: document.getElementById("trainedNome").value,
      supervisor: document.getElementById("trainedSupervisor").value,
      coordenador: document.getElementById("trainedCoordenador").value,
      turno: document.getElementById("trainedTurno").value,
      admissao: document.getElementById("trainedAdmissao").value,
      tempoEmpresa: `${tempoEmpresa} dias`,
      dataTreinamento: document.getElementById("trainedDataTreinamento").value,
      campanhas: document.getElementById("trainedCampanhas").value,
      dataAdicionado: new Date().toLocaleDateString("pt-BR"),
    }

    this.data.trained.push(trained)
    this.saveData("trained")
    this.renderTable("trained")
    this.updateCharts()
    this.updateTrainedStats()
    e.target.reset()

    this.showNotification("Operador treinado adicionado com sucesso!", "success")
  }

  addDesligamento(e) {
    e.preventDefault()
    if (!this.isAdmin) return

    const admissaoDate = new Date(document.getElementById("desligamentoAdmissao").value)
    const desligamentoDate = new Date(document.getElementById("desligamentoData").value)
    const diasEmpresa = Math.floor((desligamentoDate - admissaoDate) / (1000 * 60 * 60 * 24))

    const desligamento = {
      id: Date.now(),
      operador: document.getElementById("desligamentoOperador").value,
      carteira: document.getElementById("desligamentoCarteira").value,
      dataAdmissao: document.getElementById("desligamentoAdmissao").value,
      diasEmpresa: diasEmpresa,
      motivo: document.getElementById("desligamentoMotivo").value,
      status: document.getElementById("desligamentoStatus").value,
      dataDesligamento: document.getElementById("desligamentoData").value,
      agencia: document.getElementById("desligamentoAgencia").value,
      dataAdicionado: new Date().toLocaleDateString("pt-BR"),
    }

    this.data.desligamentos.push(desligamento)
    this.saveData("desligamentos")
    this.renderTable("desligamentos")
    this.updateCharts()
    this.updateDesligadosStats()
    e.target.reset()

    this.showNotification("Desligamento adicionado com sucesso!", "success")
  }

  // Renderização de Tabelas
  renderTable(type) {
    const tableId = this.getTableId(type)
    const tbody = document.querySelector(`#${tableId} tbody`)
    if (!tbody) return

    tbody.innerHTML = ""
    const data = this.getFilteredData(type)

    data.forEach((item) => {
      const row = this.createTableRow(type, item)
      tbody.appendChild(row)
    })
  }

  renderAllTables() {
    this.renderTable("training")
    this.renderTable("tracking")
    this.renderTable("trained")
    this.renderTable("desligamentos")
    this.renderTrainingStatusTable()
    this.updateTrainingStats()
    this.updateTrainedStats()
    this.updateDesligadosStats()
  }

  getTableId(type) {
    const tableMap = {
      training: "trainingTable",
      tracking: "trackingTable",
      trained: "trainedTable",
      desligamentos: "desligamentosTable",
    }
    return tableMap[type] || "trainingTable"
  }

  createTableRow(type, item) {
    const row = document.createElement("tr")

    switch (type) {
      case "training":
        row.innerHTML = `
                    <td>${item.colaborador}</td>
                    <td>${item.turno}</td>
                    <td>${item.carteira}</td>
                    <td class="admin-only">
                        <div class="action-buttons-table">
                            <button class="btn btn-sm btn-success" onclick="system.editItem('training', ${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="system.deleteItem('training', ${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `
        break
      case "tracking":
        row.innerHTML = `
                    <td>${item.colaborador}</td>
                    <td>${item.cpf}</td>
                    <td>${item.turno}</td>
                    <td>${item.carteira}</td>
                    <!-- Removed 1º Dia and 2º Dia columns -->
                    <td><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
                    <td class="admin-only">
                        <div class="action-buttons-table">
                            <button class="btn btn-sm btn-success" onclick="system.editItem('tracking', ${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="system.deleteItem('tracking', ${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `
        break
      case "trained":
        row.innerHTML = `
                    <td>${item.nome}</td>
                    <td>${item.supervisor}</td>
                    <td>${item.coordenador}</td>
                    <td>${item.turno}</td>
                    <td>${new Date(item.admissao).toLocaleDateString("pt-BR")}</td>
                    <td>${item.tempoEmpresa}</td>
                    <!-- Split data and campaigns into separate columns -->
                    <td>${item.dataTreinamento ? new Date(item.dataTreinamento).toLocaleDateString("pt-BR") : "N/A"}</td>
                    <td>${item.campanhas}</td>
                    <td class="admin-only">
                        <div class="action-buttons-table">
                            <button class="btn btn-sm btn-success" onclick="system.editItem('trained', ${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="system.deleteItem('trained', ${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `
        break
      case "desligamentos":
        row.innerHTML = `
                    <td>${item.operador}</td>
                    <td>${item.carteira}</td>
                    <td>${new Date(item.dataAdmissao).toLocaleDateString("pt-BR")}</td>
                    <td>${item.diasEmpresa} dias</td>
                    <td>${item.motivo}</td>
                    <td><span class="status-badge status-${item.status.toLowerCase().replace(/\s+/g, "-")}">${item.status}</span></td>
                    <td>${new Date(item.dataDesligamento).toLocaleDateString("pt-BR")}</td>
                    <td>${item.agencia}</td>
                    <td class="admin-only">
                        <div class="action-buttons-table">
                            <button class="btn btn-sm btn-success" onclick="system.editItem('desligamentos', ${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="system.deleteItem('desligamentos', ${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `
        break
    }

    return row
  }

  // Busca e Filtros
  getFilteredData(type) {
    const data = [...this.data[type]]
    return data
  }

  filterTable(type, searchTerm) {
    const tableId = this.getTableId(type)
    const tbody = document.querySelector(`#${tableId} tbody`)

    if (!tbody) return

    tbody.innerHTML = ""

    const filteredData = this.data[type].filter((item) => {
      for (const key in item) {
        if (typeof item[key] === "string" && item[key].toLowerCase().includes(searchTerm.toLowerCase())) {
          return true
        }
      }
      return false
    })

    filteredData.forEach((item) => {
      const row = this.createTableRow(type, item)
      tbody.appendChild(row)
    })
  }

  applyFilters(type) {
    const tableId = this.getTableId(type)
    const tbody = document.querySelector(`#${tableId} tbody`)
    if (!tbody) return

    tbody.innerHTML = ""

    let filteredData = [...this.data[type]]

    switch (type) {
      case "training":
        const turnoFilter = document.getElementById("filterTurno").value
        const carteiraFilter = document.getElementById("filterCarteira").value

        filteredData = filteredData.filter((item) => {
          if (turnoFilter && item.turno !== turnoFilter) return false
          if (carteiraFilter && item.carteira !== carteiraFilter) return false
          return true
        })
        break
      case "tracking":
        const turnoTrackingFilter = document.getElementById("filterTrackingTurno").value
        const statusTrackingFilter = document.getElementById("filterTrackingStatus").value

        filteredData = filteredData.filter((item) => {
          if (turnoTrackingFilter && item.turno !== turnoTrackingFilter) return false
          if (statusTrackingFilter && item.status !== statusTrackingFilter) return false
          return true
        })
        break
      case "trained":
        const turnoTrainedFilter = document.getElementById("filterTrainedTurno").value
        const supervisorTrainedFilter = document.getElementById("filterSupervisor").value.toLowerCase()

        filteredData = filteredData.filter((item) => {
          if (turnoTrainedFilter && item.turno !== turnoTrainedFilter) return false
          if (supervisorTrainedFilter && !item.supervisor.toLowerCase().includes(supervisorTrainedFilter)) return false
          return true
        })
        break
      case "desligamentos":
        const carteiraDesligamentosFilter = document.getElementById("filterDesligamentosCarteira").value
        const statusDesligamentosFilter = document.getElementById("filterDesligamentosStatus").value

        filteredData = filteredData.filter((item) => {
          if (carteiraDesligamentosFilter && item.carteira !== carteiraDesligamentosFilter) return false
          if (statusDesligamentosFilter && item.status !== statusDesligamentosFilter) return false
          return true
        })
        break
    }

    filteredData.forEach((item) => {
      const row = this.createTableRow(type, item)
      tbody.appendChild(row)
    })
  }

  // Gráficos
  updateCharts() {
    this.updateTurnoChart()
    this.updateStatusChart()
    this.updateTrainingStatusChart()
    this.updateCarteiraStatusChart()
    this.updateTrainedTurnoChart()
    this.updateTrainedStatusChart()
    this.updateDesligamentosChart()
    this.updateDesligadosStatusChart()
  }

  updateTurnoChart() {
    const ctx = document.getElementById("turnoChart")
    if (!ctx) return

    const turnoCount = { Manhã: 0, Tarde: 0, Integral: 0 }
    this.data.training.forEach((item) => {
      turnoCount[item.turno]++
    })

    const labels = Object.keys(turnoCount)
    const data = Object.values(turnoCount)
    const total = data.reduce((sum, value) => sum + value, 0)

    if (this.charts.turno) {
      this.charts.turno.destroy()
    }

    this.charts.turno = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#3498db", "#e74c3c", "#f39c12"],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                weight: "bold",
              },
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i]
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      pointStyle: "circle",
                    }
                  })
                }
                return []
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.parsed
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
        cutout: "60%",
        animation: {
          animateRotate: true,
          duration: 1000,
        },
      },
    })
  }

  updateStatusChart() {
    const ctx = document.getElementById("statusChart")
    if (!ctx) return

    const statusCount = { Ativo: 0, Desligado: 0, Remanejado: 0 }
    this.data.tracking.forEach((item) => {
      statusCount[item.status]++
    })

    const labels = Object.keys(statusCount)
    const data = Object.values(statusCount)
    const total = data.reduce((sum, value) => sum + value, 0)

    if (this.charts.status) {
      this.charts.status.destroy()
    }

    this.charts.status = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#28a745", "#dc3545", "#6c757d"],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                weight: "bold",
              },
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i]
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      pointStyle: "circle",
                    }
                  })
                }
                return []
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.parsed
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
        cutout: "60%",
        animation: {
          animateRotate: true,
          duration: 1000,
        },
      },
    })
  }

  updateTrainedTurnoChart() {
    const ctx = document.getElementById("trainedTurnoChart")
    if (!ctx) return

    const turnoData = this.data.trained.reduce((acc, item) => {
      acc[item.turno] = (acc[item.turno] || 0) + 1
      return acc
    }, {})

    if (this.charts.trainedTurno) {
      this.charts.trainedTurno.destroy()
    }

    const total = Object.values(turnoData).reduce((sum, value) => sum + value, 0)

    this.charts.trainedTurno = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(turnoData),
        datasets: [
          {
            data: Object.values(turnoData),
            backgroundColor: ["#ff6b35", "#ff8c42", "#ffa726"],
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
            labels: {
              color: window.getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim(),
              padding: 20,
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i]
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      hidden: false,
                      index: i,
                    }
                  })
                }
                return []
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return `${context.label}: ${value} (${percentage}%)`
              },
            },
          },
        },
      },
    })
  }

  updateDesligamentosChart() {
    const ctx = document.getElementById("desligamentosChart")
    if (!ctx) return

    const motivoData = this.data.desligamentos.reduce((acc, item) => {
      acc[item.motivo] = (acc[item.motivo] || 0) + 1
      return acc
    }, {})

    if (this.charts.desligamentos) {
      this.charts.desligamentos.destroy()
    }

    const total = Object.values(motivoData).reduce((sum, value) => sum + value, 0)

    this.charts.desligamentos = new window.Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(motivoData),
        datasets: [
          {
            data: Object.values(motivoData),
            backgroundColor: ["#dc3545", "#ffc107", "#6c757d", "#17a2b8"],
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
            labels: {
              color: window.getComputedStyle(document.documentElement).getPropertyValue("--text-primary").trim(),
              padding: 20,
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i]
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      hidden: false,
                      index: i,
                    }
                  })
                }
                return []
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return `${context.label}: ${value} (${percentage}%)`
              },
            },
          },
        },
      },
    })
  }

  updateTrainingStatusChart() {
    const ctx = document.getElementById("trainingStatusChart")
    if (!ctx) return

    const statusCount = { Aplicado: 0, Pendente: 0, "Não Aplicado": 0 }
    this.data.trainingStatus.forEach((item) => {
      statusCount[item.status]++
    })

    const labels = Object.keys(statusCount)
    const data = Object.values(statusCount)
    const total = data.reduce((sum, value) => sum + value, 0)

    if (this.charts.trainingStatus) {
      this.charts.trainingStatus.destroy()
    }

    this.charts.trainingStatus = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                weight: "bold",
              },
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i]
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      pointStyle: "circle",
                    }
                  })
                }
                return []
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.parsed
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
        cutout: "60%",
        animation: {
          animateRotate: true,
          duration: 1000,
        },
      },
    })
  }

  updateCarteiraStatusChart() {
    const ctx = document.getElementById("carteiraStatusChart")
    if (!ctx) return

    // Contar status por carteira para gráfico de pizza
    const carteiraStats = {}
    this.data.trainingStatus.forEach((item) => {
      if (!carteiraStats[item.carteira]) {
        carteiraStats[item.carteira] = 0
      }
      carteiraStats[item.carteira]++
    })

    const labels = Object.keys(carteiraStats)
    const data = Object.values(carteiraStats)
    const total = data.reduce((sum, value) => sum + value, 0)

    if (this.charts.carteiraStatus) {
      this.charts.carteiraStatus.destroy()
    }

    this.charts.carteiraStatus = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels.map((label, index) => {
          const percentage = total > 0 ? ((data[index] / total) * 100).toFixed(1) : 0
          return `${label}: ${data[index]} (${percentage}%)`
        }),
        datasets: [
          {
            data: data,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
            borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = labels[context.dataIndex]
                const value = context.parsed
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
          datalabels: {
            display: true,
            color: "white",
            font: {
              weight: "bold",
              size: 12,
            },
            formatter: (value, context) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return percentage > 5 ? `${percentage}%` : "" // Só mostra se for maior que 5%
            },
          },
        },
      },
    })
  }

  // Edição e Exclusão
  editItem(type, id) {
    if (!this.isAdmin) return

    const item = this.data[type].find((item) => item.id === id)
    if (!item) return

    this.showEditModal(type, item)
  }

  deleteItem(type, id) {
    if (!this.isAdmin) return

    if (confirm("Tem certeza que deseja excluir este item?")) {
      this.data[type] = this.data[type].filter((item) => item.id !== id)
      this.saveData(type)
      this.renderTable(type)
      this.updateCharts()
      this.showNotification("Item excluído com sucesso!", "success")
    }
  }

  showEditModal(type, item) {
    const modal = document.getElementById("editModal")
    const modalTitle = document.getElementById("modalTitle")
    const modalBody = document.getElementById("modalBody")

    modalTitle.textContent = `Editar ${this.getTypeLabel(type)}`
    modalBody.innerHTML = this.createEditForm(type, item)

    modal.classList.remove("hidden")
    modal.dataset.type = type
    modal.dataset.id = item.id
  }

  createEditForm(type, item) {
    switch (type) {
      case "training":
        return `
                    <div class="form-row">
                        <input type="text" id="editColaborador" value="${item.colaborador}" placeholder="Colaborador">
                        <select id="editTurno">
                            <option value="Manhã" ${item.turno === "Manhã" ? "selected" : ""}>Manhã</option>
                            <option value="Tarde" ${item.turno === "Tarde" ? "selected" : ""}>Tarde</option>
                            <option value="Integral" ${item.turno === "Integral" ? "selected" : ""}>Integral</option>
                        </select>
                        <select id="editCarteira">
                            <option value="Caixa" ${item.carteira === "Caixa" ? "selected" : ""}>Caixa</option>
                            <option value="Carrefour" ${item.carteira === "Carrefour" ? "selected" : ""}>Carrefour</option>
                        </select>
                    </div>
                `
      case "tracking":
        const statusOptions = this.customStatus
          .map((status) => `<option value="${status}" ${item.status === status ? "selected" : ""}>${status}</option>`)
          .join("")

        return `
                    <div class="form-row">
                        <input type="text" id="editColaborador" value="${item.colaborador}" placeholder="Colaborador">
                        <input type="text" id="editCPF" value="${item.cpf}" placeholder="CPF">
                        <select id="editTurno">
                            <option value="Manhã" ${item.turno === "Manhã" ? "selected" : ""}>Manhã</option>
                            <option value="Tarde" ${item.turno === "Tarde" ? "selected" : ""}>Tarde</option>
                            <option value="Integral" ${item.turno === "Integral" ? "selected" : ""}>Integral</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <select id="editCarteira">
                            <option value="Caixa" ${item.carteira === "Caixa" ? "selected" : ""}>Caixa</option>
                            <option value="Carrefour" ${item.carteira === "Carrefour" ? "selected" : ""}>Carrefour</option>
                        </select>
                        <select id="editStatus">
                            ${statusOptions}
                        </select>
                    </div>
                `
      case "trained":
        return `
                    <div class="form-row">
                        <input type="text" id="editNome" value="${item.nome}" placeholder="Nome">
                        <input type="text" id="editSupervisor" value="${item.supervisor}" placeholder="Supervisor">
                        <input type="text" id="editCoordenador" value="${item.coordenador}" placeholder="Coordenador">
                    </div>
                    <div class="form-row">
                        <select id="editTurno">
                            <option value="Manhã" ${item.turno === "Manhã" ? "selected" : ""}>Manhã</option>
                            <option value="Tarde" ${item.turno === "Tarde" ? "selected" : ""}>Tarde</option>
                            <option value="Integral" ${item.turno === "Integral" ? "selected" : ""}>Integral</option>
                        </select>
                        <input type="date" id="editAdmissao" value="${item.admissao}">
                        <!-- Added separate field for training date -->
                        <input type="date" id="editDataTreinamento" value="${item.dataTreinamento || ""}" placeholder="Data do Treinamento">
                        <textarea id="editCampanhas" placeholder="Campanhas (Produto)">${item.campanhas}</textarea>
                    </div>
                `
      case "desligamentos":
        return `
                    <div class="form-row">
                        <input type="text" id="editOperador" value="${item.operador}" placeholder="Operador">
                        <select id="editCarteira">
                            <option value="Caixa" ${item.carteira === "Caixa" ? "selected" : ""}>Caixa</option>
                            <option value="Carrefour" ${item.carteira === "Carrefour" ? "selected" : ""}>Carrefour</option>
                        </select>
                        <input type="date" id="editDataAdmissao" value="${item.dataAdmissao}">
                    </div>
                    <div class="form-row">
                        <select id="editMotivo">
                            <option value="Pedido de demissão" ${item.motivo === "Pedido de demissão" ? "selected" : ""}>Pedido de demissão</option>
                            <option value="Demissão sem justa causa" ${item.motivo === "Demissão sem justa causa" ? "selected" : ""}>Demissão sem justa causa</option>
                            <option value="Demissão por justa causa" ${item.motivo === "Demissão por justa causa" ? "selected" : ""}>Demissão por justa causa</option>
                            <option value="Fim de contrato" ${item.motivo === "Fim de contrato" ? "selected" : ""}>Fim de contrato</option>
                        </select>
                        <select id="editStatus">
                            <option value="Aviso Prévio" ${item.status === "Aviso Prévio" ? "selected" : ""}>Aviso Prévio</option>
                            <option value="Desligado" ${item.status === "Desligado" ? "selected" : ""}>Desligado</option>
                            <option value="Processando" ${item.status === "Processando" ? "selected" : ""}>Processando</option>
                        </select>
                        <input type="date" id="editDataDesligamento" value="${item.dataDesligamento}">
                        <select id="editAgencia">
                            <option value="Sim" ${item.agencia === "Sim" ? "selected" : ""}>Sim</option>
                            <option value="Não" ${item.agencia === "Não" ? "selected" : ""}>Não</option>
                        </select>
                    </div>
                `
      default:
        return "<p>Formulário de edição não disponível.</p>"
    }
  }

  saveEdit() {
    const modal = document.getElementById("editModal")
    const type = modal.dataset.type
    const id = Number.parseInt(modal.dataset.id)

    const item = this.data[type].find((item) => item.id === id)
    if (!item) return

    // Atualizar dados baseado no tipo
    switch (type) {
      case "training":
        item.colaborador = document.getElementById("editColaborador").value
        item.turno = document.getElementById("editTurno").value
        item.carteira = document.getElementById("editCarteira").value
        break
      case "tracking":
        item.colaborador = document.getElementById("editColaborador").value
        item.cpf = document.getElementById("editCPF").value
        item.turno = document.getElementById("editTurno").value
        item.carteira = document.getElementById("editCarteira").value
        item.status = document.getElementById("editStatus").value
        break
      case "trained":
        item.nome = document.getElementById("editNome").value
        item.supervisor = document.getElementById("editSupervisor").value
        item.coordenador = document.getElementById("editCoordenador").value
        item.turno = document.getElementById("editTurno").value
        item.admissao = document.getElementById("editAdmissao").value
        item.dataTreinamento = document.getElementById("editDataTreinamento").value
        item.campanhas = document.getElementById("editCampanhas").value

        // Recalcular tempo de empresa
        const admissaoDate = new Date(item.admissao)
        const hoje = new Date()
        const tempoEmpresa = Math.floor((hoje - admissaoDate) / (1000 * 60 * 60 * 24))
        item.tempoEmpresa = `${tempoEmpresa} dias`
        break
      case "desligamentos":
        item.operador = document.getElementById("editOperador").value
        item.carteira = document.getElementById("editCarteira").value
        item.dataAdmissao = document.getElementById("editDataAdmissao").value
        item.motivo = document.getElementById("editMotivo").value
        item.status = document.getElementById("editStatus").value
        item.dataDesligamento = document.getElementById("editDataDesligamento").value
        item.agencia = document.getElementById("editAgencia").value

        // Recalcular dias na empresa
        const admissaoDateDesl = new Date(item.dataAdmissao)
        const desligamentoDate = new Date(item.dataDesligamento)
        const diasEmpresa = Math.floor((desligamentoDate - admissaoDateDesl) / (1000 * 60 * 60 * 24))
        item.diasEmpresa = diasEmpresa
        break
    }

    this.saveData(type)
    this.renderTable(type)
    this.updateCharts()
    this.closeModal()
    this.showNotification("Item atualizado com sucesso!", "success")
  }

  closeModal() {
    document.getElementById("editModal").classList.add("hidden")
  }

  getTypeLabel(type) {
    const labels = {
      training: "Treinamento",
      tracking: "Acompanhamento",
      trained: "Treinado",
      desligamentos: "Desligamento",
    }
    return labels[type] || "Item"
  }

  // Importação de Excel
  // Training
  // Tracking
  // Trained
  // Desligamentos

  // Dados de Exemplo
  loadSampleData() {
    if (this.data.training.length === 0) {
      this.data.training = [
        { id: 1, colaborador: "João Silva", turno: "Manhã", carteira: "Caixa", dataAdicionado: "15/12/2024" },
        { id: 2, colaborador: "Maria Santos", turno: "Tarde", carteira: "Carrefour", dataAdicionado: "14/12/2024" },
        { id: 3, colaborador: "Pedro Costa", turno: "Integral", carteira: "Caixa", dataAdicionado: "13/12/2024" },
      ]
    }

    if (this.data.trainingStatus.length === 0) {
      this.data.trainingStatus = [
        {
          id: 1,
          colaborador: "João Silva",
          turno: "Manhã",
          carteira: "Caixa",
          dataAdicionado: "15/12/2024",
          status: "Aplicado",
        },
        {
          id: 2,
          colaborador: "Maria Santos",
          turno: "Tarde",
          carteira: "Carrefour",
          dataAdicionado: "14/12/2024",
          status: "Pendente",
        },
        {
          id: 3,
          colaborador: "Pedro Costa",
          turno: "Integral",
          carteira: "Caixa",
          dataAdicionado: "13/12/2024",
          status: "Não Aplicado",
        },
      ]
    }

    if (this.data.tracking.length === 0) {
      this.data.tracking = [
        {
          id: 1,
          colaborador: "João Silva",
          cpf: "123.456.789-00",
          turno: "Manhã",
          carteira: "Caixa",
          primeiroDia: "Presente",
          segundoDia: "Presente",
          status: "Ativo",
          dataAdicionado: "15/12/2024",
        },
        {
          id: 2,
          colaborador: "Maria Santos",
          cpf: "987.654.321-00",
          turno: "Tarde",
          carteira: "Carrefour",
          primeiroDia: "Presente",
          segundoDia: "Não compareceu",
          status: "Desligado",
          dataAdicionado: "14/12/2024",
        },
      ]
    }

    if (this.data.trained.length === 0) {
      this.data.trained = [
        {
          id: 1,
          nome: "Ana Oliveira",
          supervisor: "Carlos Lima",
          coordenador: "Roberto Silva",
          turno: "Manhã",
          admissao: "2024-01-15",
          tempoEmpresa: "330 dias",
          campanhas: "15/01/2024 - Produto A, 15/06/2024 - Produto B",
          dataAdicionado: "15/12/2024",
        },
      ]
    }

    if (this.data.desligamentos.length === 0) {
      this.data.desligamentos = [
        {
          id: 1,
          operador: "José Ferreira",
          carteira: "Caixa",
          dataAdmissao: "2024-06-01",
          diasEmpresa: 180,
          motivo: "Pedido de demissão",
          status: "Aviso Prévio",
          dataDesligamento: "2024-12-01",
          agencia: "Não",
          dataAdicionado: "15/12/2024",
        },
      ]
    }

    this.saveAllData()
  }

  // Persistência de Dados
  saveData(type) {
    localStorage.setItem(type, JSON.stringify(this.data[type]))
  }

  saveAllData() {
    Object.keys(this.data).forEach((type) => {
      this.saveData(type)
    })
  }

  // Notificações
  showNotification(message, type = "info") {
    // Criar elemento de notificação
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: var(--${type === "success" ? "success" : type === "error" ? "danger" : "primary"}-color);
            color: white;
            border-radius: 8px;
            box-shadow: var(--shadow-hover);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `
    notification.textContent = message

    document.body.appendChild(notification)

    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.animation = "fadeOut 0.3s ease-in"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  // Adicionando novo método para renderizar tabela de status dos treinamentos
  renderTrainingStatusTable() {
    const tbody = document.querySelector("#trainingStatusTable tbody")
    if (!tbody) return

    const searchTerm = document.getElementById("searchTrainingStatus")?.value.toLowerCase() || ""
    const statusFilter = document.getElementById("filterTrainingStatus")?.value || ""

    const filteredData = this.data.trainingStatus.filter((item) => {
      const matchesSearch = item.colaborador.toLowerCase().includes(searchTerm)
      const matchesStatus = !statusFilter || item.status === statusFilter
      return matchesSearch && matchesStatus
    })

    tbody.innerHTML = ""
    filteredData.forEach((item) => {
      const row = this.createTrainingStatusRow(item)
      tbody.appendChild(row)
    })
  }

  filterTrainingStatusTable(searchTerm = "", statusFilter = "") {
    const tbody = document.querySelector("#trainingStatusTable tbody")
    if (!tbody) return

    tbody.innerHTML = ""

    let filteredData = [...this.data.trainingStatus]

    if (searchTerm) {
      filteredData = filteredData.filter((item) => item.colaborador.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (statusFilter) {
      filteredData = filteredData.filter((item) => item.status === statusFilter)
    }

    filteredData.forEach((item) => {
      const row = this.createTrainingStatusRow(item)
      tbody.appendChild(row)
    })
  }

  // Adicionando novo método para criar linha da tabela de status
  createTrainingStatusRow(item) {
    const row = document.createElement("tr")
    const statusClass =
      item.status === "Aplicado"
        ? "status-applied"
        : item.status === "Pendente"
          ? "status-pending"
          : "status-not-applied"

    row.innerHTML = `
      <td>${item.colaborador}</td>
      <td>${item.turno}</td>
      <td>${item.carteira}</td>
      <td>${item.dataAdicionado}</td>
      <td><span class="status-badge ${statusClass}">${item.status}</span></td>
      <td class="admin-only">
        <div class="action-buttons-table">
          <select onchange="system.updateTrainingStatus(${item.id}, this.value)" class="status-select">
            <option value="Pendente" ${item.status === "Pendente" ? "selected" : ""}>Pendente</option>
            <option value="Aplicado" ${item.status === "Aplicado" ? "selected" : ""}>Treinamento Aplicado</option>
            <option value="Não Aplicado" ${item.status === "Não Aplicado" ? "selected" : ""}>Não Aplicado</option>
          </select>
        </div>
      </td>
    `
    return row
  }

  // Adicionando novo método para atualizar status do treinamento
  updateTrainingStatus(id, newStatus) {
    if (!this.isAdmin) return

    const item = this.data.trainingStatus.find((item) => item.id === id)
    if (item) {
      item.status = newStatus
      this.saveData("trainingStatus")
      this.renderTrainingStatusTable()
      this.updateCharts()
      this.updateTrainingStats()
      this.updateTrainedStats()
      this.updateDesligadosStats()
      this.showNotification("Status atualizado com sucesso!", "success")
    }
  }

  updateCarteiraStats() {
    this.updateTrainingCarteiraStats()
    this.updateTrainedCarteiraStats()
    this.updateDesligadosCarteiraStats()
  }

  updateTrainingCarteiraStats() {
    const container = document.getElementById("carteiraStats")
    if (!container) return

    const carteiraStats = {}

    // Initialize carteira stats for visible carteiras only
    this.carteiras.forEach((carteira) => {
      if (!this.hiddenCarteiras.has(carteira)) {
        carteiraStats[carteira] = {
          total: 0,
          aplicados: 0,
          pendentes: 0,
        }
      }
    })

    // Count training status by carteira
    this.data.trainingStatus.forEach((item) => {
      if (carteiraStats[item.carteira]) {
        carteiraStats[item.carteira].total++
        if (item.status === "Aplicado") {
          carteiraStats[item.carteira].aplicados++
        } else if (item.status === "Pendente") {
          carteiraStats[item.carteira].pendentes++
        }
      }
    })

    // Render carteira stats
    container.innerHTML = Object.entries(carteiraStats)
      .map(
        ([carteira, stats]) => `
      <div class="carteira-stat-card">
        <div class="carteira-stat-header">
          <i class="fas fa-briefcase"></i>
          <span>${carteira}</span>
        </div>
        <div class="carteira-stat-numbers">
          <div class="carteira-stat-item">
            <span class="carteira-stat-value">${stats.total}</span>
            <span class="carteira-stat-label">Total</span>
          </div>
          <div class="carteira-stat-item">
            <span class="carteira-stat-value">${stats.aplicados}</span>
            <span class="carteira-stat-label">Aplicados</span>
          </div>
          <div class="carteira-stat-item">
            <span class="carteira-stat-value">${stats.pendentes}</span>
            <span class="carteira-stat-label">Pendentes</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  updateTrainedCarteiraStats() {
    const container = document.getElementById("trainedCarteiraStats")
    if (!container) return

    const carteiraStats = {}

    // Initialize carteira stats for visible carteiras only
    this.carteiras.forEach((carteira) => {
      if (!this.hiddenCarteiras.has(carteira)) {
        carteiraStats[carteira] = {
          total: 0,
          ativos: 0,
          experientes: 0,
        }
      }
    })

    // Count trained by carteira
    this.data.trained.forEach((item) => {
      const carteira = item.campanhas && item.campanhas.includes("Caixa") ? "Caixa" : "Carrefour"

      if (carteiraStats[carteira]) {
        carteiraStats[carteira].total++

        const admissaoDate = new Date(item.admissao)
        const today = new Date()
        const diffTime = Math.abs(today - admissaoDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays > 0) {
          carteiraStats[carteira].ativos++
        }
        if (diffDays > 180) {
          carteiraStats[carteira].experientes++
        }
      }
    })

    // Render carteira stats
    container.innerHTML = Object.entries(carteiraStats)
      .map(
        ([carteira, stats]) => `
      <div class="carteira-stat-card">
        <div class="carteira-stat-header">
          <i class="fas fa-briefcase"></i>
          <span>${carteira}</span>
        </div>
        <div class="carteira-stat-numbers">
          <div class="carteira-stat-item">
            <span class="carteira-stat-value">${stats.total}</span>
            <span class="carteira-stat-label">Total</span>
          </div>
          <div class="carteira-stat-item">
            <span class="carteira-stat-value">${stats.ativos}</span>
            <span class="carteira-stat-label">Ativos</span>
          </div>
          <div class="carteira-stat-item">
            <span class="carteira-stat-value">${stats.experientes}</span>
            <span class="carteira-stat-label">Experientes</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  updateDesligadosCarteiraStats() {
    const container = document.getElementById("desligadosCarteiraStats")
    if (!container) return

    const carteiraStats = {}

    // Initialize carteira stats for visible carteiras only
    this.carteiras.forEach((carteira) => {
      if (!this.hiddenCarteiras.has(carteira)) {
        carteiraStats[carteira] = {
          total: 0,
          comAviso: 0,
          semAviso: 0,
        }
      }
    })

    // Count desligamentos by carteira
    this.data.desligamentos.forEach((item) => {
      if (carteiraStats[item.carteira]) {
        carteiraStats[item.carteira].total++
        if (item.status === "Aviso Prévio") {
          carteiraStats[item.carteira].comAviso++
        } else if (item.status === "Sem Aviso Prévio") {
          carteiraStats[item.carteira].semAviso++
        }
      }
    })

    // Render carteira stats
    container.innerHTML = Object.entries(carteiraStats)
      .map(
        ([carteira, stats]) => `
      <div class="carteira-stat-card">
        <div class="carteira-stat-header">
          <i class="fas fa-briefcase"></i>
          <span>${carteira}</span>
        </div>
        <div class="carteira-stat-numbers">
          <div class="carteira-stat-item">
            <span class="carteira-stat-value">${stats.total}</span>
            <span class="carteira-stat-label">Total</span>
          </div>
          <div class="carteira-stat-item">
            <span class="carteira-stat-value">${stats.comAviso}</span>
            <span class="carteira-stat-label">Com Aviso</span>
          </div>
          <div class="carteira-stat-item">
            <span class="carteira-stat-value">${stats.semAviso}</span>
            <span class="carteira-stat-label">Sem Aviso</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  loadData() {
    this.loadSampleData()
  }

  updateTrainingStats() {
    const totalTrainings = this.data.trainingStatus.length
    const appliedTrainings = this.data.trainingStatus.filter((item) => item.status === "Aplicado").length
    const pendingTrainings = this.data.trainingStatus.filter((item) => item.status === "Pendente").length
    const notAppliedTrainings = this.data.trainingStatus.filter((item) => item.status === "Não Aplicado").length

    document.getElementById("totalTrainings").textContent = totalTrainings
    document.getElementById("appliedTrainings").textContent = appliedTrainings
    document.getElementById("pendingTrainings").textContent = pendingTrainings
    document.getElementById("notAppliedTrainings").textContent = notAppliedTrainings

    this.updateCarteiraStats()
  }

  // Adicionando novo método para atualizar estatísticas dos treinados
  updateTrainedStats() {
    const total = this.data.trained.length
    const active = this.data.trained.filter((item) => {
      const admissaoDate = new Date(item.admissao)
      const today = new Date()
      const diffTime = Math.abs(today - admissaoDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 // Considerando ativos todos que têm data de admissão
    }).length

    const experienced = this.data.trained.filter((item) => {
      const admissaoDate = new Date(item.admissao)
      const today = new Date()
      const diffTime = Math.abs(today - admissaoDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 180 // Mais de 6 meses
    }).length

    const multipleCampaigns = this.data.trained.filter(
      (item) => item.campanhas && item.campanhas.split(",").length > 1,
    ).length

    document.getElementById("totalTrained").textContent = total
    document.getElementById("activeTrained").textContent = active
    document.getElementById("experiencedTrained").textContent = experienced
    document.getElementById("multipleCampaignsTrained").textContent = multipleCampaigns
  }

  // Adicionando novo método para atualizar estatísticas dos desligados
  updateDesligadosStats() {
    const total = this.data.desligamentos.length
    const comAviso = this.data.desligamentos.filter((item) => item.status === "Aviso Prévio").length
    const semAviso = this.data.desligamentos.filter((item) => item.status === "Sem Aviso Prévio").length

    const avgDays =
      total > 0
        ? Math.round(this.data.desligamentos.reduce((sum, item) => sum + (item.diasEmpresa || 0), 0) / total)
        : 0

    document.getElementById("totalDesligados").textContent = total
    document.getElementById("avisoDesligados").textContent = comAviso
    document.getElementById("semAvisoDesligados").textContent = semAviso
    document.getElementById("avgDaysDesligados").textContent = avgDays
  }

  updateStats() {
    this.updateTrainingStats()
    this.updateTrainedStats()
    this.updateDesligadosStats()
  }

  setupModalEvents() {
    document.getElementById("closeModal").addEventListener("click", () => this.closeModal())
    document.getElementById("cancelEdit").addEventListener("click", () => this.closeModal())
    document.getElementById("saveEdit").addEventListener("click", () => this.saveEdit())
  }

  applyUserPermissions() {
    if (!this.isAdmin) {
      document.body.classList.add("user-mode")
    } else {
      document.body.classList.remove("user-mode")
    }
  }

  loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light"
    document.documentElement.setAttribute("data-theme", savedTheme)
    const themeIcon = document.querySelector("#themeToggle i")
    if (themeIcon) {
      themeIcon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
    }
  }

  updateTrainedStatusChart() {
    const ctx = document.getElementById("trainedStatusChart")
    if (!ctx) return

    // Calculate trained status data
    const statusData = {
      Ativos: this.data.trained.filter((item) => {
        const admissaoDate = new Date(item.admissao)
        const today = new Date()
        const diffTime = Math.abs(today - admissaoDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0
      }).length,
      Experientes: this.data.trained.filter((item) => {
        const admissaoDate = new Date(item.admissao)
        const today = new Date()
        const diffTime = Math.abs(today - admissaoDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 180
      }).length,
      "Múltiplas Campanhas": this.data.trained.filter((item) => item.campanhas && item.campanhas.split(",").length > 1)
        .length,
    }

    const labels = Object.keys(statusData)
    const data = Object.values(statusData)
    const total = data.reduce((sum, value) => sum + value, 0)

    if (this.charts.trainedStatus) {
      this.charts.trainedStatus.destroy()
    }

    this.charts.trainedStatus = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#28a745", "#17a2b8", "#ffc107"],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                weight: "bold",
              },
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i]
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      pointStyle: "circle",
                    }
                  })
                }
                return []
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.parsed
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
        cutout: "60%",
        animation: {
          animateRotate: true,
          duration: 1000,
        },
      },
    })
  }

  updateDesligadosStatusChart() {
    const ctx = document.getElementById("desligadosStatusChart")
    if (!ctx) return

    // Calculate terminated status data
    const statusData = {
      "Com Aviso Prévio": this.data.desligamentos.filter((item) => item.status === "Aviso Prévio").length,
      "Sem Aviso Prévio": this.data.desligamentos.filter((item) => item.status === "Sem Aviso Prévio").length,
      Processando: this.data.desligamentos.filter((item) => item.status === "Processando").length,
    }

    const labels = Object.keys(statusData)
    const data = Object.values(statusData)
    const total = data.reduce((sum, value) => sum + value, 0)

    if (this.charts.desligadosStatus) {
      this.charts.desligadosStatus.destroy()
    }

    this.charts.desligadosStatus = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: ["#28a745", "#dc3545", "#6c757d"],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverBorderWidth: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                weight: "bold",
              },
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i]
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      pointStyle: "circle",
                    }
                  })
                }
                return []
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.parsed
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
        cutout: "60%",
        animation: {
          animateRotate: true,
          duration: 1000,
        },
      },
    })
  }

  setupStatusManagement() {
    const manageStatusBtn = document.getElementById("manageStatusBtn")
    const statusManagementPanel = document.getElementById("statusManagementPanel")
    const closeStatusManagement = document.getElementById("closeStatusManagement")
    const addStatusBtn = document.getElementById("addStatusBtn")

    if (manageStatusBtn) {
      manageStatusBtn.addEventListener("click", () => {
        statusManagementPanel.classList.toggle("hidden")
        this.updateStatusList()
      })
    }

    if (closeStatusManagement) {
      closeStatusManagement.addEventListener("click", () => {
        statusManagementPanel.classList.add("hidden")
      })
    }

    if (addStatusBtn) {
      addStatusBtn.addEventListener("click", () => {
        const newStatusName = document.getElementById("newStatusName")
        const statusName = newStatusName.value.trim()

        if (statusName && !this.customStatus.includes(statusName)) {
          this.customStatus.push(statusName)
          this.saveCustomStatus()
          this.updateStatusList()
          this.updateStatusSelects()
          newStatusName.value = ""
          this.showNotification("Status adicionado com sucesso!", "success")
        } else if (this.customStatus.includes(statusName)) {
          this.showNotification("Este status já existe!", "error")
        }
      })
    }
  }

  updateStatusList() {
    const statusList = document.getElementById("statusList")
    if (!statusList) return

    statusList.innerHTML = ""
    this.customStatus.forEach((status, index) => {
      const statusItem = document.createElement("div")
      statusItem.className = "carteira-item"
      statusItem.innerHTML = `
        <span>${status}</span>
        ${
          index >= 3
            ? `<button class="btn btn-sm btn-danger" onclick="system.removeStatus('${status}')">
          <i class="fas fa-trash"></i>
        </button>`
            : ""
        }
      `
      statusList.appendChild(statusItem)
    })
  }

  removeStatus(statusName) {
    if (confirm(`Tem certeza que deseja remover o status "${statusName}"?`)) {
      this.customStatus = this.customStatus.filter((status) => status !== statusName)
      this.saveCustomStatus()
      this.updateStatusList()
      this.updateStatusSelects()
      this.showNotification("Status removido com sucesso!", "success")
    }
  }

  updateStatusSelects() {
    const trackingStatusSelect = document.getElementById("trackingStatus")
    const filterTrackingStatusSelect = document.getElementById("filterTrackingStatus")

    if (trackingStatusSelect) {
      const currentValue = trackingStatusSelect.value
      trackingStatusSelect.innerHTML = '<option value="">Status</option>'
      this.customStatus.forEach((status) => {
        const option = document.createElement("option")
        option.value = status
        option.textContent = status
        if (status === currentValue) option.selected = true
        trackingStatusSelect.appendChild(option)
      })
    }

    if (filterTrackingStatusSelect) {
      const currentValue = filterTrackingStatusSelect.value
      filterTrackingStatusSelect.innerHTML = '<option value="">Todos os Status</option>'
      this.customStatus.forEach((status) => {
        const option = document.createElement("option")
        option.value = status
        option.textContent = status
        if (status === currentValue) option.selected = true
        filterTrackingStatusSelect.appendChild(option)
      })
    }
  }

  saveCustomStatus() {
    localStorage.setItem("customStatus", JSON.stringify(this.customStatus))
  }

  handleExcelImport(event, type) {
    if (!this.isAdmin) {
      this.showNotification("Acesso negado. Apenas administradores podem importar dados.", "error")
      return
    }

    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ]

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      this.showNotification("Formato de arquivo inválido. Use apenas arquivos Excel (.xlsx, .xls) ou CSV.", "error")
      event.target.value = "" // Clear the input
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      this.showNotification("Arquivo muito grande. O tamanho máximo é 5MB.", "error")
      event.target.value = "" // Clear the input
      return
    }

    // Show loading notification
    this.showNotification("Processando arquivo Excel...", "info")

    // Simulate Excel processing (in a real app, you'd use a library like SheetJS)
    setTimeout(() => {
      this.processExcelFile(file, type)
      event.target.value = "" // Clear the input after processing
    }, 1000)
  }

  processExcelFile(file, type) {
    // This is a simulation of Excel processing
    // In a real application, you would use a library like SheetJS (xlsx) to parse the Excel file

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        // Simulate successful import with sample data
        const sampleData = this.generateSampleImportData(type)

        // Add the sample data to the appropriate dataset
        sampleData.forEach((item) => {
          this.data[type].push({
            ...item,
            id: Date.now() + Math.random(),
            dataAdicionado: new Date().toLocaleDateString("pt-BR"),
          })
        })

        // Save and update UI
        this.saveData(type)
        this.renderTable(type)
        this.updateCharts()
        this.updateTrainingStats()
        this.updateTrainedStats()
        this.updateDesligadosStats()

        this.showNotification(`${sampleData.length} registros importados com sucesso!`, "success")
      } catch (error) {
        console.error("Erro ao processar arquivo:", error)
        this.showNotification("Erro ao processar o arquivo. Verifique o formato e tente novamente.", "error")
      }
    }

    reader.onerror = () => {
      this.showNotification("Erro ao ler o arquivo.", "error")
    }

    reader.readAsArrayBuffer(file)
  }

  generateSampleImportData(type) {
    // Generate sample data based on type for demonstration
    switch (type) {
      case "training":
        return [
          { colaborador: "Carlos Importado", turno: "Manhã", carteira: "Caixa" },
          { colaborador: "Ana Importada", turno: "Tarde", carteira: "Carrefour" },
        ]
      case "tracking":
        return [
          {
            colaborador: "Pedro Importado",
            cpf: "111.222.333-44",
            turno: "Integral",
            carteira: "Caixa",
            primeiroDia: "Presente",
            segundoDia: "Presente",
            status: "Ativo",
          },
        ]
      case "trained":
        return [
          {
            nome: "Maria Importada",
            supervisor: "João Silva",
            coordenador: "Ana Costa",
            turno: "Manhã",
            admissao: "2024-01-01",
            tempoEmpresa: "350 dias",
            campanhas: "01/01/2024 - Produto Importado",
          },
        ]
      case "desligamentos":
        return [
          {
            operador: "José Importado",
            carteira: "Carrefour",
            dataAdmissao: "2024-06-01",
            diasEmpresa: 150,
            motivo: "Pedido de demissão",
            status: "Aviso Prévio",
            dataDesligamento: "2024-11-01",
            agencia: "Não",
          },
        ]
      default:
        return []
    }
  }
}

// Inicializar o sistema
const system = new TrainingSystem()

window.system = system
