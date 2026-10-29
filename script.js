
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #101827;
  color: #f4f7fb;
  font-family: Arial, "Noto Sans Khmer", sans-serif;
  line-height: 1.6;
}

header {
  padding: 24px 16px;
  text-align: center;
  background: #07111f;
  border-bottom: 3px solid #e6b84b;
}

header h1 {
  margin: 0;
  color: #f7cb57;
  font-size: clamp(24px, 6vw, 36px);
}

header p {
  margin-bottom: 0;
  color: #cbd5e1;
}

main {
  width: min(100% - 24px, 650px);
  margin: 24px auto;
}

section {
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #344256;
  border-radius: 16px;
  background: #1b2738;
}

h2 {
  color: #f7cb57;
  font-size: 21px;
}

input {
  display: block;
  width: 100%;
  padding: 13px;
  margin: 12px 0;
  color: #111827;
  background: white;
  border: 1px solid #9ca3af;
  border-radius: 9px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 13px;
  margin: 6px 0;
  color: #101827;
  background: #f7cb57;
  border: 0;
  border-radius: 9px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

button:focus-visible,
input:focus-visible {
  outline: 3px solid #60a5fa;
  outline-offset: 2px;
}

button.secondary {
  color: white;
  background: #475569;
}

.user-row {
  padding: 12px 0;
  border-bottom: 1px solid #475569;
}

.user-row button {
  background: #4ade80;
}

.player {
  padding: 12px;
  background: #07111f;
  border-radius: 12px;
}

#videoPlayer iframe {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-top: 12px;
  border: 0;
  border-radius: 10px;
}

#authMessage,
#adminMessage,
#approvalMessage {
  overflow-wrap: anywhere;
  color: #fde68a;
}

footer {
  padding: 20px;
  text-align: center;
  color: #cbd5e1;
}

[hidden] {
  display: none !important;
    }
  111827475569
const $ = id => document.getElementById(id);
const DB_KEY = "cambodiaM3DemoV1";

