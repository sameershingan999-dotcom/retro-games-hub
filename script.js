/* ==========================================================
   FINAL SCRIPT (simple, full)
   - Admin system (localStorage)
   - Games CRUD
   - Search suggestions
   - Trending via downloads
   - Protected admin pages
   Default admin: sameer.shingan999@gmail.com / rudra7479
   ========================================================= */

/* ------ DEFAULT ADMIN ------ */
const DEFAULT_ADMIN = {
  email: "sameer.shingan999@gmail.com",
  password: "rudra7479"
};

/* ------ ADMIN STORAGE ------ */
let adminUsers = JSON.parse(localStorage.getItem("adminUsers")) || null;
if (!adminUsers || !Array.isArray(adminUsers) || adminUsers.length === 0) {
  adminUsers = [DEFAULT_ADMIN];
  localStorage.setItem("adminUsers", JSON.stringify(adminUsers));
}
function saveAdmins(){ localStorage.setItem("adminUsers", JSON.stringify(adminUsers)); }
function currentAdminEmail(){ return localStorage.getItem("loggedIn") || null; }

/* ------ CATEGORY ICONS ------ */
const categoryIcons = {
  NES: "🎮",
  SEGA: "🕹️",
  PS1: "📀",
  Arcade: "👾"
};

/* ------ GAMES STORAGE ------ */
let games = JSON.parse(localStorage.getItem("games")) || [];
let editingGameId = null;
function saveGames(){ localStorage.setItem("games", JSON.stringify(games)); }

/* ------ PASSWORD VALIDATION ------ */
function validatePassword(pw){
  if(!pw || pw.length < 8) return { ok:false, msg:"Minimum 8 characters." };
  if(!/[a-z]/.test(pw)) return { ok:false, msg:"Needs lowercase letter." };
  if(!/[A-Z]/.test(pw)) return { ok:false, msg:"Needs uppercase letter." };
  if(!/[0-9]/.test(pw)) return { ok:false, msg:"Needs a number." };
  return { ok:true };
}

/* ------ PROTECT ADMIN PAGES ------ */
(function(){
  const path = location.pathname.toLowerCase();
  const adminPages = ["admin.html","admins.html","register.html"];
  if(adminPages.some(p=> path.endsWith(p))){
    if(!currentAdminEmail()){
      window.location.href = "login.html";
    } else {
      // display current admin info if element present
      const current = document.getElementById("currentAdminInfo");
      if(current) current.innerText = `Signed in as: ${currentAdminEmail()}`;
    }
  }
})();

/* ------ AUTH: login/logout/register ------ */
function login(){
  const email = document.getElementById("loginEmail")?.value?.trim()||"";
  const password = document.getElementById("loginPassword")?.value?.trim()||"";
  const msg = document.getElementById("loginMessage");
  const match = adminUsers.find(a=> a.email === email && a.password === password);
  if(match){ localStorage.setItem("loggedIn", email); window.location.href = "admin.html"; }
  else { if(msg) { msg.innerText = "Invalid email or password!"; setTimeout(()=>msg.innerText="",3000); } else alert("Invalid credentials"); }
}

function logout(){ localStorage.removeItem("loggedIn"); window.location.href = "login.html"; }

function registerAdmin(){
  const email = document.getElementById("regEmail")?.value?.trim()||"";
  const password = document.getElementById("regPassword")?.value?.trim()||"";
  const confirm = document.getElementById("regPasswordConfirm")?.value?.trim()||"";
  const msg = document.getElementById("registerMessage");
  if(!email || !password || !confirm){ if(msg) msg.innerText="Please fill all fields!"; return; }
  if(password !== confirm){ if(msg) msg.innerText="Passwords do not match!"; return; }
  const v = validatePassword(password); if(!v.ok){ if(msg) msg.innerText=v.msg; return; }
  if(adminUsers.find(a=> a.email === email)){ if(msg) msg.innerText="Admin exists!"; return; }
  adminUsers.push({ email, password }); saveAdmins(); if(msg) msg.innerText="Admin created!"; setTimeout(()=> window.location.href="admins.html",800);
}

