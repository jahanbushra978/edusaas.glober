import fs from 'fs';
import https from 'https';

// Read API key from .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/GEMINI_API_KEY\s*=\s*([^\s\r\n]+)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
  console.error("No GEMINI_API_KEY found!");
  process.exit(1);
}

async function transcribeAudio(filename) {
  const audioData = fs.readFileSync(filename);
  const base64Audio = audioData.toString('base64');

  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: "This is a short Quran/Noorani Qaida audio clip. Listen carefully and tell me: Exactly what Arabic letter and vowel (Harakah: Fatha 'sa', Kasra 'si', or Damma 'su') is pronounced? State the exact sound."
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
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log(`\n=== RESULT FOR ${filename} ===`);
  console.log(text || JSON.stringify(json));
}

async function main() {
  await transcribeAudio('Page8-31.m4a');
  await transcribeAudio('Page8-32.m4a');
  await transcribeAudio('Page8-33.m4a');
}

main().catch(console.error);
