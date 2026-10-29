import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js'

const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})
const panel = document.querySelector('#password-panel')
const params = new URLSearchParams(location.search)
let recovery = false
function message(text, error = false) {
  const el = document.querySelector('#password-message')
  if (!el) return
  el.textContent = text
  el.classList.toggle('error', error)
}
function frame(title, body) {
  panel.innerHTML = `<div class="login-brand">HR COMP</div><h2>${title}</h2>${body}<div class="message" id="password-message" role="status"></div>`
}
function resetRequest() {
  frame('비밀번호 등록 · 재등록', `<p>등록된 이메일로 비밀번호 재설정 링크를 보내드립니다. 메일의 링크로 본인확인 후 새 비밀번호를 설정하십시오.</p><form id="reset-request"><label for="reset-email">등록된 이메일</label><input id="reset-email" type="email" autocomplete="email" required><div class="actions"><a href="./index.html">취소</a><button class="primary" id="reset-send" type="submit">인증 메일 발송</button></div></form>`)
  document.querySelector('#reset-request').addEventListener('submit', async e => {
    e.preventDefault()
    const button = document.querySelector('#reset-send'); button.disabled = true
    const email = document.querySelector('#reset-email').value.trim()
    try {
      const redirectTo = new URL('./password.html', location.href).href
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      message('계정이 등록되어 있고 메일 발송이 허용된 경우 인증 메일이 발송됩니다. 받은 편지함을 확인하십시오.')
    } catch (err) {
      console.error('Password reset request:', err)
      message('메일 발송 요청을 처리하지 못했습니다. 잠시 후 다시 시도하십시오.', true)
    } finally { button.disabled = false }
  })
}
function setPassword(mode) {
  frame(mode === 'recovery' ? '새 비밀번호 등록' : '비밀번호 변경', `<p>${mode === 'recovery' ? '이메일 인증이 완료되었습니다.' : '현재 비밀번호를 확인한 뒤 변경합니다.'}</p><form id="password-form">${mode === 'change' ? '<label for="current-password">현재 비밀번호</label><input id="current-password" type="password" autocomplete="current-password" required>' : ''}<label for="new-password">신규 비밀번호</label><input id="new-password" type="password" autocomplete="new-password" minlength="8" required><label for="confirm-password">비밀번호 확인</label><input id="confirm-password" type="password" autocomplete="new-password" minlength="8" required><div class="actions"><a href="./index.html">취소</a><button class="primary" id="password-save" type="submit">${mode === 'recovery' ? '등록저장' : '변경저장'}</button></div></form>`)
  document.querySelector('#password-form').addEventListener('submit', async e => {
    e.preventDefault()
    const button = document.querySelector('#password-save')
    const password = document.querySelector('#new-password').value
    const confirm = document.querySelector('#confirm-password').value
    if (password.length < 8 || /\s/.test(password)) { message('비밀번호는 8자 이상이며 공백을 포함할 수 없습니다.', true); return }
    if (password !== confirm) { message('새 비밀번호와 확인값이 일치하지 않습니다.', true); return }
    button.disabled = true
    try {
      if (mode === 'change') {
        const { data: { user }, error: userError } = await client.auth.getUser()
        if (userError || !user?.email) throw new Error('로그인이 필요합니다.')
        const current = document.querySelector('#current-password').value
        if (current === password) { message('현재 비밀번호와 다른 비밀번호를 입력하십시오.', true); return }
        const { error: signError } = await client.auth.signInWithPassword({ email: user.email, password: current })
        if (signError) { message('현재 비밀번호가 일치하지 않습니다.', true); return }
      } else if (!recovery) throw new Error('이메일 인증이 필요합니다.')
      if (!window.confirm('비밀번호를 실제로 저장하시겠습니까?')) return
      const { error } = await client.auth.updateUser({ password })
      if (error) throw error
      document.querySelector('#password-form').reset()
      message('비밀번호가 저장되었습니다. 포털로 돌아가 로그인하십시오.')
    } catch (err) { console.error('Password update:', err); message('비밀번호 저장에 실패했습니다. 인증 상태를 확인하십시오.', true) }
    finally { button.disabled = false }
  })
}
async function start() {
  const mode = params.get('mode')
  // Recovery token은 URL의 hash/query로 전달되며 Supabase가 세션으로 교환합니다.
  // 초기화 중 PASSWORD_RECOVERY 이벤트를 수신합니다.
  if (mode !== 'change') resetRequest()
  client.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') { recovery = true; setPassword('recovery') }
  })
  if (mode === 'change') {
    const { data: { user } } = await client.auth.getUser()
    if (!user) { frame('비밀번호 변경', '<p>로그인 후 이용할 수 있습니다.</p><div class="actions"><a href="./index.html">포털 로그인</a></div>'); return }
    setPassword('change'); return
  }
  // 인증 링크가 이미 처리되어 PASSWORD_RECOVERY 이벤트가 앞서 발생한 경우 대비
  if (location.hash.includes('type=recovery') || params.get('type') === 'recovery') {
    const { data: { session } } = await client.auth.getSession()
    if (session) { recovery = true; setPassword('recovery') }
  }
}
start().catch(err => { console.error(err); frame('비밀번호관리', '<p>초기화에 실패했습니다. 다시 접속하십시오.</p>') })
