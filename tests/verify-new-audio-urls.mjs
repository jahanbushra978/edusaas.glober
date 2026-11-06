const testMap = {
  // Alif Madda Combinations
  "بَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-26.m4a",
  "تَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter08/Page13-29.m4a",
  "ثَا": "https://audio.qurancdn.com/wbw/002_039_006.mp3",
  "جَا": "https://audio.qurancdn.com/wbw/110_001_002.mp3",
  "حَا": "https://audio.qurancdn.com/wbw/002_238_001.mp3",
  "خَا": "https://audio.qurancdn.com/wbw/002_038_012.mp3",
  "دَا": "https://audio.qurancdn.com/wbw/002_251_008.mp3",
  "ذَا": "https://audio.qurancdn.com/wbw/002_026_015.mp3",
  "رَا": "https://audio.qurancdn.com/wbw/012_028_002.mp3",
  "زَا": "https://audio.qurancdn.com/wbw/002_010_005.mp3",
  "سَا": "https://audio.qurancdn.com/wbw/002_096_010.mp3",
  "شَا": "https://audio.qurancdn.com/wbw/002_020_021.mp3",
  "صَا": "https://audio.qurancdn.com/wbw/002_177_024.mp3",
  "ضَا": "https://audio.qurancdn.com/wbw/002_017_010.mp3",
  "طَا": "https://audio.qurancdn.com/wbw/002_256_007.mp3",
  "ظَا": "https://audio.qurancdn.com/wbw/002_246_036.mp3",
  "عَا": "https://audio.qurancdn.com/wbw/002_173_008.mp3",
  "غَا": "https://audio.qurancdn.com/wbw/113_003_003.mp3", // غَاسِقٍ
  "فَا": "https://audio.qurancdn.com/wbw/002_024_001.mp3",
  "قَا": "https://audio.qurancdn.com/wbw/002_030_006.mp3",
  "كَا": "https://audio.qurancdn.com/wbw/002_034_009.mp3",
  "لَا": "https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter07/Page12-29.m4a",
  "مَا": "https://audio.qurancdn.com/wbw/109_002_003.mp3",
  "نَا": "https://audio.qurancdn.com/wbw/002_128_006.mp3",
  "وَا": "https://audio.qurancdn.com/wbw/002_035_001.mp3",
  "هَا": "https://audio.qurancdn.com/wbw/091_001_002.mp3",
  "يَا": "https://audio.qurancdn.com/wbw/002_021_001.mp3",

  // Muqatta'at
  "الم": "https://audio.qurancdn.com/wbw/002_001_001.mp3",
  "الر": "https://audio.qurancdn.com/wbw/010_001_001.mp3",
  "طه": "https://audio.qurancdn.com/wbw/020_001_001.mp3",
  "يس": "https://audio.qurancdn.com/wbw/036_001_001.mp3",
  "حم": "https://audio.qurancdn.com/wbw/040_001_001.mp3",
  "كهيعص": "https://audio.qurancdn.com/wbw/019_001_001.mp3",

  // Missing Words
  "نَحْ": "https://audio.qurancdn.com/wbw/056_057_001.mp3",
  "جَحْ": "https://audio.qurancdn.com/wbw/102_006_002.mp3",
  "عَسْ": "https://audio.qurancdn.com/wbw/002_216_006.mp3",
  "أَبَدًا": "https://audio.qurancdn.com/wbw/002_095_004.mp3",
  "بَلَدٍ": "https://audio.qurancdn.com/wbw/090_001_003.mp3",
  "قِيلَ": "https://audio.qurancdn.com/wbw/002_011_002.mp3",
  "خَوْفٌ": "https://audio.qurancdn.com/wbw/002_038_012.mp3",
  "بَيْتٌ": "https://audio.qurancdn.com/wbw/003_096_002.mp3",
  "بَيْتٍ": "https://audio.qurancdn.com/wbw/024_036_001.mp3",
  "الْبَيْتِ": "https://audio.qurancdn.com/wbw/106_003_003.mp3",
  "خَوْفٍ": "https://audio.qurancdn.com/wbw/106_004_005.mp3",
  "يَقْطَعُ": "https://audio.qurancdn.com/wbw/022_015_012.mp3",
  "إِطْعَامٌ": "https://audio.qurancdn.com/wbw/090_014_001.mp3",
  "عَمَّ": "https://audio.qurancdn.com/wbw/078_001_001.mp3",
  "جَنَّةٌ": "https://audio.qurancdn.com/wbw/002_265_005.mp3",
  "كَذَّبَ": "https://audio.qurancdn.com/wbw/091_011_001.mp3",
  "يَزَّكَّىٰ": "https://audio.qurancdn.com/wbw/080_003_003.mp3",
  "مُزَّمِّلُ": "https://audio.qurancdn.com/wbw/073_001_002.mp3",
  "يَصَّدَّقُ": "https://audio.qurancdn.com/wbw/080_007_004.mp3",
  "وَالْعَادِيَاتِ": "https://audio.qurancdn.com/wbw/100_001_001.mp3",
  "الضَّالِّينَ": "https://audio.qurancdn.com/wbw/001_007_009.mp3",
  "مَنْ": "https://audio.qurancdn.com/wbw/002_008_003.mp3",
  "آمَنَ": "https://audio.qurancdn.com/wbw/002_062_009.mp3",
  "رَحْمَةٌ": "https://audio.qurancdn.com/wbw/002_157_004.mp3",
  "عَلِيمًا": "https://audio.qurancdn.com/wbw/004_017_012.mp3",
  "جَعَلَ": "https://audio.qurancdn.com/wbw/002_022_001.mp3",
  "رِزْقًا": "https://audio.qurancdn.com/wbw/002_022_012.mp3",
  "جَاءَ": "https://audio.qurancdn.com/wbw/110_001_002.mp3",
  "مُسْتَقِيمٍ": "https://audio.qurancdn.com/wbw/036_004_003.mp3",
  "رَحِيمٌ": "https://audio.qurancdn.com/wbw/002_173_014.mp3",
};

async function testAll() {
  const failed = [];
  for (const [key, url] of Object.entries(testMap)) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.status !== 200) {
        failed.push({ key, url, status: res.status });
      }
    } catch (e) {
      failed.push({ key, url, error: e.message });
    }
  }
  console.log(`Tested ${Object.keys(testMap).length} URLs. Failures: ${failed.length}`);
  if (failed.length > 0) {
    console.log("Failed:", failed);
  }
}

testAll();

