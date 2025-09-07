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
      trainingStatus: JSON.parse(localStorage.getItem("trainingStatus") || "[]"),
    }
    this.charts = {}
    this.init()
  }

  init() {
    this.loadSampleData()
    this.renderAllTables()
    this.updateCharts()
    this.updateTrainingStats()
    this.updateTrainedStats()
    this.updateDesligadosStats()
    this.setupEventListeners()
    this.setupModalEvents()
    this.applyUserPermissions()
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

    // Search and Filter Events
    document.getElementById("searchTraining")?.addEventListener("input", () => this.renderTable("training"))
    document.getElementById("filterTurno")?.addEventListener("change", () => this.renderTable("training"))
    document.getElementById("filterCarteira")?.addEventListener("change", () => this.renderTable("training"))

    document.getElementById("searchTracking")?.addEventListener("input", () => this.renderTable("tracking"))
    document.getElementById("filterTrackingTurno")?.addEventListener("change", () => this.renderTable("tracking"))
    document.getElementById("filterTrackingStatus")?.addEventListener("change", () => this.renderTable("tracking"))

    document.getElementById("searchTrained")?.addEventListener("input", () => this.renderTable("trained"))
    document.getElementById("filterTrainedTurno")?.addEventListener("change", () => this.renderTable("trained"))
    document.getElementById("filterSupervisor")?.addEventListener("input", () => this.renderTable("trained"))

    document.getElementById("searchDesligamentos")?.addEventListener("input", () => this.renderTable("desligamentos"))
    document
      .getElementById("filterDesligamentosCarteira")
      ?.addEventListener("change", () => this.renderTable("desligamentos"))
    document
      .getElementById("filterDesligamentosStatus")
      ?.addEventListener("change", () => this.renderTable("desligamentos"))

    document.getElementById("searchTrainingStatus")?.addEventListener("input", () => this.renderTrainingStatusTable())
    document.getElementById("filterTrainingStatus")?.addEventListener("change", () => this.renderTrainingStatusTable())
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
        labels: labels.map((label, index) => {
          const percentage = total > 0 ? ((data[index] / total) * 100).toFixed(1) : 0
          return `${label}: ${data[index]} (${percentage}%)`
        }),
        datasets: [
          {
            data: data,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            borderColor: ["#FF6384", "#36A2EB", "#FFCE56"],
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
              size: 14,
            },
            formatter: (value, context) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return percentage > 3 ? `${percentage}%` : "" // Só mostra se for maior que 3%
            },
          },
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
        labels: labels.map((label, index) => {
          const percentage = total > 0 ? ((data[index] / total) * 100).toFixed(1) : 0
          return `${label}: ${data[index]} (${percentage}%)`
        }),
        datasets: [
          {
            data: data,
            backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
            borderColor: ["#28a745", "#dc3545", "#ffc107"],
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
              size: 14,
            },
            formatter: (value, context) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return percentage > 3 ? `${percentage}%` : ""
            },
          },
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

  // Adicionando novo método para gráfico de status dos treinamentos
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
        labels: labels.map((label, index) => {
          const percentage = total > 0 ? ((data[index] / total) * 100).toFixed(1) : 0
          return `${label}: ${data[index]} (${percentage}%)`
        }),
        datasets: [
          {
            data: data,
            backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
            borderColor: ["#28a745", "#ffc107", "#dc3545"],
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
              size: 14,
            },
            formatter: (value, context) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return percentage > 3 ? `${percentage}%` : ""
            },
          },
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

  updateTrainedStatusChart() {
    const ctx = document.getElementById("trainedStatusChart")
    if (!ctx) return

    const experienced = this.data.trained.filter((item) => {
      const admissaoDate = new Date(item.admissao)
      const today = new Date()
      const diffTime = Math.abs(today - admissaoDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 180
    }).length

    const novatos = this.data.trained.length - experienced
    const multipleCampaigns = this.data.trained.filter(
      (item) => item.campanhas && item.campanhas.split(",").length > 1,
    ).length

    if (this.charts.trainedStatus) {
      this.charts.trainedStatus.destroy()
    }

    const total = this.data.trained.length

    this.charts.trainedStatus = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Experientes (>6 meses)", "Novatos (<6 meses)", "Múltiplas Campanhas"],
        datasets: [
          {
            data: [experienced, novatos, multipleCampaigns],
            backgroundColor: ["#28a745", "#17a2b8", "#6f42c1"],
            borderColor: ["#1e7e34", "#138496", "#5a32a3"],
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
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i]
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor[i],
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

  updateDesligadosStatusChart() {
    const ctx = document.getElementById("desligadosStatusChart")
    if (!ctx) return

    const comAviso = this.data.desligamentos.filter((item) => item.status === "Aviso Prévio").length
    const semAviso = this.data.desligamentos.filter((item) => item.status === "Sem Aviso Prévio").length

    // Categorizar por tempo na empresa
    const ate30Dias = this.data.desligamentos.filter((item) => item.diasEmpresa <= 30).length
    const ate90Dias = this.data.desligamentos.filter((item) => item.diasEmpresa > 30 && item.diasEmpresa <= 90).length
    const mais90Dias = this.data.desligamentos.filter((item) => item.diasEmpresa > 90).length

    if (this.charts.desligadosStatus) {
      this.charts.desligadosStatus.destroy()
    }

    const total = this.data.desligamentos.length

    this.charts.desligadosStatus = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Com Aviso Prévio", "Sem Aviso Prévio", "Até 30 dias", "31-90 dias", "Mais de 90 dias"],
        datasets: [
          {
            data: [comAviso, semAviso, ate30Dias, ate90Dias, mais90Dias],
            backgroundColor: ["#28a745", "#dc3545", "#ffc107", "#fd7e14", "#6610f2"],
            borderColor: ["#1e7e34", "#c82333", "#e0a800", "#e8590c", "#520dc2"],
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
              generateLabels: (chart) => {
                const data = chart.data
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i]
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor[i],
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
                        <textarea id="editCampanhas" placeholder="Campanhas">${item.campanhas}</textarea>
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
        item.primeiroDia = document.getElementById("editPrimeiroDia").value
        item.segundoDia = document.getElementById("editSegundoDia").value
        item.status = document.getElementById("editStatus").value
        break
      case "trained":
        item.nome = document.getElementById("editNome").value
        item.supervisor = document.getElementById("editSupervisor").value
        item.coordenador = document.getElementById("editCoordenador").value
        item.turno = document.getElementById("editTurno").value
        item.admissao = document.getElementById("editAdmissao").value
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

  // Adicionando novo método para atualizar estatísticas dos treinamentos
  updateTrainingStats() {
    const total = this.data.trainingStatus.length
    const applied = this.data.trainingStatus.filter((item) => item.status === "Aplicado").length
    const pending = this.data.trainingStatus.filter((item) => item.status === "Pendente").length
    const notApplied = this.data.trainingStatus.filter((item) => item.status === "Não Aplicado").length

    document.getElementById("totalTrainings").textContent = total
    document.getElementById("appliedTrainings").textContent = applied
    document.getElementById("pendingTrainings").textContent = pending
    document.getElementById("notAppliedTrainings").textContent = notApplied
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
}

// Inicializar o sistema
const system = new TrainingSystem()

window.system = system

// Carregar tema salvo
const savedTheme = localStorage.getItem("theme") || "light"
document.documentElement.setAttribute("data-theme", savedTheme)
const themeIcon = document.querySelector("#themeToggle i")
if (themeIcon) {
  themeIcon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon"
}
