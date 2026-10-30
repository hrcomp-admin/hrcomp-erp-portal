// HR COMP WEB ERP 통합 포털 V2 — Supabase Auth + DB 메뉴
// 기존 업무별 고정 탭 이름을 유지합니다.
window.name = 'hrcomp_erp_portal'
// 비밀번호관리의 복귀 요청에만 응답합니다. 메뉴 실행/탭 관리에는 영향이 없습니다.
if (typeof BroadcastChannel !== 'undefined') {
  const portalReturnChannel = new BroadcastChannel('hrcomp_erp_portal_return')
  portalReturnChannel.onmessage = event => {
    const { type, requestId } = event.data || {}
    if (!requestId) return
    if (type === 'FIND_PORTAL') {
      portalReturnChannel.postMessage({ type: 'PORTAL_PRESENT', requestId })
    } else if (type === 'FOCUS_PORTAL') {
      window.focus() // 브라우저 정책에 따라 탭 활성화가 제한될 수 있습니다.
    }
  }
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js'

const root = document.querySelector('#groups')
const authPanel = document.querySelector('#auth-panel')
const status = document.querySelector('#portal-status')
const logoutButton = document.querySelector('#logout-button')
const userLabel = document.querySelector('#user-label')
const openedTabs = new Map()
let client
let authenticated = false

function setStatus(message, isError = false) {
  status.textContent = message
  status.classList.toggle('error', isError)
}
function updateMode() {
  const mode = document.querySelector('#mode')
  if (mode) mode.textContent = ''
}
window.addEventListener('resize', updateMode)
updateMode()

function emailFallbackEnabled() {
  return new URLSearchParams(location.search).get('login') === 'email'
}

function showLogin(message = '') {
  authenticated = false
  root.replaceChildren()
  document.querySelector('#portal-content').hidden = true
  logoutButton.hidden = true
  userLabel.textContent = ''
  authPanel.hidden = false
  authPanel.innerHTML = `
    <div class="login-card">
      <div class="login-brand">HR COMP</div>
      <h2>WEB ERP 로그인</h2>
      <p>등록된 사용자 계정으로 로그인하십시오.</p>
      <form id="login-form">
        <label for="login-id">${emailFallbackEnabled() ? '이메일 (검증용)' : '사번'}</label>
        <input id="login-id" type="${emailFallbackEnabled() ? 'email' : 'text'}" autocomplete="username" ${emailFallbackEnabled() ? '' : 'maxlength="20" autocapitalize="characters"'} required>
        <label for="login-password">비밀번호</label>
        <input id="login-password" type="password" autocomplete="current-password" required>
        <button type="submit" id="login-button">로그인</button>
        <div class="password-entry"><a href="./password.html?mode=reset">비밀번호관리</a></div>
        <div id="login-message" role="alert"></div>
      </form>
    </div>`
  document.querySelector('#login-message').textContent = message
  document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault()
    const button = document.querySelector('#login-button')
    const feedback = document.querySelector('#login-message')
    button.disabled = true
    feedback.textContent = ''
    try {
      const loginId = document.querySelector('#login-id').value.trim()
      const password = document.querySelector('#login-password').value
      if (emailFallbackEnabled()) {
        const { error } = await client.auth.signInWithPassword({ email: loginId, password })
        if (error) throw error
      } else {
        if (!/^HR[0-9]{3,}$/i.test(loginId)) throw new Error('사번 형식 오류')
        const response = await fetch(`${SUPABASE_URL}/functions/v1/employee-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_PUBLISHABLE_KEY
          },
          body: JSON.stringify({ emp_no: loginId.toUpperCase(), password })
        })
        if (!response.ok) throw new Error(`사번 인증 실패 (${response.status})`)
        const result = await response.json()
        if (!result.access_token || !result.refresh_token) throw new Error('인증 세션 누락')
        const { error } = await client.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token
        })
        if (error) throw error
      }
      await loadPortal()
    } catch (error) {
      feedback.textContent = '로그인 또는 메뉴 조회에 실패했습니다. 계정과 권한을 확인하십시오.'
      console.error('Portal sign-in:', error)
    } finally {
      button.disabled = false
    }
  })
}

function renderMenus(rows) {
  root.replaceChildren()
  const grouped = new Map()
  for (const row of rows) {
    if (!row.web_url || !row.web_group) continue
    if (!grouped.has(row.web_group)) grouped.set(row.web_group, [])
    grouped.get(row.web_group).push(row)
  }
  // 그룹 순서는 현행 포털 순서로 유지; 새로운 그룹은 뒤에 표시합니다.
  const order = ['영업관리', '재고관리', '구매관리', '대금·마감', '기준정보', '운영·경영', '시스템관리']
  const names = [...grouped.keys()].sort((a,b) => {
    const ai = order.indexOf(a), bi = order.indexOf(b)
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi) || a.localeCompare(b, 'ko')
  })
  for (const groupName of names) {
    const section = document.createElement('section')
    section.className = 'group'
    const heading = document.createElement('h3')
    heading.textContent = groupName
    section.append(heading)
    const list = document.createElement('div')
    list.className = 'items'
    for (const row of grouped.get(groupName).sort((a,b) => (a.web_sort_order ?? 999) - (b.web_sort_order ?? 999) || a.menu_id - b.menu_id)) {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'item active'
      el.setAttribute('aria-label', `${row.menu_name} 실행`)
      const label = document.createElement('span')
      label.className = 'item-label'
      label.textContent = row.menu_name
      const state = document.createElement('span')
      state.className = 'status'
      state.textContent = '열기 ↗'
      el.append(label, state)
      el.addEventListener('click', () => {
        if (!authenticated) { showLogin('로그인 세션이 종료되었습니다.'); return }
        // DB URL은 개발자가 등록한 신뢰된 HTTPS 주소만 실행합니다.
        let url
        try { url = new URL(row.web_url) } catch { setStatus('등록된 WEB 주소가 올바르지 않습니다.', true); return }
        if (url.protocol !== 'https:') { setStatus('HTTPS 주소만 실행할 수 있습니다.', true); return }
        const tabName = 'hrcomp_erp_' + String(row.menu_code).replace(/[^a-zA-Z0-9_]/g, '_')
        const tab = window.open(url.href, tabName)
        if (tab) { openedTabs.set(tabName, tab); tab.focus() }
        else setStatus('팝업이 차단되었습니다. 브라우저의 새 탭 허용 설정을 확인하십시오.', true)
      })
      list.append(el)
    }
    section.append(list)
    root.append(section)
  }
  setStatus(rows.length ? `사용 가능한 WEB 업무 메뉴 ${rows.length}개` : '접근 가능한 WEB 업무 메뉴가 없습니다.')
}

async function loadPortal() {
  const { data: { user }, error: userError } = await client.auth.getUser()
  if (userError || !user) { showLogin(); return }
  const { data, error } = await client.rpc('rpc_web_portal_menu_query')
  if (error) throw error
  authenticated = true
  authPanel.hidden = true
  document.querySelector('#portal-content').hidden = false
  logoutButton.hidden = false
  // 인증된 Auth 사용자와 연결된 사원만 표시합니다. 이메일은 노출하지 않습니다.
  userLabel.textContent = ''
  const { data: employee, error: employeeError } = await client
    .from('md_employee')
    .select('emp_no, emp_name')
    .eq('auth_user_id', user.id)
    .eq('active_yn', 'Y')
    .maybeSingle()
  if (employeeError) {
    console.warn('Portal employee label:', employeeError.message)
  } else if (employee) {
    userLabel.textContent = [employee.emp_no, employee.emp_name].filter(Boolean).join('-')
  }
  renderMenus(data || [])
}

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true
  try {
    const { error } = await client.auth.signOut()
    if (error) throw error
    for (const tab of openedTabs.values()) {
      try { if (!tab.closed) tab.close() } catch { /* 브라우저가 차단할 수 있음 */ }
    }
    openedTabs.clear()
    showLogin('로그아웃되었습니다.')
  } catch (error) {
    setStatus('로그아웃에 실패했습니다. 다시 시도하십시오.', true)
    console.error('Portal sign-out:', error)
  } finally {
    logoutButton.disabled = false
  }
})

async function initialize() {
  if (SUPABASE_URL.startsWith('REPLACE_') || SUPABASE_PUBLISHABLE_KEY.startsWith('REPLACE_')) {
    setStatus('js/supabase-config.js에 기존 Supabase URL과 공개 키를 설정하십시오.', true)
    return
  }
  client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  })
  // 다른 탭에서 로그아웃한 경우 포털을 잠급니다.
  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') showLogin('로그인 세션이 종료되었습니다.')
  })
  try { await loadPortal() }
  catch (error) {
    console.error('Portal initialization:', error)
    showLogin('메뉴 조회에 실패했습니다. 관리자에게 문의하십시오.')
  }
}
initialize()
