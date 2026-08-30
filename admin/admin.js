// admin/admin.js — Premium Dashboard logic

// ─── State ───────────────────────────────────
let currentFilter = 'all';
let currentSourceFilter = 'all';
let searchQuery = '';
let currentPage = 1;
const itemsPerPage = 10;
let enquiries = [];
let currentLanguage = 'en';
let selectedEnquiry = null;

// Chart.js instances
let trendChart = null;
let sourceChart = null;

// ─── DOM refs ────────────────────────────────
const loginScreen   = document.getElementById('loginScreen');
const dashboard     = document.getElementById('dashboard');
const loginBtn      = document.getElementById('loginBtn');
const logoutBtn     = document.getElementById('logoutBtn');
const loginError    = document.getElementById('loginError');
const tableBody     = document.getElementById('tableBody');
const refreshBtn    = document.getElementById('refreshBtn');
const adminUsername = document.getElementById('adminUsername');
const toast         = document.getElementById('toast');

const searchInput      = document.getElementById('searchInput');
const sourceFilter     = document.getElementById('sourceFilter');
const btnExportCSV     = document.getElementById('btnExportCSV');
const btnPrevPage      = document.getElementById('btnPrevPage');
const btnNextPage      = document.getElementById('btnNextPage');
const paginationInfo   = document.getElementById('paginationInfo');
const langToggle       = document.getElementById('langToggle');

// Modal DOM refs
const detailsModal      = document.getElementById('detailsModal');
const modalId           = document.getElementById('modalId');
const modalName         = document.getElementById('modalName');
const modalPhone        = document.getElementById('modalPhone');
const modalSource       = document.getElementById('modalSource');
const modalDate         = document.getElementById('modalDate');
const modalMessage      = document.getElementById('modalMessage');
const modalStatusBadge  = document.getElementById('modalStatusBadge');
const modalWhatsAppBtn  = document.getElementById('modalWhatsAppBtn');
const modalDeleteBtn    = document.getElementById('modalDeleteBtn');
const btnCloseModal     = document.getElementById('btnCloseModal');

const modalCallBtn      = document.getElementById('modalCallBtn');
const modalCalledAt     = document.getElementById('modalCalledAt');

const modalEmail        = document.getElementById('modalEmail');
const modalEmailedAt    = document.getElementById('modalEmailedAt');
const modalEmailBtn     = document.getElementById('modalEmailBtn');
const addEmail          = document.getElementById('addEmail');

const btnAddEnquiry     = document.getElementById('btnAddEnquiry');
const addEnquiryModal   = document.getElementById('addEnquiryModal');
const addEnquiryForm    = document.getElementById('addEnquiryForm');
const btnCloseAddModal  = document.getElementById('btnCloseAddModal');
const btnCancelAdd      = document.getElementById('btnCancelAdd');

