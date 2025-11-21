/* Front-end auth + demo games using localStorage */
/* Admins and users stored separately (admins in 'site_admins', users as 'user_<email>') */

const DEMO_ADMIN = { email: "sameershingan999@gmail.com", password: "rudra7479" };

// Initialize admins list
(function initAdmins(){
  const cur = localStorage.getItem('site_admins');
  if(!cur){ localStorage.setItem('site_admins', JSON.stringify([DEMO_ADMIN])); }
})();

// Demo games seed
(function initGames(){
  if(!localStorage.getItem('games')){
    const demo = [
      {id:1,title:"Super Mario Bros",category:"NES",year:1985,cover:"https://via.placeholder.com/400x240?text=Super+Mario",downloads:120},
      {id:2,title:"Sonic the Hedgehog",category:"SEGA",year:1991,cover:"https://via.placeholder.com/400x240?text=Sonic",downloads:98},
      {id:3,title:"Pac-Man",category:"Arcade",year:1980,cover:"https://via.placeholder.com/400x240?text=Pac-Man",downloads:150},
      {id:4,title:"Tekken 3",category:"PS1",year:1997,cover:"https://via.placeholder.com/400x240?text=Tekken+3",downloads:80}
    ];
    localStorage.setItem('games', JSON.stringify(demo));
  }
})();

function renderIndexGames(){
  const list = JSON.parse(localStorage.getItem('games')||'[]');
  const el = document.getElementById('gameList');
  if(!el) return;
  el.innerHTML = list.map(g=>`<div class="card"><img src="${g.cover}" alt="${g.title}"><h4>${g.title}</h4><small>${g.category} • ${g.year}</small></div>`).join('');
}

// Admin functions
function adminLogin(){
  const email = document.getElementById('adminEmail')?.value?.trim();
  const pass = document.getElementById('adminPass')?.value?.trim();
  const admins = JSON.parse(localStorage.getItem('site_admins')||'[]');
  const ok = admins.find(a=>a.email===email && a.password===pass);
  const msg = document.getElementById('formMsg');
  if(ok){ localStorage.setItem('logged_admin', email); if(msg) msg.innerText=''; window.location='admins.html'; }
  else { if(msg) msg.innerText='Invalid admin email or password'; }
}

function registerAdmin(){
  const email = document.getElementById('regAdminEmail')?.value?.trim();
  const pass = document.getElementById('regAdminPass')?.value?.trim();
  const msg = document.getElementById('formMsg');
  if(!email||!pass){ if(msg) msg.innerText='Fill both fields'; return; }
  let admins = JSON.parse(localStorage.getItem('site_admins')||'[]');
  if(admins.find(a=>a.email===email)){ if(msg) msg.innerText='Admin already exists'; return; }
  admins.push({email, password: pass});
  localStorage.setItem('site_admins', JSON.stringify(admins));
  if(msg) msg.innerText='Admin created. Redirecting...';
  setTimeout(()=> window.location='admins.html',800);
}

// User functions
function registerUser(){
  const email = document.getElementById('regEmail')?.value?.trim();
  const pass = document.getElementById('regPass')?.value?.trim();
  const msg = document.getElementById('formMsg');
  if(!email||!pass){ if(msg) msg.innerText='Fill both fields'; return; }
  if(localStorage.getItem('user_'+email)){ if(msg) msg.innerText='User exists'; return; }
  localStorage.setItem('user_'+email, pass);
  if(msg) msg.innerText='Registered. Redirecting...';
  setTimeout(()=> window.location='login.html',800);
}

function userLogin(){
  const email = document.getElementById('userEmail')?.value?.trim();
  const pass = document.getElementById('userPass')?.value?.trim();
  const msg = document.getElementById('formMsg');
  if(localStorage.getItem('user_'+email) === pass){ if(msg) msg.innerText=''; window.location='index.html'; }
  else { if(msg) msg.innerText='Invalid credentials'; }
}

// Admins page render
function renderAdminsList(){
  const box = document.getElementById('adminsList');
  if(!box) return;
  const admins = JSON.parse(localStorage.getItem('site_admins')||'[]');
  box.innerHTML = admins.map(a=>`<div style="padding:10px;border-bottom:1px solid #eee;"><strong>${a.email}</strong> <button onclick="deleteAdmin('${a.email}')" style="float:right">Delete</button></div>`).join('');
}

function deleteAdmin(email){
  if(!confirm('Delete admin '+email+' ?')) return;
  let admins = JSON.parse(localStorage.getItem('site_admins')||'[]');
  admins = admins.filter(a=>a.email!==email);
  localStorage.setItem('site_admins', JSON.stringify(admins));
  renderAdminsList();
}

// Initialize UI on DOM load
document.addEventListener('DOMContentLoaded', function(){
  renderIndexGames();
  if(document.getElementById('adminsList')) renderAdminsList();
});
