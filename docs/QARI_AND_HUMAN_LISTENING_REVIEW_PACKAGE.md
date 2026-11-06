# 🎙️ Human Listening & Qualified Qari Review Package
## Maktab Beginner Quran Learning Pilot — Alif (ا), Baa (ب), Taa (ت) & Thaa (ث)

> **Institution**: Rahmania Institute — Enterprise Multi-Tenant Quranic Platform  
> **Target Audience**: Elementary Maktab & Noorani Qaida Learners (Ages 4–10)  
> **Curriculum Baseline**: Noorani Qaida Takhti 1 (Huroof Mufradat — আলাদা হরফসমূহ)  
> **Package Date**: 2026-11-03  
> **Audit Status**: Technical Unit, Browser & Production Build Tests: **PASSED** | Human Listening & Qari Sign-Off: **PENDING REVIEW**  

---

## 1. Executive Instructions for Reviewers

> [!IMPORTANT]
> **Strict Pedagogical & Certification Standard**:  
> Automated headless browser execution verifies that audio files load, decode, and play via the Web Audio API without crashing. **It does not certify human acoustic clarity, natural tone, or authentic Tajweed.**  
> Official educational certification requires an in-person physical listening audit and evaluation by a qualified Qari.  
> Until an accredited reviewer physically listens to the audio and completes this document, **Human Listening and Qualified Qari Approval remain officially designated as PENDING.**

---

## 2. Audio Asset Specifications & Playback Endpoints

The pilot uses genuine human recordings from the Noorani Qaida master studio archives. Browser robotic synthesizers (`window.speechSynthesis`) are strictly prohibited.

