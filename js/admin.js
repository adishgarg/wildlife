/**
 * admin.js — WildGuard Admin Dashboard
 * Clean rewrite: all rendering triggered inside DOMContentLoaded.
 */

const ADMIN_API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';

// ── Sample data used when not authenticated or API unavailable ──────────────
const DEMO_STATS = {
    totalReports: 26,
    totalUsers: 8,
    accidents: 14,   // accident + injured
    poaching: 4,
    monthLabels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    monthData:   [4,     6,     3,     7,     9,     5    ],
    typeLabels:  ['Accident', 'Movement', 'Injured', 'Poaching'],
    typeData:    [10,         8,          4,         4         ],
    typeColors:  ['#E07A5F', '#4A827F', '#F2CC8F', '#DE8F59'],
    recentActivity: [
        { icon: '🚗', location: 'NH-7, Pench Tiger Reserve',         type: 'accident', ago: '1h ago'  },
        { icon: '🐘', location: 'NH-766, Wayanad Wildlife Corridor', type: 'movement', ago: '3h ago'  },
        { icon: '🩺', location: 'Bandipur National Park, Zone C',    type: 'injured',  ago: '8h ago'  },
        { icon: '⚠️', location: 'Panna Tiger Reserve, Zone A',       type: 'poaching', ago: '1d ago'  },
        { icon: '🐘', location: 'Jim Corbett, Dhikuli Range',        type: 'movement', ago: '2d ago'  },
    ]
};

const DEMO_REPORTS = [
    { id:'r1',  location:'NH-7, Pench Tiger Reserve Gate',      type:'accident', lat:21.6845, lng:79.2891, date:'22 Mar 2026' },
    { id:'r2',  location:'NH-766, Wayanad Wildlife Corridor',   type:'movement', lat:11.8745, lng:76.0815, date:'21 Mar 2026' },
    { id:'r3',  location:'Bandipur National Park, Zone C',      type:'injured',  lat:11.6603, lng:76.6260, date:'20 Mar 2026' },
    { id:'r4',  location:'Panna Tiger Reserve, Zone A',         type:'poaching', lat:24.7200, lng:80.1100, date:'19 Mar 2026' },
    { id:'r5',  location:'Jim Corbett, Ramganga River Zone',    type:'movement', lat:29.5200, lng:78.7900, date:'18 Mar 2026' },
    { id:'r6',  location:'NH-4, Bandipur Forest Zone',          type:'accident', lat:11.6789, lng:76.6102, date:'17 Mar 2026' },
    { id:'r7',  location:'Kaziranga, NH-37 Km 243',             type:'injured',  lat:26.5800, lng:93.1500, date:'16 Mar 2026' },
    { id:'r8',  location:'Sundarbans Buffer Zone',              type:'poaching', lat:21.9497, lng:88.8800, date:'15 Mar 2026' },
    { id:'r9',  location:'Mudumalai-Bandipur Corridor',        type:'movement', lat:11.5910, lng:76.5800, date:'14 Mar 2026' },
    { id:'r10', location:'SH-33, Ranthambore Zone 3',           type:'accident', lat:26.0173, lng:76.5026, date:'13 Mar 2026' },
    { id:'r11', location:'NH-44, Kanha Forest Corridor',        type:'accident', lat:22.3350, lng:80.6115, date:'12 Mar 2026' },
    { id:'r12', location:'Nagarhole, Kabini Bridge',            type:'movement', lat:11.9782, lng:76.3461, date:'11 Mar 2026' },
    { id:'r13', location:'Corbett, Dhikuli Range',              type:'injured',  lat:29.5601, lng:78.8102, date:'10 Mar 2026' },
    { id:'r14', location:'Tadoba, Gate No. 2',                  type:'injured',  lat:20.2148, lng:79.3900, date:'9 Mar 2026'  },
    { id:'r15', location:'Sariska Reserve, Northern Edge',      type:'poaching', lat:27.3350, lng:76.3000, date:'8 Mar 2026'  },
];

