/* =========================================================
   주기율표 마스터 — SPA 본체
   - 탭 전환은 페이지를 다시 불러오지 않는 SPA 방식(해시 라우팅: #quiz 등)
   - 3D 엔진(three.js)은 전자 배치 탭을 열 때만 불러옴(코드 분할)
   ========================================================= */
import './style.css';
import { RAW } from './data/elements.js';
import { TREND } from './data/trends.js';
import { ECONF } from './data/econf.js';
import { initPWA } from './pwa.js';

let THREE=null;
async function loadThree(){ if(!THREE) THREE=await import('three'); return THREE; }

/* ============ 원소 데이터 ============
   기호|한글이름|영문이름|원자량|특징|활용
   원자량: IUPAC 표준 원자량(약식). [ ]는 가장 안정한 동위원소의 질량수 */


const CAT = {
  alkali:{ko:'알칼리 금속', z:[3,11,19,37,55,87]},
  alkaline:{ko:'알칼리 토금속', z:[4,12,20,38,56,88]},
  transition:{ko:'전이 금속', z:[]},
  post:{ko:'전이후 금속', z:[13,31,49,50,81,82,83,84,113,114,115,116]},
  metalloid:{ko:'준금속', z:[5,14,32,33,51,52]},
  nonmetal:{ko:'비금속', z:[1,6,7,8,15,16,34]},
  halogen:{ko:'할로젠', z:[9,17,35,53,85,117]},
  noble:{ko:'비활성 기체', z:[2,10,18,36,54,86,118]},
  lanthanide:{ko:'란타넘족', z:[]},
  actinide:{ko:'악티늄족', z:[]}
};
function catOf(z){
  if(z>=57&&z<=71) return 'lanthanide';
  if(z>=89&&z<=103) return 'actinide';
  for(const k in CAT) if(CAT[k].z.includes(z)) return k;
  return 'transition';
}
function posOf(z){ // [period, group|null]
  if(z===1) return [1,1]; if(z===2) return [1,18];
  if(z<=10){const i=z-3;return [2,i<2?i+1:i+11];}
  if(z<=18){const i=z-11;return [3,i<2?i+1:i+11];}
  if(z<=36) return [4,z-18];
  if(z<=54) return [5,z-36];
  if(z<=56) return [6,z-54]; if(z<=71) return [6,null]; if(z<=86) return [6,z-68];
  if(z<=88) return [7,z-86]; if(z<=103) return [7,null]; return [7,z-100];
}
const GAS=[1,2,7,8,9,10,17,18,36,54,86], LIQ=[35,80];
function stateOf(z){ if(z>=100) return '알 수 없음'; if(GAS.includes(z)) return '기체'; if(LIQ.includes(z)) return '액체'; return '고체'; }
function blockOf(e){ if(e.group===null) return 'f'; if(e.z===2||e.group<=2) return 's'; if(e.group>=13) return 'p'; return 'd'; }

const EL = RAW.trim().split('\n').map((line,i)=>{
  const [sym,ko,en,mass,feat,use]=line.split('|');
  const z=i+1, [period,group]=posOf(z);
  const e={z,sym,ko,en,mass,feat,use,period,group,cat:catOf(z),state:stateOf(z)};
  e.block=blockOf(e);
  return e;
});
const byZ = z=>EL[z-1];
const koShort = e=>e.ko.replace(/\(.*\)/,'');

/* ============ 영상 속 이야기 ============
   출처: 유튜브 「원소, 주기율표를 알면 뭐가 좋아요? 모르면 손해! (feat. 윤소희 배우) [취미는 과학/49화 확장판]」
   https://www.youtube.com/watch?v=dDte4j_lyww — 자동 생성 자막을 바탕으로 정리. ⚠️ 표시는 영상 발언을 바로잡거나 보충한 내용 */
const VIDEO_URL='https://www.youtube.com/watch?v=dDte4j_lyww';
const STORY = {
  1:'수소는 <b>우주에서 가장 많은 원소</b>이고, 우리 몸·연료 등 어디에나 있습니다. <b>미래 에너지(수소 에너지)</b>로도 기대를 받고 있다고 소개됩니다.',
  2:'천문학자들은 원소를 <b>수소, 헬륨, 그리고 나머지는 모두 \'금속\'</b>으로 부른다는 재미있는 이야기가 나옵니다. (천문학의 \'금속성(metallicity)\' 개념)',
  3:'1족(알칼리 금속)은 물에 넣으면 <b>수소 기체와 열이 나오며 폭발</b>하고, 물이 <b>알칼리성</b>으로 바뀝니다. 리튬은 희토류와 함께 <b>자원 전쟁</b>의 중심 원소로 언급됩니다.',
  4:'<b>제임스 웹 우주망원경</b>의 금색 벌집 모양 거울은 베릴륨으로 만들고 그 위에 금을 코팅했습니다. 우주로 보내야 해서 <b>가볍게 쓸 수 있는 금속</b>이 필요했기 때문입니다. 고급 스피커의 <b>트위터(고음 스피커)</b>에도 쓰입니다.<br>⚠️ 가루를 들이마시면 위험하며, 베릴륨은 국제암연구소(IARC)가 정한 <b>1군 발암물질</b>입니다. 맛이 달아서 한때 \'글루시늄\'이라고도 불렸습니다.',
  5:'유리에 붕소를 섞으면(붕규산 유리) 뜨거운 것과 차가운 것을 번갈아 담아도 잘 깨지지 않습니다.<br>⚠️ 영상에서는 "열팽창이 없다"고 했지만, 정확히는 열팽창이 <b>아주 작은</b> 것입니다.',
  6:'윤소희 배우가 장홍제 교수님과 닮은 원소로 고른 원소입니다. <b>흔하고 뻔해 보이지만 특별하고</b>, 여러 분야를 연결한다는 이유였습니다. 탄소는 <b>생명체의 근원</b>이고 연료의 바탕이며, 다이아몬드도 탄소입니다.',
  7:'윤소희 배우가 <b>가장 좋아하는 원소</b>입니다. 독일의 <b>프리츠 하버</b>가 공기 중의 질소로 암모니아를 만드는 방법을 개발해 <b>비료</b>로 생명을 키웠고, 한편으로는 나이트로 화합물 같은 <b>폭발물</b>에도 쓰입니다.',
  9:'플루오린(불소)은 반응성이 너무 커서, 순수하게 분리하려던 많은 화학자가 다치거나 목숨을 잃었습니다. 이들을 <b>\'플루오린 순교자\'</b>라고 부릅니다. 1886년 앙리 무아상이 처음으로 분리에 성공했습니다.',
  11:'<b>나트륨이냐 소듐이냐?</b> 영국의 <b>험프리 데이비</b>가 소다(soda)에서 찾아 \'소듐\'이라고 이름 붙였는데, 독일 논문에서 \'나트리움\'이라고 부르면서 퍼졌고, 우리나라에는 일본을 거쳐 <b>나트륨</b>으로 들어왔습니다. 원소 기호(Na)는 라틴어 이름에서 따옵니다. 학교에서 나트륨 조각을 물에 넣는 폭발 실험을 하기도 합니다.',
  12:'2족 <b>알칼리 토금속</b>의 \'토\'는 <b>흙 토(土)</b> 자입니다. 지구(땅)에 많다는 뜻이고, 물에 넣으면 물이 알칼리성이 됩니다. 영상에서는 잠들기 전에 <b>마그네슘</b> 영양제를 먹는 이야기도 나옵니다.',
  19:'포타슘(칼륨)도 <b>험프리 데이비</b>가 식물의 재(potash)에서 찾아 \'포타슘\'이라고 이름 붙였습니다. 독일식 이름 \'칼리움\'이 일본을 거쳐 우리나라에 <b>칼륨</b>으로 들어왔습니다. 나트륨처럼 물에 넣으면 폭발합니다.',
  32:'<b>게르마늄 팔찌·게르마늄 냄비</b>가 건강에 좋다는 이야기가 있지만, 영상에서는 <b>"전혀 효과가 없다"</b>고 말합니다. "차라리 그 돈으로 마그네슘이나 아연을 드시라"는 조언도 나옵니다. (현재 표기: 저마늄)',
  33:'비소는 역사적으로 <b>독살에 많이 쓰인 원소</b>입니다. 원소 상태로도 위험합니다.',
  34:'셀레늄은 우리 몸에 필요한 영양소이고, 가장 많이 쓰이는 곳으로 <b>비듬 샴푸</b>와 <b>복사기</b>가 소개됩니다. 셀레늄은 <b>빛을 받으면 전기가 흐르는 성질</b>이 있어, 복사기가 빛을 비춰 밝은 곳과 어두운 곳을 구분하는 원리에 쓰였습니다.',
  51:'안티모니는 뾰족뾰족한 광석인 <b>휘안석</b>에서 얻습니다. 먹으면 구토와 설사를 일으킵니다. 의사가 안티모니를 계속 처방해 <b>모차르트</b>가 탈수로 사망했다는 이야기가 있지만, 영상에서도 말하듯 <b>여러 가설 중 하나</b>일 뿐입니다.',
  43:'멘델레예프의 주기율표에서 <b>오랫동안 빈칸</b>으로 남아 있던 자리입니다. 모든 동위원소가 방사성이어서 붕괴하기 때문에 지구에서는 거의 사라진 상태였습니다. 그래서 사람이 직접 만들었고, <b>인공적으로 만든 최초의 원소</b>가 되었습니다(1937년).<br>⚠️ 영상에서는 이름이 "기술의 승리"라는 뜻이라고 했지만, 실제로는 그리스어 <b>technetos(인공의)</b>에서 왔습니다.',
  53:'상처에 바르는 <b>빨간약(포비돈 아이오딘)</b>의 성분입니다. 1811년 <b>해초를 태운 재</b>에서 처음 발견되었고, 미역에도 많이 들어 있습니다. 방사능 사고 때 아이오딘을 먹으면 갑상샘이 아이오딘으로 채워져, <b>방사성 아이오딘이 몸에 쌓이는 것을 줄여 줍니다</b>.<br>⚠️ <b>바로잡기</b>: 영상에서 "빨간약도 먹어도 상관없다"는 말이 나오지만, 빨간약은 <b>바르는 소독약이므로 먹으면 안 됩니다</b>. 방사선 비상 상황에서는 보건 당국의 지시에 따라 <b>아이오딘화 포타슘(KI) 정제</b>를 먹습니다.',
  78:'<b>백금(플래티넘) ≠ 화이트골드</b>입니다. 화이트골드(백색금)는 금에 다른 금속을 섞어 하얗게 만든 <b>합금</b>이라서, 되팔 때 다시 녹여 분리해야 하므로 값이 떨어집니다. 백금은 원소 자체입니다. 실험실에서는 <b>예쁜꼬마선충</b>을 옮길 때 <b>백금선</b>을 씁니다. 가늘고 부드러우며, 불로 금방 달궈 소독할 수 있고 녹슬지 않기 때문입니다.<br>⚠️ 영상에서는 백금이 금보다 비싸다고 했지만, 값은 시기에 따라 달라집니다. 최근 몇 년은 <b>금이 백금보다 비싼 경우가 많습니다</b>.',
  80:'수은은 <b>많은 금속과 잘 섞여 \'아말감\'</b>이라는 합금을 만듭니다. 그래서 영상에서는 "누구와도 잘 어울리는" 사람과 닮은 원소로 소개됩니다. 단, 독성이 있습니다.',
  84:'<b>퀴리 부부</b>가 발견했습니다(폴란드에서 이름을 땀). 영상에서는 방사성만 놓고 보면 <b>주기율표에서 가장 위험한 원소</b>라고 소개합니다. 이 원소들을 연구하며 많은 과학자가 방사선 피해를 입었습니다.',
  86:'라돈은 무거운 기체라 <b>공기보다 무거워서 지하실 같은 낮은 곳에 쌓입니다</b>. 땅속에서 새어 나오기 때문에 <b>지진 전에 라돈 농도가 변하는지</b>를 연구하기도 합니다. 지자체에서 라돈 측정기를 빌려주기도 합니다.<br>⚠️ <b>바로잡기</b>: 영상에서 "몸에 들어가도 큰 위험은 없다", "우리나라에선 측정기가 별 필요 없다"는 말이 나오지만, 세계보건기구(WHO)는 라돈을 <b>흡연 다음가는 폐암의 주요 원인</b>으로 봅니다. 우리나라도 실내 라돈 권고 기준(148 Bq/m³)이 있으니, 지하나 환기가 잘 안 되는 공간은 <b>자주 환기</b>하는 것이 좋습니다.',
  88:'<b>퀴리 부부</b>가 폴로늄과 함께 발견한 방사성 원소입니다. 방사선의 위험을 몰랐던 시절이라 많은 희생이 있었습니다.',
  92:'우라늄은 <b>자연에서 만들어지는 원소 중 사실상 마지막</b>으로 알려져 있습니다. 그래서 그 뒤(93번~)를 <b>초우라늄 원소</b>라고 하며, 주로 사람이 만듭니다. (넵투늄·플루토늄은 자연에 극미량 존재)',
  94:'영상에서 조용하고 취미가 과학인 윤소희 배우에게 <b>"인기가 쌓이다 언젠가 터질 것"</b>이라며 골라 준 원소입니다. 😄'
};
const STORY_GROUP = {
  lanthanide:'<b>희토류</b>는 이름 때문에 아주 적을 것 같지만, 실제 양은 꽤 많습니다. \'흙(땅)에 <b>희박하게 퍼져</b> 있다\'는 뜻입니다. 여러 원소가 뒤섞여 있어 수십 단계의 분리 공정이 필요하고, 그 과정에서 <b>환경 오염</b>이 많이 생깁니다. 현재 <b>중국</b>이 대부분을 생산합니다. 요리의 <b>MSG</b>처럼 조금만 섞어도 성질을 크게 바꿀 수 있어, 풍력·태양광 같은 친환경 에너지 장치에도 쓰인다는 점이 아이러니로 소개됩니다. (희토류 = 란타넘족 15개 + 스칸듐 + 이트륨)',
  superheavy:'초중원소는 <b>입자 가속기</b>로 원자핵 두 개를 아주 빠르게 충돌시켜 만듭니다. 원소로 인정받으려면 최소 <b>10⁻¹⁴초</b> 이상 존재해야 하고, 다른 연구소에서도 실험을 재현해야 합니다. 이름은 발견한 연구팀이 제안하고 <b>IUPAC</b>이 최종 결정합니다. 원소가 몇 번까지 있을 수 있는지에 대해서는, 리처드 파인만의 계산으로는 <b>137번</b>(\'파인마늄\'), 원자핵의 크기까지 고려하면 <b>약 172번</b> 정도가 한계라는 이론이 소개됩니다.'
};
STORY[21]=STORY[39]=STORY_GROUP.lanthanide;
function storyOf(e){
  const parts=[];
  if(STORY[e.z]) parts.push(STORY[e.z]);
  if(e.cat==='lanthanide') parts.push(STORY_GROUP.lanthanide);
  if(e.z>=104) parts.push(STORY_GROUP.superheavy);
  return parts.join('<hr style="border:0;border-top:1px dashed var(--line)">');
}

/* ============ 저장소 ============ */
const LS = {
  get(k,d){ try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(_){return d;} },
  set(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(_){} }
};
let known = new Set(LS.get('pt_known',[]));
let logs = LS.get('pt_logs',{}); // {YYYY-MM-DD:{memo,done,quiz:[{c,t}],flash:n}}
let lastWrong = LS.get('pt_lastWrong',[]);
const saveKnown=()=>{LS.set('pt_known',[...known]); markState();};
const saveLogs=()=>{LS.set('pt_logs',logs); markState();};
let myRec=cleanRecLocal(LS.get('pt_my',null)); let friends=LS.get('pt_friends',{}); let nick=LS.get('pt_nick','');
const online={db:null,user:null,uid:null,rows:{},status:'offline',canWrite:true,stateRef:null};
function cleanRecLocal(d){ return d&&d.best&&d.total?d:{best:{},total:{c:0,q:0},ts:0}; }
const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayKey=()=>ymd(new Date());
function dayLog(k){ return logs[k]||(logs[k]={memo:'',done:false,quiz:[],flash:0}); }