function readDB() {
  try {
    const data = JSON.parse(localStorage.getItem(DB_KEY));
    return data && Array.isArray(data.users)
      ? data : { admin: null, users: [] };
  } catch {
    return { admin: null, users: [] };
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function show(id, visible) {
  $(id).hidden = !visible;
}

function message(id, text) {
  $(id).textContent = text;
}

function currentUser() {
  try {
    return JSON.parse(sessionStorage.getItem("m3User"));
  } catch {
    return null;
  }
}

function enterUser(user) {
  sessionStorage.setItem("m3User", JSON.stringify({
    email: user.email,
    name: user.name
  }));
  render();
}

function render() {
  const user = currentUser();
  const adminLogged = sessionStorage.getItem("m3Admin") === "yes";
  const db = readDB();

  show("auth", !user && !adminLogged);
  show("adminLogin", !user && !adminLogged);
  show("adminSetup", !db.admin && !user && !adminLogged);
  show("adminPanel", adminLogged);
  show("tvPanel", !!user && user.approved === true);

  if (user && user.approved !== true) {
    show("auth", false);
    show("adminLogin", false);
    show("tvPanel", false);
    message("authMessage", "គណនីរបស់អ្នកកំពុងរង់ចាំ Admin អនុម័ត។");
    show("auth", true);
  }

  if (user && user.approved) {
    $("welcome").textContent = "សូមស្វាគមន៍ " + user.name;
  }

  if (adminLogged) renderPending();
}

function renderPending() {
  const db = readDB();
  const container = $("pendingUsers");
  container.replaceChildren();

  const pending = db.users.filter(u => !u.approved);

  if (!pending.length) {
    container.textContent = "គ្មានគណនីរង់ចាំការអនុម័តទេ។";
    return;
  }

  pending.forEach(user => {
    const row = document.createElement("div");
    row.className = "user-row";

    const info = document.createElement("p");
    info.textContent = `${user.name} (${user.email})`;

    const approve = document.createElement("button");
    approve.textContent = "អនុម័ត";
    approve.onclick = () => {
      const latest = readDB();
      const found = latest.users.find(u => u.email === user.email);
      if (found) {
        found.approved = true;
        saveDB(latest);
        renderPending();
      }
    };

    row.append(info, approve);
    container.append(row);
  });
}

// Demo only: localStorage is not a secure authentication system.
$("setupForm").addEventListener("submit", event => {
  event.preventDefault();

  const db = readDB();
  if (db.admin) {
    message("adminMessage", "Admin ត្រូវបានបង្កើតរួចហើយ។");
    render();
    return;
  }

  const password = $("adminPassword").value;
  if (password.length < 8) {
    message("adminMessage", "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួ។");
    return;
  }

  db.admin = {
    username: "phengchen888",
    password
  };
  saveDB(db);
  $("adminPassword").value = "";
  message("adminMessage", "បង្កើត Admin ក្នុង Browser នេះរួចហើយ។");
  render();
});

$("adminLoginForm").addEventListener("submit", event => {
  event.preventDefault();
  const db = readDB();

  if (!db.admin) {
    message("adminMessage", "សូមបង្កើត Admin ដំបូងជាមុន។");
    show("adminSetup", true);
    return;
  }

  if (
    $("adminLoginName").value.trim() === db.admin.username &&
    $("adminLoginPassword").value === db.admin.password
  ) {
    sessionStorage.setItem("m3Admin", "yes");
    $("adminLoginPassword").value = "";
    message("adminMessage", "");
    render();
  } else {
    message("adminMessage", "ឈ្មោះ Admin ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។");
  }
});

$("registerForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("regName").value.trim();
  const email = $("regEmail").value.trim().toLowerCase();
  const password = $("regPassword").value;

  if (!email.endsWith("@gmail.com")) {
    message("authMessage", "សូមប្រើអាសយដ្ឋាន Gmail ដែលបញ្ចប់ដោយ @gmail.com។");
    return;
  }

  const db = readDB();
  if (db.users.some(u => u.email === email)) {
    message("authMessage", "Gmail នេះបានចុះឈ្មោះរួចហើយ។");
    return;
  }

  db.users.push({ name, email, password, approved: false });
  saveDB(db);
  $("registerForm").reset();
  message("authMessage", "ចុះឈ្មោះរួចហើយ។ សូមរង់ចាំ Admin អនុម័ត។");
});

$("loginForm").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;
  const user = readDB().users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    message("authMessage", "Gmail ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។");
    return;
  }

  if (!user.approved) {
    message("authMessage", "គណនីអ្នកកំពុងរង់ចាំ Admin អនុម័ត។");
    return;
  }

  $("loginForm").reset();
  enterUser(user);
  message("authMessage", "");
});

$("videoForm").addEventListener("submit", event => {
  event.preventDefault();

  const url = $("videoUrl").value.trim();
  let videoId = "";

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1);
    } else if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "m.youtube.com"
    ) {
      videoId = parsed.searchParams.get("v") || "";
      if (!videoId && parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/")[2] || "";
      }
    }
  } catch {}

  if (!/^[\w-]{11}$/.test(videoId)) {
    message("approvalMessage", "សូមបញ្ចូលតំណភ្ជាប់ YouTube ដែលត្រឹមត្រូវ។");
    return;
  }

  const frame = document.createElement("iframe");
  frame.src = "https://www.youtube-nocookie.com/embed/" +
    encodeURIComponent(videoId) + "?autoplay=1";
  frame.title = "Cambodia M3 TV video";
  frame.allow = "autoplay; encrypted-media; picture-in-picture";
  frame.allowFullscreen = true;

  $("videoPlayer").replaceChildren(frame);
  message("approvalMessage", "");
});

$("logout").addEventListener("click", () => {
  sessionStorage.removeItem("m3User");
  $("videoPlayer").replaceChildren();
  render();
});

$("adminLogout").addEventListener("click", () => {
  sessionStorage.removeItem("m3Admin");
  render();
});

render();
  user.approvedrow.classNameapprove.textContentu.email៨db.admin.usernamedb.admin.usernameu.passwordparsed.hostnameyoutube.comframe.srcframe.titleframe.allow
