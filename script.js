// INSERT YOUR SUPABASE KEYS HERE
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_KEY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

const app = document.getElementById("app");
const noteField = document.getElementById("noteField");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");
const logoutBtn = document.getElementById("logoutBtn");

let user = null;

// AUTH
loginBtn.addEventListener("click", async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  if (error) {
    await supabase.auth.signUp({
      email: email.value,
      password: password.value
    });
  }

  checkUser();
});

async function checkUser() {
  const { data } = await supabase.auth.getUser();
  user = data.user;

  if (user) {
    document.querySelector(".auth").classList.add("hidden");
    app.classList.remove("hidden");
    loadNotes();
  }
}

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

// CRUD
async function loadNotes() {
  const { data } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  notesList.innerHTML = "";
  data.forEach(note => renderNote(note));
}

function renderNote(note) {
  const div = document.createElement("div");
  div.className = "note";

  div.innerHTML = `
    <span>${note.text}</span>
    <button onclick="deleteNote(${note.id})">Delete</button>
  `;

  notesList.appendChild(div);
}

addNoteBtn.addEventListener("click", async () => {
  const text = noteField.value.trim();
  if (!text) return;

  await supabase.from("notes").insert({
    text,
    user_id: user.id
  });

  noteField.value = "";
  loadNotes();
});

async function deleteNote(id) {
  await supabase.from("notes").delete().eq("id", id);
  loadNotes();
}

checkUser();
