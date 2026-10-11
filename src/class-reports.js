(() => {
  const STORE_KEY='avaluapp-data-v1';
  let host=null;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}};
  const save=d=>localStorage.setItem(STORE_KEY,JSON.stringify(d));
  const safe=v=>String(v||'alumne').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_');
  const findGroup=()=>{
    const d=read(), names=[...document.querySelectorAll('.student-row')].map(x=>x.textContent.replace(/🗑/g,'').trim().toLowerCase()).filter(Boolean);
    for(const c of d.courses||[]) for(const g of c.groups||[]){
      const gn=(g.students||[]).map(s=>`${s.firstName||''} ${s.lastName||''}`.trim().toLowerCase());
      if(names.length&&gn.some(n=>names.includes(n))) return {c,g};
    }
    return null;
  };
  const gradeLabel=v=>({AE:'Assoliment excel·lent',AN:'Assoliment notable',AS:'Assoliment satisfactori',NA:'No assoliment'})[String(v||'').toUpperCase()]||v||'—';
  const loadJsZip=async()=>{
    if(window.JSZip)return window.JSZip;
    await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
    if(!window.JSZip)throw new Error('JSZip no disponible');
    return window.JSZip;
  };
  const report=async(c,g,s,term)=>{
    if(!window.docx)throw new Error('Generador Word no disponible');
    const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType}=window.docx;
    const rubric=c.rubric?.[term];
    const items=rubric?.items||[];
    const vals=s.assessments?.[term]||{};
    const cell=(text,bold=false)=>new TableCell({children:[new Paragraph({children:[new TextRun({text:String(text||'—'),bold})]})]});
    const rows=[new TableRow({children:[cell('Criteri',true),cell('Resultat',true),cell('Descripció',true)]})];
    items.forEach(i=>{const v=String(vals[i.id]?.value||'').toUpperCase();rows.push(new TableRow({children:[cell(i.name),cell(v||'—'),cell(i.descriptors?.[v]||gradeLabel(v))]}))});
    const termName=term===1?'1a Avaluació':'2a Avaluació';
    const children=[
      new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'AvaluApp',bold:true,size:34})]}),
      new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'INFORME D’AVALUACIÓ',bold:true,size:24})]}),
      new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:termName,size:20})]}),
      new Paragraph({text:''}),
      new Paragraph({children:[new TextRun({text:'Alumne: ',bold:true}),new TextRun({text:`${s.firstName||''} ${s.lastName||''}`.trim()})]}),
      new Paragraph({children:[new TextRun({text:'Curs: ',bold:true}),new TextRun({text:c.name||''}),new TextRun({text:'    Classe: ',bold:true}),new TextRun({text:g.name||''})]}),
      new Paragraph({children:[new TextRun({text:'Curs acadèmic: ',bold:true}),new TextRun({text:c.year||''})]}),
      new Paragraph({children:[new TextRun({text:'AA/PI: ',bold:true}),new TextRun({text:s.aaPi?.[term]||'—'}),new TextRun({text:'    RESULTAT FINAL: ',bold:true}),new TextRun({text:s.finalGrades?.[term]||'—'})]}),
      new Paragraph({text:''}),
      new Table({width:{size:100,type:WidthType.PERCENTAGE},rows}),
      new Paragraph({text:''}),
      new Paragraph({children:[new TextRun({text:'Observacions',bold:true})]}),
      new Paragraph({text:s.observations?.[term]||'—'})
    ];
    const doc=new Document({sections:[{properties:{page:{margin:{top:1080,right:900,bottom:1080,left:900}}},children} ]});
    return Packer.toBlob(doc);
  };
  const add=()=>{
    const dash=document.querySelector('.class-dashboard');
    if(!dash||dash.querySelector('.class-reports-card'))return;
    const info=findGroup(); if(!info)return;
    const {c,g}=info;
    const card=document.createElement('button');
    card.className='dashboard-card class-reports-card';
    card.innerHTML='<span class="dashboard-icon">📄</span><span><strong>Informes</strong><small>Informes individuals o de tota la classe</small></span><b>→</b>';
    dash.querySelector('.dashboard-grid').appendChild(card);
    const obs=document.createElement('button');
    obs.className='dashboard-card class-observations-card';
    obs.innerHTML='<span class="dashboard-icon">📝</span><span><strong>Observacions</strong><small>Escriu i revisa observacions de l’alumnat</small></span><b>→</b>';
    dash.querySelector('.dashboard-grid').appendChild(obs);
    const panel=()=>{
      const old=document.querySelector('.class-tools-panel');if(old){old.remove();return}
      const p=document.createElement('section');p.className='class-tools-panel';
      p.innerHTML=`<div class="tools-head"><div><p class="eyebrow">${esc(g.name)}</p><h2>Observacions de la classe</h2><p class="muted">Les dades es desen automàticament.</p></div><button class="secondary close-tools">Tancar</button></div><div class="obs-grid">${(g.students||[]).map(s=>`<article class="obs-student"><strong>${esc(`${s.firstName||''} ${s.lastName||''}`.trim())}</strong><label>1a Avaluació<textarea data-id="${s.id}" data-term="1" placeholder="Observacions de la 1a avaluació...">${esc(s.observations?.[1]||'')}</textarea></label><label>2a Avaluació<textarea data-id="${s.id}" data-term="2" placeholder="Observacions de la 2a avaluació...">${esc(s.observations?.[2]||'')}</textarea></label></article>`).join('')}</div>`;
      dash.after(p);
      p.querySelector('.close-tools').onclick=()=>p.remove();
      p.querySelectorAll('textarea').forEach(t=>t.addEventListener('input',()=>{const d=read();for(const cc of d.courses||[])for(const gg of cc.groups||[])for(const s of gg.students||[])if(s.id===t.dataset.id){s.observations=s.observations||{};s.observations[t.dataset.term]=t.value;save(d);return}}));
      p.scrollIntoView({behavior:'smooth',block:'start'});
    };
    obs.onclick=panel;
    card.onclick=async()=>{
      const choice=prompt('Informes: escriu 1 per 1a Avaluació, 2 per 2a Avaluació o T per generar les dues.','T');
      if(!choice)return;const terms=choice.toUpperCase()==='T'?[1,2]:[Number(choice)];if(!terms.every(t=>t===1||t===2)){alert('Opció no vàlida.');return}
      try{
        const JSZipLib=await loadJsZip(),zip=new JSZipLib();let total=0;
        for(const s of g.students||[]) for(const term of terms){const blob=await report(c,g,s,term);zip.file(`${safe(s.firstName+' '+s.lastName)}_${term===1?'1a':'2a'}_AvaluApp.docx`,blob);total++}
        const out=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(out),a=document.createElement('a');a.href=url;a.download=`AvaluApp_${safe(c.name)}_${safe(g.name)}_informes.zip`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);alert(`${total} informes preparats.`);
      }catch(e){console.error(e);alert('No s’han pogut generar els informes. Revisa que el generador Word estigui carregat.')}
    };
  };
  new MutationObserver(add).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('DOMContentLoaded',add);
})();
