// auth.js — JWT auth helpers shared across pages
const API_BASE = (window.location.hostname === '127.0.0.1' && window.location.port !== '3000') || window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

const Auth = (() => {
    const TOKEN_KEY = 'wg_token';
    const USER_KEY  = 'wg_user';

    function saveSession(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function getToken() { return localStorage.getItem(TOKEN_KEY); }

    function getUser() {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
    }

    function isLoggedIn() { return !!getToken(); }

    function isAdmin() {
        const u = getUser();
        return u && u.role === 'admin';
    }

    function logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/';
    }

    async function register(username, email, password) {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        saveSession(data.token, data.user);
        return data.user;
    }

    async function login(email, password) {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        saveSession(data.token, data.user);
        return data.user;
    }

    function authHeaders() {
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
    }

    // Update navbar based on auth state
    function initNavbar() {
        const authBtn = document.getElementById('navAuthBtn');
        const adminBtn = document.getElementById('navAdminBtn');
        const userDisplay = document.getElementById('navUserDisplay');

        if (!authBtn) return;
        const user = getUser();

        if (user) {
            authBtn.textContent = 'Logout';
            authBtn.href = '#';
            authBtn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
            if (userDisplay) { userDisplay.textContent = `👤 ${user.username}`; userDisplay.style.display = 'inline'; }
            if (adminBtn && user.role === 'admin') adminBtn.style.display = 'inline-block';
        } else {
            authBtn.textContent = 'Login';
            authBtn.href = '/login.html';
            if (userDisplay) userDisplay.style.display = 'none';
            if (adminBtn) adminBtn.style.display = 'none';
        }
    }

    return { register, login, logout, getToken, getUser, isLoggedIn, isAdmin, authHeaders, initNavbar };
})();