// ─── Translations ─────────────────────────────
const translations = {
    en: {
        dashboard_title: "Admin Dashboard — Tejas Fabrication",
        hero_title: "Tejas Fabrication",
        login_subtitle: "Admin Dashboard — Secure Login",
        username_label: "Username",
        password_label: "Password",
        login_btn: "Sign In to Dashboard",
        admin_badge: "ADMIN",
        logout_btn: "Sign Out",
        stat_total: "Total Enquiries",
        stat_new: "New / Unread",
        stat_completed: "Completed",
        stat_today: "Today",
        chart_trend_title: "📈 Enquiry Intake Trend (Daily)",
        chart_source_title: "📊 Traffic Channels",
        filter_source_all: "All Channels",
        filter_source_contact: "Contact Form",
        filter_source_estimator: "Cost Estimator",
        filter_source_whatsapp: "WhatsApp Direct",
        btn_export_csv: "Export CSV",
        enquiries_table_title: "Customer Enquiries",
        tab_all: "All",
        tab_new: "New",
        tab_read: "Read",
        tab_done: "Done",
        btn_refresh: "Refresh",
        btn_prev: "Previous",
        btn_next: "Next",
        modal_title: "Enquiry Details",
        modal_label_name: "Customer Name",
        modal_label_phone: "Phone Number",
        modal_label_source: "Source Channel",
        modal_label_date: "Received Date",
        modal_label_message: "Requirement Message",
        modal_label_status: "Status",
        modal_label_called: "Last Called At",
        modal_label_email: "Email Address",
        modal_label_emailed: "Last Emailed At",
        
        // Dynamic texts
        confirm_delete: "Are you sure you want to delete this enquiry?",
        status_updated: "Status updated to ",
        deleted_success: "Enquiry deleted successfully.",
        err_delete: "Failed to delete.",
        err_status: "Failed to update status.",
        placeholder_search: "Search by name, phone or message...",
        table_empty: "No enquiries found matching filters.",
        toast_login_fields: "Please enter username and password.",
        toast_login_connect: "Could not connect to server.",
        page_info: "Showing {start}-{end} of {total}",
        col_id: "#",
        col_name: "Name",
        col_phone: "Phone",
        col_msg: "Message",
        col_source: "Source",
        col_status: "Status",
        col_date: "Date",
        col_actions: "Actions",
        reply_default_msg: "Hello {name}, this is Tejas Fabrication. Regarding your enquiry, ",
        btn_add_enquiry: "Add Enquiry",
        add_modal_title: "Add New Enquiry",
        filter_source_manual: "Manual / Walk-in",
        btn_cancel: "Cancel",
        btn_save: "Save Enquiry",
        toast_save_success: "Enquiry saved successfully!",
        toast_save_err: "Failed to save enquiry."
    },
    gu: {
        dashboard_title: "એડમિન ડેશબોર્ડ — તેજસ ફેબ્રિકેશન",
        hero_title: "તેજસ ફેબ્રિકેશન",
        login_subtitle: "એડમિન ડેશબોર્ડ — સુરક્ષિત લોગીન",
        username_label: "યુઝરનેમ",
        password_label: "પાસવર્ડ",
        login_btn: "ડેશબોર્ડમાં પ્રવેશ કરો",
        admin_badge: "એડમિન",
        logout_btn: "સાઇન આઉટ",
        stat_total: "કુલ પૂછપરછ",
        stat_new: "નવી / વણવાંચેલી",
        stat_completed: "પૂર્ણ થયેલ",
        stat_today: "આજની પૂછપરછ",
        chart_trend_title: "📈 પૂછપરછ પ્રવાહ (દૈનિક)",
        chart_source_title: "📊 ટ્રાફિક ચેનલો",
        filter_source_all: "બધા માધ્યમો",
        filter_source_contact: "કોન્ટેક્ટ ફોર્મ",
        filter_source_estimator: "અંદાજક કૅલ્ક્યુલેટર",
        filter_source_whatsapp: "વોટ્સએપ ડાયરેક્ટ",
        btn_export_csv: "CSV ડાઉનલોડ",
        enquiries_table_title: "ગ્રાહકોની પૂછપરછ",
        tab_all: "બધી",
        tab_new: "નવી",
        tab_read: "વાંચેલી",
        tab_done: "પૂર્ણ",
        btn_refresh: "રિફ્રેશ",
        btn_prev: "પાછળ",
        btn_next: "આગળ",
        modal_title: "પૂછપરછ વિગતો",
        modal_label_name: "ગ્રાહકનું નામ",
        modal_label_phone: "ફોન નંબર",
        modal_label_source: "પૂછપરછનું માધ્યમ",
        modal_label_date: "મળેલ તારીખ",
        modal_label_message: "ગ્રાહકની જરૂરિયાત",
        modal_label_status: "સ્થિતિ",
        modal_label_called: "છેલ્લે કોલ કરેલ સમય",
        modal_label_email: "ઈમેલ એડ્રેસ",
        modal_label_emailed: "છેલ્લે ઈમેલ કરેલ સમય",
        
        // Dynamic texts
        confirm_delete: "શું તમે આ પૂછપરછ ડિલીટ કરવા માંગો છો?",
        status_updated: "સ્થિતિ બદલાઈ ગઈ: ",
        deleted_success: "પૂછપરછ ડિલીટ કરવામાં આવી છે.",
        err_delete: "ડિલીટ કરવામાં નિષ્ફળતા મળી.",
        err_status: "સ્થિતિ બદલવામાં નિષ્ફળતા મળી.",
        placeholder_search: "નામ, ફોન કે વિગત દ્વારા શોધો...",
        table_empty: "ફિલ્ટર સાથે મેળ ખાતી કોઈ પૂછપરછ મળી નથી.",
        toast_login_fields: "કૃપા કરીને યુઝરનેમ અને પાસવર્ડ દાખલ કરો.",
        toast_login_connect: "સર્વર સાથે જોડાણ થઈ શક્યું નથી.",
        page_info: "પૂછપરછ {start}-{end} બતાવી રહ્યું છે (કુલ {total} માંથી)",
        col_id: "નં.",
        col_name: "નામ",
        col_phone: "ફોન",
        col_msg: "જરૂરિયાત વિગત",
        col_source: "માધ્યમ",
        col_status: "સ્થિતિ",
        col_date: "તારીખ",
        col_actions: "ક્રિયાઓ",
        reply_default_msg: "નમસ્તે {name}, તેજસ ફેબ્રિકેશનથી વાત કરીએ છીએ. તમારી પૂછપરછ અંગે, ",
        btn_add_enquiry: "પૂછપરછ ઉમેરો",
        add_modal_title: "નવી પૂછપરછ ઉમેરો",
        filter_source_manual: "મેન્યુઅલ / રૂબરૂ",
        btn_cancel: "રદ કરો",
        btn_save: "સેવ કરો",
        toast_save_success: "પૂછપરછ સફળતાપૂર્વક સેવ થઈ ગઈ છે!",
        toast_save_err: "સેવ કરવામાં નિષ્ફળતા મળી."
    }
};

