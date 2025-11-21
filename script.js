// Load all admins or create default one
let adminUsers = JSON.parse(localStorage.getItem("adminUsers")) || [
    { email: "admin@mail.com", password: "admin123" }
];

function saveAdmins() {
    localStorage.setItem("adminUsers", JSON.stringify(adminUsers));
}

// Load all admins or create default one
let adminUsers = JSON.parse(localStorage.getItem("adminUsers")) || [
    { email: "admin@mail.com", password: "admin123" }
];

function saveAdmins() {
    localStorage.setItem("adminUsers", JSON.stringify(adminUsers));
}
if (location.pathname.includes("admin.html") || location.pathname.includes("register.html")) {
    if (!localStorage.getItem("loggedIn")) {
        window.location.href = "login.html";
    }
}

/* ==========================================================
   CATEGORY ICONS
========================================================== */
const categoryIcons = {
    "NES": "🎮",
    "SEGA": "🕹️",
    "PS1": "📀",
    "Arcade": "👾",
};

/* ==========================================================
   GLOBAL STORAGE + INITIAL SETUP
========================================================== */

let games = JSON.parse(localStorage.getItem("games")) || [];
let editingGameId = null;

if (!localStorage.getItem("adminUser")) {
    localStorage.setItem("adminUser", JSON.stringify({
        email: "admin@mail.com",
        password: "admin123"
    }));
}

/* LOGIN SYSTEM */
function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const match = adminUsers.find(a => a.email === email && a.password === password);

    if (match) {
        localStorage.setItem("loggedIn", email);
        window.location.href = "admin.html";
    } else {
        document.getElementById("loginMessage").innerText =
            "Invalid email or password!";
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
}

if (location.pathname.includes("admin.html") &&
    localStorage.getItem("loggedIn") !== "yes") {
    window.location.href = "login.html";
}

/* SAVE GAMES */
function saveGames() {
    localStorage.setItem("games", JSON.stringify(games));
}

/* ADD GAME */
function addGame() {
    const title = document.getElementById("gameTitle").value.trim();
    const category = document.getElementById("gameCategory").value.trim();
    const year = Number(document.getElementById("gameYear").value);
    const coverFile = document.getElementById("coverFile").files[0];
    const gameFile = document.getElementById("gameFile").files[0];
    const description = document.getElementById("gameDescription").value.trim();

    if (!title || !category || !year || !coverFile || !gameFile) {
        alert("Please fill all required fields!");
        return;
    }

    const readerCover = new FileReader();
    const readerGame = new FileReader();

    readerCover.onload = e1 => {
        readerGame.onload = e2 => {
            const newGame = {
                id: Date.now(),
                title,
                category,
                year,
                cover: e1.target.result,
                file: e2.target.result,
                description
            };

            games.push(newGame);
            saveGames();
            renderAdminGames();
            renderGames();

            alert("Game uploaded successfully!");
        };

        readerGame.readAsDataURL(gameFile);
    };

    readerCover.readAsDataURL(coverFile);
}

/* DELETE GAME */
function deleteGame(id) {
    if (!confirm("Delete this game?")) return;
    games = games.filter(g => g.id !== id);
    saveGames();
    renderAdminGames();
    renderGames();
}

/* EDIT GAME */
function openEdit(id) {
    editingGameId = id;

    const game = games.find(g => g.id === id);
    document.getElementById("editTitle").value = game.title;
    document.getElementById("editCategory").value = game.category;
    document.getElementById("editYear").value = game.year;
    document.getElementById("editDescription").value = game.description;

    const modal = document.getElementById("editModal");
    modal.style.display = "flex";
    modal.classList.add("show");
}

function closeEdit() {
    const modal = document.getElementById("editModal");
    modal.classList.remove("show");
    setTimeout(() => modal.style.display = "none", 200);
}