/* ============ 내비게이션 ============ */
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.page));
function showPage(p){
  const nb=document.querySelector(`#nav button[data-page="${p}"]`); if(nb&&nb.scrollIntoView) try{ nb.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'}); }catch(_){}
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===p));
  document.querySelectorAll('.page').forEach(s=>s.classList.toggle('active',s.id==='page-'+p));
  if(p==='calendar') renderCal();
  if(p==='flash') renderCard();
  if(p==='table') renderTable();
  if(p==='trend') initTrend();
  if(p==='ec') renderEC();
  if(p==='lb') initLB();
  if(p==='rv') renderRV();
  if(p!=='ec' && typeof ecStop==='function') ecStop();
  window.scrollTo(0,0);
}

/* ============ 주기율표 ============ */
let activeCat=null;
function renderTable(){
  const pt=document.getElementById('pt'); pt.innerHTML='';
  const add=(html,cls,r,c,attrs={})=>{const d=document.createElement('div');d.className=cls;d.innerHTML=html;d.style.gridRow=r;d.style.gridColumn=c;for(const a in attrs)d.setAttribute(a,attrs[a]);pt.appendChild(d);return d;};
  for(let g=1;g<=18;g++) add(g,'lbl hdr',1,g+1);
  for(let p=1;p<=7;p++) add(p,'lbl',p+1,1);
  add('57–71<span class="full"><br>란타넘족</span>','ph cat-lanthanide',7,4);
  add('89–103<span class="full"><br>악티늄족</span>','ph cat-actinide',8,4);
  add('','gap',9,'1 / -1');
  add('란','lbl',10,1); add('악','lbl',11,1);
  const showK=document.getElementById('showKnown').checked;
  EL.forEach(e=>{
    let r,c;
    if(e.group===null){ if(e.cat==='lanthanide'){r=10;c=e.z-57+4;} else {r=11;c=e.z-89+4;} }
    else { r=e.period+1; c=e.group+1; }
    const d=add(`<span class="z">${e.z}</span><span class="s">${e.sym}</span><span class="k">${koShort(e)}</span>`,
      `el cat-${e.cat}${showK&&known.has(e.z)?' known':''}${storyOf(e)?' story':''}`,r,c,{title:`${e.ko} (${e.en})`,'data-z':e.z});
    d.onclick=()=>openEl(e.z);
  });
  applyFilter();
}
function applyFilter(){
  const q=document.getElementById('search').value.trim().toLowerCase();
  document.querySelectorAll('.el').forEach(d=>{
    const e=byZ(+d.dataset.z);
    let on=true;
    if(activeCat && e.cat!==activeCat) on=false;
    if(document.getElementById('showStory').checked && !storyOf(e)) on=false;
    if(q && !(e.sym.toLowerCase()===q || e.ko.includes(q) || e.en.toLowerCase().includes(q) || String(e.z)===q)) on=false;
    d.classList.toggle('dim',!on);
  });
}
document.getElementById('search').oninput=applyFilter;
document.getElementById('showKnown').onchange=renderTable;
document.getElementById('showStory').onchange=applyFilter;
const lg=document.getElementById('legend');
Object.entries(CAT).forEach(([k,v])=>{
  const s=document.createElement('span'); s.className='cat-'+k; s.textContent=v.ko;
  s.onclick=()=>{activeCat=activeCat===k?null:k; lg.querySelectorAll('span').forEach(x=>x.classList.remove('on')); if(activeCat)s.classList.add('on'); applyFilter();};
  lg.appendChild(s);
});

/* ============ 원소 상세 모달 ============ */
const modalBg=document.getElementById('modalBg'), modal=document.getElementById('modal');
function groupText(e){ return e.group===null ? `족 번호 없음 (${CAT[e.cat].ko}, 3족 자리)` : `${e.group}족`; }
function openEl(z){
  const e=byZ(z);
  modal.innerHTML=`
    <button class="close" onclick="closeModal()">×</button>
    <div class="m-head">
      <div class="m-tile cat-${e.cat}"><span class="z">${e.z}</span><span class="s">${e.sym}</span></div>
      <div><h2 style="margin:0">${e.ko}</h2><div class="muted">${e.en}</div>
      <span class="cat-${e.cat}" style="padding:2px 10px;border-radius:999px;font-size:.8rem">${CAT[e.cat].ko}</span></div>
    </div>
    <div class="facts">
      <div><b>원자번호</b>${e.z}</div>
      <div><b>원자량</b>${e.mass}</div>
      <div><b>주기</b>${e.period}주기</div>
      <div><b>족</b>${groupText(e)}</div>
      <div><b>상온 상태</b>${e.state}</div>
      <div><b>블록</b>${e.block} 블록</div>
    </div>
    <div class="box"><h4>⚛️ 전자 배치</h4>
      <div class="row" style="align-items:flex-start;gap:14px">
        <div id="mBohr" style="flex:0 0 220px;margin:0 auto">${bohrSVG(z,{size:220,delay:70})}</div>
        <div style="flex:1;min-width:200px">${ecSummary(e)}
          <div class="row" style="margin-top:8px"><button class="btn ghost" style="font-size:.82rem" onclick="replayModalBohr(${z})">🔄 다시 채우기</button>
          <button class="btn ghost" style="font-size:.82rem" onclick="openEC(${z})">크게 보기 ▶</button></div></div>
      </div></div>
    <div class="box"><h4>📈 주기적 성질</h4><span style="font-size:.88rem">원자 반지름 ${fmt(tval(z,'radius'),'radius')}${tval(z,'radius')==null?'':' pm'} · 전기음성도 ${fmt(tval(z,'en'),'en')} · 1차 이온화 에너지 ${fmt(tval(z,'ie'),'ie')}${tval(z,'ie')==null?'':' kJ/mol'}<br>녹는점 ${fmt(tval(z,'mp'),'mp')}${tval(z,'mp')==null?'':' ℃'} · 밀도 ${fmt(tval(z,'density'),'density')}${tval(z,'density')==null?'':' g/cm³'}</span></div>
    <div class="box"><h4>🔍 특징</h4>${e.feat}</div>
    <div class="box"><h4>🛠️ 활용</h4>${e.use}</div>
    ${storyOf(e)?`<div class="box story"><h4>🎬 영상 속 이야기</h4>${storyOf(e)}<div class="muted" style="font-size:.75rem;margin-top:6px">출처: <a href="${VIDEO_URL}" target="_blank" rel="noopener">취미는 과학 49화 (feat. 윤소희 배우)</a> 자동 자막 정리 · ⚠️는 바로잡거나 보충한 내용</div></div>`:''}
    <div class="row" style="margin-top:12px">
      <label><input type="checkbox" id="mKnown" ${known.has(z)?'checked':''}> 이 원소를 외웠어요</label>
    </div>
    <p class="muted" style="font-size:.75rem">원자량의 [ ]는 가장 안정한 동위원소의 질량수입니다. 출처: IUPAC · RSC Periodic Table 요약 — 이 정보는 정확하지 않을 수 있습니다.</p>
    <div class="nav-el">
      <button class="btn ghost" ${z<=1?'disabled':''} onclick="openEl(${z-1})">◀ ${z>1?byZ(z-1).sym:''}</button>
      <button class="btn ghost" ${z>=118?'disabled':''} onclick="openEl(${z+1})">${z<118?byZ(z+1).sym:''} ▶</button>
    </div>`;
  document.getElementById('mKnown').onchange=ev=>{ ev.target.checked?known.add(z):known.delete(z); saveKnown(); renderTable(); };
  modalBg.classList.add('show');
}
function closeModal(){ modalBg.classList.remove('show'); }
modalBg.onclick=ev=>{ if(ev.target===modalBg) closeModal(); };
document.addEventListener('keydown',ev=>{ if(ev.key==='Escape') closeModal(); });

/* ============ 퀴즈 ============ */
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
let Q={list:[],i:0,score:0,wrong:[],answered:false};
function distractors(pool,e,key,n=3){
  const seen=new Set([key(e)]), out=[];
  for(const x of shuffle(pool.length>=4?pool:EL)){ const v=key(x); if(!seen.has(v)){seen.add(v);out.push(v);} if(out.length===n)break; }
  return out;
}
function makeQ(type,pool,forceZ){
  const MIX=['sym2name','name2sym','num2el','group','period','cat','use','trend','ec_shell','ec_cfg','ec_val'];
  const t=type==='mix'?pick(MIX):type; const q=_makeQ(t,pool,forceZ); if(!q.type) q.type=t; return q;
}
function _makeQ(type,pool,forceZ){
  const t = type==='mix' ? pick(['sym2name','name2sym','num2el','group','period','cat','use','trend','ec_shell','ec_cfg','ec_val']) : type;
  let e=forceZ?byZ(forceZ):pick(pool), text, ans, opts;
  switch(t){
    case 'sym2name': text=`<span class="q-big">${e.sym}</span>이 원소의 이름은?`; ans=e.ko; opts=distractors(pool,e,x=>x.ko); break;
    case 'name2sym': text=`<b>${e.ko}</b>의 원소 기호는?`; ans=e.sym; opts=distractors(pool,e,x=>x.sym); break;
    case 'num2el': text=`원자번호 <b>${e.z}번</b> 원소는?`; ans=`${koShort(e)} (${e.sym})`; opts=distractors(pool,e,x=>`${koShort(x)} (${x.sym})`); break;
    case 'group': {
      const p2=pool.filter(x=>x.group!==null); if(!(forceZ&&e.group!==null)) e=pick(p2);
      text=`<b>${e.ko} (${e.sym})</b>는 몇 족일까요?`; ans=`${e.group}족`;
      const cands=shuffle([...Array(18)].map((_,i)=>i+1).filter(g=>g!==e.group)).sort((a,b)=>Math.abs(a-e.group)-Math.abs(b-e.group));
      opts=shuffle(cands.slice(0,6)).slice(0,3).map(g=>g+'족'); break; }
    case 'period': text=`<b>${e.ko} (${e.sym})</b>는 몇 주기일까요?`; ans=`${e.period}주기`;
      opts=shuffle([1,2,3,4,5,6,7].filter(p=>p!==e.period)).slice(0,3).map(p=>p+'주기'); break;
    case 'cat': text=`<b>${e.ko} (${e.sym})</b>의 분류는?`; ans=CAT[e.cat].ko;
      opts=shuffle(Object.values(CAT).map(c=>c.ko).filter(c=>c!==ans)).slice(0,3); break;
    case 'trend': {
      const pk=pick(['radius','en','ie']), P=PROPS[pk];
      const mainG=g=>g!==null&&(g<=2||g>=13);
      const cand=pool.filter(x=>x.z<=86&&mainG(x.group)&&tval(x.z,pk)!=null);
      let a,b,how,guard=0;
      do{ a=(forceZ&&guard===0&&cand.some(x=>x.z===forceZ))?byZ(forceZ):pick(cand); const same=Math.random()<.5?'period':'group';
          const mates=cand.filter(x=>x.z!==a.z&&x[same]===a[same]&&tval(x.z,pk)!==tval(a.z,pk));
          b=mates.length?pick(mates):null; how=same; }while(!b&&guard++<50);
      if(!b) return makeQ('sym2name',pool);
      const big=Math.random()<.5, va=tval(a.z,pk), vb=tval(b.z,pk);
      const win=(big? va>vb : va<vb)?a:b; e=win;
      text=`다음 중 <b>${P.ko}</b>가 더 ${big?'큰':'작은'} 원소는?<div class="muted" style="font-size:.9rem;font-weight:500">(둘 다 같은 ${how==='period'?a.period+'주기':a.group+'족'})</div>`;
      ans=`${koShort(win)} (${win.sym})`; const other=win===a?b:a;
      const q={e,text,ans,opts:shuffle([ans,`${koShort(other)} (${other.sym})`])};
      q.note=`📈 ${a.sym} ${fmt(va,pk)} vs ${b.sym} ${fmt(vb,pk)} ${P.unit} — ${how==='period'?P.period.t:P.group.t}${pk==='ie'&&how==='period'?' (2족>13족, 15족>16족 예외 주의)':''}`;
      return q; }
    case 'ec_shell': case 'ec_cfg': {
      const near=x=>Math.abs(x.z-e.z)<=6&&x.z!==e.z;
      const sh=ECONF[e.z-1][2], cfg=ECONF[e.z-1][1];
      text = t==='ec_shell'
        ? `전자 껍질별 전자 수가<br><span class="q-big" style="font-size:2.2rem">${sh.join(', ')}</span>인 원소는?<div class="muted" style="font-size:.85rem;font-weight:500">(안쪽 K 껍질부터 차례로)</div>`
        : `전자 배치가<br><span class="cfg" style="font-size:1.3rem;display:inline-block;margin:8px 0">${supCfg(cfg)}</span><br>인 원소는?`;
      ans=`${koShort(e)} (${e.sym})`;
      const cand=shuffle(pool.filter(near)), others=shuffle(pool.filter(x=>x.z!==e.z&&!near(x)));
      const seen=new Set([ans]); opts=[];
      for(const x of [...cand,...others,...shuffle(EL)]){ const v=`${koShort(x)} (${x.sym})`; if(!seen.has(v)){seen.add(v);opts.push(v);} if(opts.length===3)break; }
      const q={e,text,ans,opts:shuffle([ans,...opts])};
      q.note=`⚛️ ${e.z}. ${e.ko}: 껍질별 ${sh.join(', ')} · ${supCfg(cfg)} — 전자 수의 합 = 원자번호 ${e.z}`;
      return q; }
    case 'ec_val': {
      const mg=pool.filter(x=>x.z<=86&&x.group!==null&&(x.group<=2||x.group>=13));
      if(!(forceZ&&e.z<=86&&e.group!==null&&(e.group<=2||e.group>=13))) e=pick(mg.length?mg:EL.filter(x=>x.z<=20));
      const v=e.z===1?1:e.group===18?0:e.group<=2?e.group:e.group-10;
      text=`<b>${e.ko} (${e.sym})</b>의 원자가 전자 수는?`; ans=`${v}개`;
      opts=shuffle([0,1,2,3,4,5,6,7,8].filter(k=>k!==v)).slice(0,3).map(k=>k+'개');
      const q={e,text,ans,opts:shuffle([ans,...opts])};
      const sh=ECONF[e.z-1][2];
      q.note=`⚛️ ${e.sym}: 껍질별 ${sh.join(', ')} → 가장 바깥 껍질 전자 ${sh[sh.length-1]}개${e.group===18?' (18족은 안정해서 원자가 전자를 0개로 봄)':''} · ${e.group}족`;
      return q; }
    case 'use': {
      const p2=pool.filter(x=>x.use!=='연구용'); if(!(forceZ&&e.use!=='연구용')) e=pick(p2.length?p2:pool);
      text=`다음 활용에 쓰이는 원소는?<div class="box" style="font-weight:500;font-size:1rem">${e.use}</div>`; ans=`${koShort(e)} (${e.sym})`;
      opts=distractors(p2.length>=4?p2:pool,e,x=>`${koShort(x)} (${x.sym})`); break; }
  }
  return {e,text,ans,opts:shuffle([ans,...opts])};
}
document.getElementById('qStart').onclick=startQuiz;
document.getElementById('qRetry').onclick=()=>{ if(Q.reviewKind) go('rv'); else startQuiz(); };
function startQuiz(){
  const max=+document.getElementById('qRange').value, type=document.getElementById('qType').value, n=+document.getElementById('qCount').value;
  const pool=EL.filter(e=>e.z<=max);
  Q={list:[],i:0,score:0,wrong:[],answered:false,start:Date.now(),range:String(max),type};
  let guard=0; const used=new Set();
  while(Q.list.length<n && guard++<500){ const q=makeQ(type,pool); const k=q.e.z+q.text; if(used.has(k)&&guard<400)continue; used.add(k); Q.list.push(q); }
  document.getElementById('quizSetup').style.display='none';
  document.getElementById('quizEnd').style.display='none';
  document.getElementById('quizPlay').style.display='block';
  showQ();
}
function showQ(){
  const q=Q.list[Q.i]; Q.answered=false;
  document.getElementById('qNum').textContent=`문제 ${Q.i+1} / ${Q.list.length}`;
  document.getElementById('qScore').textContent=`정답 ${Q.score}개`;
  document.getElementById('qBar').style.width=(Q.i/Q.list.length*100)+'%';
  document.getElementById('qText').innerHTML=q.text;
  const box=document.getElementById('qOpts'); box.innerHTML='';
  q.opts.forEach(o=>{ const b=document.createElement('button'); b.textContent=o; b.onclick=()=>answer(b,o); box.appendChild(b); });
  const fb=document.getElementById('qFb'); fb.className='feedback'; fb.innerHTML='';
  document.getElementById('qNext').style.display='none';
}
function answer(btn,o){
  if(Q.answered) return; Q.answered=true;
  const q=Q.list[Q.i], ok=o===q.ans;
  document.querySelectorAll('#qOpts button').forEach(b=>{ b.disabled=true; if(b.textContent===q.ans) b.classList.add('correct'); });
  if(!ok){ btn.classList.add('wrong'); Q.wrong.push(q.e.z); } else Q.score++;
  logAttempt(q,o,ok);
  const e=q.e, fb=document.getElementById('qFb');
  fb.className='feedback '+(ok?'ok':'no');
  fb.innerHTML=`${ok?'⭕ 정답!':'❌ 아쉬워요. 정답: <b>'+q.ans+'</b>'}<br><span class="muted">${q.note?q.note:`${e.z}. ${e.ko} (${e.sym}) · ${e.period}주기 · ${groupText(e)} · ${CAT[e.cat].ko}`}</span>`;
  const nx=document.getElementById('qNext'); nx.style.display='inline-block';
  nx.textContent = Q.i===Q.list.length-1 ? '결과 보기 🏁' : '다음 ▶';
}
document.getElementById('qNext').onclick=()=>{ if(Q.i<Q.list.length-1){Q.i++;showQ();} else endQuiz(); };
function endQuiz(){
  document.getElementById('quizPlay').style.display='none';
  document.getElementById('quizEnd').style.display='block';
  document.getElementById('quizSetup').style.display='block';
  const t=Q.list.length, pct=Math.round(Q.score/t*100);
  document.getElementById('qFinal').textContent=`${Q.score} / ${t} (${pct}%)`;
  document.getElementById('qMsg').textContent = pct===100?'🎉 완벽해요! 범위를 넓혀 보세요.':pct>=80?'👍 아주 잘했어요!':pct>=50?'💪 조금만 더! 틀린 원소를 복습해 보세요.':'📖 플래시카드로 먼저 익혀 볼까요?';
  const uniq=[...new Set(Q.wrong)];
  lastWrong=uniq; LS.set('pt_lastWrong',uniq); markState();
  uniq.forEach(z=>known.delete(z)); saveKnown();
  document.getElementById('qWrong').innerHTML = uniq.length ? `<h3>틀린 원소</h3><div class="row">${uniq.map(z=>{const e=byZ(z);return `<span class="cat-${e.cat}" style="padding:4px 10px;border-radius:8px;cursor:pointer" onclick="openEl(${z})">${e.z} ${e.sym} ${koShort(e)}</span>`;}).join('')}</div>` : '';
  document.getElementById('qToFlash').style.display = uniq.length?'inline-block':'none';
  const d=dayLog(todayKey()); d.quiz.push({c:Q.score,t}); saveLogs();
  const sec=Math.round((Date.now()-Q.start)/1000);
  const nb=recordQuiz(Q.range,Q.type,Q.score,t,sec);
  const rl=(BOARDS.find(b=>b[0]===Q.range)||[])[1];
  document.getElementById('qRank').innerHTML = `⏱️ 걸린 시간 ${fmtSec(sec)}<br>` + (Q.type!=='mix'||t<10
    ? `<span class="muted">🏆 범위별 순위표에는 '🎲 섞어서' 유형, 10문제 이상만 기록돼요. (누적 정답에는 반영됨)</span>`
    : nb ? `🎉 <b>새 최고 기록!</b> ${rl} 순위표에 올라갔어요.` : `<span class="muted">${rl} 내 최고 기록: ${myRec.best[Q.range].pct}% (${fmtSec(myRec.best[Q.range].sec)})</span>`);
  if(Q.reviewKind){ const label={review:'🎯 맞춤 복습',diag:'🩺 진단 테스트',drill:'🔍 실수 집중 연습'}[Q.reviewKind];
    document.getElementById('qRank').innerHTML=`⏱️ 걸린 시간 ${fmtSec(sec)}<br><b>${label} 완료!</b> 결과가 약점 분석에 반영됐어요.<br><button class="btn" style="margin-top:8px" onclick="go('rv')">📊 약점 분석 보기</button>`; }
}
document.getElementById('qToFlash').onclick=()=>{ document.getElementById('fRange').value='wrong'; buildDeck(); go('flash'); };