// ─── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkSession();

    // Login listeners
    document.getElementById('loginPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
    });
    document.getElementById('loginUsername').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
    });

    loginBtn.addEventListener('click', doLogin);
    logoutBtn.addEventListener('click', doLogout);
    refreshBtn.addEventListener('click', () => loadData(true));

    // Translation toggle
    langToggle.addEventListener('click', () => {
        const nextLang = currentLanguage === 'en' ? 'gu' : 'en';
        setLanguage(nextLang);
    });

    // Filtering & Search listeners
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderTable();
    });

    sourceFilter.addEventListener('change', (e) => {
        currentSourceFilter = e.target.value;
        currentPage = 1;
        renderTable();
    });

    // Filter tabs (Status)
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            currentPage = 1;
            renderTable();
        });
    });

    // Export CSV
    btnExportCSV.addEventListener('click', exportCSV);

    // Pagination
    btnPrevPage.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    btnNextPage.addEventListener('click', () => {
        const filtered = getFilteredEnquiries();
        if (currentPage * itemsPerPage < filtered.length) {
            currentPage++;
            renderTable();
        }
    });

    // Details Modal
    btnCloseModal.addEventListener('click', closeModal);
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) closeModal();
    });

    // Modal Status badge cycling
    modalStatusBadge.addEventListener('click', () => {
        if (selectedEnquiry) {
            cycleStatus(selectedEnquiry.id, selectedEnquiry.status, true);
        }
    });

    // Modal WhatsApp reply
    modalWhatsAppBtn.addEventListener('click', () => {
        if (selectedEnquiry) {
            replyWhatsApp(selectedEnquiry.phone, selectedEnquiry.name);
        }
    });

    // Modal Call customer
    if (modalCallBtn) {
        modalCallBtn.addEventListener('click', () => {
            if (selectedEnquiry) {
                triggerCall(selectedEnquiry.id, selectedEnquiry.phone);
            }
        });
    }

    // Modal Email customer
    if (modalEmailBtn) {
        modalEmailBtn.addEventListener('click', () => {
            if (selectedEnquiry) {
                triggerEmail(selectedEnquiry.id, selectedEnquiry.email, selectedEnquiry.name);
            }
        });
    }

    // Modal Delete
    modalDeleteBtn.addEventListener('click', () => {
        if (selectedEnquiry) {
            deleteEnquiry(selectedEnquiry.id, true);
        }
    });

    // Add Enquiry Modal listeners
    if (btnAddEnquiry) {
        btnAddEnquiry.addEventListener('click', () => {
            addEnquiryModal.classList.add('active');
        });
    }

    const closeAddModal = () => {
        addEnquiryModal.classList.remove('active');
        addEnquiryForm.reset();
    };

    if (btnCloseAddModal) btnCloseAddModal.addEventListener('click', closeAddModal);
    if (btnCancelAdd) btnCancelAdd.addEventListener('click', closeAddModal);
    if (addEnquiryModal) {
        addEnquiryModal.addEventListener('click', (e) => {
            if (e.target === addEnquiryModal) closeAddModal();
        });
    }

    if (addEnquiryForm) {
        addEnquiryForm.addEventListener('submit', handleAddEnquirySubmit);
    }

    // Set initial language
    setLanguage('en');
});

