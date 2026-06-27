import { getItem, setItem, removeItem } from './storage';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

function hashPassword(password) {
  let hash = 5381;
  for (let i = 0; i < password.length; i += 1) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return `p_${Math.abs(hash).toString(36)}_${password.length}`;
}

export function register({ name, email, password, confirmPassword }) {
  if (!name?.trim()) throw new Error('Le nom est requis.');
  if (!email?.trim()) throw new Error("L'email est requis.");
  if (password.length < 6) throw new Error('Mot de passe minimum 6 caractères.');
  if (password !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas.');

  const users = getItem(USERS_KEY, []);
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalizedEmail)) {
    throw new Error('Cet email est déjà utilisé.');
  }

  const user = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  setItem(USERS_KEY, users);

  const session = { id: user.id, name: user.name, email: user.email };
  setItem(SESSION_KEY, session);
  return session;
}

export function login({ email, password }) {
  const users = getItem(USERS_KEY, []);
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (u) => u.email === normalizedEmail && u.password === hashPassword(password)
  );

  if (!user) throw new Error('Email ou mot de passe incorrect.');

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    loginAt: new Date().toISOString(),
  };
  setItem(SESSION_KEY, session);
  return session;
}

export function logout() {
  removeItem(SESSION_KEY);
}

export function getSession() {
  return getItem(SESSION_KEY, null);
}

export function isAuthenticated() {
  return Boolean(getSession());
}
