(() => {
'use strict';
const root=document.querySelector('#app'),group=window.DOJIA_GROUP,posts=window.DOJIA_POSTS,users=window.DOJIA_USERS;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(n,s=22)=>`<svg class="icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${window.UI_ICONS[n]||''}</svg>`;
const user=id=>users[id]||window.DOUJIA_USER_POOL?.get?.(id)||{name:id||'匿名用户',ip:'未知'};
const avatar=(id,large=false)=>`<span class="avatar ${large?'avatar-large':''}" style="background:#84a8cd">${user(id).avatar?`<img src="${esc(user(id).avatar)}" alt="">`:esc(user(id).name.slice(0,1))}</span>`;
let state={};try{state=JSON.parse(localStorage.getItem('doujia-v2')||'{}')||{}}catch{};
const persist=()=>{try{localStorage.setItem('doujia-v2',JSON.stringify(state))}catch{toast('浏览器未允许保存，本次操作仅在当前页面有效')}};
let current=null,homeScroll=0,query='',replyTarget=null;
function toast(t){
  const stack=document.querySelector('#toast'),el=document.createElement('div');
  el.className='toast-item';el.textContent=t;
  const layout=()=>{let offset=0;[...stack.children].reverse().forEach(item=>{item.style.bottom=offset+'px';offset+=item.offsetHeight+10})};
  stack.append(el);layout();requestAnimationFrame(()=>el.classList.add('visible'));
  setTimeout(()=>{el.classList.remove('visible');setTimeout(()=>{el.remove();layout()},200)},2400);
}
const ps=p=>state[p.id]||(state[p.id]={});
const extras=p=>ps(p).comments||[];
// 本机新回复：日期取本楼最新回复日期（updated），时间取当前时分；不得早于楼内最后一条回复
const fmtDate=d=>{const z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`};
function localDate(p){const day=(p.updated||p.date).split(' ')[0],n=new Date(),t=`${day} ${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;const last=[...(p.comments||[]),...extras(p)].map(c=>c.date).filter(d=>/^\d{4}-\d\d-\d\d \d\d:\d\d$/.test(d||'')).sort().pop();return last&&t<=last?fmtDate(new Date(new Date(last.replace(' ','T')).getTime()+60000)):t}
const count=(p,k)=>(p.counts[k]||0)+(k==='replies'?extras(p).length:k==='likes'&&ps(p).liked?1:k==='saves'&&ps(p).saved?1:0);
const join=()=>`<button class="join" data-action="join" aria-pressed="${!!state.joined}">${state.joined?'已加入':'+ 加入'}</button>`;
function compact(detail=false){return `<header class="compact">${detail?`<button class="icon-btn" data-action="back" aria-label="返回小组">${icon('back')}</button>`:''}<img src="${esc(group.avatar)}" alt=""><div><strong>${esc(group.name)}</strong><small>${esc(group.members)} 位组员 · 豆荚</small></div>${join()}${!detail?`<button data-action="search" aria-label="搜索小组">${icon('search')}</button>`:''}</header>`}
const homeHTML=()=>`<main class="phone home"><div class="sitebar"><b>豆荚</b><small>相聚在感兴趣的事里</small></div><section class="hero"><label class="search">${icon('search',20)}<input id="search" type="search" placeholder="组内搜 · 找找感兴趣的讨论" aria-label="搜索帖子" value="${esc(query)}"></label><div class="group-summary"><img src="${esc(group.avatar)}" alt="小组头像"><div><h1>${esc(group.name)}</h1><small>${esc(group.members)} 位组员 · ${esc(group.online)} 人在线</small></div>${join()}</div><details class="intro"><summary>小组简介：${esc(group.description)}</summary><p>发言规则：${esc(group.rules)}</p></details></section>${compact()}<nav class="discussion" aria-label="帖子排序"><h2>讨论列表</h2><div class="filters"><button disabled>最新</button><button class="selected" aria-current="true" disabled>热门</button><button disabled>精华</button></div></nav><section id="threads" aria-label="热门帖子">${listHTML()}</section><p class="end">已经到底啦</p></main>`;
function home(){stopFooterWatch();unlockComposer();current=null;document.title=group.name+' · 豆荚';root.innerHTML=homeHTML();root.querySelector('#search').addEventListener('input',e=>{query=e.target.value;list()});scrollHeader()}
const heat=n=>n>2000?3:n>=1000?2:n>=500?1:0;
function listHTML(){const found=posts.filter(p=>p.title.includes(query)||user(p.author).name.includes(query));return found.length?found.map(p=>`<a class="thread" href="#post/${encodeURIComponent(p.id)}" data-post="${esc(p.id)}"><div class="reply-count heat-${heat(count(p,'replies'))}">${icon('comment',18)}${count(p,'replies')}</div><div class="thread-main"><div class="thread-copy"><h3>${p.featured?'<span class="featured">精</span>':''}${esc(p.title)}</h3>${p.thumbnail?`<img class="thread-thumb" src="${esc(p.thumbnail)}" alt="帖子配图" loading="lazy">`:''}</div><div class="thread-meta">${avatar(p.author)}<span>${esc(user(p.author).name)}</span><time>${esc((p.updated||p.date).split(' ')[0])} 更新</time></div></div></a>`).join(''):'<p class="end">没有找到相关讨论</p>'}
function list(){root.querySelector('#threads').innerHTML=listHTML()}
function media(m,compact=false){return `<figure class="media ${compact?'media-comment':''}"><div class="media-shell" role="button" tabindex="0" aria-label="查看全图" data-image="${esc(m.src)}" data-alt="${esc(m.alt||'图片')}"><img src="${esc(m.src)}" alt="${esc(m.alt||'图片')}" loading="lazy">${compact?'':`<div class="long-fade"><span>点击查看全图 ${icon('chevronDown',13)}</span></div>`}</div>${!compact&&m.caption?`<figcaption>${esc(m.caption)}</figcaption>`:''}</figure>`}
function block(b,i){if(b.type==='media')return media(b);if(b.type==='link')return `<button class="link-card" data-action="link" data-index="${i}"><strong class="link-title"><span>${esc(b.title)}</span>${icon('external',15)}</strong><p>${esc(b.description)}</p></button>`;if(b.type==='poll'){const vote=ps(current).votes?.[i];return `<form class="poll" data-poll="${i}"><strong>${esc(b.title)}</strong><small>${b.participants+(vote?1:0)} 人参与 · ${b.multiple?'多选':'单选'}</small>${b.choices.map((c,j)=>vote?`<div class="poll-result"><div class="poll-result-label"><span>${esc(c)}${vote.includes(j)?' · 已选':''}</span><span>${(b.votes?.[j]||0)+(vote.includes(j)?1:0)} 票</span></div><div class="poll-track" role="meter" aria-label="${esc(c)}" aria-valuemin="0" aria-valuemax="${Math.max(1,...b.choices.map((_,k)=>(b.votes?.[k]||0)+(vote.includes(k)?1:0)))}" aria-valuenow="${(b.votes?.[j]||0)+(vote.includes(j)?1:0)}"><span class="poll-fill" style="width:${100*((b.votes?.[j]||0)+(vote.includes(j)?1:0))/Math.max(1,...b.choices.map((_,k)=>(b.votes?.[k]||0)+(vote.includes(k)?1:0)))}%"></span></div></div>`:`<label class="poll-choice"><input name="choice" type="${b.multiple?'checkbox':'radio'}" value="${j}">${esc(c)}</label>`).join('')}${vote?'<button type="button" class="revote" data-action="revote">重新投票</button><em>已投票</em>':'<button type="submit" disabled>投票</button><em>投票后可查看结果</em>'}</form>`}return `<p>${esc(b.text)}</p>`}
async function revealPoll(form,index){
  const post=current;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const oldHeight=form.getBoundingClientRect().height;
  form.inert=true;
  if(!reduced)await form.animate([{opacity:1},{opacity:.35}],{duration:120,easing:'ease-out'}).finished;
  if(!form.isConnected)return;
  const template=document.createElement('template');template.innerHTML=block(post.content[index],index);
  form.innerHTML=template.content.firstElementChild.innerHTML;form.inert=false;
  form.setAttribute('tabindex','-1');form.setAttribute('aria-label',ps(post).votes?.[index]?'投票结果，已投票':'重新选择投票选项');form.focus({preventScroll:true});
  if(reduced)return;
  const newHeight=form.getBoundingClientRect().height;
  form.style.overflow='hidden';
  const resize=form.animate([{height:oldHeight+'px',opacity:.35},{height:newHeight+'px',opacity:1}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
  form.querySelectorAll('.poll-result').forEach((row,j)=>row.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,delay:j*45,fill:'backwards',easing:'ease-out'}));
  form.querySelectorAll('.poll-fill').forEach((bar,j)=>bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:600,delay:80+j*45,fill:'backwards',easing:'cubic-bezier(.22,1,.36,1)'}));
  await resize.finished;form.style.overflow='';
}
function comment(c){if(c.type==='gap')return '<div class="comment-gap"><span>已折叠部分回复</span></div>';const liked=ps(current).commentLikes?.[c.id];return `<article class="comment"><header>${avatar(c.user)}<div><div class="comment-user"><span class="comment-name">${esc(user(c.user).name)}</span>${c.user===current.author?'<i class="owner-badge">楼主</i>':''}</div><span class="meta">${esc(c.date)}　${esc(user(c.user).ip)}</span></div></header>${c.replyTo?`<blockquote><b>${esc(user(c.replyTo.user).name)}</b><span>${esc(c.replyTo.text)}</span></blockquote>`:''}<p>${esc(c.text).replaceAll('\n','<br>')}</p>${(c.media||[]).map(m=>media(m,true)).join('')}<footer><button data-action="comment-like" data-id="${esc(c.id)}" aria-pressed="${!!liked}" aria-label="赞这条回复">${icon('like',17)}${(c.likes||0)+(liked?1:0)}</button><button data-action="reply" data-id="${esc(c.id)}">回复</button>${c.user==='me'&&String(c.id).startsWith('local-')?`<button class="comment-delete" data-action="comment-delete" data-id="${esc(c.id)}">删除</button>`:''}</footer></article>`}
function detail(p){stopFooterWatch();unlockComposer();replyTarget=null;current=p;document.title=p.title+' · 豆荚';const comments=[...(p.comments||[]),...extras(p)],hot=comments.filter(c=>c.hot).sort((a,b)=>(b.likes||0)-(a.likes||0));root.innerHTML=`<main class="phone detail">${compact(true)}<article class="post"><header>${avatar(p.author,true)}<div><strong>${esc(user(p.author).name)}</strong><span class="meta">${esc(p.date)} ${p.edited?'已编辑 ':''}${esc(user(p.author).ip)}</span></div><button data-action="follow" aria-pressed="${!!state.following?.[p.author]}">${state.following?.[p.author]?'已关注':'+ 关注'}</button></header><h1>${esc(p.title)}${p.featured?'<i>精</i>':''}</h1><section class="content">${p.content.map(block).join('')}</section><small class="notice">${icon('info',13)}该小组已开启防搬运功能　|　© 原创内容声明</small></article><nav class="stats"><span class="active">回复 ${count(p,'replies')}</span><span>赞 ${count(p,'likes')}</span><span>转发 ${count(p,'reposts')}</span><span>收藏 ${count(p,'saves')}</span></nav><section class="comments" id="comments">${hot.length?`<section class="comment-section"><h2>热门回复</h2>${hot.map(comment).join('')}</section><div class="section-divider"></div>`:''}<section class="comment-section"><h2>全部回复</h2>${comments.map(comment).join('')||'<p class="end">还没有回复，来说两句吧</p>'}</section><p class="end replies-end">没有更多回复了</p></section><div class="sheet-backdrop" data-action="close-composer" aria-hidden="true"></div><form class="composer" role="dialog" aria-modal="true" aria-labelledby="reply-label" aria-hidden="true" inert><div class="composer-head"><button type="button" class="composer-cancel" data-action="close-composer">取消</button><label id="reply-label" for="reply-text">写回复</label><button type="submit" class="composer-send">发布</button></div><textarea id="reply-text" maxlength="4000" required placeholder="友善交流，说说你的想法……" enterkeyhint="send"></textarea></form><footer class="bottom adaptive-bottom"><div class="bottom-mode reading-actions" aria-hidden="true" inert><button data-action="jump-comments" aria-label="查看回复">${icon('comment')}<span>${count(p,'replies')}</span></button><button data-action="like" aria-label="点赞" aria-pressed="${!!ps(p).liked}">${icon('like')}<span>${count(p,'likes')}</span></button><button data-action="share" aria-label="转发">${icon('repost')}<span>${count(p,'reposts')}</span></button><button data-action="save" aria-label="收藏" aria-pressed="${!!ps(p).saved}">${icon('save')}<span>${count(p,'saves')}</span></button></div><div class="bottom-mode reply-actions"><button class="reply-input" data-action="reply">写回复</button><button data-action="like" aria-label="点赞" aria-pressed="${!!ps(p).liked}">${icon('like')}<small>${count(p,'likes')}</small></button><button data-action="save" aria-label="收藏" aria-pressed="${!!ps(p).saved}">${icon('save')}<small>${count(p,'saves')}</small></button><button data-action="share" aria-label="分享">${icon('share')}<small>分享</small></button></div></footer></main>`;root.querySelectorAll('.media img').forEach(img=>{const update=()=>{const r=img.naturalWidth/img.naturalHeight;if(!r)return;if(img.closest('.media-comment'))img.parentElement.dataset.crop=r<.75?'portrait':r>4/3?'landscape':'';else img.closest('.media').classList.toggle('is-long',r<.75)};img.complete?update():img.addEventListener('load',update,{once:true})});watchFooter()}

let footerObserver=null;
function stopFooterWatch(){footerObserver?.disconnect();footerObserver=null}
function updateFooter(){
  const post=root.querySelector('.post'),footer=root.querySelector('.adaptive-bottom');
  if(!post||!footer)return;
  const viewport=window.innerHeight,barHeight=footer.getBoundingClientRect().height;
  const headerHeight=root.querySelector('.compact').getBoundingClientRect().height;
  const rect=post.getBoundingClientRect();
  const reading=rect.height>viewport-headerHeight-barHeight && rect.bottom>viewport-barHeight;
  footer.classList.toggle('is-reading',reading);
  const readingBar=footer.querySelector('.reading-actions'),replyBar=footer.querySelector('.reply-actions');
  readingBar.inert=!reading;replyBar.inert=reading;
  readingBar.setAttribute('aria-hidden',String(!reading));replyBar.setAttribute('aria-hidden',String(reading));
}
function watchFooter(){
  const post=root.querySelector('.post');
  footerObserver=new ResizeObserver(updateFooter);footerObserver.observe(post);
  requestAnimationFrame(updateFooter);
}
addEventListener('scroll',updateFooter,{passive:true});
addEventListener('resize',updateFooter,{passive:true});


/* 回复抽屉：底部上滑，帖子位置不动；点击遮罩、取消或 Esc 收起。 */
const vv=window.visualViewport,docEl=document.documentElement;
function syncKeyboard(){
  if(!docEl.classList.contains('composing'))return;
  const k=vv?Math.max(0,Math.round(innerHeight-vv.height-vv.offsetTop)):0;
  docEl.style.setProperty('--keyboard',k+'px');
}
vv?.addEventListener('resize',syncKeyboard);vv?.addEventListener('scroll',syncKeyboard);
function openComposer(target){
  const f=root.querySelector('.composer');if(!f)return;
  const t=f.querySelector('textarea');
  if((target?.id??null)!==(replyTarget?.id??null))t.value='';
  replyTarget=target;
  const label=target?'回复 '+user(target.user).name:'写回复';
  f.querySelector('label').textContent=label;
  t.placeholder=target?label+'……':'友善交流，说说你的想法……';
  f.inert=false;f.removeAttribute('aria-hidden');
  docEl.classList.add('composing');syncKeyboard();
  t.focus({preventScroll:true}); // 必须在点击事件内同步调用，iOS 才会弹出输入法
}
function unlockComposer(){docEl.classList.remove('composing');docEl.style.removeProperty('--keyboard')}
function closeComposer(){
  const f=root.querySelector('.composer');
  if(f&&!f.inert){f.querySelector('textarea').blur();f.inert=true;f.setAttribute('aria-hidden','true')}
  unlockComposer();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&docEl.classList.contains('composing'))closeComposer()});
