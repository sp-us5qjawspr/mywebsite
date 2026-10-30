'use strict';
let source=null,map=null,paths=null,stations=null,charts=[];
const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('ru-RU');
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=s=>String(s||'').slice(0,16);
const coord=(lat,lon)=>[Number(lat),Number(lon)];
const valid=p=>p.every(Number.isFinite)&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180;

// Flags are inferred from standard amateur-radio callsign prefixes.
// Portable operation and special calls may differ; unknown calls use a globe.
const PREFIX_FLAGS=[
 ['VK','AU'],['AX','AU'],['VL','AU'],['ZL','NZ'],['V5','NA'],['ZS','ZA'],['ZR','ZA'],['ZT','ZA'],['ZU','ZA'],
 ['EA8','ES'],['EA6','ES'],['EA9','ES'],['EA','ES'],['EB','ES'],['EC','ES'],['ED','ES'],
 ['CT3','PT'],['CT','PT'],['CS','PT'],['CR','PT'],['CU','PT'],['EI','IE'],['EJ','IE'],
 ['GM','GB'],['MM','GB'],['GW','GB'],['MW','GB'],['GI','GB'],['MI','GB'],['G','GB'],['M','GB'],['2E','GB'],['2M','GB'],['2W','GB'],['2I','GB'],
 ['SP','PL'],['SQ','PL'],['SN','PL'],['SO','PL'],['HF','PL'],['3Z','PL'],
 ['DL','DE'],['DA','DE'],['DB','DE'],['DC','DE'],['DD','DE'],['DF','DE'],['DG','DE'],['DH','DE'],['DJ','DE'],['DK','DE'],['DM','DE'],['DN','DE'],['DO','DE'],['DP','DE'],['DQ','DE'],['DR','DE'],
 ['F','FR'],['TM','FR'],['TK','FR'],['HB','CH'],['HE','CH'],['OE','AT'],['ON','BE'],['OO','BE'],['OP','BE'],['OQ','BE'],['OR','BE'],['OS','BE'],['OT','BE'],
 ['PA','NL'],['PB','NL'],['PC','NL'],['PD','NL'],['PE','NL'],['PF','NL'],['PG','NL'],['PH','NL'],['PI','NL'],
 ['SM','SE'],['SA','SE'],['SB','SE'],['SC','SE'],['SD','SE'],['SE','SE'],['SF','SE'],['SG','SE'],['SH','SE'],['SI','SE'],['SJ','SE'],['SK','SE'],['SL','SE'],['7S','SE'],['8S','SE'],
 ['LA','NO'],['LB','NO'],['LC','NO'],['LD','NO'],['LE','NO'],['LF','NO'],['LG','NO'],['LI','NO'],['LJ','NO'],['LK','NO'],['LL','NO'],['LM','NO'],['LN','NO'],
 ['OH','FI'],['OF','FI'],['OG','FI'],['OI','FI'],['OJ','FI'],['OM','SK'],['OK','CZ'],['OL','CZ'],
 ['OZ','DK'],['OU','DK'],['OV','DK'],['OW','DK'],['OX','GL'],['OY','FO'],['TF','IS'],['ES','EE'],['YL','LV'],['LY','LT'],
 ['I','IT'],['IK','IT'],['IZ','IT'],['IU','IT'],['IS0','IT'],['9A','HR'],['S5','SI'],['YU','RS'],['YT','RS'],['E7','BA'],['4O','ME'],['ZA','AL'],['Z3','MK'],['SV','GR'],['SX','GR'],['J4','GR'],['LZ','BG'],['YO','RO'],['YR','RO'],['YP','RO'],['YQ','RO'],['UR','UA'],['US','UA'],['UT','UA'],['UU','UA'],['UV','UA'],['UW','UA'],['UX','UA'],['UY','UA'],['UZ','UA'],['EM','UA'],['EN','UA'],['EO','UA'],
 ['JA','JP'],['JE','JP'],['JF','JP'],['JG','JP'],['JH','JP'],['JI','JP'],['JJ','JP'],['JK','JP'],['JL','JP'],['JM','JP'],['JN','JP'],['JO','JP'],['JP','JP'],['JQ','JP'],['JR','JP'],['JS','JP'],['7J','JP'],['7K','JP'],['7L','JP'],['7M','JP'],['7N','JP'],['8J','JP'],['8K','JP'],['8L','JP'],['8M','JP'],['8N','JP'],
 ['BY','CN'],['BG','CN'],['BH','CN'],['BI','CN'],['BD','CN'],['BA','CN'],['VR','HK'],['BV','TW'],['BU','TW'],['BX','TW'],['HL','KR'],['DS','KR'],['6K','KR'],['6L','KR'],['6M','KR'],['6N','KR'],['9V','SG'],['HS','TH'],['E2','TH'],['DU','PH'],['DW','PH'],['DX','PH'],['DY','PH'],['YB','ID'],['YC','ID'],['YD','ID'],['YE','ID'],['YF','ID'],['YG','ID'],['YH','ID'],['9M','MY'],['9W','MY'],['VU','IN'],['AP','PK'],['9K','KW'],['A4','OM'],['A6','AE'],['A7','QA'],['HZ','SA'],['7Z','SA'],['4X','IL'],['4Z','IL'],['TA','TR'],['TB','TR'],['TC','TR'],['YM','TR'],
 ['K','US'],['N','US'],['W','US'],['AA','US'],['AB','US'],['AC','US'],['AD','US'],['AE','US'],['AF','US'],['AG','US'],['AI','US'],['AJ','US'],['AK','US'],['AL','US'],
 ['VA','CA'],['VE','CA'],['VO','CA'],['VY','CA'],['CF','CA'],['CG','CA'],['CH','CA'],['CI','CA'],['CJ','CA'],['CK','CA'],['CY','CA'],
 ['LU','AR'],['LW','AR'],['PY','BR'],['PP','BR'],['PQ','BR'],['PR','BR'],['PS','BR'],['PT','BR'],['PU','BR'],['PV','BR'],['PW','BR'],['PX','BR'],['ZP','PY'],['CX','UY'],['CE','CL'],['CA','CL'],['CB','CL'],['CD','CL'],['OA','PE'],['HC','EC'],['HK','CO'],['HJ','CO'],['YV','VE'],['YY','VE'],['CP','BO'],['HP','PA'],['TI','CR'],['TG','GT'],['XE','MX'],['XF','MX'],['XG','MX'],['4A','MX'],['4B','MX'],['4C','MX'],
 ['5Z','KE'],['5H','TZ'],['5N','NG'],['5R','MG'],['3B8','MU'],['FR','RE'],['CN','MA'],['5X','UG'],['9J','ZM'],['7Q','MW'],['A2','BW'],['3DA','SZ'],['C5','GM'],['9G','GH'],['SU','EG'],['ST','SD'],['ET','ET']
].sort((a,b)=>b[0].length-a[0].length);
function countryCode(call){
 const parts=String(call||'').toUpperCase().split('/').filter(Boolean);
 // Prefer an explicit operating prefix in slash calls (e.g. EA8/DF4UE).
 const candidate=(parts.length>1&&parts[0].length<=4)?parts[0]:parts[0]||'';
 const match=PREFIX_FLAGS.find(([p])=>candidate.startsWith(p));return match?match[1]:null;
}
// Country names and PNG flags are shown only in the rightmost country column.
const countryNames=new Intl.DisplayNames(['ru'],{type:'region'});
function countryCell(call){
 const code=countryCode(call);
 if(!code)return 'Неизвестно';
 const name=countryNames.of(code);
 return `<img src="https://flagcdn.com/w20/${code.toLowerCase()}.png" width="20" height="15" alt="" loading="lazy" style="vertical-align:middle;object-fit:contain;margin-right:7px" onerror="this.style.display='none'">${safe(name)}`;
}

