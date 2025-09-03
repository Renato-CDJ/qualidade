"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Search, Plus, Calendar, Users, TrendingUp, Clock, X, Download, Upload, BarChart3 } from "lucide-react"

interface Operator {
  id: string
  otd: string
  name: string
  cpf: string
  shift: string
  wallet: string
  admission: string
  companyTime: string
  day1Training: "PRESENTE" | "NÃO COMPARECEU" | "PENDENTE"
  day2Training: "PRESENTE" | "NÃO COMPARECEU" | "PENDENTE"
  agentStatus: "ATIVO" | "INATIVO"
  trainingStatus: "Aplicado" | "Pendente" | "Em andamento" | "Cancelado"
}

interface QuadroOperator {
  id: string
  name: string
  cpf: string
  supervisor: string
  coordinator: string
  shift: string
  wallet: string
  admission: string
  companyTime: string
  phone: string
  status: "ATIVO" | "INATIVO" | "AFASTADO" | "DESLIGADO"
  monthlyAttendance: Record<string, AttendanceStatus>
}

type AttendanceStatus =
  | "P" // Presente
  | "FI" // Falta Injustificada
  | "AM" // Atestado Médico
  | "D" // Desligado
  | "DESAP" // Desaparecido
  | "F" // Férias
  | "AF" // Afastamento
  | "R" // Remanejado
  | "FQ" // Fora do Quadro
  | "PROM" // Promovido
  | "AP" // Adicionado Aviso Prévio
  | ""

const mockOperators: Operator[] = [
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
  {
    id: "4",
    otd: "45907",
    name: "Pedro Costa",
    cpf: "321.654.987-00",
    shift: "Noite",
    wallet: "PAGBANK",
    admission: "18/01/2024",
    companyTime: "2 dias",
    day1Training: "NÃO COMPARECEU",
    day2Training: "PENDENTE",
    agentStatus: "ATIVO",
    trainingStatus: "Pendente",
  },
  {
    id: "5",
    otd: "45908",
    name: "Ana Oliveira",
    cpf: "789.123.456-00",
    shift: "Manhã",
    wallet: "YANAHA W.O",
    admission: "19/01/2024",
    companyTime: "1 dia",
    day1Training: "PRESENTE",
    day2Training: "PENDENTE",
    agentStatus: "ATIVO",
    trainingStatus: "Em andamento",
  },
  {
    id: "6",
    otd: "45909",
    name: "Carlos Lima",
    cpf: "654.987.321-00",
    shift: "Tarde",
    wallet: "WILL BANK EP",
    admission: "20/01/2024",
    companyTime: "0 dias",
    day1Training: "PENDENTE",
    day2Training: "PENDENTE",
    agentStatus: "ATIVO",
    trainingStatus: "Pendente",
  },
]

const mockQuadroOperators: QuadroOperator[] = [
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
      "1": "P",
      "2": "P",
      "3": "P",
      "4": "FI",
      "5": "P",
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
      "1": "P",
      "2": "P",
      "3": "P",
      "4": "P",
      "5": "AM",
    },
  },
  {
    id: "q3",
    name: "GUILICIA GOMES DA SILVA",
    cpf: "456.789.123-00",
    supervisor: "DIEGO EUCILDES",
    coordinator: "PEDRO COSTA",
    shift: "TARDE",
    wallet: "AFINZ",
    admission: "10/01/2024",
    companyTime: "35 dias",
    phone: "(11) 77777-7777",
    status: "ATIVO",
    monthlyAttendance: {
      "1": "DESAP",
      "2": "DESAP",
      "3": "DESAP",
      "4": "DESAP",
      "5": "DESAP",
    },
  },
]

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

const attendanceColors = {
  P: "bg-green-500 text-white", // Presente
  FI: "bg-red-500 text-white", // Falta Injustificada
  AM: "bg-blue-500 text-white", // Atestado Médico
  D: "bg-gray-800 text-white", // Desligado
  DESAP: "bg-orange-500 text-white", // Desaparecido
  F: "bg-purple-500 text-white", // Férias
  AF: "bg-yellow-500 text-black", // Afastamento
  R: "bg-cyan-500 text-white", // Remanejado
  FQ: "bg-pink-500 text-white", // Fora do Quadro
  PROM: "bg-emerald-500 text-white", // Promovido
  AP: "bg-indigo-500 text-white", // Adicionado cor para Aviso Prévio
  "": "bg-white border border-gray-300", // Vazio
}