document.addEventListener('touchmove',e=>{if(e.target.closest?.('.sheet-backdrop')&&e.cancelable)e.preventDefault()},{passive:false});

/* 帖子内右划返回首页：页面跟手，底下露出首页；松手超过 1/3 或快速划动即返回。 */
let swipe=null,edgeTouchAt=0,uiNav=false,skipMotion=false;
function swipeAllowed(target){
  return current&&!docEl.classList.contains('composing')&&!document.querySelector('#viewer').open&&!pageTransition&&!target.closest('input,textarea,select,[contenteditable]');
}
function beginSwipe(){
  const footer=root.querySelector('.adaptive-bottom'),r=footer.getBoundingClientRect(),base=root.getBoundingClientRect();
  footer.style.position='absolute';footer.style.top=(r.top-base.top)+'px';footer.style.bottom='auto';
  const under=document.createElement('div');under.className='swipe-under';under.inert=true;under.setAttribute('aria-hidden','true');
  under.innerHTML=homeHTML();under.querySelector('#search')?.removeAttribute('id');
  const shade=document.createElement('div');shade.className='swipe-shade';
  document.body.prepend(under,shade);
  under.scrollTop=homeScroll;
  const hero=under.querySelector('.hero');
  under.querySelector('.home').classList.toggle('is-scrolled',hero.getBoundingClientRect().bottom<=64);
  root.classList.add('swiping');
  Object.assign(swipe,{under,shade,w:root.querySelector('.phone').offsetWidth});
}
function paintSwipe(dx){
  const p=Math.min(1,dx/swipe.w);
  root.style.transform=`translate3d(${dx}px,0,0)`;
  swipe.under.style.transform=`translate3d(${-(1-p)*swipe.w*.3}px,0,0)`;
  swipe.shade.style.opacity=String((1-p)*.18);
}
function resetSwipe(){
  if(!swipe)return;
  swipe.under?.remove();swipe.shade?.remove();
  root.classList.remove('swiping');root.style.transform='';root.style.transition='';
  const footer=root.querySelector('.adaptive-bottom');if(footer){footer.style.position='';footer.style.top='';footer.style.bottom=''}
  clearTimeout(swipe.timer);swipe=null;
}
function settleSwipe(commit){
  const s=swipe,dur=commit?220:200,ease='cubic-bezier(.2,.8,.2,1)';
  [root,s.under].forEach(el=>el.style.transition=`transform ${dur}ms ${ease}`);s.shade.style.transition=`opacity ${dur}ms ${ease}`;
  s.settling=true;paintSwipe(commit?s.w:0);
  s.timer=setTimeout(()=>{
    if(swipe!==s)return;
    if(commit){skipMotion=true;history.pushState(null,'','#home');route()}
    else resetSwipe();
  },dur+20);
}
document.addEventListener('touchstart',e=>{
  if(e.touches.length!==1){if(swipe&&!swipe.settling&&swipe.under)settleSwipe(false);else if(swipe&&!swipe.under)swipe=null;return}
  const t=e.touches[0];
  if(t.clientX<24)edgeTouchAt=Date.now(); // 可能是系统自带的边缘返回手势
  if(swipe||!swipeAllowed(e.target))return;
  swipe={x:t.clientX,y:t.clientY,lock:null,lastX:t.clientX,lastT:e.timeStamp,v:0};
},{passive:true});
document.addEventListener('touchmove',e=>{
  if(!swipe||swipe.settling)return;
  const t=e.touches[0],dx=t.clientX-swipe.x,dy=t.clientY-swipe.y;
  if(swipe.lock===null){
    if(Math.abs(dx)<8&&Math.abs(dy)<8)return;
    if(!(dx>0&&Math.abs(dx)>Math.abs(dy)*1.3)){swipe=null;return}
    swipe.lock=true;beginSwipe();
  }
  if(e.cancelable)e.preventDefault();
  const dt=e.timeStamp-swipe.lastT;if(dt>0)swipe.v=(t.clientX-swipe.lastX)/dt;
  swipe.lastX=t.clientX;swipe.lastT=e.timeStamp;
  paintSwipe(Math.max(0,dx));
},{passive:false});
document.addEventListener('touchend',()=>{
  if(!swipe||swipe.settling)return;
  if(!swipe.under){swipe=null;return}
  const dx=swipe.lastX-swipe.x;
  settleSwipe(dx>swipe.w/3||(swipe.v>.45&&dx>40));
});
document.addEventListener('touchcancel',()=>{if(swipe&&!swipe.settling){swipe.under?settleSwipe(false):(swipe=null)}});
document.addEventListener('click',()=>{edgeTouchAt=0},true);

