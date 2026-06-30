import { getItem, setItem, removeItem } from './storage';
import { apiRequest } from './apiClient';

const SESSION_KEY = 'session';

function buildSession(user, tokens) {
  return {
    id: user.id?.toString?.() || user.id,
    name: user.name || user.email?.split('@')[0] || 'Utilisateur',
    email: user.email,
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    loginAt: new Date().toISOString(),
  };
}

export async function register({ name, email, password, confirmPassword }) {
  if (!name?.trim()) throw new Error('Le nom est requis.');
  if (!email?.trim()) throw new Error("L'email est requis.");
  if (password.length < 8) throw new Error('Mot de passe minimum 8 caractères.');
  if (password !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas.');

  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim(),
      password,
      passwordConfirm: confirmPassword,
    }),
  });

  const session = buildSession(response.data.user, response.data.tokens);
  setItem(SESSION_KEY, session);
  return session;
}

export async function login({ email, password }) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const session = buildSession(response.data.user, response.data.tokens);
  setItem(SESSION_KEY, session);
  return session;
}

export function logout() {
  removeItem(SESSION_KEY);
}

export function getSession() {
  return getItem(SESSION_KEY, null);
}

export function getToken() {
  return getSession()?.token || null;
}

export function isAuthenticated() {
  return Boolean(getToken());
}
