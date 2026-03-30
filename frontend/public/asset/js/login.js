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
  const password = document.getElementById("password").value;

  if (!email || !password) {
    return showError("Please fill all fields");
  }

  // rudimentary validation — keep lightweight for UX
  if (!email.includes("@")) {
    return showError("Please enter a valid email");
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return showError(result.message || "Invalid email or password");
    }

    // Store auth data
    localStorage.setItem("token", result.token);
    localStorage.setItem("currentUserId", result.user.id);
    localStorage.setItem("currentUser", JSON.stringify(result.user));
    window.location.href = "/account";
  } catch (err) {
    console.error("Login error:", err);
    showError("Unable to connect to server");
  }
});
