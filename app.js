'use strict';
let source=null,map=null,paths=null,stations=null,charts=[];
const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('ru-RU');
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=s=>String(s||'').slice(0,16);
const coord=(lat,lon)=>[Number(lat),Number(lon)];
const valid=p=>p.every(Number.isFinite)&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180;
function color(km){return km>10000?'#ff405d':km>=6000?'#ff9b2f':km>=3000?'#f7e044':'#23ec72'}
function setupMap(){
 if(map||!window.L)return;
 map=L.map('map',{worldCopyJump:true,preferCanvas:true,zoomSnap:.5}).setView([32,15],2.5);
 L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap contributors · HOT',maxZoom:12
 }).addTo(map);
 paths=L.layerGroup().addTo(map);stations=L.layerGroup().addTo(map);
 setTimeout(()=>map.invalidateSize(),100);
}
// Great-circle interpolation on a sphere: prevents misleading straight geographic lines.
function arc(start,end,steps=48){
 const rad=Math.PI/180,deg=180/Math.PI;
 const a=[start[0]*rad,start[1]*rad],b=[end[0]*rad,end[1]*rad];
 const vec=p=>[Math.cos(p[0])*Math.cos(p[1]),Math.cos(p[0])*Math.sin(p[1]),Math.sin(p[0])];
 const u=vec(a),v=vec(b),dot=Math.max(-1,Math.min(1,u.reduce((s,x,i)=>s+x*v[i],0))),omega=Math.acos(dot);
 if(omega<1e-7)return [start,end];
 const pts=[];for(let i=0;i<=steps;i++){
  const t=i/steps,A=Math.sin((1-t)*omega)/Math.sin(omega),B=Math.sin(t*omega)/Math.sin(omega);
  const q=u.map((x,j)=>A*x+B*v[j]);pts.push([Math.atan2(q[2],Math.hypot(q[0],q[1]))*deg,Math.atan2(q[1],q[0])*deg]);
 }return pts;
}
function drawMap(ranked,spots){
 if(!map)return;paths.clearLayers();stations.clearLayers();
 const txSpot=spots.find(s=>valid(coord(s.tx_lat,s.tx_lon)));
 if(!txSpot)return;
 const tx=coord(txSpot.tx_lat,txSpot.tx_lon);
 const labelOn=$('showLabels').checked,linesOn=$('showPaths').checked;
 const txMark=L.circleMarker(tx,{radius:9,color:'#ff445c',weight:3,fillColor:'#ffe44f',fillOpacity:1}).bindPopup('SP/US5QJA — передатчик').addTo(stations);
 if(labelOn)txMark.bindTooltip('<span class="wspr-label tx">SP/US5QJA</span>',{permanent:true,direction:'right',offset:[9,0],className:'wspr-tooltip'});
 const bounds=[tx];
 // One marker and path per unique receiver; cap for map readability.
 ranked.slice(0,220).forEach((s,i)=>{
  const rx=coord(s.rx_lat,s.rx_lon);if(!valid(rx))return;
  const km=Number(s.distance),c=color(km),popup=`<b>${safe(s.rx_sign)}</b><br>${fmt(km)} км · SNR ${safe(s.snr)} дБ<br>${safe(s.rx_loc)} · ${safe(time(s.time))} UTC`;
  if(linesOn){
   const pts=arc(tx,rx);let segment=[];
   const add=()=>{if(segment.length>1){L.polyline(segment,{color:'#07131d',weight:5,opacity:.9,interactive:false}).addTo(paths);L.polyline(segment,{color:c,weight:km>10000?3.2:2.3,opacity:.95}).bindPopup(popup).addTo(paths)}};
   for(const p of pts){if(segment.length&&Math.abs(p[1]-segment[segment.length-1][1])>180){add();segment=[]}segment.push(p)}add();
  }
  const marker=L.circleMarker(rx,{radius:i<15?5:3.5,color:'#061a2c',weight:1.5,fillColor:c,fillOpacity:1}).bindPopup(popup).addTo(stations);
  if(labelOn&&i<28)marker.bindTooltip(`<span class="wspr-label ${km>10000?'far':''}">${safe(s.rx_sign)}</span>`,{permanent:true,direction:'top',offset:[0,-5],className:'wspr-tooltip'});
  if(i<60)bounds.push(rx);
 });
 if(bounds.length>1&&$('distance').value!=='0')map.fitBounds(bounds,{padding:[40,40],maxZoom:4});
 setTimeout(()=>map.invalidateSize(),50);
}
function graph(id,type,labels,values,label){
 if(!window.Chart)return;
 charts.push(new Chart($(id),{type,data:{labels,datasets:[{label,data:values,backgroundColor:'#40cbb6',borderColor:'#f5d65b',borderWidth:2,pointRadius:type==='line'?2:0,fill:type==='line'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#9bb7c8',maxTicksLimit:9},grid:{color:'#1b3946'}},y:{ticks:{color:'#9bb7c8'},grid:{color:'#1b3946'}}}}}));
}
function render(){
 if(!source)return;charts.forEach(c=>c.destroy());charts=[];setupMap();
 const hours=$('period').value,band=$('band').value,minimum=Number($('distance').value);
 const spots=(source.windows?.[hours]||[]).filter(s=>Number(s.distance)>=minimum&&(band==='all'||Number(s.band)===Number(band)));
 const unique=new Map();for(const s of spots){const key=String(s.rx_sign)+'|'+String(s.rx_loc);if(!unique.has(key)||Number(s.distance)>Number(unique.get(key).distance))unique.set(key,s)}
 const ranked=[...unique.values()].sort((a,b)=>Number(b.distance)-Number(a.distance));
 const best=ranked[0];
 $('spots').textContent=fmt(spots.length);$('receivers').textContent=fmt(new Set(spots.map(s=>s.rx_sign)).size);
 $('maxkm').textContent=best?fmt(best.distance)+' км':'—';$('bestcall').textContent=best?best.rx_sign:'Нет данных';
 $('snr').textContent=spots.length?(spots.reduce((sum,s)=>sum+Number(s.snr),0)/spots.length).toFixed(1):'—';
 $('updated').textContent=source.updated_utc||'—';$('status').textContent=source.errors?.[hours]?'Внимание: данные могут быть устаревшими':'Данные загружены';
 drawMap(ranked,spots);
 $('mapRows').innerHTML=ranked.slice(0,20).map(s=>`<tr><td><b>${safe(s.rx_sign)}</b></td><td>${safe(s.rx_loc)}</td><td>${fmt(s.distance)} км</td><td>${safe(s.snr)} дБ</td><td>${safe(time(s.time))}</td></tr>`).join('')||'<tr><td colspan="5">Нет данных</td></tr>';
 const bins=new Map(),maxima=new Map();for(const s of spots){const k=String(s.time).slice(0,13);bins.set(k,(bins.get(k)||0)+1);maxima.set(k,Math.max(maxima.get(k)||0,Number(s.distance)))}
 const keys=[...bins.keys()].sort();graph('hoursChart','bar',keys.map(k=>k.slice(5)),keys.map(k=>bins.get(k)),'Приёмы');
 graph('distanceChart','line',keys.map(k=>k.slice(5)),keys.map(k=>maxima.get(k)),'км');
 graph('topChart','bar',ranked.slice(0,10).map(s=>s.rx_sign),ranked.slice(0,10).map(s=>s.distance),'км');
 $('rows').innerHTML=spots.slice(0,100).map(s=>`<tr><td>${safe(time(s.time))}</td><td>${safe(s.band)} МГц</td><td>${safe(s.rx_sign)}</td><td>${safe(s.rx_loc)}</td><td>${fmt(s.distance)} км</td><td>${safe(s.snr)} дБ</td><td>${(Number(s.frequency)/1e6).toFixed(6)} МГц</td><td>${safe(s.power)}</td></tr>`).join('')||'<tr><td colspan="8">Нет сообщений за выбранный период</td></tr>';
}
async function load(){try{const r=await fetch('data/spots.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);source=await r.json();render()}catch(e){$('status').textContent='Ошибка загрузки данных';$('rows').innerHTML='<tr><td colspan="8">Не удалось загрузить WSPR: '+safe(e.message)+'</td></tr>'}}
for(const id of ['period','band','distance','showLabels','showPaths'])$(id).addEventListener('change',render);
$('reload').addEventListener('click',()=>location.reload());window.addEventListener('load',load);

// Site sharing controls, independent from WSPR data loading.
(() => {
 const siteUrl='https://airbuss09.github.io/mywebsite/';
 const notice=document.getElementById('shareNotice');
 const say=message=>{if(notice)notice.textContent=message;};
 document.getElementById('copySiteLink')?.addEventListener('click',async()=>{
  try {
   if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(siteUrl);
   else {const input=document.getElementById('siteLink');input.focus();input.select();if(!document.execCommand('copy'))throw Error('copy unavailable');}
   say('Ссылка скопирована!');
  } catch(e){say('Выдели адрес в поле и нажми Ctrl+C.');}
 });
 document.getElementById('shareSiteLink')?.addEventListener('click',async()=>{
  if(navigator.share){try{await navigator.share({title:'SP/US5QJA WSPR Monitor',text:'Карта и графики WSPR',url:siteUrl});}catch(e){if(e.name!=='AbortError')say('Используй кнопку «Копировать».');}}
  else document.getElementById('copySiteLink')?.click();
 });
})();