| Letter | Arabic Glyph | Track ID | Master CDN Endpoint | Local Offline Review Path | Format / Codec | Byte Size | Sample Rate |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **Alif** | **ا** | Track 1 | [`Page1-1.m4a`](https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-1.m4a) | [`public/evidence/beginner-pilot/audio/alif_takhti1_page1_1.m4a`](/evidence/beginner-pilot/audio/alif_takhti1_page1_1.m4a) | AAC / M4A (Mono) | 6,884 B | 44.1 kHz |
| **Baa** | **ب** | Track 2 | [`Page1-2.m4a`](https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-2.m4a) | [`public/evidence/beginner-pilot/audio/baa_takhti1_page1_2.m4a`](/evidence/beginner-pilot/audio/baa_takhti1_page1_2.m4a) | AAC / M4A (Mono) | 9,219 B | 44.1 kHz |
| **Taa** | **ت** | Track 3 | [`Page1-3.m4a`](https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-3.m4a) | [`public/evidence/beginner-pilot/audio/taa_takhti1_page1_3.m4a`](/evidence/beginner-pilot/audio/taa_takhti1_page1_3.m4a) | AAC / M4A (Mono) | 9,086 B | 44.1 kHz |
| **Thaa** | **ث** | Track 4 | [`Page1-4.m4a`](https://cdn.jsdelivr.net/gh/nooresahar/noorani@master/sounds/chapter01/Page1-4.m4a) | [`public/evidence/beginner-pilot/audio/thaa_takhti1_page1_4.m4a`](/evidence/beginner-pilot/audio/thaa_takhti1_page1_4.m4a) | AAC / M4A (Mono) | 13,001 B | 44.1 kHz |

### Verified Technical Safeguards:
1. **Exact 1:1 Letter Mapping**: Alif -> Track 1; Baa -> Track 2; Taa -> Track 3; Thaa -> Track 4.
2. **Zero Cross-Substitution**: In `BeginnerLearningJourney.jsx`, fallback handlers never substitute a different letter's audio. If an asset fails, an explicit `audioError` alert and retry banner is shown.
3. **Zero Browser Synthetic Speech**: Arabic phonemes are barred from `SpeechSynthesis`.

---

## 3. Letter Teaching Profiles & Classical Makharij

### 3.1 Lesson 1: Alif (`ا`)
- **Arabic Text**: `أَلِف` (বাং: *আলিফ*)
- **Makhraj**: স্বাভাবিক ৩-অক্ষরী নাম (Name); মাদ্দ অবস্থায় মৌখিক গহ্বর (**আল-জাওফ**)।
- **The Classical 3-Part Scholarly Distinction**:
  1. **হরফের নাম**: নূরানী কায়দায় একে স্বাভাবিক স্বরে 'আলিফ' পড়তে হয়।
  2. **মাদ্দ ভূমিকা**: যবরের পর খালি আলিফ আসলে মৌখিক গহ্বর (আল-জাওফ) থেকে ১ আলিফ (২ হরকত) টেনে পড়তে হয়।
  3. **হামযাহর সাথে পার্থক্য**: খালি আলিফের ওপর হরকত বা জযম বসলে তা মূলত 'হামযাহ' (ء)।
- **Orthography**: সোজা দাঁড়িয়ে থাকা লাঠি, সম্পূর্ণ নুকতাহীন (০ নুকতা)।

### 3.2 Lesson 2: Baa (`ب`)
- **Arabic Text**: `بَاء` (বাং: *বা*)
- **Classical Makhraj**: **Makhraj #16** — আশ-শাফাতান (الشفتان — দুই ঠোঁটের ভেতরের ভিজা অংশ পরস্পরের সাথে মিলিয়ে)।
- **Orthography**: কিশতি বা নৌকার আকৃতি, যার নিচে ঠিক **১টি গোল নুকতা**।

### 3.3 Lesson 3: Taa (`ت`)
- **Arabic Text**: `تَاء` (বাং: *তা*)
- **Classical Makhraj**: **Makhraj #12** — আল-লিসান (اللسان — জিহ্বার আগা সামনের ওপরের দুই দাঁতের গোড়ার সাথে শক্তভাবে লাগিয়ে — `ط، د، ت`)।
- **Essential Sifat**:
  - **Hams (হমস)**: সাকিন অবস্থায় হালকা শ্বাস/বাতাস।
  - **Shiddah (শিদ্দাহ)**: মাখরাজে শব্দ আটকে যাওয়া।
  - **Istifal ও Infitah**: জিহ্বা নামিয়ে পাতলা স্বরে উচ্চারণ (তোয়া `ط` এর মতো মোটা করা সম্পূর্ণ নিষেধ)।
  - **Ismat (ইসমাত)**।
  - **কলক্বলাহ নিষেধ**: তা হরফে কোনো কলক্বলাহ নেই।
- **Orthography**: কিশতি বা নৌকার আকৃতি, যার পেটের ওপরে ঠিক **২টি গোল নুকতা** (চোখের মতো)।

### 3.4 Lesson 4: Thaa (`ث`)
- **Arabic Text**: `ثَاء` (বাং: *ছা* / *সা* — strictly labeled as approximations)
- **Classical Makhraj**: **Makhraj #14** — আল-লিসান (اللسان — জিহ্বার আগা সামনের ওপরের দুই দাঁতের আগার বা ধারের সাথে নরমভাবে লাগিয়ে — `ظ، ذ، ث`)।
- **Phonetic Anchor**: Voiceless dental fricative **/θ/** identical to English **"thin"**, **"think"**, **"three"**.
- **Bengali Approximation Warning**: সাধারণ বাংলা "ছা" বা "সা" এর সমান নয়।
- **Essential Sifat**:
  - **Hams (হমস)** ও **Rakhawah (রাখাওয়া)**: নরম আওয়াজের প্রবাহ।
  - **Nafy As-Safir (সাফীর বা শিসধ্বনি মুক্ত)**: সীন (`س`) এর মতো শিসধ্বনি সম্পূর্ণ নিষিদ্ধ। (সাফীর না হওয়া কোনো পৃথক সিফাত নয়; কেবল সাফীর হরফ না হওয়ার স্পষ্টীকরণ)।
  - **Istifal, Infitah ও Ismat**: পাতলা ও হালকা হরফ।
  - **কলক্বলাহ নিষেধ**: ছা হরফে কোনো কলক্বলাহ নেই।
- **Orthography**: কিশতি বা নৌকার আকৃতি, যার ওপরে ত্রিভুজাকারে সাজানো **৩টি গোল নুকতা**।

---

## 4. Standardized Teacher & Qari Review Checklist

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STANDARDIZED EVALUATION RUBRIC                                  │
├─────────┬───────────────────────────────┬────────────────────────────────┬────────────┤
│ Letter  │ Evaluation Area               │ Requirement                    │ Status     │
├─────────┼───────────────────────────────┼────────────────────────────────┼────────────┤
│ Alif    │ 1. Audio Authenticity         │ Authentic human Qari (Track 1) │ [ ] Passed │
│         │ 2. Letter Name Pronunciation  │ "Alif" read naturally (no madd)│ [ ] Passed │
│         │ 3. Madd/Hamzah Distinction    │ Clear 3-part pedagogical rule  │ [ ] Passed │
│         │ 4. Child-Friendly Instruction │ Straight stick, no dots        │ [ ] Passed │
├─────────┼───────────────────────────────┼────────────────────────────────┼────────────┤
│ Baa     │ 1. Audio Authenticity         │ Authentic human Qari (Track 2) │ [ ] Passed │
│         │ 2. Articulation Point         │ Ash-Shafataan #16 (two lips)   │ [ ] Passed │
│         │ 3. Dot Count & Placement      │ Exactly 1 dot underneath       │ [ ] Passed │
│         │ 4. Child-Friendly Instruction │ Boat metaphor, clear Bangla    │ [ ] Passed │
├─────────┼───────────────────────────────┼────────────────────────────────┼────────────┤
│ Taa     │ 1. Audio Authenticity         │ Authentic human Qari (Track 3) │ [ ] Passed │
│         │ 2. Articulation Point         │ Makhraj #12 (tip + roots)      │ [ ] Passed │
│         │ 3. Dot Count & Placement      │ Exactly 2 dots on top          │ [ ] Passed │
│         │ 4. Sifat & Non-Qalqalah       │ Hams, Shiddah, thin, no qalqala│ [ ] Passed │
├─────────┼───────────────────────────────┼────────────────────────────────┼────────────┤
│ Thaa    │ 1. Audio Authenticity         │ Authentic human Qari (Track 4) │ [ ] Passed │
│         │ 2. Articulation Point         │ Makhraj #14 (tip + tooth edge) │ [ ] Passed │
│         │ 3. Phonetic Reference         │ /θ/ like "thin", no whistle    │ [ ] Passed │
│         │ 4. Dot Count & Placement      │ Exactly 3 dots on top          │ [ ] Passed │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Official Review Record & Decision Log

> [!CAUTION]
> This section must remain **BLANK and PENDING** until an authorized human reviewer / Qari conducts an in-person physical review. No synthetic or simulated approvals are permitted.

```text
════════════════════════════════════════════════════════════════════════════════════════
                             OFFICIAL REVIEW LOG
════════════════════════════════════════════════════════════════════════════════════════

Reviewer 1 (Acoustic & Device Listening):
• Full Name             : ______________________________________________________________
• Designation & Madrasa : ______________________________________________________________
• Review Date           : ____ / ____ / ________
• Hardware Tested       : [ ] Phone Speaker  [ ] Tablet Speaker  [ ] Desktop / Headphones
• Alif Audio Decision   : [ ] PENDING        [ ] APPROVED        [ ] REJECTED
• Baa Audio Decision    : [ ] PENDING        [ ] APPROVED        [ ] REJECTED
• Taa Audio Decision    : [ ] PENDING        [ ] APPROVED        [ ] REJECTED
• Thaa Audio Decision   : [ ] PENDING        [ ] APPROVED        [ ] REJECTED
• General Comments      : ______________________________________________________________
• Signature             : ______________________________________________________________

Reviewer 2 (Qualified Qari / Tajweed Board):
• Full Name             : ______________________________________________________________
• Qari Sanad / Board    : ______________________________________________________________
• Review Date           : ____ / ____ / ________
• Maktab Pedagogy Score : [ ] PENDING        [ ] APPROVED        [ ] NEEDS REVISION
• Tajweed Articulation  : [ ] PENDING        [ ] APPROVED        [ ] NEEDS REVISION
• Final Recommendation  : [ ] PENDING FORMAL SIGN-OFF
• Official Stamp/Seal   : 

════════════════════════════════════════════════════════════════════════════════════════
CURRENT STATUS: PENDING FORMAL IN-PERSON REVIEW
════════════════════════════════════════════════════════════════════════════════════════
```

---

## 6. Visual Evidence Catalog (Alif, Baa, Taa, Thaa)

All screenshot artifacts are stored in `public/evidence/beginner-pilot/` and `<appDataDir>\brain\<conversation-id>/`:

### 6.1 Lesson 3: Taa (`ت`) Visual Journey
- [Hero Card with 4 Letters](/evidence/beginner-pilot/taa_00_hero_card_with_four_letters.png)
- [Stage 1: Taa Introduce](/evidence/beginner-pilot/taa_01_introduce.png)
- [Stage 2: Taa Makhraj #12](/evidence/beginner-pilot/taa_02_demonstrate_makhraj12.png)
- [Stage 3: Taa Listen Audio](/evidence/beginner-pilot/taa_03_listen_audio.png)
- [Stage 4: Taa Practice Touch](/evidence/beginner-pilot/taa_04_practice_touch.png)
- [Stage 5: Taa Play Discovery](/evidence/beginner-pilot/taa_05_play_discovery.png)
- [Stage 6: Taa Assess Q1](/evidence/beginner-pilot/taa_06_assess_q1.png)
- [Stage 7: Taa Error Diagnostic Hint](/evidence/beginner-pilot/taa_07_error_hint.png)
- [Stage 9: Taa Reward Stars](/evidence/beginner-pilot/taa_08_reward_stars.png)
- [Stage 10: Taa Progress Unlock Thaa](/evidence/beginner-pilot/taa_09_progress_unlock_thaa.png)

### 6.2 Lesson 4: Thaa (`ث`) Visual Journey
- [Stage 1: Thaa Introduce](/evidence/beginner-pilot/thaa_01_introduce.png)
- [Stage 2: Thaa Makhraj #14](/evidence/beginner-pilot/thaa_02_demonstrate_makhraj14.png)
- [Stage 3: Thaa Listen Audio](/evidence/beginner-pilot/thaa_03_listen_audio.png)
- [Stage 4: Thaa Practice Touch](/evidence/beginner-pilot/thaa_04_practice_touch.png)
- [Stage 5: Thaa Play Discovery](/evidence/beginner-pilot/thaa_05_play_discovery.png)
- [Stage 6: Thaa Assess Q1 & Q2](/evidence/beginner-pilot/thaa_06_assess_q1.png)
- [Stage 9: Thaa Reward Stars](/evidence/beginner-pilot/thaa_07_reward_stars.png)
- [Stage 10: All 4 Foundation Lessons Complete](/evidence/beginner-pilot/thaa_08_all_four_lessons_complete.png)
- [Mobile Responsive Layout (390x844)](/evidence/beginner-pilot/thaa_09_mobile_responsive_modal.png)
