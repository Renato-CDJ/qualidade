// js/treinados.js
import { db } from './auth.js';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ensureUI, renderTable, attachSearch, attachSelectFilter } from './utils.js';

ensureUI();

const colRef = collection(db, 'treinados');

const columns = [
  { key:'quantidade' }, { key:'nome' }, { key:'supervisor' }, { key:'coordenador' }, { key:'turno' }, { key:'admissao' }, { key:'tempo' }
];

let cache = [];

function load(){
  const q = query(colRef, orderBy('createdAt','desc'));
  onSnapshot(q, snap=>{
    const arr = [];
    snap.forEach(d => arr.push({ id:d.id, ...d.data() }));
    cache = arr;
    renderTable('#tableTreinados', arr, columns);
    attachTableActions();
    draw3D(arr);
  }, ()=>{ /* fallback */ });
}

load();

function attachTableActions(){
  document.querySelectorAll('#tableTreinados .btn-delete').forEach(btn=>{
    btn.onclick = async ()=> {
      const id = btn.dataset.id;
      if(!confirm('Excluir operador treinado?')) return;
      await deleteDoc(doc(db, 'treinados', id));
    };
  });
  document.querySelectorAll('#tableTreinados .btn-edit').forEach(btn=>{
    btn.onclick = async ()=> {
      const id = btn.dataset.id;
      const item = cache.find(r=>r.id===id);
      if(!item) return;
      const nome = prompt('Nome', item.nome) ?? item.nome;
      const supervisor = prompt('Supervisor', item.supervisor) ?? item.supervisor;
      const coordenador = prompt('Coordenador', item.coordenador) ?? item.coordenador;
      const turno = prompt('Turno', item.turno) ?? item.turno;
      const adm = prompt('Admissão (YYYY-MM-DD)', item.admissao) ?? item.admissao;
      const tempo = prompt('Tempo de empresa (meses)', item.tempo) ?? item.tempo;
      await updateDoc(doc(db,'treinados',id), { nome, supervisor, coordenador, turno, admissao:adm, admissaoOriginal:item.admissao, admissaoTempo:tempo, createdAt: new Date() });
    };
  });
}

document.getElementById('addTreinado')?.addEventListener('click', async ()=>{
  const quantidade = prompt('Quantidade') || '1';
  const nome = prompt('Nome do operador') || '';
  const supervisor = prompt('Supervisor') || '';
  const coordenador = prompt('Coordenador') || '';
  const turno = prompt('Turno') || '';
  const admissao = prompt('Admissão (YYYY-MM-DD)') || '';
  const tempo = prompt('Tempo de empresa (ex: 2 anos / 5 meses)') || '';
  const campanhas = []; // pode adicionar depois
  await addDoc(collection(db, 'treinados'), { quantidade, nome, supervisor, coordenador, turno, admissao, tempo, campanhas, createdAt:new Date() });
});

// filtros e buscas
attachSearch('searchTreinados','#tableTreinados');
attachSelectFilter('filterTurnoTreinados', val => {
  renderTable('#tableTreinados', val ? cache.filter(r => (r.turno||'').toLowerCase() === val.toLowerCase()) : cache, columns);
  attachTableActions();
});

// gráfico 3D simples
function draw3D(rows){
  if(!document.getElementById('plot3dTreinados')) return;
  const groups = {};
  rows.forEach(r=>{
    const k = r.turno || '---';
    groups[k] = (groups[k] || 0) + 1;
  });
  const xs = Object.keys(groups);
  const ys = Object.values(groups);
  const trace = { x: xs, y: ys, z: ys.map(v=>v*0.2), type:'scatter3d', mode:'markers', marker:{size: ys.map(v=>6 + v*3), color: ys, colorscale:'Viridis'} };
  const layout = { margin:{l:0,r:0,b:0,t:10} };
  Plotly.newPlot('plot3dTreinados',[trace],layout,{responsive:true});
}
