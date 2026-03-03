const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

const hideError = () => errorMsg.classList.add("hidden");
const showError = (message) => {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
};

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    return showError("Please fill all fields");
  }

  // rudimentary validation — keep lightweight for UX
  if (!email.includes("@")) {
    return showError("Please enter a valid email");
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const { message } = await response.json().catch(() => ({}));
      return showError(message || "Invalid email or password");
    }

    const { data } = await response.json();
    localStorage.setItem("currentUserId", data.userId);
    window.location.href = "/leaderboard?refresh=true";
  } catch (err) {
    console.error("Login error:", err);
    showError("Error: " + err.message);
  }
});
