document.addEventListener("DOMContentLoaded", () => {
  const user = UserManager.getCurrentUser();

  if (user) {
    document.getElementById("nameInput").value = user.name;
    document.getElementById("emailInput").value = user.email;
  }
});

function changeName() {
  const nameInput = document.getElementById("nameInput");
  const status = document.getElementById("nameStatus");
  const newName = nameInput.value.trim();

  status.classList.remove("text-teal-500", "text-red-500");

  if (!newName) {
    status.textContent = "Please enter a name";
    status.classList.add("text-red-500");
    return;
  }

  const result = UserManager.updateName(newName);

  if (result.success) {
    status.textContent = "Name updated successfully";
    status.classList.add("text-teal-500");
  } else {
    status.textContent = result.error;
    status.classList.add("text-red-500");
  }
}

function changePassword() {
  const current = document.getElementById("currentPassword").value;
  const newPass = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  const status = document.getElementById("passwordStatus");

  status.classList.remove("text-teal-500", "text-red-500");

  if (!current || !newPass || !confirm) {
    status.textContent = "Please fill all fields";
    status.classList.add("text-red-500");
    return;
  }

  if (newPass !== confirm) {
    status.textContent = "Passwords do not match";
    status.classList.add("text-red-500");
    return;
  }

  if (newPass.length < 6) {
    status.textContent = "Password must be at least 6 characters";
    status.classList.add("text-red-500");
    return;
  }

  const result = UserManager.updatePassword(current, newPass);

  if (result.success) {
    status.textContent = "Password updated successfully";
    status.classList.add("text-teal-500");
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";
  } else {
    status.textContent = result.error;
    status.classList.add("text-red-500");
  }
}

function changeEmail() {
  const emailInput = document.getElementById("emailInput");
  const status = document.getElementById("emailStatus");
  const newEmail = emailInput.value.trim();

  status.classList.remove("text-teal-500", "text-red-500");

  if (!newEmail || !newEmail.includes("@")) {
    status.textContent = "Please enter a valid email";
    status.classList.add("text-red-500");
    return;
  }

  const result = UserManager.updateEmail(newEmail);

  if (result.success) {
    status.textContent = "Email updated successfully";
    status.classList.add("text-teal-500");
  } else {
    status.textContent = result.error;
    status.classList.add("text-red-500");
  }
}

function deleteAccount() {
  UserManager.deleteAccount();
  window.location.href = "/";
}