function normalizeCode(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, '-');
}

const CODE_PATTERN = /^[a-z0-9-]{3,30}$/;

function goToApp(team) {
  localStorage.setItem('tbf_team_id', team.id);
  localStorage.setItem('tbf_team_code', team.code);
  localStorage.setItem('tbf_team_name', team.name || '');
  location.href = 'app.html';
}

// If already have a team saved, skip straight to the app.
(function autoRedirect() {
  const savedId = localStorage.getItem('tbf_team_id');
  if (savedId) location.href = 'app.html';
})();

document.getElementById('join-btn').addEventListener('click', async () => {
  const codeInput = document.getElementById('join-code');
  const errEl = document.getElementById('join-error');
  errEl.textContent = '';
  const code = codeInput.value.trim().toLowerCase();
  if (!code) { errEl.textContent = t('errJoinEmpty'); return; }

  const { data, error } = await sb.from('teams').select('*').eq('code', code).maybeSingle();
  if (error) { errEl.textContent = t('errJoinConn') + error.message; return; }
  if (!data) { errEl.textContent = t('errJoinNotFound'); return; }
  goToApp(data);
});

document.getElementById('create-btn').addEventListener('click', async () => {
  const codeInput = document.getElementById('new-team-code');
  const errEl = document.getElementById('create-error');
  errEl.textContent = '';
  const code = normalizeCode(codeInput.value);

  if (!CODE_PATTERN.test(code)) {
    errEl.textContent = t('errCreatePattern');
    return;
  }

  const { data, error } = await sb
    .from('teams')
    .insert({ code, name: code })
    .select()
    .single();
  if (error) {
    errEl.textContent = error.code === '23505' ? t('errCreateTaken') : t('errCreateFail') + error.message;
    return;
  }
  goToApp(data);
});
