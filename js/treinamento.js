// js/treinamento.js
import { db } from './auth.js';
import { collection, addDoc, getDocs, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ensureUI, renderTable, attachSearch, attachSelectFilter } from './utils.js';

ensureUI();

const colRef = collection(db, 'treinamentos');

const columns = [
  { key:'quantidade', label:'Quantidade' },
  { key:'colaborador', label:'Colaborador' },
  { key:'cpf', label:'CPF' },
  { key:'turno', label:'Turno' },
  { key:'carteira', label:'Carteira' },
  { key:'dia1', label:'1º Dia' },
  { key:'dia2', label:'2º Dia' },
  { key:'status', label:'Status' }
];

let dataCache = [];

async function loadAll(){
  // realtime listener
  const q = query(colRef, orderBy('createdAt','desc'));
  onSnapshot(q, snap => {
    const arr = [];
    snap.forEach(docu => arr.push({ id: docu.id, ...docu.data() }));
    dataCache = arr;
    renderTable('#tableTreinamento', arr, columns);
    attachTableActions();
    draw3D(arr);
  }, err => {
    // fallback to getDocs if realtime fails
    getDocs(colRef).then(snap=>{
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      dataCache = arr;
      renderTable('#tableTreinamento', arr, columns);
      attachTableActions();
      draw3D(arr);
    });
  });
}

loadAll();

function attachTableActions(){
  document.querySelectorAll('#tableTreinamento .btn-delete').forEach(btn=>{
    btn.onclick = async (e)=>{
      const id = btn.dataset.id;
      if(!confirm('Excluir registro?')) return;
      await deleteDoc(doc(db, 'treinamentos', id));
    };
  });
  document.querySelectorAll('#tableTreinamento .btn-edit').forEach(btn=>{
    btn.onclick = async ()=>{
      const id = btn.dataset.id;
      const item = dataCache.find(r => r.id === id);
      if(!item) return alert('Registro não encontrado');
      // edição via prompts simples (pode trocar por modal)
      const quantidade = prompt('Quantidade', item.quantidade) ?? item.quantidade;
      const colaborador = prompt('Colaborador', item.colaborador) ?? item.colaborador;
      const cpf = prompt('CPF', item.cpf) ?? item.cpf;
      const turno = prompt('Turno', item.turno) ?? item.turno;
      const carteira = prompt('Carteira', item.carteira) ?? item.carteira;
      const dia1 = prompt('1º Dia', item.dia1) ?? item.dia1;
      const dia2 = prompt('2º Dia', item.dia2) ?? item.dia2;
      const status = prompt('Status', item.status) ?? item.status;
      await updateDoc(doc(db, 'treinamentos', id), { quantidade, colaborador, cpf, turno, carteira, dia1, dia2, status });
    };
  });
}

// adicionar novo (admin)
document.getElementById('btnNewTrain')?.addEventListener('click', async ()=>{
  const quantidade = prompt('Quantidade') || '1';
  const colaborador = prompt('Colaborador (Nome)') || '';
  const cpf = prompt('CPF (opcional)') || '';
  const turno = prompt('Turno (Manhã/Tarde/Integral)') || '';
  const carteira = prompt('Carteira (Caixa/Carrefour)') || '';
  const dia1 = prompt('1º Dia (Presente/Não compareceu/Desistência)') || '';
  const dia2 = prompt('2º Dia (Presente/Não compareceu/Desistência)') || '';
  const status = prompt('Status (Ativo/Desligado/Remanejado)') || 'Ativo';
  await addDoc(collection(db, 'treinamentos'), {
    quantidade, colaborador, cpf, turno, carteira, dia1, dia2, status,
    createdAt: new Date()
  });
});

// acompanhamento adicional (admin) — abre prompt para dados adicionais
document.getElementById('btnNewAcompanh')?.addEventListener('click', async ()=>{
  const quantidade = prompt('Quantidade') || '1';
  const colaborador = prompt('Colaborador (Nome)') || '';
  const cpf = prompt('CPF (opcional)') || '';
  const turno = prompt('Turno (Manhã/Tarde/Integral)') || '';
  const carteira = prompt('Carteira (Caixa/Carrefour)') || '';
  const dia1 = prompt('1º Dia (Presente/Não compareceu/Desistência)') || '';
  const dia2 = prompt('2º Dia (Presente/Não compareceu/Desistência)') || '';
  const status = prompt('Status (Ativo/Desligado/Remanejado)') || 'Ativo';
  await addDoc(collection(db, 'treinamentos'), {
    quantidade, colaborador, cpf, turno, carteira, dia1, dia2, status,
    createdAt: new Date()
  });
});

// busca e filtros
attachSearch('searchTreinamento', '#tableTreinamento');
attachSelectFilter('filterTurno', val => {
  renderTable('#tableTreinamento', val ? dataCache.filter(r => (r.turno||'').toLowerCase() === val.toLowerCase()) : dataCache, columns);
  attachTableActions();
});
attachSelectFilter('filterCarteira', val => {
  renderTable('#tableTreinamento', val ? dataCache.filter(r => (r.carteira||'').toLowerCase() === val.toLowerCase()) : dataCache, columns);
  attachTableActions();
});

// draw 3D with Plotly
function draw3D(rows){
  if(!document.getElementById('plot3d')) return;
  const groups = {};
  rows.forEach(r=>{
    const key = `${r.turno||'--'}|${r.status||'--'}`;
    groups[key] = (groups[key]||0) + 1;
  });
  const xs = [], ys = [], zs = [];
  const uniqueX = [], uniqueY = [];
  Object.keys(groups).forEach(k=>{
    const [turno,status] = k.split('|');
    xs.push(turno);
    ys.push(status);
    zs.push(groups[k]);
    if(!uniqueX.includes(turno)) uniqueX.push(turno);
    if(!uniqueY.includes(status)) uniqueY.push(status);
  });
  const xnum = xs.map(v => uniqueX.indexOf(v));
  const ynum = ys.map(v => uniqueY.indexOf(v));
  const trace = {
    x: xnum,
    y: ynum,
    z: zs,
    mode: 'markers',
    marker: { size: zs.map(z=>6 + z*3), color: zs, colorscale:'YlOrRd', showscale:true },
    type: 'scatter3d'
  };
  const layout = {
    scene: {
      xaxis: { tickvals: uniqueX.map((_,i)=>i), ticktext: uniqueX, title: 'Turno' },
      yaxis: { tickvals: uniqueY.map((_,i)=>i), ticktext: uniqueY, title: 'Status' }
    },
    margin:{l:0,r:0,b:0,t:30}
  };
  Plotly.newPlot('plot3d',[trace],layout,{responsive:true});
}
