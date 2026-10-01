import { store } from './store.js';
const app=document.querySelector('#app');
const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const safeFile=(v)=>String(v||'alumne').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_');

function reportData(c,g,s,term){
 const global=term==='G',items=store.getItems(), vals=global?s.global:(s.assessments[term]||{});
 const termNames={1:'1r trimestre',2:'2n trimestre',3:'3r trimestre'};
 const rows=items.map(i=>({code:i.code,name:i.name,value:vals[i.id]?.value||''}));
 return {global,items,vals,rows,termName:global?'Avaluació global':termNames[term],studentName:(s.firstName+' '+s.lastName).trim(),course:c.name,group:g.name,year:c.year,observations:s.observations[global?'G':term]||''};
}
function downloadDoc(buffer,name){
 const blob=new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function generateWord(c,g,s,term){
 if(!window.docx){alert('No s’ha pogut carregar el generador Word.');return}
 const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,ShadingType}=window.docx;
 const d=reportData(c,g,s,term);
 const cell=(text,bold=false)=>new TableCell({children:[new Paragraph({children:[new TextRun({text:String(text||'—'),bold})]})]});
 const rows=[];
 if(d.global){
   rows.push(new TableRow({children:[cell('Ítem',true),cell('1r trimestre',true),cell('2n trimestre',true),cell('3r trimestre',true)]}));
   d.items.forEach(i=>rows.push(new TableRow({children:[cell(i.name),cell(s.assessments[1]?.[i.id]?.value),cell(s.assessments[2]?.[i.id]?.value),cell(s.assessments[3]?.[i.id]?.value)]})));
 } else {
   rows.push(new TableRow({children:[cell('Codi',true),cell('Ítem d’avaluació',true),cell('Valoració',true)]}));
   d.rows.forEach(i=>rows.push(new TableRow({children:[cell(i.code),cell(i.name),cell(i.value)]})));
 }
 const doc=new Document({sections:[{properties:{page:{margin:{top:1080,right:900,bottom:1080,left:900}}},children:[
   new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'AvaluApp',bold:true,size:34})]}),
   new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:d.termName,size:22})]}),
   new Paragraph({text:''}),
   new Paragraph({children:[new TextRun({text:'Alumne: ',bold:true}),new TextRun({text:d.studentName})]}),
   new Paragraph({children:[new TextRun({text:'Curs: ',bold:true}),new TextRun({text:d.course}),new TextRun({text:'    Classe: ',bold:true}),new TextRun({text:d.group})]}),
   new Paragraph({children:[new TextRun({text:'Curs acadèmic: ',bold:true}),new TextRun({text:d.year})]}),
   new Paragraph({text:''}),
   new Table({width:{size:100,type:WidthType.PERCENTAGE},rows}),
   new Paragraph({text:''}),
   new Paragraph({children:[new TextRun({text:d.global?'Valoració final':'Observacions',bold:true})]}),
   new Paragraph({text:d.observations||'—'})
 ]}]});
 const buffer=await Packer.toBlob(doc);
 downloadDoc(buffer,'AvaluApp_'+safeFile(d.studentName)+'_'+safeFile(d.termName)+'.docx');
}
function render(){const courses=store.getCourses();app.innerHTML=`<header class="topbar"><div class="brand"><span class="brand-mark">A</span>AvaluApp</div></header><main class="container"><section class="hero"><div><p class="eyebrow">GESTIÓ EDUCATIVA</p><h1>Els meus cursos</h1><p class="muted">Organitza cursos, classes i alumnes.</p></div><div class="hero-actions"><button class="secondary" id="demo">Carregar mostra (25)</button><button class="primary" id="new">+ Crear curs</button></div></section><section class="stats"><div class="stat"><strong>${courses.length}</strong><span>Cursos</span></div><div class="stat"><strong>${courses.reduce((n,c)=>n+c.groups.length,0)}</strong><span>Classes</span></div><div class="stat"><strong>${courses.reduce((n,c)=>n+c.groups.reduce((m,g)=>m+g.students.length,0),0)}</strong><span>Alumnes</span></div></section><section class="course-grid">${courses.map(c=>`<article class="card course-card" data-id="${c.id}"><div class="card-icon">📚</div><div class="course-main"><h2>${esc(c.name)}</h2><p>${esc(c.year)} · ${c.groups.length} classes</p></div><span>→</span></article>`).join('')||'<div class="empty"><h2>Comencem?</h2><p>Crea el teu primer curs.</p></div>'}</section></main>`;document.querySelector('#new').onclick=createCourse;document.querySelector('#demo').onclick=()=>{const c=store.seedDemo();if(c){course(c.id)}else{alert('La mostra ja està carregada.')}};document.querySelectorAll('.course-card').forEach(x=>x.onclick=()=>course(x.dataset.id))}
function createCourse(){const name=prompt('Nom del curs');if(!name?.trim())return;const year=prompt('Curs acadèmic','2026-2027')||'2026-2027';const c=store.addCourse({name:name.trim(),year});course(c.id)}
function course(id){const c=store.getCourses().find(x=>x.id===id);app.innerHTML=`<header class="topbar"><button class="back" id="back">←</button><div class="brand"><span class="brand-mark">A</span>${esc(c.name)}</div></header><main class="container"><section class="hero"><div><p class="eyebrow">${esc(c.year)}</p><h1>Classes</h1></div><button class="primary" id="newgroup">+ Crear classe</button></section><section class="group-grid">${c.groups.map(g=>`<article class="card group-card"><div class="group-badge">${esc(g.name[0])}</div><div><h2>${esc(g.name)}</h2><p>${g.students.length} alumnes</p></div><button class="secondary add" data-id="${g.id}">+ Alumne</button><button class="secondary open" data-id="${g.id}">Obrir →</button></article>`).join('')||'<div class="empty"><h2>Encara no hi ha classes</h2></div>'}</section></main>`;document.querySelector('#back').onclick=render;document.querySelector('#newgroup').onclick=()=>{const n=prompt('Nom de la classe');if(n?.trim()){store.addGroup(id,{name:n.trim()});course(id)}};document.querySelectorAll('.add').forEach(b=>b.onclick=()=>addStudent(id,b.dataset.id));document.querySelectorAll('.open').forEach(b=>b.onclick=()=>group(id,b.dataset.id))}
function normalizeHeader(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
function parseExcelRows(rows){
 if(!rows.length)return [];
 const headers=rows[0].map(normalizeHeader);
 const find=(names)=>{const i=headers.findIndex(h=>names.includes(h));return i};
 const first=find(['nom','nombre','name','first name','firstname']);
 const last=find(['cognoms','apellidos','surname','last name','lastname']);
 const full=find(['nom i cognoms','nombre y apellidos','alumne','alumno','student','nom complet']);
 const number=find(['numero','numero alumne','num alumne','n alumne','student number','id']);
 return rows.slice(1).map(r=>{
   let firstName='',lastName='';
   if(first>=0) firstName=String(r[first]??'').trim();
   if(last>=0) lastName=String(r[last]??'').trim();
   if(!firstName&&!lastName&&full>=0){
     const fullName=String(r[full]??'').trim(), parts=fullName.split(/\\s+/);
     if(parts.length>1){firstName=parts.shift();lastName=parts.join(' ')}else firstName=fullName;
   }
   return {firstName,lastName,studentNumber:number>=0?String(r[number]??'').trim():''};
 }).filter(x=>(x.firstName+' '+x.lastName).trim());
}
function importExcel(courseId,groupId){
 const input=document.createElement('input');input.type='file';input.accept='.xlsx,.xls,.csv';
 input.onchange=async()=>{
  const file=input.files?.[0];if(!file)return;
  try{
   const data=await file.arrayBuffer(),wb=XLSX.read(data,{type:'array'}),sheet=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:''}),students=parseExcelRows(rows);
   if(!students.length){alert('No he trobat alumnes. Revisa que la primera fila tingui columnes com Nom i Cognoms.');return}
   const preview=students.slice(0,80).map((s,i)=>'<tr><td>'+((i+1))+'</td><td>'+esc(s.firstName)+'</td><td>'+esc(s.lastName)+'</td><td>'+esc(s.studentNumber)+'</td></tr>').join('');
   const more=students.length>80?'... i '+(students.length-80)+' més':'';
   app.innerHTML='<header class="topbar"><button class="back" id="cancel-import">←</button><div class="brand">Importar alumnes</div></header><main class="container"><section class="hero"><div><p class="eyebrow">PREVISUALITZACIÓ</p><h1>'+esc(file.name)+'</h1><p class="muted">'+students.length+' alumnes detectats. Revisa abans d’importar.</p></div><button class="primary" id="confirm-import">Importar alumnes</button></section><section class="card import-preview"><div class="item-table"><table><thead><tr><th>#</th><th>Nom</th><th>Cognoms</th><th>Número</th></tr></thead><tbody>'+preview+'</tbody></table></div><p class="muted">'+more+'</p></section></main>';
   document.querySelector('#cancel-import').onclick=()=>group(courseId,groupId);
   document.querySelector('#confirm-import').onclick=()=>{const result=store.importStudents(groupId,students);alert('Importació completada: '+result.added+' alumnes afegits'+(result.duplicates?' i '+result.duplicates+' duplicats ignorats.':'.'));group(courseId,groupId)};
  }catch(e){alert('No s’ha pogut llegir el fitxer.');console.error(e)}
 };
 input.click();
}
function addStudent(courseId,groupId){const first=prompt('Nom de l’alumne');if(!first?.trim())return;store.addStudent(groupId,{firstName:first.trim(),lastName:prompt('Cognoms')||''});course(courseId)}
function group(courseId,groupId){const c=store.getCourses().find(x=>x.id===courseId),g=c.groups.find(x=>x.id===groupId);app.innerHTML=`<header class="topbar"><button class="back" id="back">←</button><div class="brand">${esc(c.name)} · ${esc(g.name)}</div></header><main class="container"><section class="hero"><div><p class="eyebrow">CLASSE</p><h1>${esc(g.name)}</h1><p class="muted">${g.students.length} alumnes</p></div><div class="hero-actions"><button class="primary" id="add">+ Afegir alumne</button><button class="secondary" id="import">Importar Excel</button></div></section><section class="student-list">${g.students.map(s=>`<article class="card student-row" data-id="${s.id}"><div class="avatar">${esc(s.firstName[0])}</div><div><h2>${esc(s.firstName+' '+s.lastName)}</h2><p>Obrir fitxa d’avaluació</p></div><span>→</span></article>`).join('')||'<div class="empty"><p>No hi ha alumnes.</p></div>'}</section></main>`;document.querySelector('#back').onclick=()=>course(courseId);document.querySelector('#add').onclick=()=>addStudent(courseId,groupId);document.querySelector('#import').onclick=()=>importExcel(courseId,groupId);document.querySelectorAll('.student-row').forEach(x=>x.onclick=()=>student(courseId,groupId,x.dataset.id))}
function student(courseId,groupId,studentId){const c=store.getCourses().find(x=>x.id===courseId),g=c.groups.find(x=>x.id===groupId),s=g.students.find(x=>x.id===studentId);let term='1';const tabs={1:'1r trimestre',2:'2n trimestre',3:'3r trimestre',G:'Avaluació global'};function draw(){const global=term==='G',items=store.getItems(),vals=global?s.global:(s.assessments[term]||{});app.innerHTML=`<header class="topbar"><button class="back" id="back">←</button><div class="brand">${esc(s.firstName+' '+s.lastName)}</div></header><main class="container"><section class="student-head"><div class="avatar large">${esc(s.firstName[0])}</div><div><p class="eyebrow">${esc(g.name)} · ${esc(c.name)}</p><h1>${esc(s.firstName+' '+s.lastName)}</h1><p class="muted">Fitxa d’avaluació</p></div></section><nav class="tabs">${Object.entries(tabs).map(([k,v])=>`<button class="${term===k?'active':''}" data-term="${k}">${v}</button>`).join('')}</nav><section class="card assessment"><div class="assessment-title"><h2>${global?'Valoració global':tabs[term]}</h2><button class="secondary" id="word">Generar Word</button></div>${global?`<div class="summary-grid">${[1,2,3].map(t=>`<div class="summary-term"><strong>${t}r trimestre</strong><span>${Object.keys(s.assessments[t]||{}).length} ítems registrats</span></div>`).join('')}</div>`:''}<div class="item-table"><div class="item-head"><span>Ítem</span><span>Nota / valoració</span></div>${items.map(i=>`<div class="item-row"><div><strong>${esc(i.code)}</strong><span>${esc(i.name)}</span></div><input class="mark" data-item="${i.id}" value="${esc(vals[i.id]?.value||'')}" placeholder="—"></div>`).join('')}</div><label class="obs"><span>${global?'Valoració final':'Observacions'}</span><textarea id="obs">${esc(s.observations[global?'G':term]||'')}</textarea></label></section></main>`;document.querySelector('#back').onclick=()=>group(courseId,groupId);document.querySelectorAll('[data-term]').forEach(b=>b.onclick=()=>{term=b.dataset.term;draw()});document.querySelectorAll('.mark').forEach(e=>e.onchange=()=>global?store.setGlobal(studentId,e.dataset.item,e.value):store.setAssessment(studentId,term,e.dataset.item,e.value));document.querySelector('#obs').onchange=e=>store.setObservation(studentId,global?'G':term,e.target.value);document.querySelector('#word').onclick=()=>generateWord(c,g,s,term)}draw()}
render();