const KEY='avaluapp-data-v1';
const DEFAULT_ITEMS=[
{id:'participacio',code:'PT',name:'Participació',active:true},
{id:'treball',code:'TR',name:'Treball',active:true},
{id:'actitud',code:'AC',name:'Actitud',active:true},
{id:'comprensio',code:'CO',name:'Comprensió',active:true},
{id:'progress',code:'PR',name:'Progrés',active:true}];
const empty={courses:[],items:DEFAULT_ITEMS};
function load(){try{const d=JSON.parse(localStorage.getItem(KEY))||structuredClone(empty);d.items=d.items||structuredClone(DEFAULT_ITEMS);return d}catch{return structuredClone(empty)}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
export const store={
getCourses(){return load().courses},
getItems(){return load().items.filter(i=>i.active)},
getAllItems(){return load().items},
seedDemo(){const d=load();if(d.courses.some(c=>c.name==='Curs de prova AvaluApp'))return null;const c={id:crypto.randomUUID(),name:'Curs de prova AvaluApp',year:'2026-2027',groups:[],createdAt:new Date().toISOString()};const g={id:crypto.randomUUID(),name:'5A',students:[]};const names=[['Jana','Puig Ferrer'],['Marc','Soler Vidal'],['Laia','Roca Martí'],['Pol','Serra Casas'],['Aina','Pons Navarro'],['Biel','Costa Prat'],['Júlia','Font Rovira'],['Arnau','Vila Bosch'],['Carla','Mas Gómez'],['Nil','Torres Sala'],['Emma','Vidal Serra'],['Pau','Martí Soler'],['Ona','Ferrer Costa'],['Jan','Navarro Puig'],['Martina','Casas Rius'],['Eric','Bosch Pujol'],['Abril','Rovira Font'],['Gerard','Prat Vila'],['Clàudia','Sala Pons'],['Èric','Rius Mas'],['Nora','Gómez Torres'],['Adrià','Pujol Vidal'],['Bruna','Ferrer Martí'],['Roger','Soler Roca'],['Ivet','Costa Serra']];const items=d.items.filter(i=>i.active);names.forEach(([first,last],idx)=>{const s={id:crypto.randomUUID(),firstName:first,lastName:last,studentNumber:String(idx+1),assessments:{},global:{},observations:{},createdAt:new Date().toISOString()};[1,2].forEach(t=>{s.assessments[t]={};items.forEach((it,j)=>{const values=['Excel·lent','Notable','Assoliment satisfactori','En procés'];s.assessments[t][it.id]={value:values[(idx+j+t)%values.length]}});s.observations[t]=['Participa activament i manté una bona actitud.','Evoluciona positivament i treballa amb constància.','Cal reforçar alguns aspectes, però mostra bona progressió.'][idx%3]});g.students.push(s)});c.groups.push(g);d.courses.push(c);save(d);return c},
addCourse(input){const d=load(),c={id:crypto.randomUUID(),name:input.name,year:input.year,groups:[],createdAt:new Date().toISOString()};d.courses.push(c);save(d);return c},
addGroup(courseId,input){const d=load(),c=d.courses.find(x=>x.id===courseId);if(!c)return;const g={id:crypto.randomUUID(),name:input.name,students:[]};c.groups.push(g);save(d);return g},
deleteGroup(courseId,groupId){const d=load(),c=d.courses.find(x=>x.id===courseId);if(!c)return false;c.groups=c.groups.filter(g=>g.id!==groupId);save(d);return true},
addStudent(groupId,input){const d=load(),g=d.courses.flatMap(c=>c.groups).find(x=>x.id===groupId);if(!g)return;const s={id:crypto.randomUUID(),firstName:input.firstName,lastName:input.lastName,assessments:{},global:{},observations:{},createdAt:new Date().toISOString()};g.students.push(s);save(d);return s},
deleteStudent(groupId,studentId){const d=load(),g=d.courses.flatMap(c=>c.groups).find(x=>x.id===groupId);if(!g)return false;g.students=g.students.filter(s=>s.id!==studentId);save(d);return true},
setAssessment(studentId,term,itemId,value){const d=load(),s=d.courses.flatMap(c=>c.groups.flatMap(g=>g.students)).find(x=>x.id===studentId);if(!s)return;s.assessments[term]=s.assessments[term]||{};s.assessments[term][itemId]={value};save(d)},
setGlobal(studentId,itemId,value){const d=load(),s=d.courses.flatMap(c=>c.groups.flatMap(g=>g.students)).find(x=>x.id===studentId);if(!s)return;s.global[itemId]={value};save(d)},
setObservation(studentId,term,text){const d=load(),s=d.courses.flatMap(c=>c.groups.flatMap(g=>g.students)).find(x=>x.id===studentId);if(!s)return;s.observations[term]=text;save(d)},
importStudents(groupId,students){const d=load(),g=d.courses.flatMap(c=>c.groups).find(x=>x.id===groupId);if(!g)return {added:0,duplicates:0};let added=0,duplicates=0;for(const input of students){const firstName=String(input.firstName||'').trim(),lastName=String(input.lastName||'').trim();if(!firstName&&!lastName)continue;const key=(firstName+' '+lastName).trim().toLocaleLowerCase();if(g.students.some(s=>(s.firstName+' '+s.lastName).trim().toLocaleLowerCase()===key)){duplicates++;continue}g.students.push({id:crypto.randomUUID(),firstName,lastName,studentNumber:String(input.studentNumber||'').trim(),assessments:{},global:{},observations:{},createdAt:new Date().toISOString()});added++}save(d);return {added,duplicates}}
};