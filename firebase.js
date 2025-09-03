// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdLbmyvda93ixUTiGrmIVsFxpJuM_bMsg",
  authDomain: "qualidade-bab05.firebaseapp.com",
  projectId: "qualidade-bab05",
  storageBucket: "qualidade-bab05.firebasestorage.app",
  messagingSenderId: "319259616965",
  appId: "1:319259616965:web:c3f33efa498dfe3956f2ac",
  measurementId: "G-XFYGHTGXMW",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Firebase functions for training data
export const firebaseOperations = {
  // Salvar treinamento
  async saveTraining(trainingData) {
    try {
      const docRef = await addDoc(collection(db, "trainings"), {
        ...trainingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return docRef.id
    } catch (error) {
      console.error("Erro ao salvar treinamento:", error)
      throw error
    }
  },

  // Carregar treinamentos
  async loadTrainings() {
    try {
      const q = query(collection(db, "trainings"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const trainings = []
      querySnapshot.forEach((doc) => {
        trainings.push({ id: doc.id, ...doc.data() })
      })
      return trainings
    } catch (error) {
      console.error("Erro ao carregar treinamentos:", error)
      throw error
    }
  },

  // Atualizar treinamento
  async updateTraining(id, trainingData) {
    try {
      const trainingRef = doc(db, "trainings", id)
      await updateDoc(trainingRef, {
        ...trainingData,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Erro ao atualizar treinamento:", error)
      throw error
    }
  },

  // Deletar treinamento
  async deleteTraining(id) {
    try {
      await deleteDoc(doc(db, "trainings", id))
    } catch (error) {
      console.error("Erro ao deletar treinamento:", error)
      throw error
    }
  },

  // Salvar dados do quadro
  async saveQuadroData(quadroData) {
    try {
      const docRef = await addDoc(collection(db, "quadro"), {
        ...quadroData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return docRef.id
    } catch (error) {
      console.error("Erro ao salvar dados do quadro:", error)
      throw error
    }
  },

  // Carregar dados do quadro
  async loadQuadroData() {
    try {
      const q = query(collection(db, "quadro"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const quadroData = []
      querySnapshot.forEach((doc) => {
        quadroData.push({ id: doc.id, ...doc.data() })
      })
      return quadroData
    } catch (error) {
      console.error("Erro ao carregar dados do quadro:", error)
      throw error
    }
  },

  // Atualizar dados do quadro
  async updateQuadroData(id, quadroData) {
    try {
      const quadroRef = doc(db, "quadro", id)
      await updateDoc(quadroRef, {
        ...quadroData,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error("Erro ao atualizar dados do quadro:", error)
      throw error
    }
  },
}
