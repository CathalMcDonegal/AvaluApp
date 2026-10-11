(() => {
  const STORE_KEY='avaluapp-data-v1';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}};
  const label=v=>({AE:'Assoliment excel·lent',AN:'Assoliment notable',AS:'Assoliment satisfactori',NA:'No assoliment'}[String(v||'').toUpperCase()]||'');
  const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const safe=v=>String(v||'alumne').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_');
  function find(){
    const data=read(), title=document.querySelector('.student-head h1')?.textContent?.trim()||'';
    const target=norm(title);
    for(const c of data.courses||[]) for(const g of c.groups||[]) for(const s of g.students||[]){
      const name=norm(`${s.firstName||''} ${s.lastName||''}`);
      if(name===target || (target && name.includes(target)) || (target.includes(name)&&name)) return {c,g,s};
    }
    return null;
  }
  function rows(c,s,term){
    const rubric=c?.rubric?.[term];
    const items=rubric?.items||[];
    const vals=s.assessments?.[term]||{};
    return items.map(i=>{const value=String(vals[i.id]?.value||'').toUpperCase();return {category:i.category||'',name:i.name||'',value,descriptor:i.descriptors?.[value]||label(value)}});
  }
  function addButton(){
    if(document.querySelector('#enhanced-word')) return;
    const host=document.querySelector('.student-profile-summary')||document.querySelector('.assessment');
    if(!host)return;
    const b=document.createElement('button');
    b.type='button';b.id='enhanced-word';b.className='primary enhanced-word';b.textContent='📄 Generar informe Word complet';
    b.addEventListener('click',generate);
    host.appendChild(b);
  }
  async function generate(){
    const found=find();
    if(!found){alert('No he pogut identificar l’alumne actual.');return}
    if(!window.docx){alert('No s’ha pogut carregar el generador Word.');return}
    const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle}=window.docx;
    const {c,g,s}=found;
    const name=`${s.firstName||''} ${s.lastName||''}`.trim();
    const cell=(text,bold=false)=>new TableCell({children:[new Paragraph({children:[new TextRun({text:String(text||'—'),bold,size:19})]})]});
    const heading=(text)=>new Paragraph({spacing:{before:220,after:100},children:[new TextRun({text,bold:true,size:25})]});
    const p=(text,bold=false)=>new Paragraph({spacing:{after:80},children:[new TextRun({text:String(text||'—'),bold,size:20})]});
    const section=[];
    section.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:'AvaluApp',bold:true,size:38})]}));
    section.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:220},children:[new TextRun({text:'INFORME D’AVALUACIÓ',bold:true,size:27})]}));
    section.push(p(`Alumne: ${name}`,true));
    section.push(p(`Curs: ${c.name||'—'}    Classe: ${g.name||'—'}`));
    section.push(p(`Curs acadèmic: ${c.year||'—'}`));
    section.push(heading('Resum de l’avaluació'));
    const f1=s.finalGrades?.[1]||'—',f2=s.finalGrades?.[2]||'—';
    section.push(p(`1a Avaluació: ${f1}${label(f1)?' — '+label(f1):''}`));
    section.push(p(`2a Avaluació: ${f2}${label(f2)?' — '+label(f2):''}`));
    section.push(p(`AA/PI 1a: ${s.aaPi?.[1]||'—'}    AA/PI 2a: ${s.aaPi?.[2]||'—'}`));
    for(const term of [1,2]){
      const rr=rows(c,s,term);
      section.push(heading(`${term===1?'1a':'2a'} Avaluació`));
      if(rr.length){
        const trs=[new TableRow({children:[cell('Àmbit',true),cell('Criteri',true),cell('Resultat',true),cell('Descripció',true)]})];
        rr.forEach(x=>trs.push(new TableRow({children:[cell(x.category),cell(x.name),cell(x.value||'—'),cell(x.descriptor||'—')]})));
        section.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:trs,borders:{insideHorizontal:{style:BorderStyle.SINGLE,size:4,color:'B8C0CC'},insideVertical:{style:BorderStyle.SINGLE,size:4,color:'B8C0CC'},top:{style:BorderStyle.SINGLE,size:4,color:'B8C0CC'},bottom:{style:BorderStyle.SINGLE,size:4,color:'B8C0CC'},left:{style:BorderStyle.SINGLE,size:4,color:'B8C0CC'},right:{style:BorderStyle.SINGLE,size:4,color:'B8C0CC'}}}));
      }else section.push(p('No hi ha dades de gradació registrades.'));
      section.push(heading('Observacions'));
      section.push(p(s.observations?.[term]||'Sense observacions.'));
    }
    section.push(heading('Evolució'));
    section.push(p(f1!=='—'&&f2!=='—'?`${label(f1)||f1} → ${label(f2)||f2}`:'Encara no hi ha prou dades per mostrar l’evolució.'));
    section.push(new Paragraph({spacing:{before:350},children:[new TextRun({text:'Informe generat amb AvaluApp',italics:true,size:17})]}));
    const doc=new Document({sections:[{properties:{page:{margin:{top:900,right:800,bottom:900,left:800}}},children:section}]});
    const blob=await Packer.toBlob(doc);
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`AvaluApp_Informe_${safe(name)}.docx`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200);
  }
  const observe=()=>{addButton();};
  new MutationObserver(observe).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('DOMContentLoaded',observe);
})();