/* ============ 플래시카드 ============ */
let deck=[], fi=0;
function buildDeck(){
  const r=document.getElementById('fRange').value;
  let list;
  if(r==='wrong') list=lastWrong.map(byZ);
  else { const [a,b]=r.split('-').map(Number); list=EL.filter(e=>e.z>=a&&e.z<=b); }
  if(document.getElementById('fUnknownOnly').checked) list=list.filter(e=>!known.has(e.z));
  deck=list; fi=0; renderCard();
}
function renderCard(){
  const fc=document.getElementById('fc'); fc.classList.remove('flipped');
  const front=document.getElementById('fcFront'), back=document.getElementById('fcBack');
  const total=EL.length;
  document.getElementById('fKnownCnt').textContent=`외운 원소: ${known.size} / ${total}`;
  if(!deck.length){
    front.className='face front'; front.style.background='var(--surface)';
    front.innerHTML= document.getElementById('fRange').value==='wrong' ? '최근 퀴즈에서 틀린 원소가 없어요 🎉' : '이 범위의 카드를 모두 외웠어요! 🎉<br><span class="muted">"아직 못 외운 카드만"을 해제하면 다시 볼 수 있어요.</span>';
    back.innerHTML=''; document.getElementById('fPos').textContent='0 / 0'; return;
  }
  const e=deck[fi], mode=document.getElementById('fFront').value;
  front.className=`face front cat-${e.cat}`; front.style.background='';
  front.innerHTML = mode==='sym'
    ? `<div class="muted">원자번호 ${e.z}</div><div class="s">${e.sym}</div><div class="muted">이 원소의 이름은?</div>`
    : `<div class="muted">원자번호 ${e.z}</div><div class="s" style="font-size:2.6rem">${e.ko}</div><div class="muted">원소 기호는?</div>`;
  back.innerHTML=`<div class="n">${e.sym} · ${e.ko}</div><div class="muted">${e.en} · ${e.period}주기 · ${groupText(e)}</div>
    <div style="margin:6px 0"><span class="cat-${e.cat}" style="padding:2px 10px;border-radius:999px;font-size:.8rem">${CAT[e.cat].ko}</span></div>
    <div style="font-size:.85rem">🛠️ ${e.use}</div>`;
  document.getElementById('fPos').textContent=`${fi+1} / ${deck.length} ${known.has(e.z)?'✅':''}`;
}
document.getElementById('fc').onclick=()=>document.getElementById('fc').classList.toggle('flipped');
function fMove(d){ if(!deck.length)return; fi=(fi+d+deck.length)%deck.length; renderCard(); }
document.getElementById('fPrev').onclick=()=>fMove(-1);
document.getElementById('fNext').onclick=()=>fMove(1);
function fMark(ok){
  if(!deck.length) return;
  const e=deck[fi]; ok?known.add(e.z):known.delete(e.z); saveKnown();
  const d=dayLog(todayKey()); d.flash=(d.flash||0)+1; saveLogs();
  if(ok && document.getElementById('fUnknownOnly').checked){ deck.splice(fi,1); if(fi>=deck.length)fi=0; renderCard(); }
  else fMove(1);
}
document.getElementById('fYes').onclick=()=>fMark(true);
document.getElementById('fNo').onclick=()=>fMark(false);
document.getElementById('fShuffle').onclick=()=>{deck=shuffle(deck);fi=0;renderCard();};
document.getElementById('fReset').onclick=async()=>{ if(await askConfirm('외운 원소 기록을 모두 지울까요?')){known.clear();saveKnown();buildDeck();} };
['fRange','fFront','fUnknownOnly'].forEach(id=>document.getElementById(id).onchange=buildDeck);
document.addEventListener('keydown',ev=>{
  if(!document.getElementById('page-flash').classList.contains('active')) return;
  if(ev.target.tagName==='INPUT'||ev.target.tagName==='TEXTAREA'||ev.target.tagName==='SELECT') return;
  if(ev.key===' '){ev.preventDefault();document.getElementById('fc').classList.toggle('flipped');}
  if(ev.key==='ArrowRight') fMove(1);
  if(ev.key==='ArrowLeft') fMove(-1);
});

