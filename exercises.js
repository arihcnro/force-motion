'use strict';
const setNumber=Number(document.querySelector('main').dataset.set);
const questions=window.EXERCISES.slice((setNumber-1)*10,setNumber*10);
const form=document.getElementById('exerciseForm'), container=document.getElementById('questions');
const result=document.getElementById('result'), progress=document.getElementById('progress');
const letters=['ก','ข','ค','ง'];
function el(tag,text,className){const n=document.createElement(tag);if(text)n.textContent=text;if(className)n.className=className;return n;}
questions.forEach((q,i)=>{
 const field=el('fieldset');field.id='question-'+q.id;
 field.append(el('legend',`ข้อ ${i+1}`));
 if(q.context)field.append(el('p',q.context,'context'));
 field.append(el('p',q.stem,'question-text'));
 q.images.forEach(src=>{const img=el('img');img.src='assets/exercises/'+src;img.alt='ภาพประกอบโจทย์ข้อ '+q.id;img.className='exercise-image';field.append(img);});
 q.choices.forEach((text,j)=>{const label=el('label'),input=el('input');input.type='radio';input.name='q'+q.id;input.value=String(j);input.required=true;label.append(input,el('span',letters[j]+'. '+text));field.append(label);});
 const feedback=el('div',null,'feedback');feedback.id='feedback-'+q.id;feedback.hidden=true;field.append(feedback);container.append(field);
});
function clearFeedback(){result.textContent='';questions.forEach(q=>document.getElementById('feedback-'+q.id).hidden=true);}
function answered(){return questions.filter(q=>form.querySelector(`input[name="q${q.id}"]:checked`)).length;}
form.addEventListener('change',()=>{clearFeedback();progress.textContent=`ตอบแล้ว ${answered()} จาก 10 ข้อ`;});
form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;
 let score=0;
 questions.forEach(q=>{
  const choice=Number(form.querySelector(`input[name="q${q.id}"]:checked`).value),ok=choice===q.answer;
  if(ok)score++;
  const feedback=document.getElementById('feedback-'+q.id);feedback.hidden=false;feedback.className='feedback '+(ok?'correct':'incorrect');feedback.replaceChildren(el('strong',ok?'ตอบถูก':'ยังไม่ถูกต้อง'),el('p','คำตอบที่ถูกต้อง: '+letters[q.answer]+'. '+q.choices[q.answer]),el('p',q.explanation));
 });
 result.textContent=`ชุดที่ ${setNumber}: ได้ ${score} / 10 คะแนน (${score*10}%) — อ่านคำอธิบายใต้แต่ละข้อเพื่อทบทวน`;result.focus();
});
form.addEventListener('reset',()=>{clearFeedback();progress.textContent='ตอบแล้ว 0 จาก 10 ข้อ';});
