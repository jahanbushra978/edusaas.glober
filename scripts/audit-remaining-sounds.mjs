import fs from 'fs';
import https from 'https';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/GEMINI_API_KEY\s*=\s*([^\s\r\n]+)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
  console.error("No GEMINI_API_KEY found!");
  process.exit(1);
}

async function checkSound(name, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`${name}: HTTP ${res.status}`);
      return;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const base64Audio = buf.toString("base64");

    const requestBody = JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "audio/mp4",
                data: base64Audio
              }
            },
            {
              text: "Identify the exact Arabic letter and Harakat (Fatha, Kasrah, Dammah, Sukoon, etc.) being recited in this audio clip. State the Arabic letter name, the Harakah, and the phonetic sound (e.g., 'Seen with Kasrah -> si' or 'Zay with Fatha -> za'). Be concise."
            }
          ]
        }
      ]
    });

    const result = await new Promise((resolve, reject) => {
      const req = https.request(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
          }
        },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.candidates && parsed.candidates[0]?.content?.parts?.[0]?.text) {
                resolve(parsed.candidates[0].content.parts[0].text.trim().replace(/\n/g, " "));
              } else if (parsed.error) {
                resolve(`API Error: ${parsed.error.message}`);
              } else {
                resolve(`Unknown response: ${data.substring(0, 100)}`);
              }
            } catch (e) {
              reject(e);
            }
          });
        }
      );
      req.on('error', reject);
      req.write(requestBody);
      req.end();
    });

    console.log(`${name}: ${result}`);
  } catch (err) {
    console.log(`${name}: error ${err.message}`);
  }
}

async function run() {
  const targets = [
    ...[27, 28, 29, 30, 31].map(i => ({ name: `Page8-${i}.m4a`, url: `https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page8-${i}.m4a` })),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => ({ name: `Page9-${i}.m4a`, url: `https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter04/Page9-${i}.m4a` }))
  ];

  for (const t of targets) {
    await checkSound(t.name, t.url);
    await new Promise(r => setTimeout(r, 2500)); // 2.5s delay to prevent 429
  }
}

run();
