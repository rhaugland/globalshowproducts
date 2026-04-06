import {describe, it, expect, beforeEach} from 'vitest';
import {
  register,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  updateProfile,
  getOrders,
} from '~/lib/auth';

describe('auth library', () => {
  beforeEach(() => {
    localStorage.removeItem('gsp-users');
    localStorage.removeItem('gsp-session');
  });

  it('starts logged out', () => {
    expect(isLoggedIn()).toBe(false);
    expect(getCurrentUser()).toBeNull();
  });

  it('registers a new user', () => {
    const result = register('alice@example.com', 'password123', 'Alice');
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(isLoggedIn()).toBe(true);
    expect(getCurrentUser()).toEqual({email: 'alice@example.com', name: 'Alice'});
  });

  it('rejects duplicate email', () => {
    register('alice@example.com', 'password123', 'Alice');
    logout();
    const result = register('alice@example.com', 'other', 'Alice2');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('logs in with correct credentials', () => {
    register('bob@example.com', 'secret', 'Bob');
    logout();
    const result = login('bob@example.com', 'secret');
    expect(result.success).toBe(true);
    expect(isLoggedIn()).toBe(true);
    expect(getCurrentUser()).toEqual({email: 'bob@example.com', name: 'Bob'});
  });

  it('rejects wrong password', () => {
    register('bob@example.com', 'secret', 'Bob');
    logout();
    const result = login('bob@example.com', 'wrong');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(isLoggedIn()).toBe(false);
  });

  it('logs out', () => {
    register('carol@example.com', 'pass', 'Carol');
    expect(isLoggedIn()).toBe(true);
    logout();
    expect(isLoggedIn()).toBe(false);
    expect(getCurrentUser()).toBeNull();
  });

  it('updates profile', () => {
    register('dave@example.com', 'pass', 'Dave');
    updateProfile({name: 'David'});
    expect(getCurrentUser()).toEqual({email: 'dave@example.com', name: 'David'});

    updateProfile({email: 'david@example.com'});
    expect(getCurrentUser()).toEqual({email: 'david@example.com', name: 'David'});
  });

  it('returns mock orders when logged in', () => {
    expect(getOrders()).toEqual([]);
    register('eve@example.com', 'pass', 'Eve');
    const orders = getOrders();
    expect(orders.length).toBe(2);
    expect(orders[0].id).toBe('ORD-1001');
    expect(orders[1].id).toBe('ORD-1002');
  });
});
