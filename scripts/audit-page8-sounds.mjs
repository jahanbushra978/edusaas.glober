import fs from 'fs';
import https from 'https';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/GEMINI_API_KEY\s*=\s*([^\s\r\n]+)/);
const apiKey = match[1].trim();

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        fs.unlink(dest, () => resolve(false));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', () => resolve(false));
  });
}

async function transcribe(filename) {
  const audioData = fs.readFileSync(filename);
  const base64Audio = audioData.toString('base64');

  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: "Identify the exact Arabic letter and vowel (Fatha 'a', Kasra 'i', Damma 'u') spoken in this clip. Reply in ONE line: [Letter Name] [Vowel] -> [transliteration] (e.g. 'Seen Kasrah -> si')"
          },
          {
            inlineData: {
              mimeType: "audio/mp4",
              data: base64Audio
            }
          }
        ]
      }
    ]
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody
  });

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text || 'error';
}

async function main() {
  for (let i = 24; i <= 40; i++) {
    const fn = `Page8-${i}.m4a`;
    const url = `https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/${fn}`;
    const ok = await download(url, fn);
    if (!ok) {
      console.log(`${fn}: DOES NOT EXIST (404)`);
      continue;
    }
    const result = await transcribe(fn);
    console.log(`${fn}: ${result}`);
  }
}

main().catch(console.error);
