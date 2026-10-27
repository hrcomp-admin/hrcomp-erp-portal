// Give the portal a stable browser browsing-context name for reuse.
window.name = 'hrcomp_erp_portal';
// 배포 경로 및 브라우저 캐시 불일치에 대비하여 동적으로 설정을 로드합니다.
let groups, destinations
try {
  const config = await import('./menu-config.js?v=20261027-fix1')
  groups = config.groups
  destinations = config.destinations
  if (!Array.isArray(groups) || !destinations || typeof destinations !== 'object') {
    throw new Error('메뉴 설정 형식이 올바르지 않습니다.')
  }
} catch (error) {
  const root = document.querySelector('#groups')
  if (root) root.innerHTML = '<p class="menu-notice menu-error">메뉴 설정을 불러오지 못했습니다. js/menu-config.js 파일의 배포 여부를 확인하십시오.</p>'
  console.error('[ERP Portal] menu-config.js load failed:', error)
  throw error
}
const root=document.querySelector('#groups')
root.replaceChildren()
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
// 사용자 정보는 인증 연계 전까지 임의의 이름을 표시하지 않습니다.
// 향후 검증된 인증 모듈에서 window.hrcompPortalSetUser(name)을 호출할 수 있습니다.
window.hrcompPortalSetUser = (name) => {
 const el = document.querySelector('#portalUser')
 if (el) el.textContent = typeof name === 'string' && name.trim() ? `${name.trim()} 님` : '사용자 정보 미연결'
}
for(const group of groups){
 const section=document.createElement('section');section.className='group'
 const heading=document.createElement('h3');heading.textContent=group.name;section.append(heading)
 const list=document.createElement('div');list.className='items'
 for(const [name,key] of group.items){
  const config=destinations[key];const enabled=Boolean(config?.enabled&&config?.url)
  const el=document.createElement('button');el.type='button';el.className=`item ${enabled?'active':'disabled'}`
  el.disabled=!enabled;el.setAttribute('aria-label',enabled?`${name} 실행`:`${name} WEB 준비 중`)
  el.innerHTML=`<span class="item-label">${escapeHtml(name)}</span><span class="status">${enabled?'열기 ↗':'준비 중'}</span>`
  if(enabled)el.addEventListener('click',()=>{
   // 업무별 고정된 탭 이름으로 기존 탭 재사용을 우선 시도.
   // noopener 옵션은 named target 재사용을 방해하므로 지정하지 않는다.
   const tabName='hrcomp_erp_'+key.replace(/[^a-zA-Z0-9_]/g,'_')
   const tab=window.open(config.url,tabName)
   if(tab)tab.focus()
  })
  list.append(el)
 }
 section.append(list);root.append(section)
}
