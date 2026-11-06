async function checkJsdelivr() {
  const res = await fetch("https://data.jsdelivr.com/v1/package/gh/nooresahar/noorani@master/flat");
  const data = await res.json();
  console.log("Files sample:", (data.files || []).slice(0, 20).map(f => f.name));
}
checkJsdelivr();
