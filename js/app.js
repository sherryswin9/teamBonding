const state = {
  teamId: null,
  teamCode: null,
  teamName: null,
  members: [],
  quotaHistory: [],
  usageLog: [],
};

function fmt(n) {
  return Number(n || 0).toLocaleString('zh-Hant');
}

function requireTeam() {
  const id = localStorage.getItem('tbf_team_id');
  if (!id) { location.href = 'index.html'; return false; }
  state.teamId = id;
  state.teamCode = localStorage.getItem('tbf_team_code');
  state.teamName = localStorage.getItem('tbf_team_name');
  return true;
}

function renderTopbar() {
  document.getElementById('team-info').textContent = `組別代碼：${state.teamCode}`;
}

document.getElementById('switch-team-btn').addEventListener('click', () => {
  localStorage.removeItem('tbf_team_id');
  localStorage.removeItem('tbf_team_code');
  localStorage.removeItem('tbf_team_name');
  location.href = 'index.html';
});

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
  });
});

// ---------- Data loading ----------
async function loadAll() {
  const [membersRes, quotaRes, usageRes] = await Promise.all([
    sb.from('members').select('*').eq('team_id', state.teamId).order('created_at'),
    sb.from('monthly_quota').select('*').eq('team_id', state.teamId).order('effective_month'),
    sb.from('usage_log').select('*').eq('team_id', state.teamId).order('month', { ascending: false }),
  ]);
  state.members = membersRes.data || [];
  state.quotaHistory = quotaRes.data || [];
  state.usageLog = usageRes.data || [];
}

// ---------- Dashboard ----------
function earliestTeamMonth() {
  const months = [
    ...state.quotaHistory.map((q) => TBFCalc.toMonthKey(q.effective_month)),
    ...state.usageLog.map((u) => TBFCalc.toMonthKey(u.month)),
    ...state.members.map((m) => TBFCalc.toMonthKey(m.created_at)),
  ];
  if (months.length === 0) return TBFCalc.currentMonthKey();
  return months.reduce((min, m) => (TBFCalc.compareMonth(m, min) < 0 ? m : min));
}

function usageByMonthFor(memberId) {
  const map = {};
  for (const u of state.usageLog) {
    if (u.member_id !== memberId) continue;
    const mk = TBFCalc.toMonthKey(u.month);
    map[mk] = (map[mk] || 0) + Number(u.amount);
  }
  return map;
}

function ledgerForMember(member, uptoMonth) {
  const startMonth = TBFCalc.toMonthKey(member.created_at);
  const teamStart = earliestTeamMonth();
  const start = TBFCalc.compareMonth(startMonth, teamStart) < 0 ? teamStart : startMonth;
  return TBFCalc.buildLedger({
    startMonth: start,
    endMonth: uptoMonth,
    quotaHistory: state.quotaHistory,
    usageByMonth: usageByMonthFor(member.id),
  });
}

function populateMonthSelector() {
  const sel = document.getElementById('dashboard-month');
  const cur = TBFCalc.currentMonthKey();
  const start = earliestTeamMonth();
  const end = TBFCalc.addMonths(cur, 1); // allow peeking one month ahead
  const months = TBFCalc.monthsBetween(start, end).reverse();
  sel.innerHTML = months
    .map((m) => `<option value="${m}" ${m === cur ? 'selected' : ''}>${TBFCalc.formatMonthLabel(m)}</option>`)
    .join('');
}

function renderDashboard() {
  const monthKey = document.getElementById('dashboard-month').value || TBFCalc.currentMonthKey();
  const activeMembers = state.members.filter((m) => m.active);

  let teamOwnQuota = 0, teamCarryIn = 0, teamUsed = 0, teamCarryOut = 0;
  const rowsHtml = activeMembers
    .map((m) => {
      const ledger = ledgerForMember(m, monthKey);
      const row = ledger[ledger.length - 1];
      if (!row) return '';
      teamOwnQuota += row.ownQuota;
      teamCarryIn += row.incomingCarry;
      teamUsed += row.used;
      teamCarryOut += row.carryToNextMonth;
      return `<tr>
        <td>${escapeHtml(m.name)}</td>
        <td>${fmt(row.ownQuota)}</td>
        <td>${fmt(row.incomingCarry)}</td>
        <td>${fmt(row.totalAvailable)}</td>
        <td>${fmt(row.used)}</td>
        <td class="${row.balance < 0 ? 'value neg' : ''}">${fmt(row.carryToNextMonth)}${row.balance < 0 ? '（超支 ' + fmt(-row.balance) + '）' : ''}</td>
      </tr>`;
    })
    .join('');
  document.getElementById('member-rows').innerHTML = rowsHtml || '<tr><td colspan="6" class="muted">尚無組員</td></tr>';

  const teamAvailable = teamOwnQuota + teamCarryIn;
  document.getElementById('team-summary').innerHTML = `
    <div class="stat"><div class="label">組員人數</div><div class="value">${activeMembers.length}</div></div>
    <div class="stat"><div class="label">本月團隊配額</div><div class="value">${fmt(teamOwnQuota)}</div></div>
    <div class="stat"><div class="label">上月結轉</div><div class="value">${fmt(teamCarryIn)}</div></div>
    <div class="stat"><div class="label">本月可用總額</div><div class="value">${fmt(teamAvailable)}</div></div>
    <div class="stat"><div class="label">本月已使用</div><div class="value">${fmt(teamUsed)}</div></div>
    <div class="stat"><div class="label">可帶至下月</div><div class="value">${fmt(teamCarryOut)}</div></div>
  `;
}

