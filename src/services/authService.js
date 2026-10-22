const USERS_KEY = "demo_registered_users";
const SESSION_KEY = "demo_active_session";
const OTP_KEY = "demo_active_otp_request";

async function hashSecret(secret) {
  const msgUint8 = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const authService = {
  getUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  async login(emailOrUsername, password) {
    await new Promise((r) => setTimeout(r, 400));
    const users = this.getUsers();
    const id = emailOrUsername.trim().toLowerCase();
    const hashed = await hashSecret(password);

    const match = users.find(
      (u) =>
        (u.email.toLowerCase() === id || (u.username && u.username.toLowerCase() === id)) &&
        u.passwordHash === hashed
    );

    if (!match) {
      throw new Error("Invalid username/email or password.");
    }

    const session = {
      id: match.id,
      name: match.name,
      email: match.email,
      username: match.username || match.email.split("@")[0],
      loggedInAt: new Date().toISOString(),
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async requestSignupOtp(email) {
    await new Promise((r) => setTimeout(r, 400));
    const cleanEmail = email.trim().toLowerCase();

    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error("An account with this email address already exists.");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = {
      email: cleanEmail,
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
      verified: false,
    };

    sessionStorage.setItem(OTP_KEY, JSON.stringify(otpData));

    return {
      success: true,
      previewOtp: code,
    };
  },

  async verifySignupOtp(email, inputOtp) {
    await new Promise((r) => setTimeout(r, 350));
    const cleanEmail = email.trim().toLowerCase();
    const raw = sessionStorage.getItem(OTP_KEY);

    if (!raw) {
      throw new Error("No active OTP found. Please click 'Send OTP' first.");
    }

    const record = JSON.parse(raw);
    if (record.email !== cleanEmail) {
      throw new Error("Email does not match OTP request.");
    }

    if (Date.now() > record.expiresAt) {
      sessionStorage.removeItem(OTP_KEY);
      throw new Error("OTP has expired. Please request a new one.");
    }

    if (record.code !== inputOtp.trim()) {
      throw new Error("Incorrect 6-digit verification code.");
    }

    record.verified = true;
    sessionStorage.setItem(OTP_KEY, JSON.stringify(record));
    return { verified: true };
  },

  async completeSignup({ name, email, password }) {
    await new Promise((r) => setTimeout(r, 450));
    const cleanEmail = email.trim().toLowerCase();
    const raw = sessionStorage.getItem(OTP_KEY);

    if (!raw) {
      throw new Error("Email verification is required before signing up.");
    }

    const record = JSON.parse(raw);
    if (!record.verified || record.email !== cleanEmail) {
      throw new Error("Please complete OTP verification for this email address first.");
    }

    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error("Email has already been registered.");
    }

    const passwordHash = await hashSecret(password);
    const newUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: cleanEmail,
      username: cleanEmail.split("@")[0],
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    sessionStorage.removeItem(OTP_KEY);

    return newUser;
  },

  getActiveSession() {
    try {
      const s = sessionStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },
};