async function getChapter04Details() {
  const res = await fetch('https://raw.githubusercontent.com/nooresahar/noorani/master/data/qaida_desc.js');
  const text = await res.text();
  
  const fn = new Function(text + '\nreturn lesson_data;');
  const data = fn();
  
  console.log('Total lessons:', data.length);
  
  for (let i = 0; i < data.length; i++) {
    const chapter = data[i];
    const c04 = chapter.filter(item => item.chapter_no === 'chapter04');
    if (c04.length > 0) {
      console.log(`Chapter index ${i} has ${c04.length} chapter04 items!`);
      // Print all items with Page8 in sound
      const page8Items = c04.filter(item => item.sound && item.sound.includes('Page8'));
      console.log('Page8 items:');
      for (const it of page8Items) {
        console.log(`id: ${it.id}, sound: ${it.sound}, text: "${it.text}", image: "${it.image}"`);
      }
    }
  }
}
getChapter04Details().catch(console.error);