// ── Type badge styling ────────────────────────────────────────────────────────
const TYPE_BADGE = {
    accident: 'background:rgba(224,122,95,0.15);color:#f1a08a',
    injured:  'background:rgba(242,204,143,0.15);color:#f5d9a0',
    poaching: 'background:rgba(222,143,89,0.15);color:#f0b07a',
    movement: 'background:rgba(74,130,127,0.2);color:#7fc9c6',
    animal:   'background:rgba(74,130,127,0.2);color:#7fc9c6',
};

function typeBadge(type) {
    const style = TYPE_BADGE[type] || 'background:rgba(135,159,130,0.15);color:#b5cfae';
    return `<span style="display:inline-block;padding:0.2rem 0.65rem;border-radius:20px;font-size:0.75rem;font-weight:600;text-transform:capitalize;${style}">${type}</span>`;
}

// ── Stat cards ────────────────────────────────────────────────────────────────
function renderStats(s) {
    document.getElementById('statTotalReports').textContent = s.totalReports;
    document.getElementById('statTotalUsers').textContent   = s.totalUsers;
    document.getElementById('statAccidents').textContent    = s.accidents;
    document.getElementById('statPoaching').textContent     = s.poaching;
}

// ── Charts ────────────────────────────────────────────────────────────────────
let charts = {};

function maybeDestroy(key) {
    if (charts[key]) { try { charts[key].destroy(); } catch(e){} charts[key] = null; }
}