document.getElementById('dashboard-month').addEventListener('change', renderDashboard);

// ---------- Members ----------
function renderMembersList() {
  document.getElementById('member-count').textContent = state.members.filter((m) => m.active).length;
  document.getElementById('members-list').innerHTML = state.members
    .map((m) => `
      <tr>
        <td>${escapeHtml(m.name)}</td>
        <td><span class="badge ${m.active ? '' : 'off'}">${m.active ? '啟用中' : '已停用'}</span></td>
        <td class="muted">${new Date(m.created_at).toLocaleDateString('zh-Hant')}</td>
        <td><button class="secondary" data-toggle-member="${m.id}" data-active="${m.active}">${m.active ? '停用' : '啟用'}</button></td>
      </tr>
    `)
    .join('') || '<tr><td colspan="4" class="muted">尚無組員</td></tr>';

  document.querySelectorAll('[data-toggle-member]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-toggle-member');
      const active = btn.getAttribute('data-active') === 'true';
      await sb.from('members').update({ active: !active }).eq('id', id);
      await refreshAndRender();
    });
  });
}

document.getElementById('add-member-btn').addEventListener('click', async () => {
  const input = document.getElementById('new-member-name');
  const errEl = document.getElementById('member-error');
  errEl.textContent = '';
  const name = input.value.trim();
  if (!name) { errEl.textContent = '請輸入姓名'; return; }
  const { error } = await sb.from('members').insert({ team_id: state.teamId, name });
  if (error) { errEl.textContent = '新增失敗：' + error.message; return; }
  input.value = '';
  await refreshAndRender();
});

// ---------- Quota ----------
function renderQuotaHistory() {
  const rows = [...state.quotaHistory]
    .sort((a, b) => TBFCalc.compareMonth(TBFCalc.toMonthKey(b.effective_month), TBFCalc.toMonthKey(a.effective_month)))
    .map((q) => `<tr><td>${TBFCalc.formatMonthLabel(TBFCalc.toMonthKey(q.effective_month))}</td><td>${fmt(q.amount_per_member)}</td></tr>`)
    .join('');
  document.getElementById('quota-history').innerHTML = rows || '<tr><td colspan="2" class="muted">尚未設定</td></tr>';
}

document.getElementById('save-quota-btn').addEventListener('click', async () => {
  const monthInput = document.getElementById('quota-month').value; // 'YYYY-MM'
  const amountInput = document.getElementById('quota-amount').value;
  const errEl = document.getElementById('quota-error');
  errEl.textContent = '';
  if (!monthInput) { errEl.textContent = '請選擇生效月份'; return; }
  const amount = Number(amountInput);
  if (Number.isNaN(amount) || amount < 0) { errEl.textContent = '請輸入正確金額'; return; }

  const { error } = await sb
    .from('monthly_quota')
    .upsert(
      { team_id: state.teamId, effective_month: TBFCalc.toMonthDate(monthInput), amount_per_member: amount },
      { onConflict: 'team_id,effective_month' }
    );
  if (error) { errEl.textContent = '儲存失敗：' + error.message; return; }
  await refreshAndRender();
});

