// Tiny i18n layer — no framework, just a dictionary + a couple of helpers.
// Static HTML text is marked with data-i18n / data-i18n-placeholder and
// gets filled in by applyStaticI18n(). Anything rendered dynamically from
// JS (app.js / team-select.js) calls t('key') directly instead.

const I18N_DICT = {
  zh: {
    tagline: '團隊活動基金管理小工具',
    joinLabel: '輸入組別代碼',
    joinPlaceholder: '例如 abc123',
    joinBtn: '進入',
    orDivider: '— 或 —',
    createLabel: '建立新組別（自訂代碼）',
    createPlaceholder: '例如 my-team（英文/數字/-，好記就好）',
    createHint: '這組代碼之後就是組別名稱，組員靠它加入，記得分享給大家。',
    createBtn: '建立',
    errJoinEmpty: '請輸入組別代碼',
    errJoinConn: '連線失敗：',
    errJoinNotFound: '找不到這個組別代碼',
    errCreatePattern: '代碼請用 3–30 個英文字母、數字或 -，不要用中文',
    errCreateTaken: '這個代碼已經有人用了，換一個試試',
    errCreateFail: '建立失敗：',

    switchTeam: '切換組別',
    teamCodeLabel: '組別代碼',
    tabDashboard: '總覽',
    tabMembers: '組員管理',
    tabQuota: '額度設定',
    tabUsage: '使用紀錄',

    teamOverviewTitle: '團隊總覽',
    statMemberCount: '組員人數',
    statTeamQuota: '本月團隊配額',
    statCarryIn: '上月結轉',
    statAvailable: '本月可用總額',
    statUsed: '本月已使用',
    statCarryOut: '可帶至下月',
    memberStatusTitle: '各組員本月狀況',
    colMember: '組員',
    colOwnQuota: '本月配額',
    colCarryIn: '上月結轉',
    colAvailable: '本月可用',
    colUsed: '本月已用',
    colCarryOut: '本月結餘（可帶至下月）',
    noMembers: '尚無組員',
    overSpent: '超支',

    addMemberTitle: '新增組員',
    memberNamePlaceholder: '組員姓名',
    addBtn: '新增',
    errMemberNameEmpty: '請輸入姓名',
    errMemberAddFail: '新增失敗：',
    memberListTitle: '組員名單',
    unitPeople: '人',
    colName: '姓名',
    colStatus: '狀態',
    colJoinedAt: '加入時間',
    statusActive: '啟用中',
    statusInactive: '已停用',
    btnDeactivate: '停用',
    btnActivate: '啟用',

    quotaSetTitle: '設定每月固定額度（每人）',
    effectiveMonth: '生效月份',
    quotaPerMember: '每人每月額度',
    saveBtn: '儲存',
    quotaHint: '設定後，該月份「起」的每月額度都會套用這個數字，直到有新的設定覆蓋為止。',
    errQuotaMonthEmpty: '請選擇生效月份',
    errAmountInvalid: '請輸入正確金額',
    errQuotaSaveFail: '儲存失敗：',
    quotaHistoryTitle: '額度歷史',
    noQuotaSet: '尚未設定',

    addUsageTitle: '新增使用紀錄',
    monthLabel: '月份',
    noteLabel: '備註（選填，套用到這次全部紀錄）',
    notePlaceholder: '例如：團隊聚餐',
    splitAmountLabel: '分攤金額',
    splitAmountPlaceholder: '輸入總金額',
    applySplitBtn: '平均分攤到下面勾選的組員',
    splitHint: '預設全部組員勾選、平均分攤；取消勾選可排除某人，或直接手動改每個人的金額。',
    colJoin: '參加',
    colSplitAmount: '金額（分攤）',
    colExtraAmount: '額外費用（不分攤）',
    extraHint: '「額外費用」跟分攤無關，每個組員都可以各自填，自己單獨記一筆。',
    submitBtn: '送出',
    errMonthEmpty: '請選擇月份',
    errSplitTotalInvalid: '請輸入正確的分攤總金額',
    errNoMemberChecked: '請至少勾選一位組員',
    errNoRecords: '請至少填一個金額（分攤或額外費用）',
    errUsageAddFail: '新增失敗：',
    noMembersAddFirst: '尚無組員，先到「組員管理」新增',
    usageListTitle: '紀錄列表',
    colAmount: '金額',
    colNote: '備註',
    deleteBtn: '刪除',
    noRecords: '尚無紀錄',
    tagExtraCost: '額外費用（不分攤）',
    deletedMember: '（已刪除）',
  },
  en: {
    tagline: 'A small tool for managing your team bonding fund',
    joinLabel: 'Enter team code',
    joinPlaceholder: 'e.g. abc123',
    joinBtn: 'Enter',
    orDivider: '— or —',
    createLabel: 'Create a new team (custom code)',
    createPlaceholder: 'e.g. my-team (letters/numbers/-, keep it memorable)',
    createHint: 'This code also becomes the team name — members use it to join, so share it with everyone.',
    createBtn: 'Create',
    errJoinEmpty: 'Please enter a team code',
    errJoinConn: 'Connection failed: ',
    errJoinNotFound: 'No team found with that code',
    errCreatePattern: 'Code must be 3–30 letters, numbers or -, no Chinese characters',
    errCreateTaken: 'That code is already taken — try another',
    errCreateFail: 'Failed to create: ',

    switchTeam: 'Switch team',
    teamCodeLabel: 'Team code',
    tabDashboard: 'Dashboard',
    tabMembers: 'Members',
    tabQuota: 'Quota',
    tabUsage: 'Usage Log',

    teamOverviewTitle: 'Team Overview',
    statMemberCount: 'Members',
    statTeamQuota: "This Month's Quota",
    statCarryIn: 'Carried In',
    statAvailable: 'Available',
    statUsed: 'Used This Month',
    statCarryOut: 'Carry to Next Month',
    memberStatusTitle: "This Month, by Member",
    colMember: 'Member',
    colOwnQuota: 'Quota',
    colCarryIn: 'Carried In',
    colAvailable: 'Available',
    colUsed: 'Used',
    colCarryOut: 'Carry to Next Month',
    noMembers: 'No members yet',
    overSpent: 'overspent',

    addMemberTitle: 'Add Member',
    memberNamePlaceholder: 'Member name',
    addBtn: 'Add',
    errMemberNameEmpty: 'Please enter a name',
    errMemberAddFail: 'Failed to add: ',
    memberListTitle: 'Members',
    unitPeople: '',
    colName: 'Name',
    colStatus: 'Status',
    colJoinedAt: 'Joined',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    btnDeactivate: 'Deactivate',
    btnActivate: 'Activate',

    quotaSetTitle: 'Set Monthly Quota (per member)',
    effectiveMonth: 'Effective month',
    quotaPerMember: 'Quota per member',
    saveBtn: 'Save',
    quotaHint: 'Once saved, this amount applies from that month onward, until you set a new one.',
    errQuotaMonthEmpty: 'Please choose an effective month',
    errAmountInvalid: 'Please enter a valid amount',
    errQuotaSaveFail: 'Failed to save: ',
    quotaHistoryTitle: 'Quota History',
    noQuotaSet: 'Not set yet',

    addUsageTitle: 'Add Usage',
    monthLabel: 'Month',
    noteLabel: 'Note (optional, applies to everything below)',
    notePlaceholder: 'e.g. Team lunch',
    splitAmountLabel: 'Split Amount',
    splitAmountPlaceholder: 'Enter total amount',
    applySplitBtn: 'Split evenly among checked members',
    splitHint: 'All members are checked and split evenly by default — uncheck to exclude someone, or edit any amount by hand.',
    colJoin: 'Include',
    colSplitAmount: 'Amount (split)',
    colExtraAmount: 'Extra cost (not split)',
    extraHint: '"Extra cost" is independent of the split — each member can enter their own, recorded separately.',
    submitBtn: 'Submit',
    errMonthEmpty: 'Please choose a month',
    errSplitTotalInvalid: 'Please enter a valid total amount',
    errNoMemberChecked: 'Please check at least one member',
    errNoRecords: 'Please fill in at least one amount (split or extra cost)',
    errUsageAddFail: 'Failed to add: ',
    noMembersAddFirst: 'No members yet — add one under "Members" first',
    usageListTitle: 'Records',
    colAmount: 'Amount',
    colNote: 'Note',
    deleteBtn: 'Delete',
    noRecords: 'No records yet',
    tagExtraCost: 'Extra cost (not split)',
    deletedMember: '(deleted)',
  },
};

const TBF_LANG_KEY = 'tbf_lang';

function getLang() {
  return localStorage.getItem(TBF_LANG_KEY) || 'zh';
}

function setLang(lang) {
  localStorage.setItem(TBF_LANG_KEY, lang);
}

function t(key) {
  const lang = getLang();
  return (I18N_DICT[lang] && I18N_DICT[lang][key]) ?? I18N_DICT.zh[key] ?? key;
}

function localeTag() {
  return getLang() === 'en' ? 'en-US' : 'zh-Hant';
}

function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

function updateLangSwitcherUI() {
  const cur = getLang();
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active-lang', btn.dataset.lang === cur);
  });
}

function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.lang === getLang()) return;
      setLang(btn.dataset.lang);
      location.reload();
    });
  });
  updateLangSwitcherUI();
}

applyStaticI18n();
initLangSwitcher();
