async function inspectData() {
  for (const file of ['js/object_file.js', 'data/qaida_desc.js', 'json_file/convertcsv.json', 'js/mylogic.js']) {
    try {
      const res = await fetch('https://raw.githubusercontent.com/nooresahar/noorani/master/' + file);
      console.log(file, 'status:', res.status);
      if (res.status === 200) {
        const text = await res.text();
        console.log(file, 'length:', text.length, 'sample:', text.slice(0, 300));
        // Search for chapter04 or Page8 in text
        if (text.includes('Page8') || text.includes('chapter04')) {
          console.log(`>>> ${file} contains Page8 or chapter04!`);
          const matches = text.match(/Page8-[0-9]+/g);
          console.log('Matches:', matches ? matches.slice(0, 20) : 'none');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}
inspectData();
