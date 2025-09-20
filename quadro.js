let quadros = []

document.addEventListener("DOMContentLoaded", () => {
  const quadroForm = document.getElementById("quadroForm")

  if (quadroForm) {
    quadroForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const data = document.getElementById("quadroData").value
      const turno = document.getElementById("quadroTurno").value
      const total = parseInt(document.getElementById("quadroTotal").value, 10)
      const ferias = parseInt(document.getElementById("quadroFerias").value, 10)
      const desaparecidos = parseInt(document.getElementById("quadroDesaparecidos").value, 10)
      const afastamento = parseInt(document.getElementById("quadroAfastamento").value, 10)
      const inss = parseInt(document.getElementById("quadroINSS").value, 10)

      const ativos = total - (ferias + desaparecidos + afastamento + inss)

      quadros.push({ data, turno, total, ferias, desaparecidos, afastamento, inss, ativos })

      renderTables()
      renderCharts()
      e.target.reset()
    })
  }
})

function renderTables() {
  const container = document.getElementById("quadroTables")
  container.innerHTML = ""

  const turnos = ["Manhã", "Tarde"]
  const totalizador = { total: 0, ferias: 0, desaparecidos: 0, afastamento: 0, inss: 0, ativos: 0 }

  turnos.forEach(turno => {
    const registros = quadros.filter(q => q.turno === turno)
    if (registros.length > 0) {
      const ultimo = registros[registros.length - 1]
      totalizador.total += ultimo.total
      totalizador.ferias += ultimo.ferias
      totalizador.desaparecidos += ultimo.desaparecidos
      totalizador.afastamento += ultimo.afastamento
      totalizador.inss += ultimo.inss
      totalizador.ativos += ultimo.ativos

      container.appendChild(createTable(turno, ultimo))
    }
  })

  container.appendChild(createTable("Total", totalizador))
}

function createTable(titulo, dados) {
  const table = document.createElement("table")
  table.classList.add("data-table")
  table.innerHTML = `
    <thead><tr><th colspan="2">${titulo}</th></tr></thead>
    <tbody>
      <tr><td>Total</td><td>${dados.total}</td></tr>
      <tr><td>Férias</td><td>${dados.ferias}</td></tr>
      <tr><td>Desaparecidos</td><td>${dados.desaparecidos}</td></tr>
      <tr><td>Afastamento</td><td>${dados.afastamento}</td></tr>
      <tr><td>INSS</td><td>${dados.inss}</td></tr>
      <tr><td>Ativos</td><td>${dados.ativos}</td></tr>
    </tbody>
  `
  return table
}

let turnoChart, statusChart
function renderCharts() {
  const ctxTurno = document.getElementById("turnoChart").getContext("2d")
  const ctxStatus = document.getElementById("statusChart").getContext("2d")

  const totalManha = quadros.filter(q => q.turno === "Manhã").map(q => q.ativos).pop() || 0
  const totalTarde = quadros.filter(q => q.turno === "Tarde").map(q => q.ativos).pop() || 0

  if (turnoChart) turnoChart.destroy()
  turnoChart = new Chart(ctxTurno, {
    type: "doughnut",
    data: {
      labels: ["Manhã", "Tarde"],
      datasets: [{ data: [totalManha, totalTarde], backgroundColor: ["#36a2eb", "#ff6384"] }]
    }
  })

  const totalizador = { ferias: 0, afastamento: 0, inss: 0 }
  quadros.forEach(q => {
    totalizador.ferias += q.ferias
    totalizador.afastamento += q.afastamento
    totalizador.inss += q.inss
  })

  if (statusChart) statusChart.destroy()
  statusChart = new Chart(ctxStatus, {
    type: "bar",
    data: {
      labels: ["Férias", "Afastamento", "INSS"],
      datasets: [{
        label: "Quantidade",
        data: [totalizador.ferias, totalizador.afastamento, totalizador.inss],
        backgroundColor: ["#ffcd56", "#4bc0c0", "#9966ff"]
      }]
    }
  })
}