async function handleAddEnquirySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('addName').value.trim();
    const phone = document.getElementById('addPhone').value.trim();
    const email = document.getElementById('addEmail').value.trim() || null;
    const source = document.getElementById('addSource').value;
    const status = document.getElementById('addStatus').value;
    const message = document.getElementById('addMessage').value.trim();

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        showToast(currentLanguage === 'gu' ? 'કૃપા કરીને સાચો ૧૦-આંકડાનો ફોન નંબર દાખલ કરો.' : 'Please enter a valid 10-digit phone number.', 'error');
        return;
    }

    try {
        const res = await fetch('/api/enquiry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, source, status, message })
        });
        const data = await res.json();
        if (data.success) {
            showToast(translations[currentLanguage].toast_save_success, 'success');
            addEnquiryModal.classList.remove('active');
            addEnquiryForm.reset();
            loadData();
        } else {
            showToast(data.error || translations[currentLanguage].toast_save_err, 'error');
        }
    } catch (_) {
        showToast(translations[currentLanguage].toast_save_err, 'error');
    }
}

// ─── Translations engine ──────────────────────
function setLanguage(lang) {
    currentLanguage = lang;
    langToggle.textContent = lang === 'en' ? 'ગુજરાતી' : 'English';
    searchInput.placeholder = translations[lang].placeholder_search;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    const nameInput = document.getElementById('addName');
    const phoneInput = document.getElementById('addPhone');
    const msgTextarea = document.getElementById('addMessage');
    if (nameInput) nameInput.placeholder = lang === 'en' ? 'Enter customer name' : 'ગ્રાહકનું નામ દાખલ કરો';
    if (phoneInput) phoneInput.placeholder = lang === 'en' ? 'Enter 10-digit phone number' : '૧૦-આંકડાનો ફોન નંબર દાખલ કરો';
    if (msgTextarea) msgTextarea.placeholder = lang === 'en' ? 'Describe gate/grill details, dimensions, structural specs, etc...' : 'ગેટ/ગ્રીલ ની વિગત, માપ વગેરે દાખલ કરો...';

    renderTable();
}

// ─── Session check ────────────────────────────
async function checkSession() {
    try {
        const res  = await fetch('/api/check', { credentials: 'include' });
        const data = await res.json();
        if (data.isAdmin) {
            showDashboard(data.username);
        }
    } catch (_) {}
}

// ─── Login ────────────────────────────────────
async function doLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    loginError.style.display = 'none';

    if (!username || !password) {
        showLoginError(translations[currentLanguage].toast_login_fields);
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = '...';

    try {
        const res  = await fetch('/api/login', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            showDashboard(username);
        } else {
            showLoginError(data.error || 'Invalid credentials.');
        }
    } catch (err) {
        showLoginError(translations[currentLanguage].toast_login_connect);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = translations[currentLanguage].login_btn;
    }
}

function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.style.display = 'block';
}

// ─── Logout ───────────────────────────────────
async function doLogout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    dashboard.style.display = 'none';
    loginScreen.style.display = 'flex';
    document.getElementById('loginPassword').value = '';
}

// ─── Show Dashboard ───────────────────────────
function showDashboard(username) {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    adminUsername.textContent = `👤 ${username}`;
    loadData();
}

// ─── Load Data ────────────────────────────────
async function loadData(manual = false) {
    if (manual) showToast(currentLanguage === 'gu' ? 'રિફ્રેશ કરી રહ્યા છીએ...' : 'Refreshing data...', 'success');
    await Promise.all([loadStats(), loadEnquiries()]);
}

async function loadStats() {
    try {
        const res  = await fetch('/api/enquiries/stats', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
            document.getElementById('statTotal').textContent = data.stats.total;
            document.getElementById('statNew').textContent   = data.stats.new;
            document.getElementById('statDone').textContent  = data.stats.done;
            document.getElementById('statToday').textContent = data.stats.today;
        }
    } catch (_) {}
}

