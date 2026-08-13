(function(){
  var GENRE_FALLBACK={
    'sonaandtokyo:10000000':'101858',
    'onni-style:10000033':'510883',
    'onni-style:10000097':'510883',
    'onni-style:10000258':'551732',
    'onni-style:10000250':'565218'
  };
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function trunc(s,n){s=String(s==null?'':s).trim();return s.length>n?s.slice(0,n).trim()+'…':s}
  function yen(n){return Number.isFinite(Number(n))?'¥'+Number(n).toLocaleString():'—'}
  function itemUrl(o){if(o.itemUrl)return o.itemUrl;if(!o.itemCode)return'';var p=String(o.itemCode).split(':');return p.length===2?'https://item.rakuten.co.jp/'+encodeURIComponent(p[0])+'/'+encodeURIComponent(p[1])+'/':''}
  function genre(o){return String(o.genreId||o.genreID||GENRE_FALLBACK[o.itemCode]||'')}
  function thumb(u,cls){return u?'<img class="'+cls+'" src="/api/rakuten-image?url='+encodeURIComponent(u)+'" loading="lazy" alt="">':'<div class="'+cls+' ca-noimg">—</div>'}

  function css(){
    var s=document.createElement('style');
    s.textContent=
      ':root{--ca-blue:#0071e3;--ca-ink:#1d1d1f;--ca-ink-soft:#6e6e73;--ca-ink-faint:#a1a1a6;'
      +'--ca-bg-alt:#f5f5f7;--ca-card:#fff;--ca-line:rgba(0,0,0,.06);--ca-green:#1a7f37;--ca-green-tint:#edf9f0;'
      +'--ca-blue-tint:#f0f6ff}'
      +'.ca-layout{display:flex;gap:20px;align-items:flex-start;margin-top:4px}'
      +'.ca-rail{display:flex;flex-direction:column;gap:8px;width:64px;flex-shrink:0}'
      +'.ca-thumbbtn{width:56px;height:56px;border-radius:14px;overflow:hidden;padding:0;cursor:pointer;'
      +'background:var(--ca-bg-alt);border:2px solid transparent;transition:transform .2s cubic-bezier(.16,1,.3,1),'
      +'border-color .2s,box-shadow .2s}'
      +'.ca-thumbbtn:hover{transform:translateY(-2px)}'
      +'.ca-thumbbtn.active{border-color:var(--ca-blue);box-shadow:0 0 0 3px rgba(0,113,227,.15)}'
      +'.ca-thumbbtn img{width:100%;height:100%;object-fit:cover;display:block}'
      +'.ca-thumbbtn .ca-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;'
      +'color:var(--ca-ink-faint);font-size:16px;background:var(--ca-bg-alt)}'
      +'.ca-wrap{flex:1;min-width:0}'
      +'.ca-state{padding:20px;color:var(--ca-ink-soft);font-size:14px;text-align:center;'
      +'border:1px dashed var(--ca-line);border-radius:16px}'
      +'.ca-table{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}'
      +'.ca-card{padding:14px;border-radius:16px;background:var(--ca-card);border:1px solid var(--ca-line);'
      +'box-shadow:0 1px 2px rgba(0,0,0,.04),0 8px 18px rgba(0,0,0,.03);min-width:0}'
      +'.ca-card.mine{background:var(--ca-blue-tint);border-color:rgba(0,113,227,.15)}'
      +'.ca-rank{font-size:12px;color:var(--ca-ink-soft);font-weight:700}'
      +'.ca-thumb{width:100%;aspect-ratio:1/1;object-fit:contain;display:block;margin:8px 0;border-radius:10px;background:var(--ca-bg-alt)}'
      +'.ca-name{font-size:13px;font-weight:600;line-height:1.45;height:38px;overflow:hidden;'
      +'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:var(--ca-ink)}'
      +'.ca-metrics{margin-top:10px;display:grid;gap:5px;font-size:12px;color:var(--ca-ink-soft)}'
      +'.ca-metrics b{color:var(--ca-ink)}'
      +'.ca-flags{display:flex;gap:4px;flex-wrap:wrap;margin-top:8px}'
      +'.ca-flag{font-size:11px;background:var(--ca-bg-alt);color:var(--ca-blue);border-radius:999px;padding:4px 8px;font-weight:500}'
      +'.ca-insights{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}'
      +'.ca-box{border:1px solid var(--ca-line);border-radius:16px;padding:16px;background:var(--ca-card)}'
      +'.ca-box h3{font-size:14px;margin:0 0 8px;font-weight:700}'
      +'.ca-box ul{padding-left:17px;margin:0}'
      +'.ca-box li{font-size:13px;line-height:1.6;margin:5px 0;color:var(--ca-ink-soft)}'
      +'.ca-actions{background:var(--ca-green-tint);border-color:rgba(26,127,55,.15)}'
      +'.ca-actions h3{color:var(--ca-green)}'
      +'.ca-note{font-size:11px;color:var(--ca-ink-faint);margin-top:12px;line-height:1.5}'
      +'.ca-source{font-size:12px;color:var(--ca-ink-soft);margin-top:10px}'
      +'.ca-source a{color:var(--ca-blue);font-weight:500;text-decoration:none}'
      +'@media(max-width:720px){.ca-layout{flex-direction:column}'
      +'.ca-rail{flex-direction:row;width:auto;overflow-x:auto;padding-bottom:4px}'
      +'.ca-thumbbtn{flex-shrink:0}'
      +'.ca-table{grid-template-columns:1fr 1fr}.ca-insights{grid-template-columns:1fr}}';
    document.head.appendChild(s);
  }

  function flags(f){if(!f)return'';var a=[];if(f.coupon)a.push('쿠폰/할인');if(f.freeShipping)a.push('무료배송');if(f.points)a.push('포인트');if(f.socialProof)a.push('인기/수상');if(f.urgency)a.push('한정/즉납');return a.map(function(v){return'<span class="ca-flag">'+v+'</span>'}).join('')}
  function card(p,label,mine){p=p||{};return'<div class="ca-card '+(mine?'mine':'')+'"><div class="ca-rank">'+esc(label)+'</div>'+thumb(p.imageUrl,'ca-thumb')+'<div class="ca-name" title="'+esc(p.title||'상품 정보 확인 중')+'">'+esc(trunc(p.title||'상품 정보 미확인',44))+'</div><div class="ca-metrics"><div>가격 <b>'+yen(p.price)+'</b></div><div>리뷰 <b>'+(p.reviews==null?'—':Number(p.reviews).toLocaleString()+'건')+'</b></div><div>포인트 <b>'+(p.pointRate==null?'—':p.pointRate+(p.pointRate>20?'배':'%'))+'</b></div></div><div class="ca-flags">'+flags(p.flags)+'</div></div>'}

  function draw(root,data,o){
    if(!data||!data.ok){root.innerHTML='<div class="ca-state">경쟁 상품 데이터를 불러오지 못했습니다.</div>';return}
    var top=data.top||[],mine=data.mine||{title:o.label,imageUrl:o.imageUrl};
    var h='<div class="ca-table">'+card(mine,'내 상품 · '+(o.rank==null?'순위 미확인':o.rank+'위'),true);
    for(var i=0;i<3;i++)h+=card(top[i],(i+1)+'위',false);
    h+='</div>';
    var ins=data.insights||{};
    h+='<div class="ca-insights"><div class="ca-box"><h3>🔎 상위권과의 차이</h3><ul>'+((ins.observations||[]).map(function(v){return'<li>'+esc(v)+'</li>'}).join('')||'<li>비교 가능한 공개 데이터가 충분하지 않습니다.</li>')+'</ul></div><div class="ca-box ca-actions"><h3>🚀 순위 상승 액션</h3><ul>'+((ins.actions||[]).map(function(v){return'<li>'+esc(v)+'</li>'}).join(''))+'</ul></div></div><div class="ca-note">'+esc(ins.note||'')+'</div>';
    if(data.source)h+='<div class="ca-source"><a href="'+esc(data.source)+'" target="_blank" rel="noopener">Rakuten 카테고리 랭킹 원본 보기 ↗</a></div>';
    root.innerHTML=h;
  }

  function load(root,o){
    var g=genre(o);
    if(!g){root.innerHTML='<div class="ca-state">이 상품의 genreId가 없어 경쟁 분석을 시작할 수 없습니다.</div>';return}
    root.innerHTML='<div class="ca-state">동일 카테고리 1~3위와 비교 분석 중…</div>';
    var u='/api/competitor-analysis?genreId='+encodeURIComponent(g)+'&myRank='+encodeURIComponent(o.rank||'')+'&itemUrl='+encodeURIComponent(itemUrl(o));
    fetch(u,{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){draw(root,d,o)}).catch(function(){root.innerHTML='<div class="ca-state">경쟁 분석을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>'});
  }

  function init(w){
    if(!Array.isArray(w)||!w.length)return;
    var anchor=document.getElementById('watchGrid');
    if(!anchor||document.getElementById('competitorSection'))return;
    var sec=document.createElement('section');
    sec.className='section';
    sec.id='competitorSection';
    sec.innerHTML='<div class="sectionhead"><h2>Top Competitor Analysis</h2><span class="small">동일 카테고리 1~3위 비교</span></div>'
      +'<div class="ca-layout"><div class="ca-rail" id="caRail"></div><div class="ca-wrap" id="caRoot"></div></div>';
    anchor.closest('.section').insertAdjacentElement('afterend',sec);
    var rail=sec.querySelector('#caRail'),root=sec.querySelector('#caRoot');
    rail.innerHTML=w.map(function(o,i){
      return '<button class="ca-thumbbtn'+(i===0?' active':'')+'" data-i="'+i+'" title="'+esc(o.label||o.itemCode||('상품 '+(i+1)))+'">'
        +thumb(o.imageUrl,'')+'</button>';
    }).join('');
    rail.querySelectorAll('.ca-thumbbtn').forEach(function(b){
      b.onclick=function(){
        rail.querySelectorAll('.ca-thumbbtn').forEach(function(q){q.classList.remove('active')});
        b.classList.add('active');
        load(root,w[Number(b.dataset.i)]);
      };
    });
    load(root,w[0]);
  }

  css();
  var originalFetch=window.fetch;
  window.fetch=function(){
    var args=arguments;
    return originalFetch.apply(this,args).then(function(r){
      try{
        var url=String(args[0]||'');
        if(url.indexOf('/api/news')>=0){
          r.clone().json().then(function(d){setTimeout(function(){init(d.watchlist||[])},0)}).catch(function(){});
        }
      }catch(e){}
      return r;
    });
  };
})();
