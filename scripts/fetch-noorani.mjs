import https from 'https';

async function fetchHome() {
  const res = await fetch('https://raw.githubusercontent.com/nooresahar/noorani/master/home.html');
  const text = await res.text();
  const scripts = text.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi);
  console.log('Scripts:', scripts);
  const links = text.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi);
  console.log('Links:', links);
}
fetchHome();