async function loadEnquiries() {
    tableBody.innerHTML = '<div class="spinner"></div>';
    try {
        const res  = await fetch('/api/enquiries?limit=500', { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
            enquiries = data.enquiries;
            renderTable();
            updateCharts();
        } else {
            tableBody.innerHTML = `<div class="empty-state"><p>Failed to load enquiries.</p></div>`;
        }
    } catch (err) {
        tableBody.innerHTML = `<div class="empty-state"><p>Could not reach the server.</p></div>`;
    }
}

// ─── Filtering Logic ──────────────────────────
function getFilteredEnquiries() {
    const q = searchQuery.toLowerCase().trim();
    return enquiries.filter(e => {
        // Status filter
        const matchStatus = (currentFilter === 'all' || e.status === currentFilter);
        // Source filter
        const matchSource = (currentSourceFilter === 'all' || e.source === currentSourceFilter);
        // Search query
        const matchSearch = (!q || 
            e.name.toLowerCase().includes(q) || 
            e.phone.includes(q) || 
            e.message.toLowerCase().includes(q)
        );

        return matchStatus && matchSource && matchSearch;
    });
}

// ─── Render Table ─────────────────────────────
function renderTable() {
    const filtered = getFilteredEnquiries();
    
    // Pagination slicing
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
    
    const paginated = filtered.slice(startIndex, endIndex);

    // Update Pagination info
    if (totalCount === 0) {
        paginationInfo.textContent = translations[currentLanguage].table_empty;
        btnPrevPage.disabled = true;
        btnNextPage.disabled = true;
        
        tableBody.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <p>${translations[currentLanguage].table_empty}</p>
            </div>`;
        return;
    }

    let pageText = translations[currentLanguage].page_info
        .replace('{start}', startIndex + 1)
        .replace('{end}', endIndex)
        .replace('{total}', totalCount);
        
    paginationInfo.textContent = pageText;
    btnPrevPage.disabled = currentPage === 1;
    btnNextPage.disabled = currentPage === totalPages;

    const rows = paginated.map(e => `
        <tr id="row-${e.id}" onclick="handleRowClick(event, '${e.id}')">
            <td class="id-cell">#${e.id}</td>
            <td class="name-cell">${escHtml(e.name)}</td>
            <td class="phone-cell">
                <a href="tel:+91${e.phone}" style="color:inherit;text-decoration:none;" onclick="event.stopPropagation()">
                    ${escHtml(e.phone)}
                </a>
            </td>
            <td class="msg-cell" title="${escHtml(e.message)}">${escHtml(e.message)}</td>
            <td>
                <span class="source-tag">
                    ${escHtml(e.source.replace('_', ' '))}
                </span>
            </td>
            <td>
                <button class="status-badge status-${e.status}"
                        onclick="event.stopPropagation(); cycleStatus(${e.id}, '${e.status}')">
                    ${statusIcon(e.status)} ${e.status.toUpperCase()}
                </button>
            </td>
            <td class="date-cell">${formatDate(e.created_at)}</td>
            <td class="actions-cell">
                <button class="btn-wa" title="Reply on WhatsApp"
                        onclick="event.stopPropagation(); replyWhatsApp('${e.phone}', '${escHtml(e.name)}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.978 0 1.58.411 3.12 1.193 4.474L3 21l4.643-1.218a8.924 8.924 0 0 0 4.407 1.164h.004c4.947 0 8.975-4.027 8.977-8.978a8.919 8.919 0 0 0-2.628-6.335z"/>
                    </svg>
                </button>
                <button class="btn-delete" title="Delete enquiry"
                        onclick="event.stopPropagation(); deleteEnquiry(${e.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    tableBody.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>${translations[currentLanguage].col_id}</th>
                    <th>${translations[currentLanguage].col_name}</th>
                    <th>${translations[currentLanguage].col_phone}</th>
                    <th>${translations[currentLanguage].col_msg}</th>
                    <th>${translations[currentLanguage].col_source}</th>
                    <th>${translations[currentLanguage].col_status}</th>
                    <th>${translations[currentLanguage].col_date}</th>
                    <th>${translations[currentLanguage].col_actions}</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

// ─── Actions & Handlers ───────────────────────
const STATUS_CYCLE = { new: 'read', read: 'done', done: 'new' };

async function cycleStatus(id, current, isFromModal = false) {
    const next = STATUS_CYCLE[current];
    try {
        const res  = await fetch(`/api/enquiries/${id}/status`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: next })
        });
        const data = await res.json();
        if (data.success) {
            enquiries = enquiries.map(e => e.id === id ? { ...e, status: next } : e);
            renderTable();
            loadStats();
            updateCharts();
            showToast(`${translations[currentLanguage].status_updated}${next.toUpperCase()}`, 'success');
            
            // If called from details modal, update modal contents too
            if (isFromModal && selectedEnquiry && selectedEnquiry.id === id) {
                selectedEnquiry.status = next;
                modalStatusBadge.className = `status-badge status-${next}`;
                modalStatusBadge.textContent = `${statusIcon(next)} ${next.toUpperCase()}`;
            }
        }
    } catch (_) {
        showToast(translations[currentLanguage].err_status, 'error');
    }
}

