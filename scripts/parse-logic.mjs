async function fetchLogic() {
  const res = await fetch('https://raw.githubusercontent.com/nooresahar/noorani/master/js/mylogic.js');
  const text = await res.text();
  const match = text.match(/var\s+lesson_obj\s*=\s*(\[[\s\S]*?\]);/);
  if (match) {
    const list = eval(match[1]);
    console.log(list.map(l => ({ num: l.lesson_num, name: l.lesson_name, urdu: l.urdu_text, descr: l.descr })));
  }
}
fetchLogic().catch(console.error);