/* ============ 학습달력 ============ */
let calY, calM, selKey=todayKey();
{const t=new Date(); calY=t.getFullYear(); calM=t.getMonth();}
const PLAN=['1~10번 암기 (수헬리베붕탄질산플네)','11~20번 암기 (나마알규인황염아칼칼)','1~20번 플래시카드 + 퀴즈','📘 주기와 족 개념 학습','1족·2족 원소 외우기','17족·18족 원소 외우기','1주차 복습 퀴즈 (1~20번)',
'21~30번 전이 금속 (스타바크망철코니구아)','31~36번 (갈저비셀브크)','21~36번 플래시카드','37~46번 암기','47~54번 암기','37~54번 플래시카드 + 퀴즈','2주차 복습 퀴즈 (1~54번)',
'55~56번, 72~80번 암기','81~86번 암기','란타넘족 57~71번 훑어보기','1~86번 퀴즈','87~88번, 104~112번','113~118번 (새 원소 이름 유래)','3주차 복습 퀴즈',
'악티늄족 89~103번 훑어보기','금속·비금속·준금속 분류 퀴즈','원소 활용 탐구 (주기율표에서 원소 클릭)','전체 퀴즈 1회차','틀린 원소 플래시카드','전체 퀴즈 2회차','🎉 최종 점검 & 나에게 보상!'];
function active(k){ const d=logs[k]; return d && (d.done || (d.quiz&&d.quiz.length) || d.flash>0); }
function renderCal(){
  document.getElementById('cTitle').textContent=`${calY}년 ${calM+1}월`;
  const cal=document.getElementById('cal'); cal.innerHTML='';
  ['일','월','화','수','목','금','토'].forEach(w=>{const d=document.createElement('div');d.className='dow';d.textContent=w;cal.appendChild(d);});
  const first=new Date(calY,calM,1), start=new Date(first); start.setDate(1-first.getDay());
  const tk=todayKey();
  for(let i=0;i<42;i++){
    const dt=new Date(start); dt.setDate(start.getDate()+i);
    const k=ymd(dt), L=logs[k], cell=document.createElement('div');
    cell.className='day'+(dt.getMonth()!==calM?' other':'')+(k===tk?' today':'')+(k===selKey?' sel':'')+(L&&L.done?' done':'');
    let badge=''; if(L&&L.done) badge='✅'; else if(active(k)) badge='📝';
    cell.innerHTML=`<div class="dn">${dt.getDate()}</div><span class="badge">${badge}</span><div class="plan">${L&&L.memo?escapeHtml(L.memo):''}</div>`;
    cell.onclick=()=>{selKey=k; renderCal();};
    cal.appendChild(cell);
    if(i>=34 && dt.getMonth()!==calM && dt.getDay()===6) break;
  }
  renderDay(); renderStats();
}
function escapeHtml(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function renderDay(){
  const L=logs[selKey]||{memo:'',done:false,quiz:[],flash:0};
  const [y,m,d]=selKey.split('-');
  document.getElementById('dTitle').textContent=`📌 ${y}년 ${+m}월 ${+d}일`;
  document.getElementById('dMemo').value=L.memo||'';
  document.getElementById('dDone').checked=!!L.done;
  const q=L.quiz||[];
  document.getElementById('dLog').innerHTML = (q.length||L.flash)
    ? `<h4>이날의 학습 기록</h4>${q.map((x,i)=>`퀴즈 ${i+1}회: ${x.c}/${x.t} (${Math.round(x.c/x.t*100)}%)`).join('<br>')}${L.flash?`<br>플래시카드 ${L.flash}장 학습`:''}`
    : '<span class="muted">아직 학습 기록이 없습니다.</span>';
}
document.getElementById('dSave').onclick=()=>{
  const L=dayLog(selKey); L.memo=document.getElementById('dMemo').value.trim(); L.done=document.getElementById('dDone').checked; saveLogs(); renderCal();
};
document.getElementById('cPrev').onclick=()=>{calM--; if(calM<0){calM=11;calY--;} renderCal();};
document.getElementById('cNext').onclick=()=>{calM++; if(calM>11){calM=0;calY++;} renderCal();};
document.getElementById('cPlan').onclick=async()=>{
  if(!await askConfirm('오늘부터 28일간 추천 학습계획을 넣을까요? (이미 쓴 메모는 유지됩니다)')) return;
  const t=new Date();
  PLAN.forEach((p,i)=>{ const d=new Date(t); d.setDate(t.getDate()+i); const L=dayLog(ymd(d)); if(!L.memo) L.memo=`[${i+1}일차] ${p}`; });
  saveLogs(); renderCal();
};
document.getElementById('cClearPlan').onclick=async()=>{
  if(!await askConfirm('추천 학습계획([n일차]로 시작하는 메모)을 모두 지울까요?')) return;
  for(const k in logs) if(logs[k].memo && /^\[\d+일차\]/.test(logs[k].memo)) logs[k].memo='';
  saveLogs(); renderCal();
};
function renderStats(){
  let streak=0; const d=new Date();
  if(!active(ymd(d))) d.setDate(d.getDate()-1);
  while(active(ymd(d))){ streak++; d.setDate(d.getDate()-1); }
  const pre=`${calY}-${String(calM+1).padStart(2,'0')}`;
  let days=0,c=0,t=0;
  for(const k in logs) if(k.startsWith(pre)){ if(active(k))days++; (logs[k].quiz||[]).forEach(x=>{c+=x.c;t+=x.t;}); }
  document.getElementById('sStreak').textContent=streak;
  document.getElementById('sDays').textContent=days;
  document.getElementById('sAcc').textContent=t?Math.round(c/t*100)+'%':'-';
  document.getElementById('sKnown').textContent=known.size;
}

/* ============ 주기적 성질 ============
   [원자반지름 pm, 전기음성도(폴링), 1차 이온화에너지 kJ/mol, 녹는점 ℃, 밀도 g/cm³] — mendeleev v1.3.0 */

const PROPS = {
  radius:{i:0,ko:'원자 반지름',unit:'pm',dec:0,
    period:{dir:'감소 ⬅️ 작아짐',t:'같은 주기에서는 오른쪽으로 갈수록 작아집니다'},
    group:{dir:'증가 ⬇️ 커짐',t:'같은 족에서는 아래로 갈수록 커집니다'},
    why:`<b>왜 그럴까?</b><ul class="ex-list">
      <li><b>주기 →</b> 전자 껍질 수는 같은데 양성자 수(핵의 + 전하)가 늘어나 <b>유효 핵전하</b>가 커집니다. 핵이 전자를 더 세게 당겨 원자가 작아집니다.</li>
      <li><b>족 ↓</b> 아래로 갈수록 <b>전자 껍질이 하나씩 늘어나</b> 원자가 커집니다.</li>
      <li>그래서 각 주기의 <b>1족(알칼리 금속)</b>이 가장 크고, 그래프에서 ▲ 위치가 봉우리가 됩니다. 가장 큰 원소는 세슘(Cs) 쪽, 가장 작은 쪽은 오른쪽 위입니다.</li></ul>`},
  en:{i:1,ko:'전기음성도',unit:'(폴링 척도)',dec:2,
    period:{dir:'증가 ➡️ 커짐',t:'같은 주기에서는 오른쪽으로 갈수록 커집니다'},
    group:{dir:'감소 ⬇️ 작아짐',t:'같은 족에서는 아래로 갈수록 작아집니다'},
    why:`<b>전기음성도</b>는 화학 결합에서 원자가 <b>공유 전자쌍을 끌어당기는 정도</b>입니다.<ul class="ex-list">
      <li><b>주기 →</b> 유효 핵전하가 커지고 원자가 작아져 전자를 더 세게 당깁니다.</li>
      <li><b>족 ↓</b> 원자가 커져 바깥 전자가 핵에서 멀어지므로 당기는 힘이 약해집니다.</li>
      <li>가장 큰 원소는 <b>플루오린(F, 3.98)</b>, 그다음 산소(O)입니다. 오른쪽 위로 갈수록 크고 왼쪽 아래로 갈수록 작습니다.</li>
      <li>비활성 기체는 결합을 거의 하지 않아 대부분 값이 없습니다(빗금).</li></ul>`},
  ie:{i:2,ko:'1차 이온화 에너지',unit:'kJ/mol',dec:0,
    period:{dir:'대체로 증가 ➡️',t:'같은 주기에서는 오른쪽으로 갈수록 대체로 커집니다'},
    group:{dir:'감소 ⬇️',t:'같은 족에서는 아래로 갈수록 작아집니다'},
    why:`<b>1차 이온화 에너지</b>는 기체 상태 원자에서 <b>전자 1개를 떼어 내는 데 필요한 에너지</b>입니다.<ul class="ex-list">
      <li><b>주기 →</b> 유효 핵전하가 커져 전자를 떼기 어려워집니다. 그래서 각 주기의 <b>18족(■)이 봉우리</b>, 다음 주기 <b>1족(▲)이 골짜기</b>가 됩니다.</li>
      <li><b>족 ↓</b> 바깥 전자가 핵에서 멀어 떼기 쉬워집니다.</li>
      <li>⚠️ <b>예외 1 (2족 &gt; 13족)</b>: Be &gt; B, Mg &gt; Al. 13족은 에너지가 더 높은 p 오비탈 전자를 떼기 때문입니다.</li>
      <li>⚠️ <b>예외 2 (15족 &gt; 16족)</b>: N &gt; O, P &gt; S. 16족은 한 오비탈에 짝지어진 전자끼리 반발해 하나를 떼기 쉽기 때문입니다.</li>
      <li>그래프에서 2·3주기의 작은 '꺾임'을 찾아보세요!</li></ul>`},
  mp:{i:3,ko:'녹는점',unit:'℃',dec:0,
    period:{dir:'가운데가 높음',t:'주기 가운데(14족·전이 금속)에서 높고 양 끝에서 낮습니다'},
    group:{dir:'족마다 다름',t:'1족은 아래로 갈수록 낮아지고, 17·18족은 아래로 갈수록 높아집니다'},
    why:`녹는점은 원자 사이 결합의 종류와 세기에 따라 달라서 <b>반지름처럼 단순한 규칙은 없습니다.</b><ul class="ex-list">
      <li>금속 결합이 강한 <b>전이 금속</b>(특히 6족 텅스텐 W)과 그물 구조의 <b>14족</b>(C, Si)이 높습니다.</li>
      <li>분자 사이 힘이 약한 <b>비활성 기체·할로젠·대부분의 비금속</b>은 낮습니다.</li>
      <li>탄소(C)는 보통 압력에서 녹지 않고 바로 승화해 값이 없습니다(빗금). 헬륨은 보통 압력에서 얼지 않습니다.</li></ul>`},
  density:{i:4,ko:'밀도',unit:'g/cm³',dec:3,
    period:{dir:'가운데가 큼',t:'주기 가운데(전이 금속)에서 가장 크고 양 끝에서 작습니다'},
    group:{dir:'대체로 증가 ⬇️',t:'같은 족에서는 아래로 갈수록 대체로 커집니다'},
    why:`<ul class="ex-list">
      <li>원자가 무거워질수록(아래쪽) 밀도가 대체로 커집니다.</li>
      <li>6주기 가운데의 <b>오스뮴(Os)·이리듐(Ir)</b>이 가장 밀도가 큰 원소입니다.</li>
      <li>기체 원소는 상온에서 값이 매우 작아 거의 흰색으로 보입니다.</li>
      <li>103번 이후 원소는 자료가 없거나 예측값이라 제외했습니다.</li></ul>`}
};
let tProp='ie', tMax=36, tShowTable=false;
const RAMP=['#cde2fb','#b7d3f6','#9ec5f4','#86b6ef','#6da7ec','#5598e7','#3987e5','#2a78d6','#256abf','#1c5cab','#184f95','#104281','#0d366b'];
const tval=(z,p=tProp)=>TREND[z-1][PROPS[p].i];
function fmt(v,p=tProp){ if(v==null) return '자료 없음'; const d=PROPS[p].dec; return (d===3? (v<0.01? v.toExponential(2): v.toFixed(v<1?3:2)) : v.toFixed(d)); }
function rampColor(t){ if(isDark()) t=1-t; const i=Math.max(0,Math.min(RAMP.length-1,Math.round(t*(RAMP.length-1)))); return [RAMP[i], i>=7]; }
function initTrend(){
  const ps=document.getElementById('tProps');
  ps.innerHTML=Object.entries(PROPS).map(([k,v])=>`<button data-p="${k}" class="${k===tProp?'on':''}">${v.ko}</button>`).join('');
  ps.querySelectorAll('button').forEach(b=>b.onclick=()=>{tProp=b.dataset.p;initTrend();});
  const rs=document.getElementById('tRange');
  rs.innerHTML=[[18,'1~3주기'],[36,'1~4주기'],[54,'1~5주기'],[86,'1~6주기'],[118,'전체']].map(([m,l])=>`<button data-m="${m}" class="${m===tMax?'on':''}">${l}</button>`).join('');
  rs.querySelectorAll('button').forEach(b=>b.onclick=()=>{tMax=+b.dataset.m;initTrend();});
  const P=PROPS[tProp];
  document.getElementById('tSum').innerHTML=`<div><span class="muted">주기 (가로줄 →)</span><b class="big">${P.period.dir}</b>${P.period.t}</div><div><span class="muted">족 (세로줄 ↓)</span><b class="big">${P.group.dir}</b>${P.group.t}</div>`;
  document.getElementById('tExplain').innerHTML=P.why;
  document.getElementById('tUnitLbl').textContent=`— ${P.ko} ${P.unit}`;
  renderHeat(); renderChart(); renderTTable();
}
function renderHeat(){
  const hm=document.getElementById('hm'); hm.innerHTML='';
  const vals=TREND.map(r=>r[PROPS[tProp].i]).filter(v=>v!=null);
  const mn=Math.min(...vals), mx=Math.max(...vals);
  document.getElementById('tMin').textContent=`${fmt(mn)}`; document.getElementById('tMax').textContent=`${fmt(mx)} ${PROPS[tProp].unit}`;
  const add=(html,cls,r,c)=>{const d=document.createElement('div');d.className=cls;d.innerHTML=html;d.style.gridRow=r;d.style.gridColumn=c;hm.appendChild(d);return d;};
  for(let g=1;g<=18;g++) add(g,'lbl hdr',1,g+1);
  for(let p=1;p<=7;p++) add(p,'lbl',p+1,1);
  add('57–71','ph',7,4); add('89–103','ph',8,4); add('','gap',9,'1 / -1'); add('란','lbl',10,1); add('악','lbl',11,1);
  EL.forEach(e=>{
    let r,c; if(e.group===null){ if(e.cat==='lanthanide'){r=10;c=e.z-57+4;} else {r=11;c=e.z-89+4;} } else { r=e.period+1; c=e.group+1; }
    const v=tval(e.z);
    const d=add(`<span class="z">${e.z}</span><span class="s">${e.sym}</span><span class="v">${v==null?'–':fmt(v)}</span>`,'el'+(v==null?' nodata':''),r,c);
    if(v!=null){ const [bg,dark]=rampColor((v-mn)/(mx-mn||1)); d.style.background=bg; d.style.color=dark?'#fff':'#111827'; d.querySelector('.z').style.color=dark?'#e5e7eb':'#1f2937'; }
    d.title=`${e.ko} (${e.sym}) — ${PROPS[tProp].ko}: ${fmt(v)} ${v==null?'':PROPS[tProp].unit}`;
    d.onclick=()=>openEl(e.z);
  });
}
function niceMax(v){ const p=Math.pow(10,Math.floor(Math.log10(v))); for(const m of [1,1.5,2,2.5,3,4,5,6,8,10]) if(m*p>=v) return m*p; return 10*p; }
function renderChart(){
  const svg=document.getElementById('tChart'), P=PROPS[tProp];
  const cw=svg.parentElement.clientWidth||1000, W=Math.round(Math.max(320,Math.min(1000,cw))), narrow=W<600;
  const H=narrow?Math.round(W*0.78):380, L=narrow?54:60, R=narrow?10:20, T=24, B=44;
  svg.setAttribute('width',W); svg.setAttribute('height',H);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.setAttribute('aria-label',`원자번호 1~${tMax}의 ${P.ko} 그래프`);
  const pts=[]; for(let z=1;z<=tMax;z++) pts.push([z,tval(z)]);
  const vs=pts.map(p=>p[1]).filter(v=>v!=null);
  const vmin=Math.min(0,...vs), vmax=niceMax(Math.max(...vs));
  const x=z=>L+(z-1)/(tMax-1)*(W-L-R), y=v=>T+(1-(v-vmin)/(vmax-vmin))*(H-T-B);
  let g='';
  for(let k=0;k<=5;k++){ const v=vmin+(vmax-vmin)*k/5, yy=y(v);
    g+=`<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" style="stroke:var(--chart-grid)"/><text x="${L-8}" y="${yy+4}" font-size="12" text-anchor="end" style="fill:var(--chart-text)">${+v.toFixed(P.dec===2?1:P.dec===3?1:0)}</text>`; }
  if(vmin<0) g+=`<line x1="${L}" x2="${W-R}" y1="${y(0)}" y2="${y(0)}" style="stroke:var(--chart-axis)"/>`;
  [2,10,18,36,54,86].filter(z=>z<tMax).forEach((z,i)=>{ const xx=x(z+0.5);
    g+=`<line x1="${xx}" x2="${xx}" y1="${T}" y2="${H-B}" style="stroke:var(--chart-period)" stroke-dasharray="4 4"/>`; });
  [[1,2],[3,10],[11,18],[19,36],[37,54],[55,86],[87,118]].forEach(([a,b],i)=>{ if(a>tMax) return; const bb=Math.min(b,tMax);
    g+=`<text x="${(x(a)+x(bb))/2}" y="${T-8}" font-size="12" text-anchor="middle" style="fill:var(--chart-text)">${narrow&&x(bb)-x(a)<20?'':(i+1)+(narrow&&x(bb)-x(a)<40?'':'주기')}</text>`; });
  const plotW=W-L-R; const step=[1,2,5,10,20].find(st=>tMax/st*26<=plotW)||20;
  for(let z=1;z<=tMax;z++) if(z===1||z%step===0) g+=`<text x="${x(z)}" y="${H-B+18}" font-size="12" text-anchor="middle" style="fill:var(--chart-text)">${z}</text>`;
  g+=`<text x="${(L+W-R)/2}" y="${H-6}" font-size="12" text-anchor="middle" style="fill:var(--ink-2)">원자번호</text>`;
  g+=`<text x="${narrow?9:14}" y="${(T+H-B)/2}" font-size="${narrow?11:12}" text-anchor="middle" style="fill:var(--ink-2)" transform="rotate(-90 14 ${(T+H-B)/2})">${P.ko} ${P.unit}</text>`;
  let d='', pen=false; pts.forEach(([z,v])=>{ if(v==null){pen=false;return;} d+=(pen?'L':'M')+x(z).toFixed(1)+' '+y(v).toFixed(1); pen=true; });
  g+=`<path d="${d}" fill="none" stroke="#2a78d6" stroke-width="2" stroke-linejoin="round"/>`;
  pts.forEach(([z,v])=>{ if(v!=null) g+=`<circle cx="${x(z)}" cy="${y(v)}" r="${tMax<=36?3:2}" fill="#2a78d6"/>`; });
  pts.forEach(([z,v])=>{ if(v==null) return; const e=byZ(z); const xx=x(z), yy=y(v);
    if(e.group===1&&z>1){ g+=`<path d="M${xx} ${yy-6}L${xx+5.5} ${yy+4}L${xx-5.5} ${yy+4}Z" style="fill:var(--card);stroke:var(--chart-strong)" stroke-width="1.5"/><text x="${xx}" y="${yy-10}" font-size="11" font-weight="700" text-anchor="middle" style="fill:var(--chart-strong)">${e.sym}</text>`; }
    if(e.group===18){ g+=`<rect x="${xx-4.5}" y="${yy-4.5}" width="9" height="9" style="fill:var(--card);stroke:var(--chart-strong)" stroke-width="1.5"/><text x="${xx}" y="${yy-9}" font-size="11" font-weight="700" text-anchor="middle" style="fill:var(--chart-strong)">${e.sym}</text>`; } });
  g+=`<line id="tCross" x1="0" x2="0" y1="${T}" y2="${H-B}" style="stroke:var(--chart-strong)" stroke-width="1" visibility="hidden"/><circle id="tDot" r="6" fill="#2a78d6" style="stroke:var(--card)" stroke-width="2" visibility="hidden"/>`;
  g+=`<rect x="${L}" y="${T}" width="${W-L-R}" height="${H-T-B}" fill="transparent" id="tHit"/>`;
  svg.innerHTML=g;
  const tip=document.getElementById('tTip'), hit=svg.querySelector('#tHit'), cross=svg.querySelector('#tCross'), dot=svg.querySelector('#tDot');
  const move=ev=>{
    const pt=svg.createSVGPoint(); const src=ev.touches?ev.touches[0]:ev; pt.x=src.clientX; pt.y=src.clientY;
    const sp=pt.matrixTransform(svg.getScreenCTM().inverse());
    const z=Math.max(1,Math.min(tMax,Math.round((sp.x-L)/(W-L-R)*(tMax-1)+1)));
    const v=tval(z), e=byZ(z), xx=x(z);
    cross.setAttribute('x1',xx); cross.setAttribute('x2',xx); cross.setAttribute('visibility','visible');
    if(v!=null){dot.setAttribute('cx',xx);dot.setAttribute('cy',y(v));dot.setAttribute('visibility','visible');} else dot.setAttribute('visibility','hidden');
    tip.innerHTML=`<b>${e.z}. ${e.ko} (${e.sym})</b><br>${P.ko}: ${fmt(v)} ${v==null?'':P.unit}<br><span style="opacity:.75">${e.period}주기 · ${groupText(e)}</span>`;
    tip.style.display='block';
    const wrap=svg.parentElement.getBoundingClientRect(), sx=src.clientX-wrap.left+svg.parentElement.scrollLeft, sy=src.clientY-wrap.top;
    tip.style.left=Math.min(sx+14, svg.parentElement.scrollWidth-tip.offsetWidth-4)+'px'; tip.style.top=Math.max(0,sy-60)+'px';
  };
  const leave=()=>{tip.style.display='none';cross.setAttribute('visibility','hidden');dot.setAttribute('visibility','hidden');};
  hit.addEventListener('mousemove',move); hit.addEventListener('touchmove',move,{passive:true}); hit.addEventListener('touchstart',move,{passive:true});
  hit.addEventListener('mouseleave',leave);
  hit.addEventListener('click',ev=>{ const sp=(()=>{const pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse());})();
    openEl(Math.max(1,Math.min(tMax,Math.round((sp.x-L)/(W-L-R)*(tMax-1)+1)))); });
}
function renderTTable(){
  const box=document.getElementById('tTable'), P=PROPS[tProp];
  box.style.display=tShowTable?'block':'none';
  document.getElementById('tTableBtn').textContent=tShowTable?'표 숨기기':'표로 보기';
  if(!tShowTable) return;
  let h=`<table class="simple"><tr><th>원자번호</th><th>원소</th><th>주기</th><th>족</th><th>${P.ko} (${P.unit})</th></tr>`;
  for(let z=1;z<=tMax;z++){const e=byZ(z);h+=`<tr><td>${z}</td><td>${e.ko} (${e.sym})</td><td>${e.period}</td><td>${e.group??'-'}</td><td>${fmt(tval(z))}</td></tr>`;}
  box.innerHTML=h+'</table>';
}
document.getElementById('tTableBtn').onclick=()=>{tShowTable=!tShowTable;renderTTable();};

