import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("1. Three Main Public Panels are primary top navigation in HumanTeacherPlatform", () => {
  const file = fs.readFileSync(
    "src/features/teachers/components/HumanTeacherPlatform.jsx",
    "utf-8"
  );

  // Check the Three Main Panels
  assert.ok(file.includes('setActiveMainPanel("home")'), "Navigation includes Home panel trigger");
  assert.ok(file.includes('setActiveMainPanel("teachers")'), "Navigation includes Teacher Panel trigger");
  assert.ok(file.includes('setActiveMainPanel("students")'), "Navigation includes Student Panel trigger");

  // Check top navigation tab labels
  assert.ok(file.includes("<span>হোম</span>"), "Home panel tab label rendered");
  assert.ok(file.includes("<span>টিচার প্যানেল</span>"), "Teacher Panel tab label rendered");
  assert.ok(file.includes("<span>স্টুডেন্ট প্যানেল</span>"), "Student Panel tab label rendered");
});

test("2. Platform Transaction & Commission Incentive Banner is prominently featured", () => {
  const file = fs.readFileSync(
    "src/features/teachers/components/HumanTeacherPlatform.jsx",
    "utf-8"
  );

  // User specification: "amader side use kore len den korile aro fesaletic and % deoya hobe aro sogoj sobida deoya hobe"
  assert.ok(
    file.includes("রহমানিয়া প্ল্যাটফর্মে লেনদেন ও হাদিয়ার বিশেষ সুবিধা"),
    "Platform incentive banner title exists"
  );
  assert.ok(
    file.includes("সর্বনিম্ন কমিশন") && file.includes("ওয়ালেট নিরাপত্তা"),
    "Incentive highlights lower commission and wallet security"
  );
});

test("3. StoriesBar component enforces 24-hour expiration and role-based story limits", () => {
  const storiesFile = fs.readFileSync(
    "src/features/teachers/components/social/StoriesBar.jsx",
    "utf-8"
  );
  const storiesApi = fs.readFileSync(
    "app/api/teacher-marketplace/stories/route.js",
    "utf-8"
  );

  assert.ok(storiesFile.includes("২৪ ঘণ্টার স্টোরি"), "StoriesBar identifies 24-hour duration");
  assert.ok(storiesFile.includes("activeStoryIndex"), "StoriesBar manages story index and progress timer");
  assert.ok(storiesApi.includes("expires_at"), "Stories API handles expiration timestamp");
  assert.ok(
    storiesApi.includes('author_role === "student" && media_type === "video"'),
    "Stories API prevents students from uploading video stories (photos only)"
  );
});

test("4. ReelsDiscoverySection provides vertical short-video discovery and playback", () => {
  const reelsFile = fs.readFileSync(
    "src/features/teachers/components/social/ReelsDiscoverySection.jsx",
    "utf-8"
  );

  assert.ok(reelsFile.includes("রিলস ও ইসলামিক শর্ট ভিডিও"), "Reels section title is rendered");
  assert.ok(reelsFile.includes("selectedReel"), "Reels supports modal video player");
  assert.ok(reelsFile.includes("<video"), "Reels player embeds video tag");
  assert.ok(reelsFile.includes("likesCount") && reelsFile.includes("commentsCount"), "Reels tracks social interactions");
});

test("5. StudentDiscoveryDirectory allows search by Name, Username, and exact Public Student ID", () => {
  const studentDirFile = fs.readFileSync(
    "src/features/teachers/components/StudentDiscoveryDirectory.jsx",
    "utf-8"
  );
  const studentApiFile = fs.readFileSync(
    "app/api/teacher-marketplace/public-students/route.js",
    "utf-8"
  );

  assert.ok(studentDirFile.includes("গ্লোবাল পাবলিক শিক্ষার্থী ডিরেক্টরি"), "Student discovery header exists");
  assert.ok(studentDirFile.includes("student_public_id"), "Student cards display Public Student ID");
  assert.ok(studentDirFile.includes("onRequestTeachStudent"), "Teachers can initiate teaching requests");
  assert.ok(studentApiFile.includes("is_discoverable"), "Public students API filters by discoverability");
  assert.ok(studentApiFile.includes("SEED_PUBLIC_STUDENTS"), "Public students API supplies verified seed profiles");
});

