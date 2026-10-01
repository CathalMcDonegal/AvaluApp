const KEY = 'avaluapp-data-v1';

const empty = { courses: [] };

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(empty); }
  catch { return structuredClone(empty); }
}
function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

export const store = {
  getCourses() { return load().courses; },
  addCourse(input) {
    const data=load();
    const course={id:crypto.randomUUID(),name:input.name,year:input.year,groups:[],createdAt:new Date().toISOString()};
    data.courses.push(course); save(data); return course;
  },
  addGroup(courseId,input) {
    const data=load(); const c=data.courses.find(x=>x.id===courseId); if(!c) return;
    const group={id:crypto.randomUUID(),name:input.name,students:[]};
    c.groups.push(group); save(data); return group;
  },
  addStudent(groupId,input) {
    const data=load();
    const g=data.courses.flatMap(c=>c.groups).find(x=>x.id===groupId); if(!g) return;
    const student={id:crypto.randomUUID(),firstName:input.firstName,lastName:input.lastName,assessments:{},createdAt:new Date().toISOString()};
    g.students.push(student); save(data); return student;
  }
};