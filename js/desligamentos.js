// js/desligamentos.js
import { db } from './auth.js';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ensureUI, renderTable, attachSearch, attachSelectFilter } from './utils.js';

ensureUI();

const colRef = collection(db, 'desligamentos');

const columns = [
  { key:'quantidade' }, { key:'operador' }, { key:'carteira' }, { key:'admissao' }, { key:'dias' }, { key:'motivo' }, { key:'status' }, { key:'agencia' }
];

let cache = [];

function load(){
  const q = query(colRef, orderBy('createdAt','desc'));
  onSnapshot(q, snap=>{
    const arr = [];
    snap.forEach(d => arr.push({ id:d.id, ...d.data() }));
    cache = arr;
    renderTable('#tableDesligamentos', arr, columns);
    attachTableActions();
    draw3D(arr);
  });
}

load();

function attachTableActions(){
  document.querySelectorAll('#tableDesligamentos .btn-delete').forEach(btn=>{
    btn.onclick = async ()=> {
      const id = btn.dataset.id;
      if(!confirm('Excluir desligamento?')) return;
      await deleteDoc(doc(db, 'desligamentos', id));
    };
  });
  document.querySelectorAll('#tableDesligamentos .btn-edit').forEach(btn=>{
    btn.onclick = async ()=>{
      const id = btn.dataset.id;
      const item = cache.find(r=>r.id===id);
      if(!item) return;
      const operador = prompt('Operador', item.operador) ?? item.operador;
      const carteira = prompt('Carteira', item.carteira) ?? item.carteira;
      const admissao = prompt('Data de Admissão (YYYY-MM-DD)', item.admissao) ?? item.admissao;
      const dias = prompt('Quantidade de dias', item.dias) ?? item.dias;
      const motivo = prompt('Motivo', item.motivo) ?? item.motivo;
      const status = prompt('Status (Aviso Prévio / Sem Aviso Prévio)', item.status) ?? item.status;
      const agencia = prompt('Agência (Sim / Não)', item.agencia) ?? item.agencia;
      await updateDoc(doc(db,'desligamentos',id), { operador, carteira, admissao, dias, motivo, status, agencia, createdAt:new Date() });
    };
  });
}

document.getElementById('addDesligamento')?.addEventListener('click', async ()=>{
  const quantidade = prompt('Quantidade') || '1';
  const operador = prompt('Operador (nome)') || '';
  const carteira = prompt('Carteira (Caixa/Carrefour)') || '';
  const admissao = prompt('Data de Admissão (YYYY-MM-DD)') || '';
  const dias = prompt('Quantidade de dias') || '';
  const motivo = prompt('Motivo') || '';
  const status = prompt('Status (Aviso Prévio / Sem Aviso Prévio)') || '';
  const agencia = prompt('Agência (Sim/Não)') || '';
  await addDoc(collection(db, 'desligamentos'), { quantidade, operador, carteira, admissao, dias, motivo, status, agencia, createdAt:new Date() });
});

// filtros e busca
attachSearch('searchDesligamentos','#tableDesligamentos');
attachSelectFilter('filterStatusDesl', val => {
  renderTable('#tableDesligamentos', val ? cache.filter(r => (r.status||'').toLowerCase() === val.toLowerCase()) : cache, columns);
  attachTableActions();
});

// gráfico 3D simples por mês (motivos)
function draw3D(rows){
  if(!document.getElementById('plot3dDesl')) return;
  const months = {};
  rows.forEach(r=>{
    const d = r.admissao ? new Date(r.admissao) : null;
    const m = d ? d.toLocaleString('pt-BR', { month:'short', year:'numeric' }) : 'sem-data';
    months[m] = (months[m]||0) + 1;
  });
  const xs = Object.keys(months);
  const ys = Object.values(months);
  const trace = { x: xs, y: ys, z: ys.map(v=>v*0.5), type:'scatter3d', mode:'markers', marker:{size:ys.map(v=>6+v*2), color:ys, colorscale:'Reds'} };
  const layout = { margin:{l:0,r:0,b:0,t:10} };
  Plotly.newPlot('plot3dDesl',[trace],layout,{responsive:true});
}
