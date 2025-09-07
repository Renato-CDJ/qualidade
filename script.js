// Sistema de Gerenciamento de Treinamentos
class TrainingSystem {
  constructor() {
    this.currentUser = null
    this.isAdmin = false
    this.data = {
      training: JSON.parse(localStorage.getItem("training") || "[]"),
      tracking: JSON.parse(localStorage.getItem("tracking") || "[]"),
      trained: JSON.parse(localStorage.getItem("trained") || "[]"),
      desligamentos: JSON.parse(localStorage.getItem("desligamentos") || "[]"),
    }
    this.charts = {}
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadSampleData()
    this.updateCharts()
  }

  setupEventListeners() {
    // Login
    document.getElementById("loginForm").addEventListener("submit", (e) => this.handleLogin(e))
    document.getElementById("logoutBtn").addEventListener("click", () => this.logout())

    // Theme Toggle
    document.getElementById("themeToggle").addEventListener("click", () => this.toggleTheme())

    // Tab Navigation
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.switchTab(e.target.dataset.tab))
    })

    // Training Section
    document.getElementById("addTrainingBtn").addEventListener("click", () => this.toggleSection("newTrainingSection"))
    document.getElementById("trackingBtn").addEventListener("click", () => this.toggleSection("trackingSection"))
    document.getElementById("addTrainingForm").addEventListener("submit", (e) => this.addTraining(e))
    document.getElementById("addTrackingForm").addEventListener("submit", (e) => this.addTracking(e))

    // Trained Section
    document.getElementById("addTrainedForm").addEventListener("submit", (e) => this.addTrained(e))

    // Desligamentos Section
    document.getElementById("addDesligamentoForm").addEventListener("submit", (e) => this.addDesligamento(e))

    // Search and Filter
    this.setupSearchAndFilter()

    // Excel Import
    this.setupExcelImport()

    // Modal
    document.getElementById("closeModal").addEventListener("click", () => this.closeModal())
    document.getElementById("cancelEdit").addEventListener("click", () => this.closeModal())
    document.getElementById("saveEdit").addEventListener("click", () => this.saveEdit())
  }

  handleLogin(e) {
    e.preventDefault()
    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value

    // Validação simples de login
    if (email === "qualidade@grupo.com") {
      this.currentUser = "Administrador"
      this.isAdmin = true
    } else if (email && password) {
      this.currentUser = email.split("@")[0]
      this.isAdmin = false
    } else {
      alert("Credenciais inválidas!")
      return
    }

    document.getElementById("loginScreen").classList.add("hidden")
    document.getElementById("mainSystem").classList.remove("hidden")
    document.getElementById("userWelcome").textContent = `Bem-vindo, ${this.currentUser}`

    this.updateUIForUserType()
    this.renderAllTables()
    this.updateCharts()
  }

  logout() {
    this.currentUser = null
    this.isAdmin = false
    document.getElementById("loginScreen").classList.remove("hidden")
    document.getElementById("mainSystem").classList.add("hidden")
    document.getElementById("loginForm").reset()
  }

  updateUIForUserType() {
    if (!this.isAdmin) {
      document.body.classList.add("user-mode")
    } else {
      document.body.classList.remove("user-mode")
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
    // Atualizar botões
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

    // Atualizar conteúdo
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))
    document.getElementById(tabName).classList.add("active")

    // Renderizar tabela da aba ativa
    this.renderTable(tabName)
    this.updateCharts()
  }

  toggleSection(sectionId) {
    const section = document.getElementById(sectionId)
    const isHidden = section.classList.contains("hidden")

    // Esconder todas as seções primeiro
    document.querySelectorAll(".section").forEach((s) => s.classList.add("hidden"))

    if (isHidden) {
      section.classList.remove("hidden")
      section.classList.add("fade-in")
    }
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
    this.saveData("training")
    this.renderTable("training")
    this.updateCharts()
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
      campanhas: document.getElementById("trainedCampanhas").value,
      dataAdicionado: new Date().toLocaleDateString("pt-BR"),
    }

    this.data.trained.push(trained)
    this.saveData("trained")
    this.renderTable("trained")
    this.updateCharts()
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
    ;["training", "tracking", "trained", "desligamentos"].forEach((type) => {
      this.renderTable(type)
    })
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
                    <td>${item.primeiroDia}</td>
                    <td>${item.segundoDia}</td>
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
                    <td><span class="status-badge">${item.status}</span></td>
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
  setupSearchAndFilter() {
    // Training
    document.getElementById("searchTraining").addEventListener("input", () => this.filterTable("training"))
    document.getElementById("filterTurno").addEventListener("change", () => this.filterTable("training"))
    document.getElementById("filterCarteira").addEventListener("change", () => this.filterTable("training"))

    // Tracking
    document.getElementById("searchTracking").addEventListener("input", () => this.filterTable("tracking"))
    document.getElementById("filterTrackingTurno").addEventListener("change", () => this.filterTable("tracking"))
    document.getElementById("filterTrackingStatus").addEventListener("change", () => this.filterTable("tracking"))

    // Trained
    document.getElementById("searchTrained").addEventListener("input", () => this.filterTable("trained"))
    document.getElementById("filterTrainedTurno").addEventListener("change", () => this.filterTable("trained"))
    document.getElementById("filterSupervisor").addEventListener("input", () => this.filterTable("trained"))

    // Desligamentos
    document.getElementById("searchDesligamentos").addEventListener("input", () => this.filterTable("desligamentos"))
    document
      .getElementById("filterDesligamentosCarteira")
      .addEventListener("change", () => this.filterTable("desligamentos"))
    document
      .getElementById("filterDesligamentosStatus")
      .addEventListener("change", () => this.filterTable("desligamentos"))
  }

  getFilteredData(type) {
    let data = [...this.data[type]]

    switch (type) {
      case "training":
        const searchTraining = document.getElementById("searchTraining").value.toLowerCase()
        const filterTurno = document.getElementById("filterTurno").value
        const filterCarteira = document.getElementById("filterCarteira").value

        data = data.filter((item) => {
          const matchSearch = item.colaborador.toLowerCase().includes(searchTraining)
          const matchTurno = !filterTurno || item.turno === filterTurno
          const matchCarteira = !filterCarteira || item.carteira === filterCarteira
          return matchSearch && matchTurno && matchCarteira
        })
        break

      case "tracking":
        const searchTracking = document.getElementById("searchTracking").value.toLowerCase()
        const filterTrackingTurno = document.getElementById("filterTrackingTurno").value
        const filterTrackingStatus = document.getElementById("filterTrackingStatus").value

        data = data.filter((item) => {
          const matchSearch = item.colaborador.toLowerCase().includes(searchTracking)
          const matchTurno = !filterTrackingTurno || item.turno === filterTrackingTurno
          const matchStatus = !filterTrackingStatus || item.status === filterTrackingStatus
          return matchSearch && matchTurno && matchStatus
        })
        break

      case "trained":
        const searchTrained = document.getElementById("searchTrained").value.toLowerCase()
        const filterTrainedTurno = document.getElementById("filterTrainedTurno").value
        const filterSupervisor = document.getElementById("filterSupervisor").value.toLowerCase()

        data = data.filter((item) => {
          const matchSearch = item.nome.toLowerCase().includes(searchTrained)
          const matchTurno = !filterTrainedTurno || item.turno === filterTrainedTurno
          const matchSupervisor = !filterSupervisor || item.supervisor.toLowerCase().includes(filterSupervisor)
          return matchSearch && matchTurno && matchSupervisor
        })
        break

      case "desligamentos":
        const searchDesligamentos = document.getElementById("searchDesligamentos").value.toLowerCase()
        const filterDesligamentosCarteira = document.getElementById("filterDesligamentosCarteira").value
        const filterDesligamentosStatus = document.getElementById("filterDesligamentosStatus").value

        data = data.filter((item) => {
          const matchSearch = item.operador.toLowerCase().includes(searchDesligamentos)
          const matchCarteira = !filterDesligamentosCarteira || item.carteira === filterDesligamentosCarteira
          const matchStatus = !filterDesligamentosStatus || item.status === filterDesligamentosStatus
          return matchSearch && matchCarteira && matchStatus
        })
        break
    }

    return data
  }

  filterTable(type) {
    this.renderTable(type)
  }

  // Gráficos
  updateCharts() {
    this.createTurnoChart()
    this.createStatusChart()
    this.createTrainedTurnoChart()
    this.createDesligamentosChart()
  }

  createTurnoChart() {
    const ctx = document.getElementById("turnoChart")
    if (!ctx) return

    const turnoData = this.data.training.reduce((acc, item) => {
      acc[item.turno] = (acc[item.turno] || 0) + 1
      return acc
    }, {})

    if (this.charts.turno) {
      this.charts.turno.destroy()
    }

    this.charts.turno = new window.Chart(ctx, {
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
            },
          },
        },
      },
    })
  }

  createStatusChart() {
    const ctx = document.getElementById("statusChart")
    if (!ctx) return

    const statusData = this.data.tracking.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {})

    if (this.charts.status) {
      this.charts.status.destroy()
    }

    this.charts.status = new window.Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(statusData),
        datasets: [
          {
            data: Object.values(statusData),
            backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
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
            },
          },
        },
      },
    })
  }

  createTrainedTurnoChart() {
    const ctx = document.getElementById("trainedTurnoChart")
    if (!ctx) return

    const turnoData = this.data.trained.reduce((acc, item) => {
      acc[item.turno] = (acc[item.turno] || 0) + 1
      return acc
    }, {})

    if (this.charts.trainedTurno) {
      this.charts.trainedTurno.destroy()
    }

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
            },
          },
        },
      },
    })
  }

  createDesligamentosChart() {
    const ctx = document.getElementById("desligamentosChart")
    if (!ctx) return

    const motivoData = this.data.desligamentos.reduce((acc, item) => {
      acc[item.motivo] = (acc[item.motivo] || 0) + 1
      return acc
    }, {})

    if (this.charts.desligamentos) {
      this.charts.desligamentos.destroy()
    }

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
                        <select id="editPrimeiroDia">
                            <option value="Presente" ${item.primeiroDia === "Presente" ? "selected" : ""}>Presente</option>
                            <option value="Não compareceu" ${item.primeiroDia === "Não compareceu" ? "selected" : ""}>Não compareceu</option>
                            <option value="Desistência" ${item.primeiroDia === "Desistência" ? "selected" : ""}>Desistência</option>
                        </select>
                        <select id="editSegundoDia">
                            <option value="Presente" ${item.segundoDia === "Presente" ? "selected" : ""}>Presente</option>
                            <option value="Não compareceu" ${item.segundoDia === "Não compareceu" ? "selected" : ""}>Não compareceu</option>
                            <option value="Desistência" ${item.segundoDia === "Desistência" ? "selected" : ""}>Desistência</option>
                        </select>
                        <select id="editStatus">
                            <option value="Ativo" ${item.status === "Ativo" ? "selected" : ""}>Ativo</option>
                            <option value="Desligado" ${item.status === "Desligado" ? "selected" : ""}>Desligado</option>
                            <option value="Remanejado" ${item.status === "Remanejado" ? "selected" : ""}>Remanejado</option>
                        </select>
                    </div>
                `
      // Adicionar casos para 'trained' e 'desligamentos'
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
        item.primeiroDia = document.getElementById("editPrimeiroDia").value
        item.segundoDia = document.getElementById("editSegundoDia").value
        item.status = document.getElementById("editStatus").value
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
  setupExcelImport() {
    // Training
    document.getElementById("importTrainingBtn").addEventListener("click", () => {
      document.getElementById("importTrainingExcel").click()
    })
    document.getElementById("importTrainingExcel").addEventListener("change", (e) => {
      this.handleExcelImport(e, "training")
    })

    // Tracking
    document.getElementById("importTrackingBtn").addEventListener("click", () => {
      document.getElementById("importTrackingExcel").click()
    })
    document.getElementById("importTrackingExcel").addEventListener("change", (e) => {
      this.handleExcelImport(e, "tracking")
    })

    // Trained
    document.getElementById("importTrainedBtn").addEventListener("click", () => {
      document.getElementById("importTrainedExcel").click()
    })
    document.getElementById("importTrainedExcel").addEventListener("change", (e) => {
      this.handleExcelImport(e, "trained")
    })

    // Desligamentos
    document.getElementById("importDesligamentosBtn").addEventListener("click", () => {
      document.getElementById("importDesligamentosExcel").click()
    })
    document.getElementById("importDesligamentosExcel").addEventListener("change", (e) => {
      this.handleExcelImport(e, "desligamentos")
    })
  }

  handleExcelImport(event, type) {
    if (!this.isAdmin) return

    const file = event.target.files[0]
    if (!file) return

    // Simulação de importação (em um sistema real, usaria uma biblioteca como SheetJS)
    this.showNotification("Funcionalidade de importação será implementada com biblioteca específica.", "info")

    // Reset do input
    event.target.value = ""
  }

  // Dados de Exemplo
  loadSampleData() {
    if (this.data.training.length === 0) {
      this.data.training = [
        { id: 1, colaborador: "João Silva", turno: "Manhã", carteira: "Caixa", dataAdicionado: "15/12/2024" },
        { id: 2, colaborador: "Maria Santos", turno: "Tarde", carteira: "Carrefour", dataAdicionado: "14/12/2024" },
        { id: 3, colaborador: "Pedro Costa", turno: "Integral", carteira: "Caixa", dataAdicionado: "13/12/2024" },
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
}

// Inicializar o sistema
const system = new TrainingSystem()

// Carregar tema salvo
const savedTheme = localStorage.getItem("theme") || "light"
document.documentElement.setAttribute("data-theme", savedTheme)
const themeIcon = document.querySelector("#themeToggle i")
if (themeIcon) {
  themeIcon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
}