function renderCharts(s) {
    // Line chart — monthly trend (Overview)
    maybeDestroy('line1');
    const c1 = document.getElementById('chartMonthly');
    if (c1) {
        charts.line1 = new Chart(c1, {
            type: 'line',
            data: {
                labels: s.monthLabels,
                datasets: [{
                    data: s.monthData,
                    borderColor: '#879f82',
                    backgroundColor: 'rgba(135,159,130,0.12)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#879f82',
                    pointRadius: 5,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(135,159,130,0.1)' }, ticks: { color: '#abb8b0' } },
                    x: { grid: { display: false }, ticks: { color: '#abb8b0' } }
                }
            }
        });
    }

    // Doughnut — incident types (Overview)
    maybeDestroy('donut1');
    const c2 = document.getElementById('chartType');
    if (c2) {
        charts.donut1 = new Chart(c2, {
            type: 'doughnut',
            data: { labels: s.typeLabels, datasets: [{ data: s.typeData, backgroundColor: s.typeColors, borderWidth: 0 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#abb8b0', padding: 14, boxWidth: 14 } } },
                cutout: '65%'
            }
        });
    }

    // Line chart — Analytics tab
    maybeDestroy('line2');
    const c3 = document.getElementById('chartMonthly2');
    if (c3) {
        charts.line2 = new Chart(c3, {
            type: 'line',
            data: {
                labels: s.monthLabels,
                datasets: [{
                    data: s.monthData,
                    borderColor: '#879f82',
                    backgroundColor: 'rgba(135,159,130,0.12)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#879f82',
                    pointRadius: 5,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(135,159,130,0.1)' }, ticks: { color: '#abb8b0' } },
                    x: { grid: { display: false }, ticks: { color: '#abb8b0' } }
                }
            }
        });
    }

    // Doughnut — Analytics tab
    maybeDestroy('donut2');
    const c4 = document.getElementById('chartType2');
    if (c4) {
        charts.donut2 = new Chart(c4, {
            type: 'doughnut',
            data: { labels: s.typeLabels, datasets: [{ data: s.typeData, backgroundColor: s.typeColors, borderWidth: 0 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#abb8b0', padding: 14, boxWidth: 14 } } },
                cutout: '65%'
            }
        });
    }

    // Bar — Analytics tab
    maybeDestroy('bar');
    const c5 = document.getElementById('chartBar');
    if (c5) {
        charts.bar = new Chart(c5, {
            type: 'bar',
            data: {
                labels: s.typeLabels,
                datasets: [{ data: s.typeData, backgroundColor: s.typeColors, borderRadius: 6 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(135,159,130,0.1)' }, ticks: { color: '#abb8b0' } },
                    x: { grid: { display: false }, ticks: { color: '#abb8b0' } }
                }
            }
        });
    }
}

// ── Activity feed ─────────────────────────────────────────────────────────────
function renderActivity(items) {
    const el = document.getElementById('activityFeed');
    if (!el) return;
    const TYPE_COLOR = { accident:'#E07A5F', injured:'#F2CC8F', poaching:'#DE8F59', movement:'#4A827F', animal:'#4A827F' };
    el.innerHTML = items.map(r => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid rgba(135,159,130,0.12);">
            <div style="font-size:1.4rem;line-height:1;min-width:28px;">${r.icon || '📍'}</div>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:#edf2ed;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.location}</div>
                <div style="display:flex;gap:8px;margin-top:4px;align-items:center;">
                    <span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:${TYPE_COLOR[r.type]||'#879f82'}">${r.type}</span>
                    <span style="color:#abb8b0;font-size:0.78rem;">${r.ago}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ── Reports table ─────────────────────────────────────────────────────────────
function renderReports(list, isReal) {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#abb8b0;">No reports found</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(r => `
        <tr style="transition:background 0.15s;" onmouseover="this.style.background='rgba(135,159,130,0.05)'" onmouseout="this.style.background='transparent'">
            <td style="padding:1rem 1.5rem;border-bottom:1px solid rgba(135,159,130,0.08);font-family:monospace;color:#abb8b0;font-size:0.82rem;">${String(r.id || r._id || '').slice(-6)}</td>
            <td style="padding:1rem 1.5rem;border-bottom:1px solid rgba(135,159,130,0.08);color:#edf2ed;font-size:0.9rem;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.location}</td>
            <td style="padding:1rem 1.5rem;border-bottom:1px solid rgba(135,159,130,0.08);">${typeBadge(r.type)}</td>
            <td style="padding:1rem 1.5rem;border-bottom:1px solid rgba(135,159,130,0.08);color:#abb8b0;font-size:0.83rem;">${r.lat != null ? Number(r.lat).toFixed(3) : (r.latitude != null ? Number(r.latitude).toFixed(3) : '—')}, ${r.lng != null ? Number(r.lng).toFixed(3) : (r.longitude != null ? Number(r.longitude).toFixed(3) : '—')}</td>
            <td style="padding:1rem 1.5rem;border-bottom:1px solid rgba(135,159,130,0.08);color:#abb8b0;font-size:0.83rem;">${r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—')}</td>
            <td style="padding:1rem 1.5rem;border-bottom:1px solid rgba(135,159,130,0.08);">
                ${isReal
                    ? `<button onclick="deleteReport('${r._id}',this)" style="border:none;background:none;cursor:pointer;color:#E07A5F;padding:4px 8px;border-radius:6px;transition:background 0.2s;" onmouseover="this.style.background='rgba(224,122,95,0.15)'" onmouseout="this.style.background='none'"><i class="fa-solid fa-trash-can"></i></button>`
                    : `<span style="color:#abb8b0;font-size:0.8rem;">—</span>`}
            </td>
        </tr>
    `).join('');
}

// ── Delete report ─────────────────────────────────────────────────────────────
async function deleteReport(id, btn) {
    if (!confirm('Delete this report?')) return;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;
    try {
        const token = typeof Auth !== 'undefined' ? Auth.getToken() : null;
        const res = await fetch(`${ADMIN_API_BASE}/api/admin/reports/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            btn.closest('tr').remove();
            const el = document.getElementById('statTotalReports');
            if (el) el.textContent = Math.max(0, parseInt(el.textContent) - 1);
        } else {
            btn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            btn.disabled = false;
        }
    } catch(e) {
        btn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        btn.disabled = false;
    }
}

// ── Section switching ─────────────────────────────────────────────────────────
function showSection(id) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
    const sec  = document.getElementById(id);
    const link = document.querySelector(`[data-section="${id}"]`);
    if (sec)  sec.classList.add('active');
    if (link) link.classList.add('active');

    const titles = { overview:'Overview', analytics:'Analytics', reports:'Reports' };
    const tbEl = document.getElementById('topbarTitle');
    if (tbEl) tbEl.textContent = titles[id] || 'Dashboard';
}

// ── Try to fetch real data from API ──────────────────────────────────────────
async function tryLoadRealData() {
    const token = typeof Auth !== 'undefined' ? Auth.getToken() : null;
    if (!token) return;

    try {
        const [sRes, rRes] = await Promise.all([
            fetch(`${ADMIN_API_BASE}/api/admin/stats`,   { headers:{ 'Authorization':`Bearer ${token}` } }),
            fetch(`${ADMIN_API_BASE}/api/admin/reports?limit=15`, { headers:{ 'Authorization':`Bearer ${token}` } })
        ]);

        if (sRes.ok) {
            const s = await sRes.json();
            const byType = s.byType || [];
            const get = (t) => (byType.find(b => b._id === t) || {}).count || 0;
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const now = new Date();
            const mLabels = [], mData = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                mLabels.push(monthNames[d.getMonth()]);
                const found = (s.byMonth || []).find(m => m._id.month === d.getMonth()+1 && m._id.year === d.getFullYear());
                mData.push(found ? found.count : 0);
            }
            const realStats = {
                totalReports: s.totalReports,
                totalUsers:   s.totalUsers,
                accidents:    get('accident') + get('injured'),
                poaching:     get('poaching'),
                monthLabels:  mLabels,
                monthData:    mData,
                typeLabels:   byType.map(b => b._id.charAt(0).toUpperCase() + b._id.slice(1)),
                typeData:     byType.map(b => b.count),
                typeColors:   ['#E07A5F','#F2CC8F','#4A827F','#879f82','#DE8F59'],
                recentActivity: (s.recentReports || []).map(r => ({
                    icon: { accident:'🚗', injured:'🩺', poaching:'⚠️', movement:'🐘', animal:'🌿' }[r.type] || '📍',
                    location: r.location,
                    type: r.type,
                    ago: timeAgo(r.createdAt)
                }))
            };
            renderStats(realStats);
            renderCharts(realStats);
            if (realStats.recentActivity.length) renderActivity(realStats.recentActivity);
        }

        if (rRes.ok) {
            const rd = await rRes.json();
            renderReports(rd.reports, true);
        }
    } catch(e) { /* keep demo data */ }
}

function timeAgo(date) {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff/60)   + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600)  + 'h ago';
    return Math.floor(diff/86400) + 'd ago';
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Set up sidebar nav
    document.querySelectorAll('.admin-nav-link[data-section]').forEach(link => {
        link.addEventListener('click', e => { e.preventDefault(); showSection(link.dataset.section); });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof Auth !== 'undefined') Auth.logout();
            else { localStorage.clear(); window.location.href = '/'; }
        });
    }

    // Sidebar avatar
    if (typeof Auth !== 'undefined') {
        const u = Auth.getUser();
        if (u) {
            const av = document.getElementById('sidebarAvatar');
            const un = document.getElementById('adminUsername');
            if (av) av.textContent = u.username.charAt(0).toUpperCase();
            if (un) un.textContent = u.username;
        }
    }

    // 1. Show overview section
    showSection('overview');

    // 2. Render non-chart demo data immediately
    renderStats(DEMO_STATS);
    renderActivity(DEMO_STATS.recentActivity);
    renderReports(DEMO_REPORTS, false);

    // 3. Try to overlay real API data immediately (doesn't need Chart.js)
    tryLoadRealData();

    // 4. Auto-refresh real data every 60s
    setInterval(tryLoadRealData, 60000);

    // 5. Initialize charts (waits for Chart.js CDN)
    function initCharts() {
        if (typeof Chart === 'undefined') {
            setTimeout(initCharts, 50);
            return;
        }
        Chart.defaults.color = '#abb8b0';
        Chart.defaults.font.family = "'Outfit', sans-serif";
        renderCharts(DEMO_STATS);
    }
    initCharts();
});