/* ============ 전자 배치 ============
   [전체 배치(쌓음 순서), 줄임 표기, 껍질별 전자 수] — mendeleev v1.3.0 */

const SHELL_NAMES=['K','L','M','N','O','P','Q'];
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const supCfg=s=>s.replace(/(\d)([spdf])(\d+)/g,(m,n,l,c)=>n+l+c.replace(/\d/g,x=>SUP[x]));
const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function valenceInfo(e){
  const sh=ECONF[e.z-1][2], outer=sh[sh.length-1];
  let val;
  if(e.z===1) val='1개';
  else if(e.group===18) val='0개 (18족은 안정해서 0으로 봄)';
  else if(e.group!==null&&(e.group<=2||e.group>=13)) val=(e.group<=2?e.group:e.group-10)+'개';
  else val='전이 원소는 한 가지로 정하기 어려움';
  return {outer,val};
}
/* 보어 모형 SVG: 전자를 쌓음(Aufbau) 순서대로 하나씩 채움 */
function bohrSVG(z,{size=300,delay=60,spin=true,id=''}={}){
  const [full,,shells]=ECONF[z-1], e=byZ(z), n=shells.length;
  const R0=30, Rmax=132, step=n>1?(Rmax-R0-8)/(n-1):0;
  const radius=i=>n===1?60:R0+14+i*step;
  // 쌓음 순서로 각 껍질에 전자가 들어가는 순번 만들기
  const order=[]; full.split(' ').forEach(t=>{const m=t.match(/^(\d)([spdf])(\d+)$/); if(m) for(let k=0;k<+m[3];k++) order.push(+m[1]-1);});
  const seen=shells.map(()=>0), seq=shells.map(c=>new Array(c));
  order.forEach((s,idx)=>{ seq[s][seen[s]++]=idx; });
  const dots=n>=5?3.2:4.2, last=n-1;
  let g=`<svg viewBox="-150 -150 300 300" width="${size}" height="${size}" class="bohr" ${id?`id="${id}"`:''} role="img" aria-label="${e.ko} 보어 모형: 껍질별 전자 ${shells.join(', ')}">`;
  shells.forEach((c,i)=>{ const r=radius(i);
    g+=`<circle r="${r}" fill="none" style="stroke:${i===last?'#fdba74':'var(--orbit)'}" stroke-width="${i===last?1.6:1}" ${i===last?'stroke-dasharray="3 3"':''}/>`;
    g+=`<text x="0" y="${-r-3}" text-anchor="middle" font-size="9" style="fill:var(--muted)">${SHELL_NAMES[i]} ${c}</text>`; });
  g+=`<circle r="${R0-6}" fill="#4f46e5"/><text y="-2" text-anchor="middle" font-size="${R0>26?14:12}" font-weight="800" fill="#fff">${e.sym}</text><text y="11" text-anchor="middle" font-size="8.5" fill="#e0e7ff">+${z}</text>`;
  shells.forEach((c,i)=>{ const r=radius(i), dur=(8+i*5)*(i%2?-1:1);
    g+=`<g class="orbit${spin&&!reduceMotion?' spin':''}" style="animation-duration:${Math.abs(dur)}s;animation-direction:${dur<0?'reverse':'normal'}">`;
    for(let k=0;k<c;k++){ const a=-Math.PI/2+2*Math.PI*k/c, x=(r*Math.cos(a)).toFixed(2), y=(r*Math.sin(a)).toFixed(2);
      g+=`<circle class="el-e" cx="${x}" cy="${y}" r="${dots}" fill="${i===last?'#f97316':'#2a78d6'}" style="stroke:var(--card)" stroke-width="1" style="animation-delay:${reduceMotion?0:seq[i][k]*delay}ms"/>`; }
    g+='</g>'; });
  return g+'</svg>';
}
/* 오비탈 상자 그림 (훈트 규칙: 홀전자 ↑ 먼저, 그다음 ↓) */
function orbitalBoxes(z,delay=120){
  const short=ECONF[z-1][1];
  const subs=short.split(' ').filter(t=>/^\d[spdf]\d+$/.test(t));
  const BOX={s:1,p:3,d:5,f:7}; let html='<div class="obox-wrap">', idx=0;
  subs.forEach(t=>{ const [,nl,l,c]=t.match(/^(\d([spdf]))(\d+)$/).concat(); const m=BOX[l], cnt=+c;
    const nlTxt=t.match(/^\d[spdf]/)[0];
    html+=`<div class="obox"><div class="boxes">`;
    const order=[]; for(let i=0;i<cnt;i++) order.push(i<m?[i,'u']:[i-m,'d']);
    const cell=[...Array(m)].map(()=>({u:null,d:null}));
    order.forEach(([b,dir])=>{ cell[b][dir]=idx++; });
    cell.forEach(cl=>{ html+=`<span class="b">${cl.u!=null?`<i class="ar" style="animation-delay:${reduceMotion?0:cl.u*delay}ms">↑</i>`:''}${cl.d!=null?`<i class="ar" style="animation-delay:${reduceMotion?0:cl.d*delay}ms">↓</i>`:''}</span>`; });
    html+=`</div><div class="lb">${nlTxt}</div></div>`; });
  const core=short.match(/^\[(\w+)\]/);
  return (core?`<div class="muted" style="font-size:.8rem;margin-bottom:4px">[${core[1]}] = ${byZ(EL.find(x=>x.sym===core[1]).z).ko}과 같은 안쪽 전자 배치 (생략)</div>`:'')+html+'</div>';
}
function ecSummary(e){
  const [full,short,shells]=ECONF[e.z-1], v=valenceInfo(e);
  return `<div class="facts" style="margin:8px 0">
    <div><b>전자 수</b>${e.z}개 (= 양성자 수)</div>
    <div><b>껍질별 전자 수</b>${shells.map((c,i)=>SHELL_NAMES[i]+' '+c).join(' · ')}</div>
    <div><b>전자 껍질 수</b>${shells.length}개 → ${e.period}주기</div>
    <div><b>원자가 전자</b>${v.val}</div>
  </div>
  <div style="font-size:.88rem"><b>전자 배치</b>: <span class="cfg">${supCfg(short)}</span>${short!==full?`<br><span class="muted">전체: ${supCfg(full)}</span>`:''}</div>`;
}
/* ----- 전자 배치 탭 ----- */
let ecZ=11, ecTimer=null, ecView='3d';
function renderEC(replay=true){
  const e=byZ(ecZ), spin=document.getElementById('ecSpin').checked, sp=+document.getElementById('ecSpeed').value;
  document.getElementById('ecSlider').value=ecZ;
  const is3d=ecView==='3d';
  document.getElementById('orbWrap').style.display=is3d?'block':'none';
  document.getElementById('bohrWrap').style.display=is3d?'none':'block';
  if(is3d){ if(THREE) orbShow(ecZ); else { document.getElementById('orbInfo').textContent='3D 엔진 불러오는 중…'; loadThree().then(()=>{ if(ecView==='3d'&&document.getElementById('page-ec').classList.contains('active')) orbShow(ecZ); }).catch(()=>{ document.getElementById('orbCanvas').innerHTML='<p class="muted" style="padding:20px">3D 엔진을 불러오지 못했습니다. 보어 모형으로 보세요.</p>'; }); } } else document.getElementById('ecStage').innerHTML=bohrSVG(ecZ,{size:340,delay:sp,spin});
  const sh=ECONF[ecZ-1][2], v=valenceInfo(e);
  document.getElementById('ecInfo').innerHTML=`
    <div class="row" style="align-items:center"><div class="m-tile cat-${e.cat}" style="width:64px;height:64px"><span class="z">${e.z}</span><span class="s" style="font-size:1.6rem">${e.sym}</span></div>
    <div><h2 style="margin:0">${e.ko}</h2><span class="muted">${e.period}주기 · ${groupText(e)} · ${CAT[e.cat].ko}</span></div></div>
    ${ecSummary(e)}
    <h4 style="margin:12px 0 4px">📦 오비탈 상자 그림 <span class="muted" style="font-weight:400">(바깥쪽 전자)</span></h4>
    ${orbitalBoxes(ecZ, Math.max(60,sp*2))}
    ${ecNote(e)}`;
}
function ecNote(e){
  const notes={24:'⚠️ <b>예외!</b> 크로뮴은 규칙대로라면 3d⁴ 4s² 이지만, d 오비탈이 <b>절반(5개) 채워질 때 더 안정</b>해서 3d⁵ 4s¹ 이 됩니다.',
    29:'⚠️ <b>예외!</b> 구리는 규칙대로라면 3d⁹ 4s² 이지만, d 오비탈이 <b>꽉 채워질 때(10개) 더 안정</b>해서 3d¹⁰ 4s¹ 이 됩니다.',
    19:'💡 칼륨부터 4번째 껍질(N)이 시작됩니다. 3번째 껍질(M)은 18개까지 들어갈 수 있지만, <b>4s가 3d보다 먼저</b> 채워지기 때문입니다.',
    21:'💡 스칸듐부터 <b>전이 원소</b>입니다. 4s가 채워진 뒤, 안쪽 M 껍질의 <b>3d 오비탈</b>을 채워 갑니다. 그래서 바깥 껍질 전자 수는 대부분 2개로 비슷합니다.'};
  let t=notes[e.z]||'';
  if(!t&&e.group===18&&e.z>2) t='✨ 18족: 가장 바깥 껍질에 전자가 <b>8개(옥텟)</b>로 꽉 차 있어 매우 안정합니다.';
  if(!t&&e.z===2) t='✨ 헬륨: 첫 번째 껍질(K)은 전자 2개면 꽉 찹니다. 그래서 바깥 전자가 2개여도 18족에 들어갑니다.';
  if(!t&&e.group===1&&e.z>1) t='💡 1족: 가장 바깥 껍질에 전자가 <b>1개</b>뿐이라, 이 전자를 잃고 +1 이온이 되기 쉽습니다. 그래서 반응성이 큽니다.';
  if(!t&&e.group===17) t='💡 17족: 가장 바깥 껍질에 전자가 <b>7개</b>라, 1개를 얻어 −1 이온이 되기 쉽습니다.';
  if(!t&&(e.cat==='lanthanide'||e.cat==='actinide')) t='💡 란타넘족·악티늄족은 안쪽의 <b>f 오비탈</b>을 채우기 때문에 바깥쪽 전자 배치가 서로 비슷하고, 성질도 비슷합니다.';
  if(e.z>=104) t+=(t?'<br>':'')+'⚠️ 104번 이후 원소의 전자 배치는 실험으로 확인되지 않은 <b>예측값</b>입니다.';
  if(e.z===103) t+=(t?'<br>':'')+'⚠️ 로렌슘의 전자 배치(7p¹ 또는 6d¹)는 아직 논란이 있습니다.';
  return t?`<div class="box" style="margin-top:10px;font-size:.88rem">${t}</div>`:'';
}
document.querySelectorAll('#ecView button').forEach(b=>b.onclick=()=>{ ecView=b.dataset.v; document.querySelectorAll('#ecView button').forEach(x=>x.classList.toggle('on',x===b)); renderEC(); });
['orbCloud','orbSep'].forEach(id=>document.getElementById(id).onchange=()=>{ if(orb.z) orbShow(orb.z); });
function ecGo(z){ ecZ=Math.max(1,Math.min(118,z)); renderEC(); }
document.getElementById('ecSlider').oninput=ev=>ecGo(+ev.target.value);
document.getElementById('ecPrev').onclick=()=>{ecStop();ecGo(ecZ-1);};
document.getElementById('ecNext').onclick=()=>{ecStop();ecGo(ecZ+1);};
document.getElementById('ecReplay').onclick=()=>renderEC();
document.getElementById('ecSpin').onchange=()=>renderEC();
document.getElementById('ecSpeed').onchange=()=>renderEC();
document.getElementById('ecSearch').onchange=ev=>{ const q=ev.target.value.trim().toLowerCase();
  const f=EL.find(e=>e.sym.toLowerCase()===q||e.ko.includes(q)||String(e.z)===q||e.en.toLowerCase()===q); if(f){ecStop();ecGo(f.z);} ev.target.value=''; };
function ecStop(){ if(ecTimer){clearInterval(ecTimer);ecTimer=null;} document.getElementById('ecPlay').textContent='▶ 1번부터 차례로 재생'; }
document.getElementById('ecPlay').onclick=()=>{
  if(ecTimer){ecStop();return;}
  ecZ=0;
  document.getElementById('ecPlay').textContent='⏸ 멈춤';
  ecGo(ecZ+1);
  ecTimer=setInterval(()=>{ if(ecZ>=36||!document.getElementById('page-ec').classList.contains('active')){ecStop();return;} ecGo(ecZ+1); },2200);
};
function replayModalBohr(z){ const box=document.getElementById('mBohr'); if(box) box.innerHTML=bohrSVG(z,{size:220,delay:70}); }

/* ============ 확인 창 (페이지 안에서 띄움) ============ */
function askConfirm(msg){ return new Promise(res=>{ const bg=document.getElementById('confirmBg'); document.getElementById('confirmMsg').textContent=msg; bg.classList.add('show');
  const done=v=>{bg.classList.remove('show');res(v);}; document.getElementById('confirmYes').onclick=()=>done(true); document.getElementById('confirmNo').onclick=()=>done(false); }); }