function color(km){return km>10000?'#ff405d':km>=6000?'#ff9b2f':km>=3000?'#f7e044':'#23ec72'}
function setupMap(){
 if(map||!window.L)return;
 map=L.map('map',{worldCopyJump:true,preferCanvas:true,zoomSnap:.5}).setView([32,15],2.5);
 const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri, Maxar, Earthstar Geographics and contributors',maxZoom:12});
 const street=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:12});
 satellite.addTo(map);
 L.control.layers({'Спутник':satellite,'Обычная карта':street},null,{position:'topleft',collapsed:true}).addTo(map);
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
   const add=()=>{if(segment.length>1){L.polyline(segment,{color:'#07131d',weight:3,opacity:.75,interactive:false}).addTo(paths);L.polyline(segment,{color:c,weight:km>10000?2.1:1.5,opacity:.9}).bindPopup(popup).addTo(paths)}};
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
 const checkedBands=[...document.querySelectorAll('.band-checkbox:checked')].map(el=>Number(el.value));
 const filterByCheckbox=!$('allBandsCheck').checked;
 const spots=(source.windows?.[hours]||[]).filter(s=>Number(s.distance)>=minimum&&(filterByCheckbox?checkedBands.includes(Number(s.band)):(band==='all'||Number(s.band)===Number(band))));
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
 $('rows').innerHTML=spots.slice(0,100).map(s=>`<tr><td>${safe(time(s.time))}</td><td>${safe(s.band)} МГц</td><td>${safe(s.rx_sign)}</td><td>${safe(s.rx_loc)}</td><td>${fmt(s.distance)} км</td><td>${safe(s.snr)} дБ</td><td>${(Number(s.frequency)/1e6).toFixed(6)} МГц</td><td>${safe(s.power)}</td><td>${countryCell(s.rx_sign)}</td></tr>`).join('')||'<tr><td colspan="9">Нет сообщений за выбранный период</td></tr>';
}
async function load(){try{const r=await fetch('data/spots.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);source=await r.json();render()}catch(e){$('status').textContent='Ошибка загрузки данных';$('rows').innerHTML='<tr><td colspan="9">Не удалось загрузить WSPR: '+safe(e.message)+'</td></tr>'}}
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

// Sidebar band filters. Existing dropdown remains available for one-band selection.
const allBandsCheck=document.getElementById('allBandsCheck');
const bandChecks=[...document.querySelectorAll('.band-checkbox')];
allBandsCheck?.addEventListener('change',()=>{
 if(allBandsCheck.checked){bandChecks.forEach(c=>c.checked=false);document.getElementById('band').value='all';}
 else{bandChecks.forEach(c=>c.checked=true);document.getElementById('band').value='all';}
 render();
});
bandChecks.forEach(c=>c.addEventListener('change',()=>{
 allBandsCheck.checked=false;
 if(bandChecks.every(x=>x.checked)||bandChecks.every(x=>!x.checked)){
  allBandsCheck.checked=true;bandChecks.forEach(x=>x.checked=false);
 }
 document.getElementById('band').value='all';render();
}));
document.getElementById('band').addEventListener('change',e=>{
 allBandsCheck.checked=e.target.value==='all';
 bandChecks.forEach(c=>c.checked=!allBandsCheck.checked&&c.value===e.target.value);
});