function saveEdit() {
    const game = games.find(g => g.id === editingGameId);

    game.title = document.getElementById("editTitle").value;
    game.category = document.getElementById("editCategory").value;
    game.year = Number(document.getElementById("editYear").value);
    game.description = document.getElementById("editDescription").value;

    const newCover = document.getElementById("editCover").files[0];
    const newFile = document.getElementById("editFile").files[0];

    if (newCover) {
        const reader = new FileReader();
        reader.onload = e => {
            game.cover = e.target.result;
            if (newFile) return updateFile(game, newFile);
            finishEdit();
        };
        reader.readAsDataURL(newCover);
        return;
    }

    if (newFile) return updateFile(game, newFile);

    finishEdit();
}

function updateFile(game, file) {
    const reader = new FileReader();
    reader.onload = e => {
        game.file = e.target.result;
        finishEdit();
    };
    reader.readAsDataURL(file);
}

function finishEdit() {
    saveGames();
    renderAdminGames();
    renderGames();
    closeEdit();
    alert("Game updated successfully!");
}

/* ADMIN LIST */
function renderAdminGames() {
    const container = document.getElementById("adminGameList");
    if (!container) return;

    container.innerHTML = games
        .map(
            g => `
        <div class="game-card admin-card">
            <img src="${g.cover}">
            <h4>${g.title}</h4>
            <p>${categoryIcons[g.category] || "🎮"} ${g.category} (${g.year})</p>
            <p class="small-desc">${(g.description || "").slice(0, 80)}</p>
            <button onclick="openEdit(${g.id})">Edit</button>
            <button class="delete-btn" onclick="deleteGame(${g.id})">Delete</button>
        </div>
    `
        )
        .join("");
}

/* PUBLIC GAME LIST */
let letterFilter = "all";

function filterLetter(letter) {
    letterFilter = letter;
    renderGames();
}

function openDetails(id) {
    window.location.href = `game.html?id=${id}`;
}

function renderGames() {
    const container = document.getElementById("gameList");
    if (!container) return;

    let filtered = [...games];

    const search = document.getElementById("search")?.value.toLowerCase() || "";
    filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(search)
    );

    const cat = document.getElementById("categoryFilter")?.value || "all";
    if (cat !== "all") filtered = filtered.filter(g => g.category === cat);

    if (letterFilter !== "all")
        filtered = filtered.filter(g =>
            g.title.toLowerCase().startsWith(letterFilter.toLowerCase())
        );

    const sort = document.getElementById("sortFilter")?.value || "newest";

    if (sort === "newest") filtered.sort((a, b) => b.year - a.year);
    if (sort === "oldest") filtered.sort((a, b) => a.year - b.year);
    if (sort === "az") filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "za") filtered.sort((a, b) => b.title.localeCompare(a.title));

    container.innerHTML = filtered
        .map(
            g => `
        <div class="game-card" onclick="openDetails(${g.id})">
            <img src="${g.cover}">
            <h4>${g.title}</h4>
            <p>${categoryIcons[g.category] || "🎮"} ${g.category} (${g.year})</p>
            <a download="${g.title}.zip" href="${g.file}">
                <button>Download</button>
            </a>
        </div>
    `
        )
        .join("");
}

/* INIT */
renderGames();
renderAdminGames();

function registerAdmin() {
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!email || !password) {
        document.getElementById("registerMessage").innerText =
            "Please fill all fields!";
        return;
    }

    if (adminUsers.find(a => a.email === email)) {
        document.getElementById("registerMessage").innerText =
            "Admin already exists!";
        return;
    }

    adminUsers.push({ email, password });
    saveAdmins();

    document.getElementById("registerMessage").innerText =
        "Admin created successfully!";

    setTimeout(() => {
        window.location.href = "admin.html";
    }, 1000);
}
if (location.pathname.includes("admin.html") || location.pathname.includes("register.html")) {
    if (!localStorage.getItem("loggedIn")) {
        window.location.href = "login.html";
    }
}
function registerAdmin() {
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!email || !password) {
        document.getElementById("registerMessage").innerText =
            "Please fill all fields!";
        return;
    }

    if (adminUsers.find(a => a.email === email)) {
        document.getElementById("registerMessage").innerText =
            "Admin already exists!";
        return;
    }

    adminUsers.push({ email, password });
    saveAdmins();

    document.getElementById("registerMessage").innerText =
        "Admin created successfully!";

    setTimeout(() => {
        window.location.href = "admin.html";
    }, 1000);
}
