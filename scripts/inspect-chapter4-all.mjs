async function inspectChapter4All() {
  const res = await fetch('https://raw.githubusercontent.com/nooresahar/noorani/master/data/qaida_desc.js');
  const text = await res.text();
  const fn = new Function(text + '\nreturn lesson_data;');
  const data = fn();
  const c04 = data[3]; // chapter 4
  console.log('Chapter 4 items count:', c04.length);
  for (let i = 0; i < c04.length; i++) {
    const it = c04[i];
    console.log(`[${i}] sound: ${it.sound}, img: ${it.image}`);
  }
}
inspectChapter4All().catch(console.error);
