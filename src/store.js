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
addCourse(input){const d=load(),c={id:crypto.randomUUID(),name:input.name,year:input.year,groups:[],createdAt:new Date().toISOString()};d.courses.push(c);save(d);return c},
addGroup(courseId,input){const d=load(),c=d.courses.find(x=>x.id===courseId);if(!c)return;const g={id:crypto.randomUUID(),name:input.name,students:[]};c.groups.push(g);save(d);return g},
addStudent(groupId,input){const d=load(),g=d.courses.flatMap(c=>c.groups).find(x=>x.id===groupId);if(!g)return;const s={id:crypto.randomUUID(),firstName:input.firstName,lastName:input.lastName,assessments:{},global:{},observations:{},createdAt:new Date().toISOString()};g.students.push(s);save(d);return s},
setAssessment(studentId,term,itemId,value){const d=load(),s=d.courses.flatMap(c=>c.groups.flatMap(g=>g.students)).find(x=>x.id===studentId);if(!s)return;s.assessments[term]=s.assessments[term]||{};s.assessments[term][itemId]={value};save(d)},
setGlobal(studentId,itemId,value){const d=load(),s=d.courses.flatMap(c=>c.groups.flatMap(g=>g.students)).find(x=>x.id===studentId);if(!s)return;s.global[itemId]={value};save(d)},
setObservation(studentId,term,text){const d=load(),s=d.courses.flatMap(c=>c.groups.flatMap(g=>g.students)).find(x=>x.id===studentId);if(!s)return;s.observations[term]=text;save(d)},
importStudents(groupId,students){const d=load(),g=d.courses.flatMap(c=>c.groups).find(x=>x.id===groupId);if(!g)return {added:0,duplicates:0};let added=0,duplicates=0;for(const input of students){const firstName=String(input.firstName||'').trim(),lastName=String(input.lastName||'').trim();if(!firstName&&!lastName)continue;const key=(firstName+' '+lastName).trim().toLocaleLowerCase();if(g.students.some(s=>(s.firstName+' '+s.lastName).trim().toLocaleLowerCase()===key)){duplicates++;continue}g.students.push({id:crypto.randomUUID(),firstName,lastName,studentNumber:String(input.studentNumber||'').trim(),assessments:{},global:{},observations:{},createdAt:new Date().toISOString()});added++}save(d);return {added,duplicates}}
};