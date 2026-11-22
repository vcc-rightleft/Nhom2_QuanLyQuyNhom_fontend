/* SQUAD.CASH — MySQL is reached ONLY through authenticated FastAPI.
   Never persist financial state as a browser-side source of truth. */
const SQUAD_API_BASE = 'http://127.0.0.1:8000';
const SQUAD_TOKEN_KEY = 'squad_cash_token';
let squadSelectedGroupId = null;

function escapeSquadHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
}
function selectedSquadGroup() {
  return userJoinedGroups.find(g => g.id === squadSelectedGroupId) || null;
}
function requireActiveHostGroup() {
  const group = selectedSquadGroup();
  if (!group || group.role !== 'HOST') throw new Error('Chọn nhóm mà bạn là Host trước khi thực hiện thao tác này.');
  return group;
}
async function squadApi(path, {method='GET', body} = {}) {
  const token = sessionStorage.getItem(SQUAD_TOKEN_KEY);
  const response = await fetch(SQUAD_API_BASE + path, {
    method,
    headers: {'Content-Type':'application/json', ...(token ? {Authorization:'Bearer ' + token} : {})},
    ...(body !== undefined ? {body: JSON.stringify(body)} : {})
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = json.detail;
    throw new Error(typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail.map(x=>x.msg).join('; ') : `HTTP ${response.status}`));
  }
  return json;
}
function applyServerGroups(groups) {
  userJoinedGroups = groups.map(g=>({
    id:Number(g.group_id), name:g.group_name, inviteCode:'',
    host:g.role === 'HOST' ? (squadSession?.name || 'Tôi') : 'Host',
    members:Number(g.member_count || 0), status:'Hoạt động',
    balance:Number(g.fund_balance || 0), role:g.role
  }));
  if (typeof renderUserWorkspace === 'function') renderUserWorkspace();
}
async function refreshServerGroups(preferredId = null) {
  if (!isSquadSignedIn()) return;
  const result = await squadApi('/api/groups/my-groups');
  if (!Array.isArray(result)) throw new Error('API danh sách nhóm trả dữ liệu không hợp lệ');
  applyServerGroups(result);
  const preferred = preferredId == null ? squadSelectedGroupId : Number(preferredId);
  const next = userJoinedGroups.find(g => g.id === preferred) || userJoinedGroups[0];
  if (next) await selectSquadGroup(next.id);
  else {
    squadSelectedGroupId = null;
    clearSquadWorkingData(); // clears groups too; there are none
    renderUserWorkspace();
    renderHostWorkspace();
  }
}
function mapDebtFromServer(d, name) {
  return {
    id: 'DBT-' + d.id,
    userId: String(d.debtor_id), memberName: d.debtor_name || name,
    type: d.source_type === 'INVOICE' ? 'invoice' : 'fund',
    typeLabel: d.source_type === 'INVOICE' ? 'Hóa đơn' : 'Đợt thu',
    desc: d.source_type === 'INVOICE' ? 'Khoản nợ từ hóa đơn' : 'Khoản nợ quỹ',
    date: d.created_at?.slice(0,10) || '',
    total:Number(d.amount || 0), paid:Number(d.paid_amount || 0),
    disputed:false
  };
}
async function selectSquadGroup(id) {
  const group = userJoinedGroups.find(g => g.id === Number(id));
  if (!group) throw new Error('Nhóm không thuộc danh sách của bạn');
  // Clear the previous group's financial details before loading another group.
  groupMembers.length = 0;
  groupDebts = [];
  groupInvoices = [];
  fundTransactions = [];
  currentGroupSingleCode = '';
  squadSelectedGroupId = group.id;
  renderUserWorkspace();
  renderHostWorkspace();

  const base = '/api/groups/' + group.id;
  const [detail, members, overview, billPage, myDebts, hostDebts] = await Promise.all([
    squadApi(base),
    squadApi(base + '/members'),
    squadApi(base + '/fund-overview'),
    squadApi('/api/bills/groups/' + group.id + '?page_size=100'),
    squadApi('/api/debts/owed-by-me/' + encodeURIComponent(squadSession.accountId) + '?group_id=' + group.id),
    group.role === 'HOST' ? squadApi(base + '/debts') : Promise.resolve(null)
  ]);
  const myId = Number(squadSession.accountId);
  group.inviteCode = group.role === 'HOST' ? (detail.invite_code || '') : '';
  currentGroupSingleCode = group.inviteCode;
  group.balance = Number(overview.balance?.balance ?? overview.balance ?? 0);
  groupMembers.push(...members.map(m => ({
    id: Number(m.user_id), name:m.full_name || 'Thành viên #'+m.user_id,
    handle:'#'+m.user_id, role:m.role === 'HOST' ? 'Host' : 'User', joined:'—'
  })));
  const memberNameById = new Map(groupMembers.map(m => [Number(m.id), m.name]));
  fundTransactions = (overview.transactions || []).filter(tx => tx.status !== 'CANCELLED').map(tx => ({
    id:'TX-'+tx.transaction_id, type:tx.type === 'INCOME' ? 'in' : 'out',
    desc:tx.description || tx.category || 'Giao dịch quỹ',
    method:tx.category || 'Quỹ chung', author:memberNameById.get(Number(tx.created_by)) || 'Thành viên #'+tx.created_by,
    time:(tx.occurred_at || '').replace('T',' ').slice(0,16), amount:Number(tx.amount || 0)
  }));
  const bills = Array.isArray(billPage.items) ? billPage.items : [];
  const details = await Promise.all(bills.map(b => squadApi('/api/bills/' + b.id)));
  groupInvoices = bills.map((bill, idx) => {
    const billDetail = details[idx];
    const myShare = (billDetail.shares || []).find(s => Number(s.member_id) === myId)?.amount || 0;
    return {
      id:'INV-'+bill.id, merchant:bill.title, date:bill.bill_date?.slice(0,10) || '',
      mode:(bill.split_type || 'EQUAL').toLowerCase(), modeLabel:bill.split_type || 'EQUAL',
      total:Number(bill.total_amount || 0), myShare:Number(myShare),
      items:(billDetail.items || []).map(it => ({name:it.name, qty:it.quantity, assigned:(it.consumer_user_ids || []).map(uid=>memberNameById.get(Number(uid))||('#'+uid)).join(', '),price:Number(it.line_total||0)}))
    };
  });
  groupDebts = (hostDebts || myDebts || []).map(d => mapDebtFromServer(d, squadSession.name));
  renderUserWorkspace();
  renderHostWorkspace();
  // Pick active group in the Host workspace without a fake additional group.
  const chosen = document.getElementById('squadGroupSelector');
  if (chosen) chosen.value = String(group.id);
  const label = document.getElementById('squadSelectedGroupBadge');
  if (label) label.textContent = group.name + ' (#' + group.id + ')';
  return group;
}