/* ============ 순위표 ============ */
const BOARDS=[['20','1~20번'],['36','1~36번'],['54','1~54번'],['86','1~86번'],['118','전체'],['total','누적 정답']];
const RANGE_KEYS=['20','36','54','86','118'];
let lbBoard='20', lbNames={};
const int=(v,max)=>{v=Math.round(Number(v)); return Number.isFinite(v)?Math.max(0,Math.min(max,v)):0;};
function cleanRec(d){ // 공유 데이터는 믿을 수 없으므로 정리
  const out={best:{},total:{c:0,q:0},ts:0}; if(!d||typeof d!=='object') return out;
  const b=d.best||d.b||{};
  RANGE_KEYS.forEach(k=>{ const r=b[k]; if(r&&typeof r==='object'){ const t=int(r.t,30), c=Math.min(int(r.c,30),t);
    if(t>=10) out.best[k]={c,t,pct:Math.round(c/t*1000)/10,sec:int(r.sec,36000),at:String(r.at||'').slice(0,10)}; } });
  const tt=d.total||d.t||{}; out.total={q:int(tt.q,1e7)}; out.total.c=Math.min(int(tt.c,1e7),out.total.q);
  out.ts=int(d.ts,1e14); if(typeof d.n==='string') out.n=d.n.slice(0,20);
  return out;
}
function better(a,b){ if(!b) return true; if(a.pct!==b.pct) return a.pct>b.pct; if(a.sec!==b.sec) return a.sec<b.sec; return a.t>b.t; }
function recordQuiz(range,type,c,t,sec){
  myRec.total.c+=c; myRec.total.q+=t; let newBest=false;
  if(type==='mix'&&t>=10){ const r={c,t,pct:Math.round(c/t*1000)/10,sec,at:todayKey()}; if(better(r,myRec.best[range])){myRec.best[range]=r;newBest=true;} }
  myRec.ts=Date.now(); LS.set('pt_my',myRec); pushOnline(); return newBest;
}
let pushing=false, pushAgain=false;
async function pushOnline(){
  if(!online.db||!online.uid||!online.canWrite) return;
  if(pushing){pushAgain=true;return;} pushing=true;
  try{ await online.db.doc('scores/'+online.uid).set({best:myRec.best,total:myRec.total,ts:myRec.ts}); }
  catch(e){ if(e&&e.code==='invalid_argument'){online.canWrite=false;renderLB();} }
  pushing=false; if(pushAgain){pushAgain=false;pushOnline();}
}
/* 온라인(claude.ai 아티팩트로 열었을 때만): 공유 순위표 + 내 학습 기록 저장 */
(async()=>{
  if(!window.claude||typeof window.claude.use!=='function') return;
  let db,user; try{ [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]); }catch(_){ return; }
  if(!db||!user) return;
  const uid=await user.id(); if(!uid) return;
  Object.assign(online,{db,user,uid,status:'loading'});
  try{ if((await user.can('data.write'))===false) online.canWrite=false; }catch(_){}
  renderLB();
  // 내 학습 기록(외운 원소·달력) 불러오기
  try{ const ref=db.doc('data/users/'+uid+'/state'); const s=await ref.get(); online.stateRef=ref;
    if(s.exists){ const d=s.data()||{}; if((d.ts||0)>LS.get('pt_state_ts',0)){
      known=new Set((d.known||[]).map(Number).filter(z=>z>=1&&z<=118)); logs=JSON.parse(JSON.stringify(d.logs||{})); lastWrong=(d.lastWrong||[]).map(Number); if(Array.isArray(d.attempts)){ ATT=d.attempts.filter(a=>Array.isArray(a)&&a.length===5&&TYPE_KO[a[1]]&&a[2]>=1&&a[2]<=118).slice(-600); LS.set('pt_att',ATT); }
      LS.set('pt_known',[...known]); LS.set('pt_logs',logs); LS.set('pt_lastWrong',lastWrong); LS.set('pt_state_ts',d.ts);
      renderTable(); buildDeck(); } }
    else if(Object.keys(logs).length||known.size) markState();
  }catch(_){}
  // 내 점수 합치기 (다른 기기 기록 포함)
  try{ const s=await db.doc('scores/'+uid).get();
    if(s.exists){ const r=cleanRec(s.data()); let changed=false;
      RANGE_KEYS.forEach(k=>{ if(r.best[k]&&better(r.best[k],myRec.best[k])) myRec.best[k]=r.best[k]; else if(myRec.best[k]&&better(myRec.best[k],r.best[k])) changed=true; });
      if(r.total.q>myRec.total.q) myRec.total=r.total; else if(myRec.total.q>r.total.q) changed=true;
      myRec.ts=Math.max(myRec.ts,r.ts); LS.set('pt_my',myRec); if(changed) pushOnline(); }
    else if(myRec.total.q>0) pushOnline();
  }catch(_){}
  const timer=setTimeout(()=>{ if(online.status==='loading'){online.status='slow';renderLB();} },10000);
  db.collection('scores').onSnapshot(snap=>{
    online.rows={}; snap.docs.forEach(d=>{ if(d.exists) online.rows[d.id]=cleanRec(d.data()); });
    if(!snap.metadata.fromCache){ clearTimeout(timer); online.status='live'; }
    renderLB();
  }, ()=>{ clearTimeout(timer); online.status='error'; renderLB(); });
})();
let stateTimer=null, stateWriting=false;
function markState(){
  LS.set('pt_state_ts',Date.now());
  if(!online.stateRef) return;
  clearTimeout(stateTimer); stateTimer=setTimeout(writeState,1500);
}
async function writeState(){
  if(stateWriting){ stateTimer=setTimeout(writeState,800); return; }
  stateWriting=true;
  try{ await online.stateRef.set({known:[...known],logs,lastWrong,attempts:ATT,ts:LS.get('pt_state_ts',Date.now())}); }catch(_){}
  stateWriting=false;
}
/* 점수 코드 (서버 없이 친구와 비교) */
const b64e=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4)s+='='; return decodeURIComponent(escape(atob(s)));};
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
function makeCode(){ const body=b64e(JSON.stringify({n:nick,b:myRec.best,t:myRec.total,ts:Date.now()})); return 'PT1.'+body+'.'+hashStr(body); }
function readCode(code){ const m=String(code).trim().match(/^PT1\.([\w-]+)\.(\w+)$/); if(!m||hashStr(m[1])!==m[2]) throw new Error('bad'); const r=cleanRec(JSON.parse(b64d(m[1]))); if(!r.n) throw new Error('noname'); return r; }
function fmtSec(s){ return s>=60?`${Math.floor(s/60)}분 ${s%60}초`:`${s}초`; }
async function renderLB(){
  const page=document.getElementById('page-lb'); if(!page) return;
  // 상태 안내
  const st=document.getElementById('lbStatus');
  if(online.db){
    st.className='box'; st.innerHTML = online.status==='error' ? '⚠️ 온라인 순위표를 불러오지 못했습니다. 아래 점수 코드 방식은 계속 쓸 수 있어요.'
      : online.status==='slow' ? '⏳ 온라인 순위표를 불러오는 중입니다. 연결이 느리면 최신 기록이 아닐 수 있어요.'
      : online.status==='loading' ? '⏳ 온라인 순위표 불러오는 중…'
      : `🌐 <b>온라인 순위표</b> · 이 페이지를 함께 쓰는 친구들의 기록이 <b>실시간으로</b> 모입니다.${online.canWrite?'':'<br>👀 지금은 <b>보기 전용 권한</b>이라 내 점수가 올라가지 않아요. 페이지를 만든 사람에게 <b>편집자(Editor)</b>로 초대해 달라고 하거나, 아래 점수 코드를 쓰세요.'}`;
  } else {
    st.className='box'; st.innerHTML='📱 <b>오프라인 모드</b> · 이 파일에는 서버가 없어서, 친구와 <b>점수 코드</b>를 주고받아 순위를 비교합니다. (claude.ai 아티팩트로 열면 온라인 순위표가 켜집니다)';
  }
  // 줄 모으기
  const rows=[];
  if(online.db&&online.status!=='error'){
    const ids=Object.keys(online.rows);
    if(ids.length){ try{ const ps=await online.user.profiles(ids); ids.forEach(id=>{ lbNames[id]=(ps&&ps[id]&&ps[id].name)||lbNames[id]||'친구'; }); }catch(_){} }
    ids.forEach(id=>rows.push({name:id===online.uid?(lbNames[id]||'나'):(lbNames[id]||'친구'),me:id===online.uid,src:'🌐',rec:online.rows[id]}));
    if(!online.rows[online.uid]) rows.push({name:'나',me:true,src:'🌐',rec:myRec});
  } else rows.push({name:nick||'나',me:true,src:'📱',rec:myRec});
  Object.entries(friends).forEach(([n,r])=>rows.push({name:n,me:false,src:'🔑',rec:r}));
  // 정렬
  let list, head;
  if(lbBoard==='total'){
    list=rows.filter(r=>r.rec.total&&r.rec.total.q>0).sort((a,b)=>b.rec.total.c-a.rec.total.c||a.rec.total.q-b.rec.total.q);
    head='<tr><th>순위</th><th>이름</th><th>누적 정답</th><th>푼 문제</th><th>정답률</th></tr>';
  } else {
    list=rows.filter(r=>r.rec.best&&r.rec.best[lbBoard]).sort((a,b)=>better(a.rec.best[lbBoard],b.rec.best[lbBoard])?-1:1);
    head='<tr><th>순위</th><th>이름</th><th>정답률</th><th>맞힌 문제</th><th>걸린 시간</th><th>기록한 날</th></tr>';
  }
  const medal=i=>['🥇','🥈','🥉'][i]||(i+1);
  const body=list.map((r,i)=>{ const nm=`${r.src} ${escapeHtml(r.name)}${r.me?' <b>(나)</b>':''}`;
    if(lbBoard==='total'){ const t=r.rec.total; return `<tr class="${r.me?'me':''}"><td>${medal(i)}</td><td>${nm}</td><td><b>${t.c}</b>개</td><td>${t.q}개</td><td>${t.q?Math.round(t.c/t.q*100):0}%</td></tr>`; }
    const b=r.rec.best[lbBoard]; return `<tr class="${r.me?'me':''}"><td>${medal(i)}</td><td>${nm}</td><td><b>${b.pct}%</b></td><td>${b.c} / ${b.t}</td><td>${fmtSec(b.sec)}</td><td>${escapeHtml(b.at)}</td></tr>`; }).join('');
  document.getElementById('lbTable').innerHTML = list.length ? `<table class="simple lb">${head}${body}</table>`
    : `<p class="muted" style="text-align:center;padding:20px 0">아직 이 순위표에 기록이 없어요. ❓ 퀴즈에서 <b>🎲 섞어서</b> 유형으로 범위 <b>${(BOARDS.find(b=>b[0]===lbBoard)||[])[1]}</b>, 10문제 이상을 풀어 첫 기록을 남겨 보세요!</p>`;
  const myIdx=list.findIndex(r=>r.me);
  document.getElementById('lbMine').textContent = myIdx>=0 ? `내 순위: ${myIdx+1}위 / ${list.length}명` : '';
  // 친구 목록
  const fl=document.getElementById('lbFriends');
  const names=Object.keys(friends);
  fl.innerHTML = names.length ? names.map(n=>`<span class="chip">🔑 ${escapeHtml(n)} <button data-n="${escapeHtml(n)}" aria-label="${escapeHtml(n)} 삭제">×</button></span>`).join('') : '<span class="muted">아직 추가한 친구가 없어요.</span>';
  fl.querySelectorAll('button').forEach(b=>b.onclick=async()=>{ if(await askConfirm(`'${b.dataset.n}' 님의 기록을 순위표에서 지울까요?`)){ delete friends[b.dataset.n]; LS.set('pt_friends',friends); renderLB(); } });
}
function initLB(){
  const seg=document.getElementById('lbBoards');
  seg.innerHTML=BOARDS.map(([k,l])=>`<button data-b="${k}" class="${k===lbBoard?'on':''}">${l}</button>`).join('');
  seg.querySelectorAll('button').forEach(b=>b.onclick=()=>{lbBoard=b.dataset.b;initLB();});
  document.getElementById('lbNick').value=nick;
  renderLB();
}
document.getElementById('lbNick').onchange=ev=>{ nick=ev.target.value.trim().slice(0,20); LS.set('pt_nick',nick); document.getElementById('lbCode').value=''; renderLB(); };
document.getElementById('lbMake').onclick=async()=>{
  nick=document.getElementById('lbNick').value.trim().slice(0,20); LS.set('pt_nick',nick);
  const msg=document.getElementById('lbMsg');
  if(!nick){ msg.textContent='⚠️ 먼저 닉네임을 입력하세요.'; return; }
  if(!myRec.total.q){ msg.textContent='⚠️ 아직 퀴즈 기록이 없어요. 퀴즈를 먼저 풀어 보세요.'; return; }
  const code=makeCode(); const ta=document.getElementById('lbCode'); ta.value=code;
  try{ await navigator.clipboard.writeText(code); msg.textContent='✅ 내 점수 코드를 복사했어요. 카톡 등으로 친구에게 보내세요!'; }
  catch(_){ ta.select(); msg.textContent='✅ 코드를 만들었어요. 위 칸의 코드를 길게 눌러 복사해 친구에게 보내세요.'; }
};
document.getElementById('lbAdd').onclick=()=>{
  const inp=document.getElementById('lbPaste'), msg=document.getElementById('lbMsg2');
  const codes=inp.value.split(/\s+/).filter(Boolean); let ok=0, bad=0;
  codes.forEach(c=>{ try{ const r=readCode(c); if(r.n===nick){bad++;return;} const old=friends[r.n]; if(!old||r.ts>=old.ts){friends[r.n]=r;} ok++; }catch(_){bad++;} });
  LS.set('pt_friends',friends); inp.value='';
  msg.textContent = ok ? `✅ ${ok}명의 기록을 순위표에 넣었어요.${bad?` (${bad}개는 잘못된 코드라 건너뜀)`:''}` : '⚠️ 올바른 점수 코드가 아니에요. PT1. 으로 시작하는 코드를 통째로 붙여 넣으세요. (내 코드는 넣을 수 없어요)';
  renderLB();
};

/* ============ 3D 오비탈 (three.js) ============
   오비탈의 '모양'은 실수 구면조화함수 Y(θ,φ)의 극좌표 그림(|Y|)으로 그림.
   색 = 파동함수 부호(위상). 크기·방사 마디(radial node)는 단순화함. */
const ORB_DEF={
  s:[['s',(x,y,z)=>1]],
  p:[['p<sub>x</sub>',(x,y,z)=>x],['p<sub>y</sub>',(x,y,z)=>y],['p<sub>z</sub>',(x,y,z)=>z]],
  d:[['d<sub>xy</sub>',(x,y,z)=>x*y],['d<sub>yz</sub>',(x,y,z)=>y*z],['d<sub>xz</sub>',(x,y,z)=>x*z],['d<sub>x²−y²</sub>',(x,y,z)=>x*x-y*y],['d<sub>z²</sub>',(x,y,z)=>3*z*z-1]],
  f:[['f<sub>z³</sub>',(x,y,z)=>z*(5*z*z-3)],['f<sub>xz²</sub>',(x,y,z)=>x*(5*z*z-1)],['f<sub>yz²</sub>',(x,y,z)=>y*(5*z*z-1)],['f<sub>xyz</sub>',(x,y,z)=>x*y*z],
     ['f<sub>z(x²−y²)</sub>',(x,y,z)=>z*(x*x-y*y)],['f<sub>x(x²−3y²)</sub>',(x,y,z)=>x*(x*x-3*y*y)],['f<sub>y(3x²−y²)</sub>',(x,y,z)=>y*(3*x*x-y*y)]]
};
const PH_POS=0x3987e5, PH_NEG=0xf97316;
const plain=s=>s.replace(/<sub>|<\/sub>/g,'');
const orb={ready:false,renderer:null,scene:null,camera:null,group:null,raf:0,rotY:0.6,rotX:0.35,dist:7,auto:true,anim:[],z:null,sub:null,sep:false,cloud:false,last:0};
function orbInit(){
  if(orb.ready) return true;
  const host=document.getElementById('orbCanvas');
  if(!THREE){ host.innerHTML='<p class="muted" style="padding:20px">3D 그래픽을 불러오지 못했습니다. 보어 모형으로 보세요.</p>'; return false; }
  let renderer; try{ renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); }catch(_){ host.innerHTML='<p class="muted" style="padding:20px">이 기기/브라우저는 3D(WebGL)를 지원하지 않습니다. 보어 모형으로 보세요.</p>'; return false; }
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(40,1,0.1,100);
  scene.add(new THREE.AmbientLight(0xffffff,0.55));
  const dl=new THREE.DirectionalLight(0xffffff,0.75); dl.position.set(4,6,5); scene.add(dl);
  const dl2=new THREE.DirectionalLight(0xffffff,0.3); dl2.position.set(-5,-3,-4); scene.add(dl2);
  const group=new THREE.Group(); scene.add(group);
  Object.assign(orb,{renderer,scene,camera,group,ready:true});
  // 끌어서 회전, 휠/두 손가락으로 확대
  const cv=renderer.domElement; let drag=null, pinch=null;
  cv.style.touchAction='none'; cv.style.cursor='grab';
  cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};orb.auto=false;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';});
  cv.addEventListener('pointermove',e=>{ if(!drag||pinch) return; orb.rotY+=(e.clientX-drag.x)*0.01; orb.rotX=Math.max(-1.5,Math.min(1.5,orb.rotX+(e.clientY-drag.y)*0.01)); drag={x:e.clientX,y:e.clientY}; });
  const end=()=>{drag=null;cv.style.cursor='grab';}; cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end);
  cv.addEventListener('wheel',e=>{e.preventDefault(); orb.dist=Math.max(3,Math.min(30,orb.dist*(e.deltaY>0?1.1:0.9)));},{passive:false});
  cv.addEventListener('touchstart',e=>{ if(e.touches.length===2){ pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);} },{passive:true});
  cv.addEventListener('touchmove',e=>{ if(e.touches.length===2&&pinch){ const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); orb.dist=Math.max(3,Math.min(30,orb.dist*pinch/d)); pinch=d; } },{passive:true});
  cv.addEventListener('touchend',()=>{pinch=null;},{passive:true});
  window.addEventListener('resize',orbResize);
  return true;
}
function orbResize(){ if(!orb.ready) return; const host=document.getElementById('orbCanvas'); const w=host.clientWidth||340, h=Math.round(Math.min(420,Math.max(280,w*0.85)));
  orb.renderer.setSize(w,h); orb.camera.aspect=w/h; orb.camera.updateProjectionMatrix(); }