/* ------ ADMINS PAGE ------ */
function renderAdmins(){
  const box = document.getElementById("adminsList"); if(!box) return;
  const current = currentAdminEmail();
  box.innerHTML = adminUsers.map((a,i)=>`
    <div class="admin-row">
      <div class="admin-meta">
        <strong>${a.email}</strong>
        <div class="muted">#${i+1} ${a.email===current? "• (you)": ""}</div>
      </div>
      <div class="admin-actions">
        <button onclick="promptResetAdmin('${a.email}')">Reset</button>
        <button class="delete-btn" ${a.email===DEFAULT_ADMIN.email? "disabled": ""} onclick="deleteAdmin('${a.email}')">Delete</button>
      </div>
    </div>
  `).join("");
}
function quickCreateAdmin(){
  const email = document.getElementById("quickEmail")?.value?.trim()||"";
  const password = document.getElementById("quickPassword")?.value?.trim()||"";
  const msg = document.getElementById("quickMsg");
  if(!email || !password){ if(msg) msg.innerText="Fill both fields."; return; }
  const v = validatePassword(password); if(!v.ok){ if(msg) msg.innerText=v.msg; return; }
  if(adminUsers.find(a=> a.email===email)){ if(msg) msg.innerText="Admin exists."; return; }
  adminUsers.push({ email, password}); saveAdmins(); if(msg) msg.innerText="Admin created."; setTimeout(()=>{ if(msg) msg.innerText=""; renderAdmins(); },700);
}
function deleteAdmin(email){
  if(email === DEFAULT_ADMIN.email){ alert("Cannot delete default admin."); return; }
  if(!confirm(`Delete admin '${email}'?`)) return;
  adminUsers = adminUsers.filter(a=> a.email !== email); saveAdmins(); if(currentAdminEmail() === email) logout(); renderAdmins();
}
function promptResetAdmin(email){
  const newPwd = prompt(`Enter new password for ${email}:`); if(newPwd === null) return;
  const v = validatePassword(newPwd); if(!v.ok) return alert(v.msg);
  const a = adminUsers.find(x=> x.email === email); if(!a) return alert("Admin not found.");
  a.password = newPwd; saveAdmins(); alert("Password updated.");
}

/* ------ GAMES: add/edit/delete/upload/download counter ------ */
function addGame(){
  const title = document.getElementById("gameTitle")?.value?.trim()||"";
  const category = document.getElementById("gameCategory")?.value?.trim()||"";
  const year = Number(document.getElementById("gameYear")?.value) || 0;
  const coverFile = document.getElementById("coverFile")?.files?.[0];
  const gameFile = document.getElementById("gameFile")?.files?.[0];
  const description = document.getElementById("gameDescription")?.value?.trim()||"";
  if(!title || !category || !year || !coverFile || !gameFile){ alert("Please fill all required fields!"); return; }
  const rc = new FileReader(); const rf = new FileReader();
  rc.onload = e1 => {
    rf.onload = e2 => {
      games.push({ id: Date.now(), title, category, year, cover: e1.target.result, file: e2.target.result, description, downloads: 0 });
      saveGames(); renderAdminGames(); renderGames(); alert("Game uploaded!");
      // clear inputs
      if(document.getElementById("gameTitle")) document.getElementById("gameTitle").value = "";
      if(document.getElementById("gameCategory")) document.getElementById("gameCategory").value = "";
      if(document.getElementById("gameYear")) document.getElementById("gameYear").value = "";
      if(document.getElementById("coverFile")) document.getElementById("coverFile").value = "";
      if(document.getElementById("gameFile")) document.getElementById("gameFile").value = "";
      if(document.getElementById("gameDescription")) document.getElementById("gameDescription").value = "";
    };
    rf.readAsDataURL(gameFile);
  };
  rc.readAsDataURL(coverFile);
}

function deleteGame(id){ if(!confirm("Delete this game?")) return; games = games.filter(g=> g.id !== id); saveGames(); renderAdminGames(); renderGames(); }
function openEdit(id){
  editingGameId = id; const g = games.find(x=> x.id === id); if(!g) return alert("Game not found.");
  document.getElementById("editTitle").value = g.title; document.getElementById("editCategory").value = g.category; document.getElementById("editYear").value = g.year; document.getElementById("editDescription").value = g.description;
  document.getElementById("editModal").style.display = "flex";
}
function closeEdit(){ document.getElementById("editModal").style.display = "none"; }
function saveEdit(){
  const g = games.find(x=> x.id === editingGameId); if(!g) return alert("No game selected.");
  g.title = document.getElementById("editTitle").value.trim(); g.category = document.getElementById("editCategory").value.trim(); g.year = Number(document.getElementById("editYear").value) || 0; g.description = document.getElementById("editDescription").value.trim();
  const newCover = document.getElementById("editCover")?.files?.[0]; const newFile = document.getElementById("editFile")?.files?.[0];
  if(newCover){
    const r = new FileReader(); r.onload = e=>{ g.cover = e.target.result; if(newFile) return updateGameFile(g,newFile); finishEdit(); }; r.readAsDataURL(newCover); return;
  }
  if(newFile) return updateGameFile(g,newFile);
  finishEdit();
}
function updateGameFile(game,file){ const r=new FileReader(); r.onload=e=>{ game.file = e.target.result; finishEdit(); }; r.readAsDataURL(file); }
function finishEdit(){ saveGames(); renderAdminGames(); renderGames(); closeEdit(); alert("Game updated!"); }
function incrementDownload(id){ const g = games.find(x=> x.id === id); if(g){ g.downloads = (g.downloads||0)+1; saveGames(); } }

