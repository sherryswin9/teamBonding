function genCode() {
  return Math.random().toString(36).slice(2, 8);
}

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
  if (!code) { errEl.textContent = '請輸入組別代碼'; return; }

  const { data, error } = await sb.from('teams').select('*').eq('code', code).maybeSingle();
  if (error) { errEl.textContent = '連線失敗：' + error.message; return; }
  if (!data) { errEl.textContent = '找不到這個組別代碼'; return; }
  goToApp(data);
});

document.getElementById('create-btn').addEventListener('click', async () => {
  const nameInput = document.getElementById('new-team-name');
  const errEl = document.getElementById('create-error');
  errEl.textContent = '';
  const name = nameInput.value.trim();

  let attempts = 0;
  while (attempts < 5) {
    const code = genCode();
    const { data, error } = await sb
      .from('teams')
      .insert({ code, name: name || null })
      .select()
      .single();
    if (!error) { goToApp(data); return; }
    if (error.code !== '23505') { // not a unique-violation, give up
      errEl.textContent = '建立失敗：' + error.message;
      return;
    }
    attempts++;
  }
  errEl.textContent = '建立失敗，請再試一次';
});
