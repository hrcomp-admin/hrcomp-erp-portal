// WEB ERP 포털 메뉴 설정: 새 모듈 추가 시 이 파일의 URL과 enabled를 설정합니다.
// 기존 VBA 메뉴 23개를 포함합니다. 로그인/접근권한은 각 모듈에서 별도 검증합니다.
export const groups = [
 {name:'영업관리', icon:'▤', items:[['고객주문','order'],['고객주문납기관리','delivery'],['출하관리','shipment'],['거래명세서','note']]},
 {name:'재고관리', icon:'◫', items:[['현재재고','stock'],['재고실사','count']]},
 {name:'구매관리', icon:'▣', items:[['구매발주','purchase'],['구매입고','purchase-in']]},
 {name:'대금·마감', icon:'₩', items:[['세금계산서','tax'],['대금수금','receipt'],['미수금','receivable'],['월마감','close']]},
 {name:'기준정보', icon:'▦', items:[['공통코드','common'],['사원','employee'],['고객사','customer'],['구매처','vendor'],['부품','part'],['단가관리','price']]},
 {name:'운영·경영', icon:'◈', items:[['일정관리','schedule'],['품질관리','quality'],['DASHBOARD','dashboard']]},
 {name:'시스템관리', icon:'⚙', items:[['비번','password'],['권한','auth']]},
]
export const destinations = {
 order: { url:'https://hrcomp-admin.github.io/hrcomp-customer-order-pages/', enabled:true },
 part: { url:'https://hrcomp-admin.github.io/hrcomp-part-pages/', enabled:true },
 price: { url:'https://hrcomp-admin.github.io/hrcomp-price-pages/', enabled:true },
 delivery: { url:'https://hrcomp-admin.github.io/hrcomp-delivery-pages/', enabled:true },
 // 기존 모바일 저장소의 GitHub Pages 주소 확인 후 활성화하세요.
 stock: { url:'https://hr-comp.github.io/hrcomp-mobile/?menu=stock', enabled:true },
 // count: { url:'https://hr-comp.github.io/hrcomp-mobile/?menu=count', enabled:true },
}
