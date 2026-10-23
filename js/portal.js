import {groups, destinations} from './menu-config.js'
const root=document.querySelector('#groups')
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const mobile=()=>window.matchMedia('(max-width: 700px)').matches
function updateMode(){document.querySelector('#mode').textContent=mobile()?'모바일 · 새 탭 열기':'PC · 새 탭 열기'}
updateMode(); window.addEventListener('resize',updateMode)
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
   // PC·모바일 공통: 포털은 유지하고 업무 모듈을 새 탭에서 실행.
   window.open(config.url,'_blank','noopener,noreferrer')
  })
  list.append(el)
 }
 section.append(list);root.append(section)
}