async function deleteEnquiry(id, isFromModal = false) {
    if (!confirm(translations[currentLanguage].confirm_delete)) return;
    try {
        const res  = await fetch(`/api/enquiries/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
            enquiries = enquiries.filter(e => e.id !== id);
            renderTable();
            loadStats();
            updateCharts();
            showToast(translations[currentLanguage].deleted_success, 'success');
            if (isFromModal) closeModal();
        }
    } catch (_) {
        showToast(translations[currentLanguage].err_delete, 'error');
    }
}

function replyWhatsApp(phone, name) {
    const defaultMsg = translations[currentLanguage].reply_default_msg.replace('{name}', name);
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(defaultMsg)}`, '_blank');
}

async function triggerCall(id, phone) {
    window.location.href = `tel:${phone}`;
    try {
        const res = await fetch(`/api/enquiries/${id}/call`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
            enquiries = enquiries.map(e => e.id === id ? { ...e, called_at: data.called_at, status: data.status } : e);
            renderTable();
            loadStats();
            updateCharts();
            if (selectedEnquiry && selectedEnquiry.id === id) {
                selectedEnquiry.called_at = data.called_at;
                selectedEnquiry.status = data.status;
                modalCalledAt.textContent = formatDate(data.called_at);
                modalStatusBadge.className = `status-badge status-${data.status}`;
                modalStatusBadge.textContent = `${statusIcon(data.status)} ${data.status.toUpperCase()}`;
            }
            showToast(currentLanguage === 'gu' ? 'કોલ લોગ થયો છે.' : 'Call logged successfully.', 'success');
        }
    } catch (_) {
        showToast(currentLanguage === 'gu' ? 'કોલ લોગ કરવામાં મુશ્કેલી પડી.' : 'Failed to log call.', 'error');
    }
}

async function triggerEmail(id, email, name) {
    if (!email) {
        showToast(currentLanguage === 'gu' ? 'કૃપા કરીને પહેલા ગ્રાહકનો ઈમેલ ઉમેરો.' : 'Please add an email address for this customer first.', 'error');
        return;
    }
    const subject = encodeURIComponent('Regarding your Enquiry - Tejas Fabrication');
    const body = encodeURIComponent(`Hello ${name},\n\nThis is Tejas Fabrication. Regarding your enquiry, `);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    try {
        const res = await fetch(`/api/enquiries/${id}/email`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
            enquiries = enquiries.map(e => e.id === id ? { ...e, emailed_at: data.emailed_at, status: data.status } : e);
            renderTable();
            loadStats();
            updateCharts();
            if (selectedEnquiry && selectedEnquiry.id === id) {
                selectedEnquiry.emailed_at = data.emailed_at;
                selectedEnquiry.status = data.status;
                modalEmailedAt.textContent = formatDate(data.emailed_at);
                modalStatusBadge.className = `status-badge status-${data.status}`;
                modalStatusBadge.textContent = `${statusIcon(data.status)} ${data.status.toUpperCase()}`;
            }
            showToast(currentLanguage === 'gu' ? 'ઈમેલ લોગ થયો છે.' : 'Email logged successfully.', 'success');
        }
    } catch (_) {
        showToast(currentLanguage === 'gu' ? 'ઈમેલ લોગ કરવામાં મુશ્કેલી પડી.' : 'Failed to log email.', 'error');
    }
}

// ─── Details Modal Logic ──────────────────────
function handleRowClick(event, id) {
    const item = enquiries.find(e => e.id === id);
    if (item) {
        selectedEnquiry = item;
        
        modalId.textContent = `#${item.id}`;
        modalName.textContent = item.name;
        modalPhone.textContent = item.phone;
        modalEmail.textContent = item.email || '—';
        modalSource.textContent = item.source.replace('_', ' ');
        modalDate.textContent = formatDate(item.created_at);
        modalCalledAt.textContent = item.called_at ? formatDate(item.called_at) : '—';
        modalEmailedAt.textContent = item.emailed_at ? formatDate(item.emailed_at) : '—';
        modalMessage.textContent = item.message;
        
        modalStatusBadge.className = `status-badge status-${item.status}`;
        modalStatusBadge.textContent = `${statusIcon(item.status)} ${item.status.toUpperCase()}`;
        
        detailsModal.classList.add('active');
    }
}

function closeModal() {
    detailsModal.classList.remove('active');
    selectedEnquiry = null;
}

// ─── CSV Export Handler ───────────────────────
function exportCSV() {
    const filtered = getFilteredEnquiries();
    if (filtered.length === 0) {
        showToast('No enquiries to export.', 'error');
        return;
    }

    const headers = ['ID', 'Customer Name', 'Phone Number', 'Message/Requirements', 'Source', 'Status', 'Date Received'];
    const rows = filtered.map(e => [
        e.id,
        `"${e.name.replace(/"/g, '""')}"`,
        e.phone,
        `"${e.message.replace(/"/g, '""')}"`,
        e.source,
        e.status,
        e.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tejas_Fabrication_Enquiries_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ─── Chart.js Integrations ───────────────────
function updateCharts() {
    // 1. Source distribution dataset
    const sourcesCount = { contact_form: 0, estimator: 0, whatsapp: 0 };
    enquiries.forEach(e => {
        if (sourcesCount[e.source] !== undefined) {
            sourcesCount[e.source]++;
        } else {
            sourcesCount.contact_form++; // Fallback
        }
    });

    const sourceData = [sourcesCount.contact_form, sourcesCount.estimator, sourcesCount.whatsapp];
    const sourceLabels = currentLanguage === 'gu' 
        ? ['કોન્ટેક્ટ ફોર્મ', 'અંદાજક કૅલ્ક્યુલેટર', 'વોટ્સએપ ડાયરેક્ટ'] 
        : ['Contact Form', 'Cost Estimator', 'WhatsApp Direct'];

    // 2. Trend Intake dataset (last 7 days)
    const dailyCount = {};
    const dateLabels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        dailyCount[dateStr] = 0;
        
        // Formatted label
        const displayLabel = d.toLocaleDateString(currentLanguage === 'gu' ? 'gu-IN' : 'en-IN', { day: 'numeric', month: 'short' });
        dateLabels.push({ raw: dateStr, display: displayLabel });
    }

    enquiries.forEach(e => {
        const createdDate = new Date(e.created_at).toISOString().slice(0, 10);
        if (dailyCount[createdDate] !== undefined) {
            dailyCount[createdDate]++;
        }
    });

    const trendData = dateLabels.map(l => dailyCount[l.raw]);
    const trendDisplayLabels = dateLabels.map(l => l.display);

    // Draw / Update source Doughnut Chart
    if (sourceChart) {
        sourceChart.data.labels = sourceLabels;
        sourceChart.data.datasets[0].data = sourceData;
        sourceChart.update();
    } else {
        const ctx = document.getElementById('sourceChart').getContext('2d');
        sourceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sourceLabels,
                datasets: [{
                    data: sourceData,
                    backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11 } }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // Draw / Update trend Line Chart
    if (trendChart) {
        trendChart.data.labels = trendDisplayLabels;
        trendChart.data.datasets[0].data = trendData;
        trendChart.update();
    } else {
        const ctx = document.getElementById('trendChart').getContext('2d');
        trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendDisplayLabels,
                datasets: [{
                    label: currentLanguage === 'gu' ? 'પૂછપરછ સંખ્યા' : 'Intake Count',
                    data: trendData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#f59e0b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { 
                            color: '#94a3b8', 
                            font: { family: 'Inter', size: 10 },
                            stepSize: 1,
                            precision: 0
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// ─── Helpers ──────────────────────────────────
function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function statusIcon(s) {
    return { new: '🔔', read: '👁️', done: '✅' }[s] || '•';
}

function formatDate(dt) {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    return d.toLocaleDateString(currentLanguage === 'gu' ? 'gu-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' ' + d.toLocaleTimeString(currentLanguage === 'gu' ? 'gu-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' });
}

let toastTimer = null;
function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.className = `show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}
