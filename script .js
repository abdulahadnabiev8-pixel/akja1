const CONTRACT = 70000;     // бир окуучунун жылдык контракты (сом)
const STUDENTS = 270;       // жалпы окуучулар
const STORAGE_KEY = 'madrasa_payments_v1';

const form = document.getElementById('paymentForm');
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('search');

let payments = load();

function load() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved)) return saved;
    } catch (e) {}
    return [
        { id: 1, name: 'Асан уулу Мухаммед', amount: 70000, date: '2026-09-10', giver: 'Апасы (Бактыгүл)', receiver: 'Устаз Абдулла' },
        { id: 2, name: 'Ибрагим уулу Умар', amount: 30000, date: '2026-09-15', giver: 'Өзү', receiver: 'Бухгалтер Айбек' },
        { id: 3, name: 'Касымов Бекжан', amount: 70000, date: '2026-09-20', giver: 'Атасы (Касым)', receiver: 'Устаз Абдулла' }
    ];
}

function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payments)); } catch (e) {}
}

const fmt = n => n.toLocaleString('en-US') + ' сом';

function fmtDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// Бир окуучунун бардык төлөмдөрүн кошуп, калдыгын эсептейт
function paidByName(name) {
    return payments
        .filter(p => p.name.toLowerCase() === name.toLowerCase())
        .reduce((sum, p) => sum + p.amount, 0);
}

function updateStats() {
    const total = CONTRACT * STUDENTS;
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('contractLabel').textContent = CONTRACT.toLocaleString('en-US');
    document.getElementById('statTotal').textContent = fmt(total);
    document.getElementById('statPaid').textContent = fmt(paid);
    document.getElementById('statDebt').textContent = fmt(Math.max(total - paid, 0));
}

function render() {
    const q = searchInput.value.trim().toLowerCase();
    const rows = payments
        .map((p, i) => ({ p, i }))
        .filter(({ p }) => p.name.toLowerCase().includes(q));

    if (!rows.length) {
        tableBody.innerHTML = '<tr><td colspan="10" class="empty">Төлөм табылган жок</td></tr>';
    } else {
        tableBody.innerHTML = rows.map(({ p, i }) => {
            const totalPaid = paidByName(p.name);
            const left = Math.max(CONTRACT - totalPaid, 0);
            const done = left === 0;
            return `<tr>
                <td>${i + 1}</td>
                <td>${escapeHtml(p.name)}</td>
                <td>${fmt(CONTRACT)}</td>
                <td>${fmt(p.amount)}</td>
                <td>${fmt(left)}</td>
                <td>${fmtDate(p.date)}</td>
                <td>${escapeHtml(p.giver || '-')}</td>
                <td>${escapeHtml(p.receiver || '-')}</td>
                <td><span class="badge ${done ? 'badge-success' : 'badge-danger'}">${done ? 'Толук төлөдү' : 'Карызы бар'}</span></td>
                <td><button class="btn-delete" data-id="${p.id}">Өчүрүү</button></td>
            </tr>`;
        }).join('');
    }
    updateStats();
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const amount = Number(document.getElementById('amount').value);
    if (!amount || amount <= 0) return;

    payments.push({
        id: Date.now(),
        name: document.getElementById('name').value.trim(),
        amount,
        date: document.getElementById('date').value,
        giver: document.getElementById('giver').value.trim(),
        receiver: document.getElementById('receiver').value.trim()
    });
    save();
    form.reset();
    render();
});

tableBody.addEventListener('click', e => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    if (!confirm('Бул төлөмдү өчүрөсүзбү?')) return;
    payments = payments.filter(p => p.id !== Number(btn.dataset.id));
    save();
    render();
});

searchInput.addEventListener('input', render);

render();
