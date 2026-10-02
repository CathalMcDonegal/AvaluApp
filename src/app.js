import { store } from './store.js';
const app=document.querySelector('#app');
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let deferredInstallPrompt=null;
const installControl=()=>'<button type="button" class="install-app secondary" title="Instal·lar AvaluApp">⬇ Instal·la AvaluApp</button>';
const installApp=async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;return}alert('Per instal·lar AvaluApp com una aplicació d’escriptori, obre el menú ⋮ del navegador i tria «Instal·la AvaluApp» o «Instal·la aplicació».');};
document.addEventListener('click',e=>{if(e.target.closest('.install-app'))installApp()});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null});
const safeFile=(v)=>String(v||'alumne').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_');

function reportData(c,g,s,term){
 const rubric=c.rubric?.[term]||null;
 const items=rubric?.items||store.getItems().map(i=>({...i,descriptors:{}}));
 const vals=s.assessments[term]||{};
 const termNames={1:'1a Avaluació',2:'2a Avaluació'};
 const rows=items.map(i=>({code:i.code,name:i.name,category:i.category||'',value:String(vals[i.id]?.value||'').toUpperCase(),descriptor:i.descriptors?.[String(vals[i.id]?.value||'').toUpperCase()]||''}));
 return {items,vals,rows,termName:termNames[term],studentName:(s.firstName+' '+s.lastName).trim(),course:c.name,group:g.name,year:c.year,observations:s.observations[term]||'',finalGrade:s.finalGrades?.[term]||'',aaPi:s.aaPi?.[term]||''};
}
function downloadDoc(buffer,name){
 const blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function generateWord(c,g,s,term){
 if(!window.docx){alert('No s’ha pogut carregar el generador Word.');return}
 const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType}=window.docx;
 const d=reportData(c,g,s,term);
 const cell=(text,bold=false)=>new TableCell({children:[new Paragraph({children:[new TextRun({text:String(text||'—'),bold})]})]});
 const rows=[new TableRow({children:[cell('Ítem',true),cell('Codi',true),cell('Descripció de la gradació',true)]})];
 d.rows.forEach(i=>rows.push(new TableRow({children:[cell(i.name),cell(i.value||'—'),cell(i.descriptor||i.value||'—')]})));
 const doc=new Document({sections:[{properties:{page:{margin:{top:1080,right:900,bottom:1080,left:900}}},children:[
   new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'AvaluApp',bold:true,size:34})]}),
   new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:d.termName,size:22})]}),
   new Paragraph({text:''}),
   new Paragraph({children:[new TextRun({text:'Alumne: ',bold:true}),new TextRun({text:d.studentName})]}),
   new Paragraph({children:[new TextRun({text:'Curs: ',bold:true}),new TextRun({text:d.course}),new TextRun({text:'    Classe: ',bold:true}),new TextRun({text:d.group})]}),
   new Paragraph({children:[new TextRun({text:'Curs acadèmic: ',bold:true}),new TextRun({text:d.year})]}),
   new Paragraph({children:[new TextRun({text:'AA/PI: ',bold:true}),new TextRun({text:d.aaPi||'—'}),new TextRun({text:'    FINAL: ',bold:true}),new TextRun({text:d.finalGrade||'—'})]}),
   new Paragraph({text:''}),
   new Table({width:{size:100,type:WidthType.PERCENTAGE},rows}),
   new Paragraph({text:''}),
   new Paragraph({children:[new TextRun({text:'Observacions',bold:true})]}),
   new Paragraph({text:d.observations||'—'})
 ]}]});
 const buffer=await Packer.toBlob(doc);
 downloadDoc(buffer,'AvaluApp_'+safeFile(d.studentName)+'_'+safeFile(d.termName)+'.docx');
}
function render(){const courses=store.getCourses();app.innerHTML=`<header class="topbar"><div class="brand"><span class="brand-mark">A</span>AvaluApp</div><div class="topbar-spacer"></div>${installControl()}</header><main class="container"><section class="hero"><div><p class="eyebrow">GESTIÓ EDUCATIVA</p><h1>Els meus cursos</h1><p class="muted">Organitza cursos, classes i alumnes.</p></div><div class="hero-actions"><button class="secondary" id="demo">Carregar mostra (25)</button><button class="primary" id="new">+ Crear curs</button></div></section><section class="stats"><div class="stat"><strong>${courses.length}</strong><span>Cursos</span></div><div class="stat"><strong>${courses.reduce((n,c)=>n+c.groups.length,0)}</strong><span>Classes</span></div><div class="stat"><strong>${courses.reduce((n,c)=>n+c.groups.reduce((m,g)=>m+g.students.length,0),0)}</strong><span>Alumnes</span></div></section><section class="course-grid">${courses.map(c=>`<article class="card course-card" data-id="${c.id}"><div class="card-icon">📚</div><div class="course-main"><h2>${esc(c.name)}</h2><p>${esc(c.year)} · ${c.groups.length} classes</p></div><span>→</span></article>`).join('')||'<div class="empty"><h2>Comencem?</h2><p>Crea el teu primer curs.</p></div>'}</section></main>`;document.querySelector('#new').onclick=createCourse;document.querySelector('#demo').onclick=()=>{const c=store.seedDemo();if(c){course(c.id)}else{alert('La mostra ja està carregada.')}};document.querySelectorAll('.course-card').forEach(x=>x.onclick=()=>course(x.dataset.id))}
function createCourse(){const name=prompt('Nom del curs');if(!name?.trim())return;const year=prompt('Curs acadèmic','2026-2027')||'2026-2027';const c=store.addCourse({name:name.trim(),year});course(c.id)}
function course(id){
 const c=store.getCourses().find(x=>x.id===id),rubric=c.rubric;
 app.innerHTML=`<header class="topbar"><button class="back" id="back">←</button><div class="brand"><span class="brand-mark">A</span>${esc(c.name)}</div><div class="topbar-spacer"></div>${installControl()}</header><main class="container"><section class="hero"><div><p class="eyebrow">${esc(c.year)}</p><h1>Classes</h1><p class="muted">${rubric?'Graella de gradació vinculada · AE · AN · AS · NA':'Encara no hi ha cap graella de gradació vinculada.'}</p></div><div class="hero-actions"><button class="secondary" id="rubric">📊 ${rubric?'Canviar graella':'Adjuntar graella'}</button><button class="primary" id="newgroup">+ Crear classe</button></div></section><section class="group-grid">${c.groups.map(g=>`<article class="card group-card"><div class="group-badge">${esc(g.name[0])}</div><div><h2>${esc(g.name)}</h2><p>${g.students.length} alumnes</p></div><button class="secondary add" data-id="${g.id}">+ Alumne</button><button class="secondary open" data-id="${g.id}">Obrir →</button><button class="danger icon-delete delete-group" data-id="${g.id}" title="Esborrar classe" aria-label="Esborrar classe">🗑</button></article>`).join('')||'<div class="empty"><h2>Encara no hi ha classes</h2></div>'}</section></main>`;
 document.querySelector('#back').onclick=render;
 document.querySelector('#rubric').onclick=()=>importRubric(id);
 document.querySelector('#newgroup').onclick=()=>{const n=prompt('Nom de la classe');if(n?.trim()){store.addGroup(id,{name:n.trim()});course(id)}};
 document.querySelectorAll('.add').forEach(b=>b.onclick=()=>addStudent(id,b.dataset.id));
 document.querySelectorAll('.open').forEach(b=>b.onclick=()=>group(id,b.dataset.id));
 document.querySelectorAll('.delete-group').forEach(b=>b.onclick=e=>{e.stopPropagation();if(confirm('Esborrar aquesta classe i tots els seus alumnes? Aquesta acció no es pot desfer.')){store.deleteGroup(id,b.dataset.id);course(id)}})
}
function normalizeHeader(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function parseRubricSheet(rows,term){
 if(!rows?.length)return null;
 const codes=['AE','AN','AS','NA'];
 const title=String(rows[0]?.[0]||'').trim()||('Avaluació '+term);
 const items=[];
 for(let r=2;r<rows.length;r++){
   const category=String(rows[r]?.[0]||'').trim();
   const name=String(rows[r]?.[1]||'').trim();
   if(!name)continue;
   const descriptors={};
   codes.forEach((code,j)=>{const v=String(rows[r]?.[j+2]??'').trim();if(v)descriptors[code]=v});
   if(Object.keys(descriptors).length)items.push({id:'rubric_'+term+'_'+items.length,category,name,code:name.slice(0,3).toUpperCase(),descriptors});
 }
 return {title,items,codes};
}
async function importRubric(courseId){
 const input=document.createElement('input');input.type='file';input.accept='.xlsx,.xls,.csv';
 input.onchange=async()=>{
  const file=input.files?.[0];if(!file)return;
  try{
   const XLSXLib=await ensureXlsx();
   const data=await file.arrayBuffer(),wb=XLSXLib.read(data,{type:'array'});
   const sheets=wb.SheetNames;
   const rubric={};
   const termSheets=[sheets.find(s=>normalizeHeader(s).includes('1r')),sheets.find(s=>normalizeHeader(s).includes('2n'))];
   if(!termSheets[0]||!termSheets[1]){alert('No he trobat les pestanyes de la 1a i 2a avaluació.');return}
   termSheets.forEach((sheet,idx)=>{const rows=XLSXLib.utils.sheet_to_json(wb.Sheets[sheet],{header:1,defval:''});rubric[idx+1]=parseRubricSheet(rows,idx+1)});
   if(!rubric[1]?.items.length&&!rubric[2]?.items.length){alert('No he trobat ítems de gradació a la graella.');return}
   store.setRubric(courseId,rubric);alert('Graella de gradació importada i vinculada al curs. Les seves classes la compartiran.');course(courseId);
  }catch(e){console.error(e);alert('No s’ha pogut llegir la graella.')}
 };
 input.click();
}
function splitStudentName(raw){
 const value=String(raw||'').trim();
 if(!value)return {firstName:'',lastName:''};
 // Format habitual de llistats escolars: COGNOMS, NOM.
 if(value.includes(',')){
   const parts=value.split(',');
   const lastName=parts.shift().trim();
   const firstName=parts.join(',').trim();
   if(firstName)return {firstName,lastName};
 }
 const parts=value.split(/\s+/).filter(Boolean);
 if(parts.length===1)return {firstName:parts[0],lastName:''};
 return {firstName:parts.shift(),lastName:parts.join(' ')};
}
function parseExcelRows(rows){
 if(!rows.length)return [];
 const headers=rows[0].map(normalizeHeader);
 const find=(names)=>headers.findIndex(h=>names.includes(h));
 const first=find(['nom','nombre','name','first name','firstname','nom alumne','nombre alumno']);
 const last=find(['cognoms','apellidos','surname','last name','lastname','1r cognom','primer cognom','1er cognom','primer apellido','1r apellido']);
 const last2=find(['2n cognom','segon cognom','2on cognom','segundo apellido','2n apellido']);
 const full=find(['nom i cognoms','nom i cognom','nombre y apellidos','nombre y apellido','alumne','alumno','student','nom complet','nombre completo']);
 const number=find(['numero','numero alumne','num alumne','n alumne','student number','id']);
 return rows.slice(1).map(r=>{
   let firstName='',lastName='';
   if(first>=0) firstName=String(r[first]??'').trim();
   if(last>=0) lastName=String(r[last]??'').trim();
   if(last2>=0){const secondLast=String(r[last2]??'').trim();lastName=[lastName,secondLast].filter(Boolean).join(' ');}
   if(first>=0 && last<0){
     const parsed=splitStudentName(firstName);
     firstName=parsed.firstName;lastName=parsed.lastName;
   }
   if(!firstName&&!lastName&&full>=0){
     const parsed=splitStudentName(String(r[full]??''));
     firstName=parsed.firstName;lastName=parsed.lastName;
   }
   return {firstName,lastName,studentNumber:number>=0?String(r[number]??'').trim():''};
 }).filter(x=>(x.firstName+' '+x.lastName).trim());
}
async function ensureXlsx(){
 if(window.XLSX)return window.XLSX;
 await new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
   script.onload=resolve;script.onerror=reject;document.head.appendChild(script);
 });
 if(!window.XLSX)throw new Error('XLSX no disponible');
 return window.XLSX;
}
function importExcel(courseId,groupId){
 const input=document.createElement('input');input.type='file';input.accept='.xlsx,.xls,.csv';
 input.onchange=async()=>{
  const file=input.files?.[0];if(!file)return;
  try{
   const XLSXLib=await ensureXlsx();
   const data=await file.arrayBuffer(),wb=XLSXLib.read(data,{type:'array'}),sheet=wb.Sheets[wb.SheetNames[0]],rows=XLSXLib.utils.sheet_to_json(sheet,{header:1,defval:''}),students=parseExcelRows(rows);
   if(!students.length){alert('No he trobat alumnes. Revisa que la primera fila tingui columnes com Nom i Cognoms.');return}
   const preview=students.slice(0,80).map((s,i)=>'<tr><td>'+((i+1))+'</td><td>'+esc(s.firstName)+'</td><td>'+esc(s.lastName)+'</td><td>'+esc(s.studentNumber)+'</td></tr>').join('');
   const more=students.length>80?'... i '+(students.length-80)+' més':'';
   app.innerHTML='<header class="topbar"><button class="back" id="cancel-import">←</button><div class="brand">Importar alumnes</div><div class="topbar-spacer"></div>${installControl()}</header><main class="container"><section class="hero"><div><p class="eyebrow">PREVISUALITZACIÓ</p><h1>'+esc(file.name)+'</h1><p class="muted">'+students.length+' alumnes detectats. Revisa abans d’importar.</p></div><button class="primary" id="confirm-import">Importar alumnes</button></section><section class="card import-preview"><div class="item-table"><table><thead><tr><th>#</th><th>Nom</th><th>Cognoms</th><th>Número</th></tr></thead><tbody>'+preview+'</tbody></table></div><p class="muted">'+more+'</p></section></main>';
   document.querySelector('#cancel-import').onclick=()=>group(courseId,groupId);
   document.querySelector('#confirm-import').onclick=()=>{const result=store.importStudents(groupId,students);alert('Importació completada: '+result.added+' alumnes afegits'+(result.duplicates?' i '+result.duplicates+' duplicats ignorats.':'.'));group(courseId,groupId)};
  }catch(e){alert('No s’ha pogut llegir el fitxer.');console.error(e)}
 };
 input.click();
}
function addStudent(courseId,groupId){const first=prompt('Nom de l’alumne');if(!first?.trim())return;store.addStudent(groupId,{firstName:first.trim(),lastName:prompt('Cognoms')||''});course(courseId)}
function gradeChoices(selected){return ['', 'AE','AN','AS','NA','AE*','AN*','AS*','NA*','(AE)','(AN)','(AS)','(NA)','-'].map(v=>`<option value="${v}" ${selected===v?'selected':''}>${v||'—'}</option>`).join('')}
function classGrid(courseId,groupId){
 const c=store.getCourses().find(x=>x.id===courseId),g=c.groups.find(x=>x.id===groupId);let term='1';
 const tabs={1:'1a Avaluació',2:'2a Avaluació'};
 function draw(){
  const rubric=c.rubric?.[term],items=rubric?.items||[];
  app.innerHTML=`<header class="topbar"><button class="back" id="back">←</button><div class="brand"><span class="brand-mark">A</span> Graella · ${esc(g.name)}</div><div class="topbar-spacer"></div>${installControl()}</header><main class="container"><section class="hero"><div><p class="eyebrow">GRAELLA DE CLASSE</p><h1>${esc(g.name)}</h1><p class="muted">${g.students.length} alumnes · ${tabs[term]} · edició ràpida</p></div><div class="hero-actions"><button class="secondary" id="backtab">← Fitxa de classe</button></div></section><nav class="tabs grid-tabs">${Object.entries(tabs).map(([k,v])=>`<button class="${term===k?'active':''}" data-term="${k}">${v}</button>`).join('')}</nav>${!rubric?'<section class="card empty"><h2>Falta la graella</h2><p>Adjunta la graella de gradació des del curs per poder treballar la classe.</p></section>':`<section class="card class-grid-card"><div class="grid-note"><strong>💡 El FINAL és manual</strong><span>No es calcula automàticament: introdueix la valoració global segons les evidències.</span></div><div class="class-grid-scroll"><table class="class-grid-table"><thead><tr><th class="student-col">Alumne</th><th>AA/PI</th>${items.map(i=>`<th title="${esc(i.name)}">${esc(i.code)}</th>`).join('')}<th class="final-col">FINAL</th></tr></thead><tbody>${g.students.map(s=>{const vals=s.assessments?.[term]||{};const final=s.finalGrades?.[term]||'';const aapi=s.aaPi?.[term]||'';return `<tr data-student="${s.id}"><td class="student-col"><button class="student-link" data-student="${s.id}">${esc([s.firstName,s.lastName].filter(Boolean).join(' '))}</button></td><td><select class="grid-select aa-select" data-student="${s.id}"><option value="" ${!aapi?'selected':''}>—</option><option value="X" ${aapi==='X'?'selected':''}>X</option></select></td>${items.map(i=>{const v=String(vals[i.id]?.value||'').toUpperCase();return `<td><select class="grid-select grade-select" data-student="${s.id}" data-item="${i.id}">${gradeChoices(v)}</select></td>`}).join('')}<td><select class="grid-select final-select" data-student="${s.id}">${gradeChoices(final)}</select></td></tr>`}).join('')}</tbody></table></div></section>`}</main>`;
  document.querySelector('#back').onclick=()=>group(courseId,groupId);document.querySelector('#backtab').onclick=()=>group(courseId,groupId);
  document.querySelectorAll('[data-term]').forEach(b=>b.onclick=()=>{term=b.dataset.term;draw()});
  document.querySelectorAll('.student-link').forEach(b=>b.onclick=()=>student(courseId,groupId,b.dataset.student));
  document.querySelectorAll('.grade-select').forEach(e=>e.onchange=()=>store.setAssessment(e.dataset.student,term,e.dataset.item,e.value));
  document.querySelectorAll('.aa-select').forEach(e=>e.onchange=()=>store.setAAPi(e.dataset.student,term,e.value));
  document.querySelectorAll('.final-select').forEach(e=>e.onchange=()=>store.setFinalGrade(e.dataset.student,term,e.value));
 }
 draw();
}
function group(courseId,groupId){const c=store.getCourses().find(x=>x.id===courseId),g=c.groups.find(x=>x.id===groupId);app.innerHTML=`<header class="topbar"><button class="back" id="back">←</button><div class="brand">${esc(c.name)} · ${esc(g.name)}</div><div class="topbar-spacer"></div>${installControl()}</header><main class="container"><section class="hero"><div><p class="eyebrow">CLASSE</p><h1>${esc(g.name)}</h1><p class="muted">${g.students.length} alumnes</p></div><div class="hero-actions"><button class="primary" id="grid">📋 Graella de classe</button><button class="secondary" id="add">+ Afegir alumne</button><button class="secondary" id="import">Importar Excel</button></div></section><section class="student-list">${g.students.map(s=>`<article class="card student-row" data-id="${s.id}"><div class="avatar">${esc(s.firstName[0])}</div><div class="student-main"><h2>${esc(s.firstName+' '+s.lastName)}</h2><p>Obrir fitxa d’avaluació</p></div><button class="danger icon-delete delete-student" data-id="${s.id}" title="Esborrar alumne" aria-label="Esborrar alumne">🗑</button><span>→</span></article>`).join('')||'<div class="empty"><p>No hi ha alumnes.</p></div>'}</section></main>`;document.querySelector('#back').onclick=()=>course(courseId);document.querySelector('#grid').onclick=()=>classGrid(courseId,groupId);document.querySelector('#add').onclick=()=>addStudent(courseId,groupId);document.querySelector('#import').onclick=()=>importExcel(courseId,groupId);document.querySelectorAll('.student-row').forEach(x=>x.onclick=()=>student(courseId,groupId,x.dataset.id));document.querySelectorAll('.delete-student').forEach(b=>b.onclick=e=>{e.stopPropagation();if(confirm('Esborrar aquest alumne i totes les seves avaluacions? Aquesta acció no es pot desfer.')){store.deleteStudent(groupId,b.dataset.id);group(courseId,groupId)}})}
function student(courseId,groupId,studentId){
 const c=store.getCourses().find(x=>x.id===courseId),g=c.groups.find(x=>x.id===groupId),s=g.students.find(x=>x.id===studentId);
 let term='1';const tabs={1:'1a Avaluació',2:'2a Avaluació'};
 function draw(){
  const rubric=c.rubric?.[term],items=rubric?.items||store.getItems().map(i=>({...i,descriptors:{}})),vals=s.assessments[term]||{};
  app.innerHTML=`<header class="topbar"><button class="back" id="back">←</button><div class="brand"><span class="brand-mark">A</span> ${esc(s.firstName+' '+s.lastName)}</div><div class="topbar-spacer"></div>${installControl()}</header><main class="container"><section class="student-head"><div class="avatar large">${esc(s.firstName[0])}</div><div><p class="eyebrow">${esc(g.name)} · ${esc(c.name)}</p><h1>${esc(s.firstName+' '+s.lastName)}</h1><p class="muted">Fitxa d’avaluació · ${rubric?'AE · AN · AS · NA':'Configura primer la graella del curs'}</p></div></section><nav class="tabs">${Object.entries(tabs).map(([k,v])=>`<button class="${term===k?'active':''}" data-term="${k}">${v}</button>`).join('')}</nav><section class="card assessment"><div class="assessment-title"><div><h2>${tabs[term]}</h2><p class="muted">${rubric?.title||''}</p></div><button class="secondary" id="word">Generar Word</button></div><div class="item-table">${items.map(i=>{const value=String(vals[i.id]?.value||'').toUpperCase(),desc=i.descriptors?.[value]||'';return `<div class="item-row rubric-row"><div><strong>${esc(i.category||'')}</strong><span>${esc(i.name)}</span></div><div class="mark-wrap"><div class="grade-buttons" role="group" aria-label="Gradació ${esc(i.name)}">${['AE','AN','AS','NA'].map(code=>`<button type="button" class="grade-btn ${value===code?'selected':''}" data-item="${i.id}" data-value="${code}">${code}</button>`).join('')}</div><small class="descriptor" data-desc="${i.id}">${esc(desc)}</small></div></div>`}).join('')||'<p class="muted">No hi ha ítems configurats per aquesta avaluació.</p>'}</div><label class="obs"><span>Observacions</span><textarea id="obs">${esc(s.observations[term]||'')}</textarea></label></section></main>`;
  document.querySelector('#back').onclick=()=>group(courseId,groupId);
  document.querySelectorAll('[data-term]').forEach(b=>b.onclick=()=>{term=b.dataset.term;draw()});
  document.querySelectorAll('.grade-btn').forEach(e=>e.onclick=()=>{
   const itemId=e.dataset.item,value=e.dataset.value;
   store.setAssessment(studentId,term,itemId,value);
   const wrap=e.closest('.mark-wrap');wrap.querySelectorAll('.grade-btn').forEach(btn=>btn.classList.toggle('selected',btn===e));
   wrap.querySelector('.descriptor').textContent=items.find(i=>i.id===itemId)?.descriptors?.[value]||'';
  });
  document.querySelector('#obs').onchange=e=>store.setObservation(studentId,term,e.target.value);
  document.querySelector('#word').onclick=()=>generateWord(c,g,s,term);
 }
 draw()
}
render();

// Registra el Service Worker perquè AvaluApp es pugui instal·lar com una aplicació d'escriptori.
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));}