export function OperatorTrainingControl() {
  const [operators, setOperators] = useState<Operator[]>(mockOperators)
  const [quadroOperators, setQuadroOperators] = useState<QuadroOperator[]>(mockQuadroOperators)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterWallet, setFilterWallet] = useState<string>("CAIXA")
  const [filterShift, setFilterShift] = useState<string>("Manhã")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newOperators, setNewOperators] = useState<Partial<Operator>[]>([])
  const [quadroSearchTerm, setQuadroSearchTerm] = useState("") // Separado search para quadro
  const [quadroFilterWallet, setQuadroFilterWallet] = useState<string>("all") // Separado filtro para quadro
  const [quadroFilterShift, setQuadroFilterShift] = useState<string>("all") // Separado filtro para quadro

  const getCurrentMonthDays = () => {
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

  const monthDays = getCurrentMonthDays()

  const filteredOperators = operators.filter((operator) => {
    const matchesSearch =
      operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.otd.includes(searchTerm) ||
      operator.cpf.includes(searchTerm)
    const matchesWallet = filterWallet === "all" || operator.wallet === filterWallet
    const matchesShift = filterShift === "all" || operator.shift === filterShift

    return matchesSearch && matchesWallet && matchesShift
  })

  const walletData = Object.entries(
    operators.reduce(
      (acc, operator) => {
        acc[operator.wallet] = (acc[operator.wallet] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value, color: walletColors[name as keyof typeof walletColors] }))

  const updateTrainingStatus = (
    operatorId: string,
    day: "day1Training" | "day2Training",
    status: "PRESENTE" | "NÃO COMPARECEU",
  ) => {
    setOperators((prev) => prev.map((op) => (op.id === operatorId ? { ...op, [day]: status } : op)))
  }

  const updateOperatorTrainingStatus = (
    operatorId: string,
    status: "Aplicado" | "Pendente" | "Em andamento" | "Cancelado",
  ) => {
    setOperators((prev) => prev.map((op) => (op.id === operatorId ? { ...op, trainingStatus: status } : op)))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PRESENTE: "bg-green-100 text-green-800 border-green-200",
      "NÃO COMPARECEU": "bg-red-100 text-red-800 border-red-200",
      PENDENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ATIVO: "bg-blue-100 text-blue-800 border-blue-200",
      Aplicado: "bg-green-100 text-green-800 border-green-200",
      "Em andamento": "bg-blue-100 text-blue-800 border-blue-200",
      Cancelado: "bg-red-100 text-red-800 border-red-200",
      ATIVO: "bg-blue-100 text-blue-800 border-blue-200",
      INATIVO: "bg-red-100 text-red-800 border-red-200",
      AFASTADO: "bg-yellow-100 text-yellow-800 border-yellow-200",
      DESLIGADO: "bg-gray-100 text-gray-800",
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const stats = {
    totalOperators: operators.length,
    day1Present: operators.filter((op) => op.day1Training === "PRESENTE").length,
    day2Present: operators.filter((op) => op.day2Training === "PRESENTE").length,
    pendingTraining: operators.filter((op) => op.day1Training === "PENDENTE" || op.day2Training === "PENDENTE").length,
  }

  const addNewOperatorRow = () => {
    setNewOperators([
      ...newOperators,
      {
        otd: "",
        name: "",
        cpf: "",
        shift: "Manhã",
        wallet: "CAIXA",
        admission: new Date().toLocaleDateString("pt-BR"),
        trainingStatus: "Pendente",
      },
    ])
  }

  const removeOperatorRow = (index: number) => {
    setNewOperators(newOperators.filter((_, i) => i !== index))
  }

  const updateNewOperator = (index: number, field: keyof Operator, value: string) => {
    const updated = [...newOperators]
    updated[index] = { ...updated[index], [field]: value }
    setNewOperators(updated)
  }

  const saveNewOperators = () => {
    const validOperators = newOperators.filter((op) => op.otd && op.name && op.cpf)
    const operatorsToAdd: Operator[] = validOperators.map((op, index) => ({
      id: Date.now().toString() + index,
      otd: op.otd || "",
      name: op.name || "",
      cpf: op.cpf || "",
      shift: op.shift || "Manhã",
      wallet: op.wallet || "CAIXA",
      admission: op.admission || new Date().toLocaleDateString("pt-BR"),
      companyTime: "0 dias",
      day1Training: "PENDENTE",
      day2Training: "PENDENTE",
      agentStatus: "ATIVO",
      trainingStatus: op.trainingStatus || "Pendente",
    }))

    setOperators([...operators, ...operatorsToAdd])
    setNewOperators([])
    setIsDialogOpen(false)
  }

  const updateAttendance = (operatorId: string, day: string, status: AttendanceStatus) => {
    setQuadroOperators((prev) =>
      prev.map((op) =>
        op.id === operatorId ? { ...op, monthlyAttendance: { ...op.monthlyAttendance, [day]: status } } : op,
      ),
    )
  }

  const calculateQuadroStats = () => {
    const totalDays = monthDays.length
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

    return {
      totalPresent,
      totalAbsent,
      totalMedical,
      totalVacation,
      totalLeave,
      totalOperators: quadroOperators.length,
      attendanceRate: totalPresent > 0 ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1) : "0",
    }
  }

  const quadroStats = calculateQuadroStats()
  const quadroChartData = [
    { name: "Presente", value: quadroStats.totalPresent, color: "#22c55e" },
    { name: "Falta Injustificada", value: quadroStats.totalAbsent, color: "#ef4444" },
    { name: "Atestado Médico", value: quadroStats.totalMedical, color: "#3b82f6" },
    { name: "Férias", value: quadroStats.totalVacation, color: "#a855f7" },
    { name: "Afastamento", value: quadroStats.totalLeave, color: "#eab308" },
  ].filter((item) => item.value > 0)

  const filteredQuadroOperators = quadroOperators.filter((operator) => {
    const matchesSearch =
      operator.name.toLowerCase().includes(quadroSearchTerm.toLowerCase()) ||
      operator.cpf.includes(quadroSearchTerm) ||
      operator.supervisor.toLowerCase().includes(quadroSearchTerm.toLowerCase())
    const matchesWallet = quadroFilterWallet === "all" || operator.wallet === quadroFilterWallet
    const matchesShift = quadroFilterShift === "all" || operator.shift === quadroFilterShift

    return matchesSearch && matchesWallet && matchesShift
  })

  const exportToExcel = () => {
    const csvContent = [
      // Cabeçalho
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
      // Dados
      ...filteredQuadroOperators.map((operator) =>
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

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        // Aqui você implementaria a lógica de parsing do CSV/Excel
        console.log("Arquivo importado:", text)
        alert("Funcionalidade de importação será implementada em breve!")
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Controle de Treinamentos</h1>
            <p className="text-gray-600 mt-1">Acompanhamento dos primeiros dois dias de operadores</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Treinamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Treinamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Adicione os operadores que participarão do treinamento</p>
                  <Button onClick={addNewOperatorRow} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Operador
                  </Button>
                </div>

                {newOperators.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>OTD</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>CPF</TableHead>
                          <TableHead>Turno</TableHead>
                          <TableHead>Carteira</TableHead>
                          <TableHead>Status Treinamento</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newOperators.map((operator, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                value={operator.otd || ""}
                                onChange={(e) => updateNewOperator(index, "otd", e.target.value)}
                                placeholder="Ex: 45910"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={operator.name || ""}
                                onChange={(e) => updateNewOperator(index, "name", e.target.value)}
                                placeholder="Nome completo"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={operator.cpf || ""}
                                onChange={(e) => updateNewOperator(index, "cpf", e.target.value)}
                                placeholder="000.000.000-00"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={operator.shift || "Manhã"}
                                onValueChange={(value) => updateNewOperator(index, "shift", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Manhã">Manhã</SelectItem>
                                  <SelectItem value="Tarde">Tarde</SelectItem>
                                  <SelectItem value="Noite">Noite</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={operator.wallet || "CAIXA"}
                                onValueChange={(value) => updateNewOperator(index, "wallet", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CAIXA">CAIXA</SelectItem>
                                  <SelectItem value="BMG">BMG</SelectItem>
                                  <SelectItem value="MERCANTIL">MERCANTIL</SelectItem>
                                  <SelectItem value="PAGBANK">PAGBANK</SelectItem>
                                  <SelectItem value="YANAHA W.O">YANAHA W.O</SelectItem>
                                  <SelectItem value="WILL BANK EP">WILL BANK EP</SelectItem>
                                  <SelectItem value="WILL BANK VARIÁVEL">WILL BANK VARIÁVEL</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={operator.trainingStatus || "Pendente"}
                                onValueChange={(value) => updateNewOperator(index, "trainingStatus", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pendente">Pendente</SelectItem>
                                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                                  <SelectItem value="Aplicado">Aplicado</SelectItem>
                                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeOperatorRow(index)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveNewOperators} disabled={newOperators.length === 0}>
                    Salvar Treinamento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="treinamentos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="treinamentos">Treinamentos</TabsTrigger>
            <TabsTrigger value="quadro">Quadro</TabsTrigger>
          </TabsList>

          <TabsContent value="treinamentos" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Operadores</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOperators}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">1º Dia Presentes</p>
                      <p className="text-2xl font-bold text-green-600">{stats.day1Present}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">2º Dia Presentes</p>
                      <p className="text-2xl font-bold text-green-600">{stats.day2Present}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Treinamentos Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pendingTraining}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Table */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Operadores</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar por nome, OTD ou CPF..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={filterWallet} onValueChange={setFilterWallet}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filtrar por carteira" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as carteiras</SelectItem>
                          <SelectItem value="CAIXA">CAIXA</SelectItem>
                          <SelectItem value="BMG">BMG</SelectItem>
                          <SelectItem value="MERCANTIL">MERCANTIL</SelectItem>
                          <SelectItem value="PAGBANK">PAGBANK</SelectItem>
                          <SelectItem value="YANAHA W.O">YANAHA W.O</SelectItem>
                          <SelectItem value="WILL BANK EP">WILL BANK EP</SelectItem>
                          <SelectItem value="WILL BANK VARIÁVEL">WILL BANK VARIÁVEL</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterShift} onValueChange={setFilterShift}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder="Turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Manhã">Manhã</SelectItem>
                          <SelectItem value="Tarde">Tarde</SelectItem>
                          <SelectItem value="Noite">Noite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>OTD</TableHead>
                            <TableHead>Colaborador</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Turno</TableHead>
                            <TableHead>Carteira</TableHead>
                            <TableHead>Admissão</TableHead>
                            <TableHead>1º Dia</TableHead>
                            <TableHead>2º Dia</TableHead>
                            <TableHead>Status Agente</TableHead>
                            <TableHead>Status Treinamento</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOperators.map((operator) => (
                            <TableRow key={operator.id}>
                              <TableCell className="font-medium">{operator.otd}</TableCell>
                              <TableCell>{operator.name}</TableCell>
                              <TableCell>{operator.cpf}</TableCell>
                              <TableCell>{operator.shift}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  style={{
                                    backgroundColor: `${walletColors[operator.wallet as keyof typeof walletColors]}15`,
                                    borderColor: walletColors[operator.wallet as keyof typeof walletColors],
                                    color: walletColors[operator.wallet as keyof typeof walletColors],
                                  }}
                                >
                                  {operator.wallet}
                                </Badge>
                              </TableCell>
                              <TableCell>{operator.admission}</TableCell>
                              <TableCell>
                                <Select
                                  value={operator.day1Training}
                                  onValueChange={(value) =>
                                    updateTrainingStatus(operator.id, "day1Training", value as any)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PRESENTE">PRESENTE</SelectItem>
                                    <SelectItem value="NÃO COMPARECEU">NÃO COMPARECEU</SelectItem>
                                    <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={operator.day2Training}
                                  onValueChange={(value) =>
                                    updateTrainingStatus(operator.id, "day2Training", value as any)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PRESENTE">PRESENTE</SelectItem>
                                    <SelectItem value="NÃO COMPARECEU">NÃO COMPARECEU</SelectItem>
                                    <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusBadge(operator.agentStatus)}>{operator.agentStatus}</Badge>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={operator.trainingStatus}
                                  onValueChange={(value) => updateOperatorTrainingStatus(operator.id, value as any)}
                                >
                                  <SelectTrigger className="w-36">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pendente">Pendente</SelectItem>
                                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                                    <SelectItem value="Aplicado">Aplicado</SelectItem>
                                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Contagem de Carteira</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={walletData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {walletData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quadro" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Operadores</p>
                      <p className="text-2xl font-bold text-gray-900">{quadroStats.totalOperators}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Presenças</p>
                      <p className="text-2xl font-bold text-green-600">{quadroStats.totalPresent}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Faltas</p>
                      <p className="text-2xl font-bold text-red-600">{quadroStats.totalAbsent}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Atestados</p>
                      <p className="text-2xl font-bold text-blue-600">{quadroStats.totalMedical}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taxa Presença</p>
                      <p className="text-2xl font-bold text-green-600">{quadroStats.attendanceRate}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        Quadro de Operadores -{" "}
                        {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).toUpperCase()}
                      </CardTitle>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileImport}
                          className="hidden"
                          id="file-import"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("file-import")?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Importar
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToExcel}>
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Buscar por nome, CPF ou supervisor..."
                          value={quadroSearchTerm}
                          onChange={(e) => setQuadroSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={quadroFilterWallet} onValueChange={setQuadroFilterWallet}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filtrar por carteira" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as carteiras</SelectItem>
                          <SelectItem value="AFINZ">AFINZ</SelectItem>
                          <SelectItem value="ATIVOS G1 - CELTA">ATIVOS G1 - CELTA</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={quadroFilterShift} onValueChange={setQuadroFilterShift}>
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue placeholder="Turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="MANHÃ">MANHÃ</SelectItem>
                          <SelectItem value="TARDE">TARDE</SelectItem>
                          <SelectItem value="INTEGRAL">INTEGRAL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[150px]">Colaborador</TableHead>
                            <TableHead className="min-w-[120px]">CPF</TableHead>
                            <TableHead className="min-w-[120px]">Supervisor</TableHead>
                            <TableHead className="min-w-[120px]">Coordenador</TableHead>
                            <TableHead>Turno</TableHead>
                            <TableHead>Carteira</TableHead>
                            <TableHead>Admissão</TableHead>
                            <TableHead>Tempo Empresa</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Status</TableHead>
                            {monthDays.map((dayInfo) => (
                              <TableHead key={dayInfo.day} className="min-w-[80px] text-center">
                                <div className="flex flex-col">
                                  <span className="text-xs">{dayInfo.dayOfWeek}</span>
                                  <span>{dayInfo.day}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredQuadroOperators.map((operator) => (
                            <TableRow key={operator.id}>
                              <TableCell className="font-medium">{operator.name}</TableCell>
                              <TableCell>{operator.cpf}</TableCell>
                              <TableCell>{operator.supervisor}</TableCell>
                              <TableCell>{operator.coordinator}</TableCell>
                              <TableCell>{operator.shift}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{operator.wallet}</Badge>
                              </TableCell>
                              <TableCell>{operator.admission}</TableCell>
                              <TableCell>{operator.companyTime}</TableCell>
                              <TableCell>{operator.phone}</TableCell>
                              <TableCell>
                                <Badge className={getStatusBadge(operator.status)}>{operator.status}</Badge>
                              </TableCell>
                              {monthDays.map((dayInfo) => (
                                <TableCell key={dayInfo.day} className="p-1">
                                  <Select
                                    value={operator.monthlyAttendance[dayInfo.day] || "P"}
                                    onValueChange={(value) =>
                                      updateAttendance(operator.id, dayInfo.day, value as AttendanceStatus)
                                    }
                                  >
                                    <SelectTrigger
                                      className={`w-16 h-8 text-xs ${attendanceColors[operator.monthlyAttendance[dayInfo.day] || ""]}`}
                                    >
                                      <SelectValue placeholder="" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="P">P - Presente</SelectItem>
                                      <SelectItem value="FI">FI - Falta Injustificada</SelectItem>
                                      <SelectItem value="AM">AM - Atestado Médico</SelectItem>
                                      <SelectItem value="D">D - Desligado</SelectItem>
                                      <SelectItem value="DESAP">DESAP - Desaparecido</SelectItem>
                                      <SelectItem value="F">F - Férias</SelectItem>
                                      <SelectItem value="AF">AF - Afastamento</SelectItem>
                                      <SelectItem value="R">R - Remanejado</SelectItem>
                                      <SelectItem value="FQ">FQ - Fora do Quadro</SelectItem>
                                      <SelectItem value="PROM">PROM - Promovido</SelectItem>
                                      <SelectItem value="AP">AP - Aviso Prévio</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas do Quadro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={quadroChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ percent }) => `${(percent * 1).toFixed(1)}%`}
                          >
                            {quadroChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} registros`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Legenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>P - Presente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>FI - Falta Injustificada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>AM - Atestado Médico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-800 rounded"></div>
                    <span>D - Desligado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>DESAP - Desaparecido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>F - Férias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>AF - Afastamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                    <span>R - Remanejado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-pink-500 rounded"></div>
                    <span>FQ - Fora do Quadro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                    <span>PROM - Promovido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                    <span>AP - Aviso Prévio</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