function textSprite(txt,color='#334155',scale=0.5){
  const c=document.createElement('canvas'); c.width=512; c.height=96; const g=c.getContext('2d');
  g.font='bold 60px sans-serif'; g.fillStyle=color; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,256,48,500);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));
  sp.scale.set(scale*512/96,scale,1); return sp;
}
// 화학 좌표 (x, y, z: z가 위쪽) → three 좌표 (x, z, −y)
const toChem=v=>[v.x,-v.z,v.y];
function orbitalMesh(fn,size,isS){
  const geo=new THREE.SphereGeometry(1,isS?48:128,isS?32:96), pos=geo.attributes.position, cols=new Float32Array(pos.count*3);
  let mx=0; const vals=new Float32Array(pos.count), v=new THREE.Vector3();
  for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).normalize(); const [x,y,z]=toChem(v); vals[i]=fn(x,y,z); mx=Math.max(mx,Math.abs(vals[i])); }
  const cP=new THREE.Color(PH_POS), cN=new THREE.Color(PH_NEG);
  for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).normalize(); const a=Math.abs(vals[i])/mx, r=(isS?1:a*a)*size; pos.setXYZ(i,v.x*r,v.y*r,v.z*r);
    const c=vals[i]>=0?cP:cN; cols[i*3]=c.r; cols[i*3+1]=c.g; cols[i*3+2]=c.b; }
  geo.setAttribute('color',new THREE.BufferAttribute(cols,3)); geo.computeVertexNormals();
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,transparent:true,opacity:0.85,shininess:60,side:THREE.DoubleSide,depthWrite:false});
  return new THREE.Mesh(geo,mat);
}
function cloudPoints(fn,size,count){
  const pts=[], cols=[], cP=new THREE.Color(PH_POS), cN=new THREE.Color(PH_NEG);
  let mx=0; for(let i=0;i<400;i++){ const u=Math.random()*2-1, t=Math.random()*Math.PI*2, s=Math.sqrt(1-u*u); mx=Math.max(mx,Math.abs(fn(s*Math.cos(t),s*Math.sin(t),u))); }
  mx=mx||1; let guard=0;
  while(pts.length<count*3&&guard++<count*60){ const u=Math.random()*2-1, t=Math.random()*Math.PI*2, s=Math.sqrt(1-u*u);
    const x=s*Math.cos(t), y=s*Math.sin(t), z=u, val=fn(x,y,z)/mx;
    if(Math.random()>val*val*val*val) continue;
    const r=val*val*size*Math.cbrt(Math.random());
    pts.push(x*r, z*r, -y*r); const c=val>=0?cP:cN; cols.push(c.r,c.g,c.b); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  return new THREE.Points(geo,new THREE.PointsMaterial({size:0.05,vertexColors:true,transparent:true,opacity:0.8,depthWrite:false}));
}
function clearGroup(g){ while(g.children.length){ const o=g.children.pop(); o.traverse(n=>{ if(n.geometry) n.geometry.dispose(); if(n.material){ if(n.material.map) n.material.map.dispose(); n.material.dispose(); } }); } }
function axes(len){
  const g=new THREE.Group(), m=new THREE.LineBasicMaterial({color:isDark()?0x566072:0x94a3b8,transparent:true,opacity:0.7});
  [[[1,0,0],'x'],[[0,0,-1],'y'],[[0,1,0],'z']].forEach(([d,n])=>{
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-d[0]*len,-d[1]*len,-d[2]*len),new THREE.Vector3(d[0]*len,d[1]*len,d[2]*len)]);
    g.add(new THREE.Line(geo,m)); const sp=textSprite(n,isDark()?'#98a2b3':'#64748b',0.45); sp.position.set(d[0]*(len+0.3),d[1]*(len+0.3),d[2]*(len+0.3)); g.add(sp); });
  return g;
}
const sizeFor=n=>0.75+0.3*n;
// 원소의 부껍질 목록 (쌓음 순서) [{name:'2p',n,l,count}]
function subshellsOf(z){ return ECONF[z-1][0].split(' ').map(t=>t.match(/^(\d)([spdf])(\d+)$/)).filter(Boolean).map(m=>({name:m[1]+m[2],n:+m[1],l:m[2],count:+m[3]})); }
// 훈트 규칙: 오비탈별 전자 수
function hund(m,c){ const occ=new Array(m).fill(0); for(let i=0;i<c;i++) occ[i<m?i:i-m]++; return occ; }
function orbShow(z,subName){
  if(!orbInit()) return;
  const subs=subshellsOf(z);
  if(orb.z!==z){ orb.z=z; orb.sub=null; }
  const prevSub=orb.sub;
  if(subName!==undefined) orb.sub=subName;
  if(!orb.sub||(orb.sub!=='all'&&!subs.find(s=>s.name===orb.sub))) orb.sub=subs[subs.length-1].name;
  if(orb.sub!==prevSub&&orb.sub!=='all') document.getElementById('orbSep').checked=/[df]$/.test(orb.sub);
  // 부껍질 버튼
  document.getElementById('orbChips').innerHTML=subs.map(s=>`<button data-s="${s.name}" class="${s.name===orb.sub?'on':''}">${s.name}<sup>${s.count}</sup></button>`).join('')+`<button data-s="all" class="${orb.sub==='all'?'on':''}">전체 겹쳐 보기</button>`;
  document.getElementById('orbChips').querySelectorAll('button').forEach(b=>b.onclick=()=>orbShow(z,b.dataset.s));
  const g=orb.group; clearGroup(g); orb.anim=[]; orb.bodies=[]; orb.sepMode=false; g.rotation.set(0,0,0);
  const sp=+document.getElementById('ecSpeed').value, stepMs=Math.max(120,sp*5);
  let info='';
  if(orb.sub==='all'){
    // 전체: 각 부껍질 오비탈을 크기만 다르게 겹쳐서
    subs.forEach((s,si)=>{ const defs=ORB_DEF[s.l], occ=hund(defs.length,s.count);
      defs.forEach(([nm,fn],i)=>{ if(!occ[i]) return; const mesh=orbitalMesh(fn,sizeFor(s.n),s.l==='s'); mesh.material.opacity=s.l==='s'?0.12:0.35; mesh.scale.setScalar(0.001); g.add(mesh);
        orb.anim.push({obj:mesh,t0:performance.now()+si*stepMs,dur:500}); }); });
    g.add(axes(sizeFor(subs[subs.length-1].n)+0.6));
    orb.dist=Math.max(7,sizeFor(subs[subs.length-1].n)*3.2);
    info=`<b>전체 ${subs.length}개 부껍질을 겹쳐 본 모습</b> — 안쪽(n이 작은) 오비탈일수록 작고 핵에 가깝습니다. s 오비탈은 흐리게 표시했습니다.`;
  } else {
    const s=subs.find(x=>x.name===orb.sub), defs=ORB_DEF[s.l], m=defs.length, occ=hund(m,s.count);
    const sep=document.getElementById('orbSep').checked&&m>1, cloud=document.getElementById('orbCloud').checked;
    const size=1.6, gap=size*2.3;
    // 전자 하나씩: 훈트 규칙 순서 (↑ 먼저 하나씩, 그다음 ↓)
    const order=[]; for(let i=0;i<s.count;i++) order.push(i<m?i:i-m);
    defs.forEach(([nm,fn],i)=>{
      const holder=new THREE.Group();
      if(sep){ const cols=Math.min(m,4), row=Math.floor(i/cols), col=i%cols, rowsN=Math.ceil(m/cols), inRow=Math.min(cols,m-row*cols);
        holder.position.set((col-(inRow-1)/2)*gap,-(row-(rowsN-1)/2)*gap,0);
        const lb=textSprite(plain(nm)+'  '+(occ[i]===2?'↑↓':occ[i]===1?'↑':'(빈칸)'),occ[i]?(isDark()?'#e6e9ef':'#1e293b'):(isDark()?'#566072':'#94a3b8'),0.5); lb.position.set(0,-size-0.3,0); holder.add(lb); }
      g.add(holder);
      const body=cloud?cloudPoints(fn,size,occ[i]*700||1):orbitalMesh(fn,size,s.l==='s');
      if(!occ[i]){ if(cloud){ body.visible=false; } else { body.material.opacity=0.08; body.material.wireframe=true; } }
      else if(!cloud&&occ[i]===1) body.material.opacity=0.55;
      orb.bodies.push(body);
      body.scale.setScalar(occ[i]?0.001:1); holder.add(body);
      const first=order.indexOf(i), second=order.lastIndexOf(i);
      if(occ[i]){ orb.anim.push({obj:body,t0:performance.now()+first*stepMs,dur:450});
        if(!cloud&&occ[i]===2){ body.material.opacity=0.45; orb.anim.push({obj:body,t0:performance.now()+second*stepMs,dur:300,fade:0.88}); } }
    });
    if(!sep) g.add(axes(size+0.5)); orb.sepMode=sep;
    orb.dist=sep?Math.max(7,gap*Math.min(m,4)*1.25):8.2;
    const nmList=defs.map(([nm],i)=>`${nm} ${occ[i]===2?'↑↓':occ[i]===1?'↑':'–'}`).join(' · ');
    const shape={s:'공(구) 모양',p:'아령 모양 (x, y, z축 방향 3개)',d:'네잎클로버 모양 4개 + 고리 달린 아령(d<sub>z²</sub>) 1개',f:'더 복잡한 모양 7개'}[s.l];
    info=`<b>${s.name} 오비탈</b>: ${shape} · 오비탈 ${m}개에 전자 ${s.count}개<br><span style="font-size:.85rem">${nmList}</span>`+
      (m>1&&s.count<2*m&&s.count>0?`<br><span class="muted" style="font-size:.8rem">※ 에너지가 같은 오비탈끼리는 어느 것부터 채워지든 같습니다. 여기서는 순서대로 표시했습니다.</span>`:'');
  }
  document.getElementById('orbInfo').innerHTML=info;
  orb.auto=true; orbResize(); orbLoop();
}
function orbLoop(){
  if(orb.raf) return;
  const tick=now=>{
    if(!document.getElementById('page-ec').classList.contains('active')||document.getElementById('orbWrap').style.display==='none'){ orb.raf=0; return; }
    orb.raf=requestAnimationFrame(tick);
    const spin=document.getElementById('ecSpin').checked&&!reduceMotion;
    if(orb.auto&&spin) orb.rotY+=0.004;
    orb.anim=orb.anim.filter(a=>{ const k=reduceMotion?1:Math.min(1,Math.max(0,(now-a.t0)/a.dur)); if(now<a.t0&&!reduceMotion) return true;
      const e=1-Math.pow(1-k,3);
      if(a.fade!=null) a.obj.material.opacity=0.45+(a.fade-0.45)*e; else a.obj.scale.setScalar(Math.max(0.001,e));
      return k<1; });
    const c=orb.camera;
    if(orb.sepMode){ orb.bodies.forEach(b=>{ b.rotation.set(orb.rotX,orb.rotY,0,'XYZ'); }); c.position.set(0,0,orb.dist); c.lookAt(0,0,0); orb.renderer.render(orb.scene,c); return; }
    c.position.set(orb.dist*Math.cos(orb.rotX)*Math.sin(orb.rotY),orb.dist*Math.sin(orb.rotX),orb.dist*Math.cos(orb.rotX)*Math.cos(orb.rotY)); c.lookAt(0,0,0);
    orb.renderer.render(orb.scene,c);
  };
  orb.raf=requestAnimationFrame(tick);
}

/* ============ 맞춤 복습 (약점 분석) ============
   기록: [시각, 유형, 원소 z, 정답 1/0, 고른 답(원소 z 또는 숫자)] 최근 600개 */