// ---------- Usage ----------
function renderUsageMemberRows() {
  const tbody = document.getElementById('usage-member-rows');

  // Preserve whatever the user already typed/checked across re-renders
  // (e.g. triggered by switching tabs or another save elsewhere).
  const prevState = {};
  tbody.querySelectorAll('tr[data-member-id]').forEach((tr) => {
    prevState[tr.dataset.memberId] = {
      checked: tr.querySelector('.usage-member-check').checked,
      amount: tr.querySelector('.usage-member-amount').value,
    };
  });

  const activeMembers = state.members.filter((m) => m.active);
  tbody.innerHTML = activeMembers
    .map((m) => {
      const prev = prevState[m.id];
      const checked = prev ? prev.checked : true;
      const amount = prev ? prev.amount : '';
      return `
        <tr data-member-id="${m.id}">
          <td><input type="checkbox" class="usage-member-check" ${checked ? 'checked' : ''} /></td>
          <td>${escapeHtml(m.name)}</td>
          <td><input type="number" class="usage-member-amount" min="0" step="1" placeholder="0" style="width:100px" value="${amount}" /></td>
        </tr>
      `;
    })
    .join('') || '<tr><td colspan="3" class="muted">尚無組員，先到「組員管理」新增</td></tr>';
}

document.getElementById('apply-split-btn').addEventListener('click', () => {
  const errEl = document.getElementById('usage-error');
  errEl.textContent = '';
  const total = Number(document.getElementById('usage-split-amount').value);
  if (Number.isNaN(total) || total < 0) { errEl.textContent = '請輸入正確的分攤總金額'; return; }

  const checkedRows = [...document.querySelectorAll('#usage-member-rows tr[data-member-id]')]
    .filter((tr) => tr.querySelector('.usage-member-check').checked);
  if (checkedRows.length === 0) { errEl.textContent = '請至少勾選一位組員'; return; }

  const perPerson = Math.round((total / checkedRows.length) * 100) / 100;
  checkedRows.forEach((tr) => { tr.querySelector('.usage-member-amount').value = perPerson; });
});

document.getElementById('submit-usage-btn').addEventListener('click', async () => {
  const errEl = document.getElementById('usage-error');
  errEl.textContent = '';
  const monthInput = document.getElementById('usage-month').value;
  if (!monthInput) { errEl.textContent = '請選擇月份'; return; }
  const note = document.getElementById('usage-note').value.trim();

  const records = [];
  for (const tr of document.querySelectorAll('#usage-member-rows tr[data-member-id]')) {
    if (!tr.querySelector('.usage-member-check').checked) continue;
    const amountRaw = tr.querySelector('.usage-member-amount').value;
    if (amountRaw === '') continue;
    const amount = Number(amountRaw);
    if (Number.isNaN(amount) || amount <= 0) continue;
    records.push({
      team_id: state.teamId,
      member_id: tr.dataset.memberId,
      month: TBFCalc.toMonthDate(monthInput),
      amount,
      note: note || null,
    });
  }
  if (records.length === 0) { errEl.textContent = '請至少勾選一位組員並填金額'; return; }

  const { error } = await sb.from('usage_log').insert(records);
  if (error) { errEl.textContent = '新增失敗：' + error.message; return; }

  document.getElementById('usage-split-amount').value = '';
  document.getElementById('usage-note').value = '';
  document.querySelectorAll('#usage-member-rows .usage-member-amount').forEach((i) => { i.value = ''; });
  await refreshAndRender();
});

function renderUsageList() {
  const memberName = (id) => state.members.find((m) => m.id === id)?.name || '（已刪除）';
  document.getElementById('usage-list').innerHTML = state.usageLog
    .map((u) => `
      <tr>
        <td>${TBFCalc.formatMonthLabel(TBFCalc.toMonthKey(u.month))}</td>
        <td>${escapeHtml(memberName(u.member_id))}</td>
        <td>${fmt(u.amount)}</td>
        <td class="muted">${escapeHtml(u.note || '')}</td>
        <td><button class="danger" data-delete-usage="${u.id}">刪除</button></td>
      </tr>
    `)
    .join('') || '<tr><td colspan="5" class="muted">尚無紀錄</td></tr>';

  document.querySelectorAll('[data-delete-usage]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete-usage');
      await sb.from('usage_log').delete().eq('id', id);
      await refreshAndRender();
    });
  });
}

// ---------- Glue ----------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

async function refreshAndRender() {
  await loadAll();
  populateMonthSelector();
  renderDashboard();
  renderMembersList();
  renderQuotaHistory();
  renderUsageMemberRows();
  renderUsageList();
}

(async function init() {
  if (!requireTeam()) return;
  renderTopbar();

  const cur = TBFCalc.currentMonthKey();
  document.getElementById('quota-month').value = cur;
  document.getElementById('usage-month').value = cur;

  await refreshAndRender();
})();
