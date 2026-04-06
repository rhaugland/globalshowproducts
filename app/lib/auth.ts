import mockOrders from '~/data/mock-orders.json';

export interface User {
  email: string;
  name: string;
  passwordHash: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface OrderItem {
  title: string;
  variant: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const USERS_KEY = 'gsp-users';
const SESSION_KEY = 'gsp-session';

/** Simple hash for demo purposes only — NOT cryptographically secure. */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

function getUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as User[];
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(email: string, name: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({email, name}));
}

export function register(
  email: string,
  password: string,
  name: string,
): AuthResult {
  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return {success: false, error: 'Email already registered'};
  }
  const user: User = {email, name, passwordHash: simpleHash(password)};
  users.push(user);
  saveUsers(users);
  setSession(email, name);
  return {success: true};
}

export function login(email: string, password: string): AuthResult {
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  if (!user) {
    return {success: false, error: 'User not found'};
  }
  if (user.passwordHash !== simpleHash(password)) {
    return {success: false, error: 'Invalid password'};
  }
  setSession(user.email, user.name);
  return {success: true};
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): {email: string; name: string} | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as {email: string; name: string};
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

export function updateProfile(updates: {name?: string; email?: string}): void {
  const current = getCurrentUser();
  if (!current) return;

  const users = getUsers();
  const idx = users.findIndex((u) => u.email === current.email);
  if (idx === -1) return;

  if (updates.name) {
    users[idx].name = updates.name;
  }
  if (updates.email) {
    users[idx].email = updates.email;
  }
  saveUsers(users);
  setSession(updates.email ?? current.email, updates.name ?? current.name);
}

export function getOrders(): Order[] {
  if (!isLoggedIn()) return [];
  return mockOrders as Order[];
}