/* ------ SEARCH SUGGESTIONS ------ */
function handleSearchInput(){
  const box = document.getElementById("searchSuggestions");
  const value = (document.getElementById("search")?.value || "").toLowerCase();
  if(!value){ if(box) box.style.display="none"; renderGames(); return; }
  const results = games.filter(g => g.title.toLowerCase().includes(value)).slice(0,5);
  if(!results.length){ if(box) box.style.display="none"; return; }
  if(box) {
    box.innerHTML = results.map(g=>`<div class="suggestion-item" onclick="selectSuggestion(${g.id}, '${g.title.replace(/'/g,"\\'")}')"><div class="suggestion-text">${g.title}</div></div>`).join('');
    box.style.display = "block";
  }
}
function selectSuggestion(id,title){ document.getElementById("search").value = title; document.getElementById("searchSuggestions").style.display = "none"; openDetails(id); }
document.addEventListener("click", function(e){ if(!e.target.closest(".search-container")){ const b=document.getElementById("searchSuggestions"); if(b) b.style.display="none"; } });

/* ------ RENDER GAMES / HOME ------ */
let letterFilter = "all";
function filterLetter(letter){ letterFilter = letter; renderGames(); }
function renderGames(){
  const box = document.getElementById("gameList"); if(!box) return;
  let filtered = [...games];
  const searchVal = (document.getElementById("search")?.value || "").toLowerCase();
  if(searchVal) filtered = filtered.filter(g=> g.title.toLowerCase().includes(searchVal));
  const cat = document.getElementById("categoryFilter")?.value || "all";
  if(cat !== "all") filtered = filtered.filter(g => g.category === cat);
  if(letterFilter !== "all") filtered = filtered.filter(g => g.title.startsWith(letterFilter));
  const sort = document.getElementById("sortFilter")?.value || "newest";
  if(sort === "newest") filtered.sort((a,b)=> b.year - a.year);
  if(sort === "oldest") filtered.sort((a,b)=> a.year - b.year);
  if(sort === "az") filtered.sort((a,b)=> a.title.localeCompare(b.title));
  if(sort === "za") filtered.sort((a,b)=> b.title.localeCompare(a.title));
  box.innerHTML = filtered.map(g => `
    <div class="game-card" onclick="openDetails(${g.id})">
      <img src="${g.cover}" alt="${g.title}">
      <h4>${g.title}</h4>
      <p>${categoryIcons[g.category] || '🎮'} ${g.category} (${g.year})</p>
      <p style="color:#aaa">🔥 ${g.downloads || 0} downloads</p>
    </div>
  `).join('');
}

/* ------ ADMIN GAME LIST ------ */
function renderAdminGames(){
  const box = document.getElementById("adminGameList"); if(!box) return;
  box.innerHTML = games.map(g => `
    <div class="game-card admin-card">
      <img src="${g.cover}" alt="${g.title}">
      <h4>${g.title}</h4>
      <p>${categoryIcons[g.category] || '🎮'} ${g.category} (${g.year})</p>
      <div class="admin-actions">
        <button onclick="openEdit(${g.id})">Edit</button>
        <button class="delete-btn" onclick="deleteGame(${g.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

/* ------ DETAILS / NAV helpers ------ */
function openDetails(id){ window.location.href = `game.html?id=${id}`; }

/* ------ INIT ON LOAD ------ */
document.addEventListener("DOMContentLoaded", ()=>{
  renderGames();
  renderAdminGames();
  if(document.getElementById("adminsList")) renderAdmins();
});
