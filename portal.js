import { groups, destinations } from './menu-config.js';
window.name = 'hrcomp_erp_portal';
const root = document.getElementById('groups');
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try {
  if (!root || !Array.isArray(groups)) throw new Error('메뉴 데이터 또는 화면 영역이 없습니다.');
  for (const group of groups) {
    const section = document.createElement('section'); section.className = 'group';
    const heading = document.createElement('h3'); heading.textContent = group.name; section.append(heading);
    const list = document.createElement('div'); list.className = 'items';
    for (const [name, key] of group.items) {
      const config = destinations[key]; const enabled = Boolean(config?.enabled && config?.url);
      const el = document.createElement('button'); el.type = 'button';
      el.className = `item ${enabled ? 'active' : 'disabled'}`;
      el.disabled = !enabled; el.setAttribute('aria-label', enabled ? `${name} 실행` : `${name} WEB 준비 중`);
      el.innerHTML = `<span class="item-label">${escapeHtml(name)}</span><span class="status">${enabled ? '열기 ↗' : '준비 중'}</span>`;
      if (enabled) el.addEventListener('click', () => {
        const tabName = 'hrcomp_erp_' + key.replace(/[^a-zA-Z0-9_]/g, '_');
        const tab = window.open(config.url, tabName); if (tab) tab.focus();
      });
      list.append(el);
    }
    section.append(list); root.append(section);
  }
} catch (error) {
  console.error('포털 메뉴 생성 실패', error);
  if (root) {root.textContent = `메뉴 표시 실패: ${error.message}`; root.classList.add('error');}
}
