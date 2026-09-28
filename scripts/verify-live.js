const BASE_URL = 'https://popto.vercel.app';

async function run() {
  console.log('====================================================');
  console.log('POPTO LIVE VERIFICATION:', BASE_URL);
  console.log('====================================================');

  // 1. Home
  const home = await fetch(BASE_URL);
  console.log('[1] Homepage HTTP Status:', home.status);
  const html = await home.text();
  console.log('    Length:', html.length);
  if (home.status !== 200) throw new Error('Home failed: ' + home.status);

  // 2. Stats & Catalog
  const stats = await (await fetch(BASE_URL + '/api/stats')).json();
  const prods = await (await fetch(BASE_URL + '/api/products')).json();
  const farms = await (await fetch(BASE_URL + '/api/farmers')).json();
  console.log('[2] Catalog API:', { stats: stats.success, isLiveDb: stats.data && stats.data.isLiveDb, prodsCount: prods.data && prods.data.length, farmsCount: farms.data && farms.data.length });
  if (!stats.success || !prods.data || prods.data.length === 0) throw new Error('Catalog failed');

  // 3. Customer Login
  const custLogin = await (await fetch(BASE_URL + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'rahul.sharma@example.com', password: 'Customer@123' }) })).json();
  console.log('[3] Customer Login:', { success: !!custLogin.token, role: custLogin.user && custLogin.user.role });
  if (!custLogin.token) throw new Error('Customer login failed');

  // 4. Seller Login
  const sellLogin = await (await fetch(BASE_URL + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'rajesh.patil@example.com', password: 'Farmer@123' }) })).json();
  console.log('[4] Seller Login:', { success: !!sellLogin.token, role: sellLogin.user && sellLogin.user.role });
  if (!sellLogin.token) throw new Error('Seller login failed');

  // 5. Admin Login
  const adminLogin = await (await fetch(BASE_URL + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@popto.local', password: 'ChangeThisAdminPassword' }) })).json();
  console.log('[5] Admin Login:', { success: !!adminLogin.token, role: adminLogin.user && adminLogin.user.role });
  if (!adminLogin.token) throw new Error('Admin login failed');

  // 6. Security: Unauth & Customer 403 on admin audit
  const unauth = await fetch(BASE_URL + '/api/admin/login-activity');
  const custBlock = await fetch(BASE_URL + '/api/admin/login-activity', { headers: { Authorization: 'Bearer ' + custLogin.token } });
  console.log('[6] RBAC Security:', { unauthenticated: unauth.status, customerRole: custBlock.status, expected: 403 });
  if (unauth.status !== 403 || custBlock.status !== 403) throw new Error('RBAC audit failed');

  // 7. Admin-Only Login Activity Payload
  const actRes = await fetch(BASE_URL + '/api/admin/login-activity', { headers: { Authorization: 'Bearer ' + adminLogin.token } });
  const act = await actRes.json();
  console.log('[7] Admin Login Activity:', { status: actRes.status, total: act.total || (act.data && act.data.length), sampleEvent: act.data && act.data[0] });
  if (actRes.status !== 200 || !act.data || act.data.length === 0) throw new Error('Admin login activity empty or failed');

  // 8. ABSOLUTE PASSWORD PRIVACY
  const str = JSON.stringify(act).toLowerCase();
  if (str.includes('password_hash') || str.includes('changethisadminpassword') || str.includes('customer@123') || str.includes('farmer@123')) {
    throw new Error('SECURITY ALERT: Password or hash found in login activity payload!');
  }
  console.log('[8] Password Privacy: ZERO password or hash exposure verified.');

  // 9. CSV Export Sanitization
  const csvRes = await fetch(BASE_URL + '/api/admin/login-activity?export=csv', { headers: { Authorization: 'Bearer ' + adminLogin.token } });
  const csv = await csvRes.text();
  console.log('[9] CSV Export Status:', csvRes.status, 'Headers:', csv.split('\n')[0]);
  if (csv.toLowerCase().includes('password')) throw new Error('Password in CSV export!');

  console.log('====================================================');
  console.log('ALL 9 LIVE PRODUCTION VERIFICATION TESTS PASSED!');
  console.log('====================================================');
}
run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