function rerender(){const y=scrollY;detail(current);scrollTo(0,y)}
let pageTransition=null;
if('scrollRestoration' in history)history.scrollRestoration='manual';
function route(){
  let id;try{id=decodeURIComponent(location.hash.replace(/^#post\//,''))}catch{}
  const p=posts.find(p=>p.id===id);
  const next=location.hash.startsWith('#post/')&&p&&!p.deleted?p:null;
  const hadPage=!!root.firstElementChild,wasPost=!!current;
  const swiped=skipMotion||(wasPost&&!next&&!uiNav&&Date.now()-edgeTouchAt<1500);skipMotion=false;uiNav=false;edgeTouchAt=0;
  if(!wasPost&&hadPage)homeScroll=scrollY;
  const render=()=>{
    if(next){detail(next);scrollTo(0,0);updateFooter()}
    else{
      if(location.hash.startsWith('#post/')){toast(p?'该帖子已删除':'该帖子不存在');history.replaceState(null,'',location.pathname+location.search+'#home')}
      home();scrollTo(0,homeScroll);scrollHeader();
    }
  };
  if(pageTransition){pageTransition.skipTransition();pageTransition=null}
  resetSwipe();
  if(swiped||!hadPage||wasPost===!!next||matchMedia('(prefers-reduced-motion: reduce)').matches||!document.startViewTransition){render();return}
  document.documentElement.dataset.pageMotion=next?'push':'pop';
  const transition=document.startViewTransition(render);pageTransition=transition;
  transition.finished.catch(()=>{}).finally(()=>{
    if(pageTransition===transition){pageTransition=null;delete document.documentElement.dataset.pageMotion}
  });
}

function scrollHeader(){const hero=root.querySelector('.hero');if(hero)root.querySelector('.home').classList.toggle('is-scrolled',hero.getBoundingClientRect().bottom<=64)}
addEventListener('scroll',scrollHeader,{passive:true});addEventListener('hashchange',route);
root.addEventListener('click',async e=>{const link=e.target.closest('[data-post]');if(link){const p=posts.find(p=>p.id===link.dataset.post);if(p.deleted){e.preventDefault();toast('该帖子已删除')}else homeScroll=scrollY;return}const m=e.target.closest('[data-image]');if(m){const d=document.querySelector('#viewer');d.querySelector('img').src=m.dataset.image;d.querySelector('img').alt=m.dataset.alt;d.showModal();d.scrollTop=0;document.documentElement.classList.add('viewing-image');return}const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='back'){uiNav=true;location.hash='home';return}if(a==='search'){scrollTo(0,0);root.querySelector('#search').focus();return}if(a==='join'){state.joined=!state.joined;persist();root.querySelectorAll('[data-action=join]').forEach(el=>{el.textContent=state.joined?'已加入':'+ 加入';el.setAttribute('aria-pressed',!!state.joined)});return}if(!current)return;if(a==='jump-comments'){root.querySelector('#comments').scrollIntoView({behavior:'smooth',block:'start'});return}const s=ps(current);if(a==='revote'){const form=b.closest('.poll'),i=Number(form.dataset.poll);if(form.inert||!s.votes?.[i])return;delete s.votes[i];persist();revealPoll(form,i);return}if(a==='follow'){state.following||={};const followed=!state.following[current.author];state.following[current.author]=followed;persist();b.textContent=followed?'已关注':'+ 关注';b.setAttribute('aria-pressed',String(followed));return}if(a==='like'||a==='save'){const key=a==='like'?'liked':'saved';s[key]=!s[key];persist();rerender()}if(a==='comment-delete'){if(b.dataset.confirm!=='1'){b.dataset.confirm='1';b.textContent='确认删除';clearTimeout(b._t);b._t=setTimeout(()=>{b.dataset.confirm='';b.textContent='删除'},3000);return}const p=ps(current);p.comments=(p.comments||[]).filter(c=>c.id!==b.dataset.id);if(p.commentLikes)delete p.commentLikes[b.dataset.id];persist();rerender();toast('评论已删除');return}if(a==='comment-like'){s.commentLikes||={};s.commentLikes[b.dataset.id]=!s.commentLikes[b.dataset.id];persist();rerender()}if(a==='reply'){openComposer(b.dataset.id?[...(current.comments||[]),...extras(current)].find(c=>c.id===b.dataset.id)||null:null);return}if(a==='close-composer'){closeComposer();return}if(a==='link'){const url=current.content[Number(b.dataset.index)].url;if(url&&/^https?:\/\//i.test(url))window.open(url,'_blank','noopener,noreferrer');else toast('该链接已失效')}if(a==='share'){try{await navigator.clipboard.writeText(location.href);toast('链接已复制')}catch{toast('可复制浏览器地址栏中的链接分享')}}});
root.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-image]')){e.preventDefault();e.target.click()}});
root.addEventListener('change',e=>{const f=e.target.closest('.poll');if(f)f.querySelector('button').disabled=!f.querySelector('input:checked')});
root.addEventListener('submit',e=>{e.preventDefault();if(e.target.matches('.poll')){const i=e.target.dataset.poll,choices=[...e.target.querySelectorAll('input:checked')].map(x=>Number(x.value));if(!choices.length||ps(current).votes?.[i])return;ps(current).votes||={};ps(current).votes[i]=choices;persist();revealPoll(e.target,Number(i))}if(e.target.matches('.composer')){const text=e.target.querySelector('textarea').value.trim();if(!text){toast('请先填写回复');return}const c={id:'local-'+Date.now(),user:'me',date:localDate(current),text,likes:0};if(replyTarget)c.replyTo={user:replyTarget.user,text:replyTarget.text};ps(current).comments||=[];ps(current).comments.push(c);persist();closeComposer();replyTarget=null;rerender();toast('回复已发布')}});
const viewer=document.querySelector('#viewer');viewer.addEventListener('click',()=>viewer.close());viewer.addEventListener('close',()=>document.documentElement.classList.remove('viewing-image'));route();
})();
