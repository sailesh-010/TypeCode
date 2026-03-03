const selectors = {
  form: document.getElementById("signupForm"),
  error: document.getElementById("errorMsg"),
  name: document.getElementById("name"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  confirm: document.getElementById("confirmPassword"),
};

const hideError = () => selectors.error.classList.add("hidden");
const showError = (msg) => {
  selectors.error.textContent = msg;
  selectors.error.classList.remove("hidden");
};

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (pwd) =>
  pwd.length >= 6;

async function apiPost(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Malformed server response");
  }

  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Ensure DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  selectors.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const name = selectors.name.value.trim();
    const email = selectors.email.value.trim();
    const password = selectors.password.value;
    const confirmPassword = selectors.confirm.value;

    if (!name || !email || !password || !confirmPassword) {
      return showError("Please fill all fields");
    }

    if (!validateEmail(email)) {
      return showError("Please enter a valid email");
    }

    if (!validatePassword(password)) {
      return showError("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return showError("Passwords do not match");
    }

    try {
      const response = await apiPost("/api/user", { name, email, password }); 
      // Backend returns: { success: true, data: { user: {...}, score: {...} } }
      const userId = response.data?.user?.userId;
      if (!userId) throw new Error("Invalid server response");

      localStorage.setItem("currentUserId", userId);
      window.location.href = "/leaderboard?refresh=true";
    } catch (err) {
      showError(err.message || "Unable to connect to server");
      console.error("Signup error:", err);
    }
  });
});