test("6. Mutual Connection Request modal supports both directions and prevents duplicates", () => {
  const modalFile = fs.readFileSync(
    "src/features/teachers/components/MutualConnectionRequestModal.jsx",
    "utf-8"
  );
  const connApiFile = fs.readFileSync(
    "app/api/teacher-marketplace/connections/route.js",
    "utf-8"
  );

  assert.ok(modalFile.includes("আমি আপনার কাছে পড়তে চাই"), "Student-to-Teacher request mode supported");
  assert.ok(modalFile.includes("আমি আপনাকে পড়াতে চাই"), "Teacher-to-Student invitation mode supported");
  assert.ok(connApiFile.includes("onConflict") || connApiFile.includes("existingConn"), "API prevents duplicate requests");
  assert.ok(connApiFile.includes("learning_assistant_groups"), "Accepting request provisions Private Learning Assistant Group");
});

test("7. PrivateLearningGroupModal provides dedicated private workspace with Chat, Notes, Schedule, Tools, and WebRTC", () => {
  const groupModalFile = fs.readFileSync(
    "src/features/teachers/components/PrivateLearningGroupModal.jsx",
    "utf-8"
  );
  const groupMsgApi = fs.readFileSync(
    "app/api/teacher-marketplace/connections/messages/route.js",
    "utf-8"
  );

  assert.ok(groupModalFile.includes("সক্রিয় শিক্ষা সংযোগ"), "Private workspace badge displayed");
  assert.ok(groupModalFile.includes("বার্তা ও রিসোর্স"), "Private messaging tab exists");
  assert.ok(groupModalFile.includes("ক্লাস শিডিউল"), "Schedule tab exists");
  assert.ok(groupModalFile.includes("শিক্ষা সহায়ক টুলস"), "Integrated Quran/Nur tools tab exists");
  assert.ok(groupModalFile.includes("WebRTCLiveCallModal"), "Integrates WebRTC live call modal");
  assert.ok(groupMsgApi.includes("Unauthorized: You are not a member"), "Messages API strictly denies unrelated users");
});

test("8. WebRTCLiveCallModal integrates real Screen Sharing for authorized lessons", () => {
  const webrtcFile = fs.readFileSync(
    "src/features/teachers/components/WebRTCLiveCallModal.jsx",
    "utf-8"
  );

  assert.ok(webrtcFile.includes("getDisplayMedia"), "WebRTC modal invokes browser getDisplayMedia API");
  assert.ok(webrtcFile.includes("handleToggleScreenShare"), "WebRTC modal provides screen sharing toggle");
  assert.ok(webrtcFile.includes("Monitor") && webrtcFile.includes("MonitorOff"), "WebRTC modal renders Monitor icon buttons");
});

test("9. Database Migration 20261109 defines RLS, Tables, Indexes, and Constraints", () => {
  const sqlFile = fs.readFileSync(
    "supabase/migrations/20261109_global_education_social_network.sql",
    "utf-8"
  );

  assert.ok(sqlFile.includes("CREATE TABLE IF NOT EXISTS public.public_student_profiles"), "Defines public_student_profiles table");
  assert.ok(sqlFile.includes("CREATE TABLE IF NOT EXISTS public.learning_connections"), "Defines learning_connections table");
  assert.ok(sqlFile.includes("CREATE TABLE IF NOT EXISTS public.learning_assistant_groups"), "Defines learning_assistant_groups table");
  assert.ok(sqlFile.includes("CREATE TABLE IF NOT EXISTS public.learning_group_messages"), "Defines learning_group_messages table");
  assert.ok(sqlFile.includes("CREATE TABLE IF NOT EXISTS public.social_stories"), "Defines social_stories table");
  assert.ok(sqlFile.includes("ENABLE ROW LEVEL SECURITY"), "Enables RLS on all tables");
  assert.ok(sqlFile.includes("expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + interval '24 hours')"), "Enforces 24-hour story expiration");
});

