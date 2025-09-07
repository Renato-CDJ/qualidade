// js/utils.js
import { getLocalUser, logout, requireAuthRedirect } from './auth.js';

// inicialização UI comum: mostra usuário, logout e tema
export function ensureUI(){
  const user = requireAuthRedirect();
  const displays = document.querySelectorAll('.user-display, #displayUser, #displayUser2, #displayUser3');
  displays.forEach(d => { if(user) d.textContent = user.name; });

  document.getElementById('logout')?.addEventListener('click', ()=>{ logout() });
  document.getElementById('logout2')?.addEventListener('click', ()=>{ logout() });
  document.getElementById('logout3')?.addEventListener('click', ()=>{ logout() });

  // theme
  const current = localStorage.getItem('qc_theme') || 'light';
  document.documentElement.setAttribute('data-theme', current);
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('themeToggle2')?.addEventListener('click', toggleTheme);
  document.getElementById('themeToggle3')?.addEventListener('click', toggleTheme);

  // admin class
  const local = getLocalUser();
  document.body.classList.toggle('admin', !!local?.isAdmin);
}

export function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('qc_theme', next);
}

// render uma tabela a partir de dados (array of objects) e colunas [{key,label}]
export function renderTable(tableSelector, data, columns){
  const tbody = document.querySelector(tableSelector + ' tbody');
  if(!tbody) return;
  tbody.innerHTML = '';
  data.forEach((row)=>{
    const tr = document.createElement('tr');
    columns.forEach(col=>{
      const td = document.createElement('td');
      td.textContent = row[col.key] ?? '';
      tr.appendChild(td);
    });
    if(document.body.classList.contains('admin')){
      const td = document.createElement('td');
      td.classList.add('admin-only');
      td.innerHTML = `
        <button data-id="${row.id || ''}" class="btn-edit">Editar</button>
        <button data-id="${row.id || ''}" class="btn-delete">Excluir</button>
      `;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
}

// search input autocomplete (filtro simples)
export function attachSearch(inputId, tableSelector){
  const input = document.getElementById(inputId);
  if(!input) return;
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll(tableSelector + ' tbody tr').forEach(tr=>{
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// helper to attach select filter with a callback
export function attachSelectFilter(selectId, callback){
  const select = document.getElementById(selectId);
  if(!select) return;
  select.addEventListener('change', ()=> { callback(select.value) });
}