let ATT=LS.get('pt_att',[]); if(!Array.isArray(ATT)) ATT=[];
const TYPE_KO={sym2name:'기호 → 이름',name2sym:'이름 → 기호',num2el:'원자번호 → 원소',group:'몇 족?',period:'몇 주기?',cat:'분류 맞히기',use:'활용 → 원소',trend:'주기적 성질 비교',ec_shell:'⚛️ 껍질별 전자 수 → 원소',ec_cfg:'⚛️ 전자 배치 표기 → 원소',ec_val:'⚛️ 원자가 전자 수'};
const EC_TYPES=['ec_shell','ec_cfg','ec_val'], ALL_TYPES=Object.keys(TYPE_KO);
const SKILL_KO={m12:'1~2주기 주족 원소 (H~Ne)',m3:'3주기 주족 원소 (Na~Ar)',m4:'4주기 주족 원소 (K, Ca, Ga~Kr)',d4:'4주기 전이 금속 (Sc~Zn)',m5:'5주기 이후 주족 원소',d:'5주기 이후 전이 금속',f:'란타넘족·악티늄족'};
const EXC=[24,29,42,47,79];
function skillOf(z){ const e=byZ(z); if(e.cat==='lanthanide'||e.cat==='actinide') return 'f'; if(e.group>=3&&e.group<=12) return e.period===4?'d4':'d'; if(e.period<=2) return 'm12'; if(e.period===3) return 'm3'; if(e.period===4) return 'm4'; return 'm5'; }
const isMain=e=>e.group!==null&&(e.group<=2||e.group>=13);
function logAttempt(q,o,ok){
  let pk=null; const m=String(o).match(/\(([A-Z][a-z]?)\)$/);
  if(m){ const f=EL.find(x=>x.sym===m[1]); if(f) pk=f.z; } else { const n=parseInt(o,10); if(Number.isFinite(n)) pk=n; }
  ATT.push([Date.now(),q.type,q.e.z,ok?1:0,pk]); if(ATT.length>600) ATT=ATT.slice(-600);
  LS.set('pt_att',ATT); markState();
}
const acc=list=>list.length?list.reduce((s,a)=>s+a[3],0)/list.length:null;
/* 오답 패턴 진단 (전자 배치 유형) */
const PATTERNS={
  noble0:{t:'18족의 원자가 전자를 0개가 아닌 수로 고름',fix:'18족은 가장 바깥 껍질이 꽉 차서 매우 안정하므로, 원자가 전자 수를 <b>0개</b>로 봅니다. "가장 바깥 껍질 전자 수(8개, He는 2개)"와 "원자가 전자 수"를 구분하세요.',
    drill:()=>({types:['ec_val'],els:EL.filter(e=>e.z<=86&&isMain(e)),must:EL.filter(e=>e.group===18&&e.z<=86)})},
  valrule:{t:'주족 원소의 원자가 전자 수를 틀림',fix:'1·2족은 <b>족 번호</b>, 13~17족은 <b>족 번호 − 10</b>이 원자가 전자 수입니다. (예: 17족 염소 → 7개) 껍질별 전자 수의 <b>마지막 숫자</b>를 봐도 됩니다.',
    drill:()=>({types:['ec_val'],els:EL.filter(e=>e.z<=54&&isMain(e)&&e.group!==18)})},
  count:{t:'전자 수를 하나 차이로 잘못 셈 (바로 옆 원소를 고름)',fix:'껍질별 전자 수(또는 배치 표기의 위 첨자)를 <b>모두 더하면 원자번호</b>입니다. 예: 2, 8, 7 → 2+8+7 = 17 → 염소. 더한 뒤 고르는 습관을 들이세요.',
    drill:()=>({types:['ec_shell','ec_cfg'],els:EL.filter(e=>e.z<=36)})},
  shellnum:{t:'바깥 전자 수만 보고 같은 족의 다른 원소를 고름',fix:'같은 족은 바깥 전자 수가 같아서 헷갈리기 쉽습니다. <b>껍질 개수 = 주기</b>를 먼저 확인하세요. 예: 2, 8, 1 (껍질 3개) → 3주기 1족 → 소듐.',
    drill:()=>({types:['ec_shell'],els:EL.filter(e=>e.z<=54&&isMain(e))})},
  outer:{t:'껍질 수는 맞았지만 같은 주기의 다른 원소를 고름',fix:'주기(껍질 수)는 맞췄습니다! <b>가장 바깥 껍질의 전자 수</b>로 족을 정하세요. 바깥 전자 n개 → 1·2족이면 n족, 그 외에는 (n+10)족.',
    drill:()=>({types:['ec_shell','ec_cfg'],els:EL.filter(e=>e.z<=54&&isMain(e))})},
  dorder:{t:'전이 금속(3d·4d) 전자 배치를 틀림',fix:'4주기 전이 금속은 <b>4s가 3d보다 먼저</b> 채워집니다. 그래서 [Ar] 4s² 다음에 3d¹ → 3d¹⁰ 순서로 늘어납니다. 바깥 껍질(N)의 전자는 대부분 2개로 같아서, <b>3d의 전자 수</b>로 원소를 구별합니다. 👉 ⚛️ 전자 배치 탭에서 Sc~Zn을 하나씩 넘겨 보세요.',
    drill:()=>({types:['ec_cfg','ec_shell'],els:EL.filter(e=>e.z>=19&&e.z<=36)})},
  exception:{t:'크로뮴·구리 같은 예외 배치를 틀림',fix:'Cr(24)은 3d⁵ 4s¹, Cu(29)는 3d¹⁰ 4s¹입니다. d 오비탈이 <b>절반(5개) 또는 꽉(10개)</b> 찰 때 더 안정하기 때문입니다. 같은 족의 Mo(42)·Ag(47)·Au(79)도 비슷합니다.',
    drill:()=>({types:['ec_cfg'],els:[23,24,25,28,29,30,42,47].map(byZ),must:[24,29].map(byZ)})}
};
function diagnose(list){
  const cnt={}; const add=k=>cnt[k]=(cnt[k]||0)+1;
  list.filter(a=>!a[3]&&EC_TYPES.includes(a[1])).forEach(([,t,z,,pk])=>{ const e=byZ(z);
    if(t==='ec_val'){ add(e.group===18?'noble0':'valrule'); return; }
    if(t==='ec_cfg'&&EXC.includes(z)){ add('exception'); return; }
    const sk=skillOf(z); if(sk==='d4'||sk==='d') add('dorder');
    if(pk==null||pk<1||pk>118) return; const p=byZ(pk);
    if(Math.abs(pk-z)===1) add('count'); else if(p.group!==null&&p.group===e.group) add('shellnum'); else if(p.period===e.period) add('outer'); });
  return Object.entries(cnt).sort((a,b)=>b[1]-a[1]);
}
/* 원소×유형 상태 */
function itemStats(){
  const m={}; ATT.forEach(a=>{ const k=a[1]+':'+a[2]; (m[k]=m[k]||[]).push(a); }); return m;
}
function streakOf(list){ let s=0; for(let i=list.length-1;i>=0&&list[i][3];i--) s++; return s; }
function rvScope(){ return document.getElementById('rvScope').value==='ec'?EC_TYPES:ALL_TYPES; }
function weakElements(types){
  const m=itemStats(), byEl={};
  Object.entries(m).forEach(([k,list])=>{ const [t,z]=k.split(':'); if(!types.includes(t)) return;
    const wrong=list.filter(a=>!a[3]).length; if(!wrong) return; const st=streakOf(list);
    const o=byEl[z]||(byEl[z]={z:+z,wrong:0,need:0}); o.wrong+=wrong; o.need=Math.max(o.need,Math.max(0,2-st)); });
  return Object.values(byEl).sort((a,b)=>b.need-a.need||b.wrong-a.wrong);
}
function bar(label,a,n,minN=5){
  const pct=a==null?0:Math.round(a*100), weak=a!=null&&n>=minN&&a<0.7;
  return `<div class="rv-bar"><span class="rv-l">${label}</span><span class="rv-track"><span style="width:${a==null?0:pct}%"></span></span>
    <span class="rv-v">${a==null||n===0?'<span class="muted">기록 없음</span>':n<minN?`${pct}% <span class="muted">(${n}문제·데이터 부족)</span>`:`<b>${pct}%</b> <span class="muted">(${n}문제)</span>${weak?' <b class="weak">⚠️ 약점</b>':''}`}</span></div>`;
}
function renderRV(){
  const types=rvScope(), mine=ATT.filter(a=>types.includes(a[1]));
  const box=document.getElementById('rvAnalysis');
  if(mine.length<5){ box.innerHTML=`<div class="box" style="text-align:center;padding:24px">📭 아직 분석할 기록이 부족해요 (${mine.length}문제).<br>먼저 <b>🩺 진단 테스트</b>를 풀거나 ❓ 퀴즈에서 ${types===EC_TYPES?'⚛️ 전자 배치 유형을':'문제를'} 풀어 보세요. 5문제 이상이면 분석이 시작됩니다.</div>`; return; }
  const recent=mine.slice(-30);
  // 유형별 (최근 20문제)
  const tb=types.map(t=>{ const l=ATT.filter(a=>a[1]===t).slice(-20); return {t,a:acc(l),n:l.length}; });
  // 원소 그룹별 (전자 배치 유형, 최근 20)
  const ecAtt=ATT.filter(a=>EC_TYPES.includes(a[1]));
  const sb=Object.keys(SKILL_KO).map(k=>{ const l=ecAtt.filter(a=>skillOf(a[2])===k).slice(-20); return {k,a:acc(l),n:l.length}; }).filter(x=>x.n>0);
  const pats=diagnose(ecAtt.slice(-80));
  const weak=weakElements(types), left=weak.filter(w=>w.need>0), done=weak.filter(w=>w.need===0);
  box.innerHTML=`
   <div class="stats" style="margin-bottom:12px">
     <div class="stat"><b>${mine.length}</b>푼 문제</div>
     <div class="stat"><b>${Math.round(acc(recent)*100)}%</b>최근 30문제 정답률</div>
     <div class="stat"><b>${left.length}</b>복습할 원소</div>
     <div class="stat"><b>${done.length}</b>극복한 원소</div>
   </div>
   <h3>📊 유형별 정답률 <span class="muted" style="font-weight:400">(유형마다 최근 20문제)</span></h3>
   ${tb.map(x=>bar(TYPE_KO[x.t],x.a,x.n)).join('')}
   ${sb.length?`<h3>🧪 원소 그룹별 정답률 <span class="muted" style="font-weight:400">(⚛️ 전자 배치 문제만)</span></h3>${sb.map(x=>bar(SKILL_KO[x.k],x.a,x.n,3)).join('')}`:''}
   <h3>🔍 자주 하는 실수 패턴 <span class="muted" style="font-weight:400">(⚛️ 전자 배치 오답 분석)</span></h3>
   ${pats.length?pats.slice(0,4).map(([k,n])=>`<div class="box rv-pat"><b>${PATTERNS[k].t}</b> <span class="muted">· ${n}번</span><div style="margin:4px 0 8px;font-size:.9rem">💡 ${PATTERNS[k].fix}</div><button class="btn ghost" style="font-size:.85rem" onclick="startDrill('${k}')">이 실수 집중 연습 (8문제)</button></div>`).join('')
     :'<p class="muted">전자 배치 문제에서 반복되는 실수 패턴이 아직 없어요. 👍</p>'}
   <h3>📌 다시 볼 원소 <span class="muted" style="font-weight:400">(2번 연속 맞히면 극복)</span></h3>
   <div class="row">${left.length?left.slice(0,20).map(w=>{const e=byZ(w.z);return `<span class="chip cat-${e.cat}" style="cursor:pointer" onclick="openEl(${w.z})">${e.sym} ${koShort(e)} <span class="muted">· ${w.wrong}번 틀림 · ${w.need}번 더</span></span>`;}).join(''):'<span class="muted">모두 극복했어요! 🎉</span>'}</div>
   ${done.length?`<p class="muted" style="font-size:.85rem;margin-top:8px">✅ 극복: ${done.slice(0,30).map(w=>byZ(w.z).sym).join(', ')}</p>`:''}`;
}
/* 문제 만들기 */
function launchQuiz(list,meta){
  Q=Object.assign({list,i:0,score:0,wrong:[],answered:false,start:Date.now(),range:'review',type:'review'},meta||{});
  go('quiz');
  document.getElementById('quizSetup').style.display='none';
  document.getElementById('quizEnd').style.display='none';
  document.getElementById('quizPlay').style.display='block';
  showQ();
}
function wPick(items){ const tot=items.reduce((s,x)=>s+x.w,0); let r=Math.random()*tot; for(const x of items){ r-=x.w; if(r<=0) return x; } return items[items.length-1]; }
function buildReview(n){
  const types=rvScope(), max=+document.getElementById('rvRange').value, pool=EL.filter(e=>e.z<=max);
  const m=itemStats();
  const tAcc={}; types.forEach(t=>{ const l=ATT.filter(a=>a[1]===t).slice(-20); tAcc[t]=l.length>=5?acc(l):0.6; });
  const sAcc={}; Object.keys(SKILL_KO).forEach(k=>{ const l=ATT.filter(a=>EC_TYPES.includes(a[1])&&skillOf(a[2])===k).slice(-20); sAcc[k]=l.length>=3?acc(l):0.6; });
  const elWrong={}; ATT.slice(-150).forEach(a=>{ if(!a[3]) elWrong[a[2]]=(elWrong[a[2]]||0)+1; });
  const cand=[];
  types.forEach(t=>pool.forEach(e=>{
    if(t==='group'&&e.group===null) return; if(t==='ec_val'&&!(isMain(e)&&e.z<=86)) return; if(t==='use'&&e.use==='연구용') return; if(t==='trend'&&!(isMain(e)&&e.z<=86)) return;
    const l=m[t+':'+e.z]||[], wr=l.slice(-3).filter(a=>!a[3]).length, st=streakOf(l);
    let w=0.3+4*wr+1.2*Math.min(3,elWrong[e.z]||0)+3*(1-tAcc[t])+(EC_TYPES.includes(t)?2.5*(1-sAcc[skillOf(e.z)]):0)+(l.length?0:0.6);
    if(st>=2) w*=0.25; cand.push({t,z:e.z,w});
  }));
  const out=[], used=new Set();
  // 가장 많이 한 실수 패턴에서 2문제
  const pats=types===EC_TYPES||types.includes('ec_val')?diagnose(ATT.filter(a=>EC_TYPES.includes(a[1])).slice(-80)):[];
  if(pats.length&&n>=8){ drillQs(pats[0][0],2,max).forEach(q=>{ out.push(q); used.add(q.type+':'+q.e.z); }); }
  // 아직 극복하지 못한 문항(틀린 유형+원소)은 반드시 다시 (최대 절반)
  const due=Object.entries(m).filter(([k,l])=>{ const [t,z]=k.split(':'); return types.includes(t)&&+z<=max&&l.some(x=>!x[3])&&streakOf(l)<2; })
    .sort((A,B)=>B[1][B[1].length-1][0]-A[1][A[1].length-1][0]).slice(0,Math.ceil(n/2));
  due.forEach(([k])=>{ if(used.has(k)) return; const [t,z]=k.split(':'); const q=makeQ(t,pool,+z); used.add(k); q.review=true; out.push(q); });
  let guard=0;
  while(out.length<n&&cand.length&&guard++<400){ const c=wPick(cand); const k=c.t+':'+c.z; if(used.has(k)) { c.w*=0.2; continue; }
    used.add(k); c.w*=0.05; const q=makeQ(c.t,pool,c.z); if(q.e.z!==c.z&&used.has(q.type+':'+q.e.z)) continue; q.review=true; out.push(q); }
  return shuffle(out);
}
function drillQs(key,n,max=118){
  const d=PATTERNS[key].drill(); const els=d.els.filter(e=>e.z<=Math.max(max,36)); const out=[], used=new Set();
  const must=shuffle(d.must||[]); let guard=0;
  while(out.length<n&&guard++<200){ const e=must.length&&out.length<Math.ceil(n/2)?must.shift():pick(els); const t=pick(d.types);
    const k=t+':'+e.z; if(used.has(k)) continue; used.add(k); out.push(makeQ(t,els,e.z)); }
  return out;
}
function startDrill(key){ launchQuiz(shuffle(drillQs(key,8)),{reviewKind:'drill',drillKey:key}); }
function startDiagnostic(){
  const types=rvScope(); const list=[];
  if(types===EC_TYPES){
    const pickZ=a=>pick(a);
    [[1,3,6,9,12],[11,13,15,17],[19,20,31,34,35],[21,23,26,28,30]].forEach(g=>list.push(makeQ('ec_shell',EL.filter(e=>e.z<=36),pickZ(g))));
    [[6,8,10],[12,14,16],[22,25,27],[24,29]].forEach(g=>list.push(makeQ('ec_cfg',EL.filter(e=>e.z<=36),pickZ(g))));
    [[3,5,7,9],[11,13,15,16],[10,18,36],[19,31,33,35]].forEach(g=>list.push(makeQ('ec_val',EL.filter(e=>e.z<=36),pickZ(g))));
  } else {
    const pool=EL.filter(e=>e.z<=36); shuffle(ALL_TYPES).forEach(t=>list.push(makeQ(t,pool)));
    while(list.length<12) list.push(makeQ('mix',pool));
  }
  launchQuiz(shuffle(list),{reviewKind:'diag'});
}
document.getElementById('rvStart').onclick=()=>{ const n=+document.getElementById('rvCount').value; const list=buildReview(n);
  if(!list.length){ document.getElementById('rvMsg').textContent='문제를 만들지 못했어요. 범위를 넓혀 보세요.'; return; }
  launchQuiz(list,{reviewKind:'review'}); };
document.getElementById('rvDiag').onclick=startDiagnostic;
['rvScope','rvRange'].forEach(id=>document.getElementById(id).onchange=renderRV);

/* ============ 화면 테마 (자동 / 라이트 / 다크) ============ */
function isDark(){ return document.documentElement.getAttribute('data-theme')==='dark'; }
const THEME_LABEL={auto:'🌓 자동',light:'☀️ 라이트',dark:'🌙 다크'};
let themeMode=LS.get('pt_theme','auto');
const mqDark=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
function applyTheme(){
  const dark=themeMode==='dark'||(themeMode==='auto'&&mqDark&&mqDark.matches);
  const was=isDark();
  document.documentElement.setAttribute('data-theme',dark?'dark':'light');
  document.getElementById('themeBtn').textContent=THEME_LABEL[themeMode];
  document.getElementById('themeBtn').title='지금: '+(dark?'다크':'라이트')+' 화면 (누르면 바뀜)';
  const tc=document.querySelector('meta[name=theme-color]'); if(tc) tc.content=dark?'#171d27':'#4f46e5';
  if(was!==dark) refreshThemed();
}
function refreshThemed(){ // 색을 코드로 칠한 화면은 다시 그리기
  if(document.getElementById('page-trend').classList.contains('active')) initTrend();
  if(document.getElementById('page-ec').classList.contains('active')&&orb.z&&ecView==='3d') orbShow(orb.z);
}
document.getElementById('themeBtn').onclick=()=>{ themeMode={auto:'light',light:'dark',dark:'auto'}[themeMode]; LS.set('pt_theme',themeMode); applyTheme(); };
if(mqDark){ const h=()=>{ if(themeMode==='auto') applyTheme(); }; mqDark.addEventListener?mqDark.addEventListener('change',h):mqDark.addListener(h); }
applyTheme();

/* ============ 반응형 보조 ============ */
document.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{
  const w=document.getElementById(b.dataset.zoom==='pt'?'ptWrap':'hmWrap'); const on=w.classList.toggle('zoom');
  b.textContent=on?'↔️ 화면에 맞추기':'🔍 크게 보기'; });
let rzTimer=null, lastW=window.innerWidth;
window.addEventListener('resize',()=>{ clearTimeout(rzTimer); rzTimer=setTimeout(()=>{
  if(Math.abs(window.innerWidth-lastW)<4) return; lastW=window.innerWidth;
  if(document.getElementById('page-trend').classList.contains('active')) renderChart();
  if(typeof orbResize==='function') orbResize();
},150); });
if(window.ResizeObserver){ const ro=new ResizeObserver(()=>{ if(orb.ready) orbResize(); }); ro.observe(document.getElementById('orbCanvas')); }
/* init */
renderTable(); buildDeck();

/* ============ SPA 라우팅 (해시) ============ */
const PAGES=['table','trend','ec','intro','memo','quiz','rv','flash','calendar','lb'];
function go(p){ if(!PAGES.includes(p)) p='table'; if(location.hash.slice(1)!==p) location.hash=p; else showPage(p); }
function openEC(z){ closeModal(); ecZ=z; go('ec'); }
window.addEventListener('hashchange',()=>{ const p=location.hash.slice(1); showPage(PAGES.includes(p)?p:'table'); });
{ const p=location.hash.slice(1); if(PAGES.includes(p)&&p!=='table') showPage(p); }
// HTML 안의 onclick에서 쓰는 함수들
Object.assign(window,{go,openEl,closeModal,replayModalBohr,startDrill,openEC});

initPWA();
