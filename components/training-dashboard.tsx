"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Users, BookOpen, TrendingUp, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"

interface Training {
  id: string
  title: string
  description: string
  instructor: string
  date: string
  duration: string
  participants: number
  maxParticipants: number
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  category: string
}

interface Participant {
  id: string
  name: string
  email: string
  department: string
  status: "enrolled" | "completed" | "absent" | "pending"
  completionDate?: string
}

const mockTrainings: Training[] = [
  {
    id: "1",
    title: "Segurança no Trabalho",
    description: "Treinamento obrigatório sobre normas de segurança",
    instructor: "João Silva",
    date: "2024-01-15",
    duration: "4h",
    participants: 25,
    maxParticipants: 30,
    status: "scheduled",
    category: "Segurança",
  },
  {
    id: "2",
    title: "Liderança e Gestão",
    description: "Desenvolvimento de habilidades de liderança",
    instructor: "Maria Santos",
    date: "2024-01-20",
    duration: "8h",
    participants: 15,
    maxParticipants: 20,
    status: "in-progress",
    category: "Desenvolvimento",
  },
  {
    id: "3",
    title: "Excel Avançado",
    description: "Técnicas avançadas de planilhas eletrônicas",
    instructor: "Carlos Oliveira",
    date: "2024-01-10",
    duration: "6h",
    participants: 18,
    maxParticipants: 20,
    status: "completed",
    category: "Tecnologia",
  },
]

const mockParticipants: Participant[] = [
  {
    id: "1",
    name: "Ana Costa",
    email: "ana.costa@empresa.com",
    department: "RH",
    status: "completed",
    completionDate: "2024-01-10",
  },
  {
    id: "2",
    name: "Pedro Almeida",
    email: "pedro.almeida@empresa.com",
    department: "TI",
    status: "enrolled",
  },
  {
    id: "3",
    name: "Lucia Ferreira",
    email: "lucia.ferreira@empresa.com",
    department: "Vendas",
    status: "pending",
  },
]

export function TrainingDashboard() {
  const [trainings, setTrainings] = useState<Training[]>(mockTrainings)
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isNewTrainingOpen, setIsNewTrainingOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "enrolled":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "absent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado"
      case "in-progress":
        return "Em Andamento"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      case "enrolled":
        return "Inscrito"
      case "pending":
        return "Pendente"
      case "absent":
        return "Ausente"
      default:
        return status
    }
  }

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || training.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Controle de Treinamentos</h1>
          <p className="text-muted-foreground">Gerencie treinamentos e acompanhe o progresso dos participantes</p>
        </div>
        <Dialog open={isNewTrainingOpen} onOpenChange={setIsNewTrainingOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Treinamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Treinamento</DialogTitle>
              <DialogDescription>Preencha as informações do treinamento</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input id="title" placeholder="Nome do treinamento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seguranca">Segurança</SelectItem>
                      <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" placeholder="Descreva o conteúdo do treinamento" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instrutor</Label>
                  <Input id="instructor" placeholder="Nome do instrutor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Input id="duration" placeholder="Ex: 4h" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
                <Input id="maxParticipants" type="number" placeholder="30" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewTrainingOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsNewTrainingOpen(false)}>Cadastrar Treinamento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Treinamentos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainings.length}</div>
            <p className="text-xs text-muted-foreground">+2 desde o mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-muted-foreground">+12% desde a semana passada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">+5% desde o mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Treinamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Nos próximos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="trainings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trainings">Treinamentos</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="trainings" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar treinamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="Segurança">Segurança</SelectItem>
                <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trainings List */}
          <div className="grid gap-4">
            {filteredTrainings.map((training) => (
              <Card key={training.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{training.title}</CardTitle>
                      <CardDescription>{training.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(training.status)}>{getStatusText(training.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Instrutor:</span>
                      <p className="text-muted-foreground">{training.instructor}</p>
                    </div>
                    <div>
                      <span className="font-medium">Data:</span>
                      <p className="text-muted-foreground">{new Date(training.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <span className="font-medium">Duração:</span>
                      <p className="text-muted-foreground">{training.duration}</p>
                    </div>
                    <div>
                      <span className="font-medium">Participantes:</span>
                      <p className="text-muted-foreground">
                        {training.participants}/{training.maxParticipants}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Participantes</CardTitle>
              <CardDescription>Gerencie os participantes dos treinamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">{participant.email}</p>
                      <p className="text-sm text-muted-foreground">{participant.department}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(participant.status)}>{getStatusText(participant.status)}</Badge>
                      {participant.completionDate && (
                        <span className="text-sm text-muted-foreground">
                          Concluído em {new Date(participant.completionDate).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Conclusão</CardTitle>
                <CardDescription>Taxa de conclusão por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Segurança</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Desenvolvimento</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tecnologia</span>
                    <span className="font-medium">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Vencimentos</CardTitle>
                <CardDescription>Certificações que vencem em breve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Segurança no Trabalho</p>
                      <p className="text-sm text-muted-foreground">15 funcionários</p>
                    </div>
                    <Badge variant="destructive">30 dias</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Primeiros Socorros</p>
                      <p className="text-sm text-muted-foreground">8 funcionários</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">60 dias</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
