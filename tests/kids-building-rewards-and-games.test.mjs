import test from "node:test";
import assert from "node:assert/strict";
import { BUILDING_JOURNEYS, getBuildingJourney } from "../src/features/ai-learning/data/buildingRewardData.js";
import {
  KIDS_DOT_GAME_LEVELS,
  KIDS_HARAKAT_GAME_LEVELS,
  KIDS_SOUND_DETECTIVE_LEVELS,
  KIDS_MEMORY_GAME_LEVELS,
  KIDS_TRACING_GROUPS,
} from "../src/features/ai-learning/data/kidsGameData.js";

test("Building Rewards Progression System Validation", async (t) => {
  await t.test("all registered journeys have valid structure, components, and milestones", () => {
    const journeyKeys = Object.keys(BUILDING_JOURNEYS);
    assert.ok(journeyKeys.length >= 7, "Should define at least 7 building journeys");

    for (const key of journeyKeys) {
      const journey = BUILDING_JOURNEYS[key];
      assert.ok(journey.id, `${key} missing id`);
      assert.ok(journey.titleBn, `${key} missing titleBn`);
      assert.ok(journey.icon, `${key} missing icon`);
      assert.ok(journey.totalMilestones > 0, `${key} totalMilestones must be > 0`);
      assert.equal(
        journey.components.length,
        journey.totalMilestones,
        `${key} components length must match totalMilestones`
      );

      // Verify components are sequentially numbered and unique
      const ids = new Set();
      let lastPercent = 0;
      journey.components.forEach((c, idx) => {
        assert.equal(c.level, idx + 1, `${key} component ${idx} level mismatch`);
        assert.ok(!ids.has(c.id), `${key} duplicate component id ${c.id}`);
        ids.add(c.id);
        assert.ok(c.nameBn, `${key} component ${c.id} missing nameBn`);
        assert.ok(c.icon, `${key} component ${c.id} missing icon`);
        assert.ok(c.percent > lastPercent, `${key} component ${c.id} percent must increase`);
        lastPercent = c.percent;
      });

      assert.equal(
        journey.components[journey.components.length - 1].percent,
        100,
        `${key} final component must reach 100%`
      );
    }
  });

  await t.test("verifies alignment between game level counts and journey milestones", () => {
    // 1. Drag Drop Letter: 14 levels -> 14 milestones
    assert.equal(BUILDING_JOURNEYS["drag-drop-letter"].totalMilestones, 14);

    // 2. Balloon Pop: 3 levels -> 3 milestones
    assert.equal(BUILDING_JOURNEYS["balloon-pop"].totalMilestones, 3);

    // 3. Dot Count: 6 levels -> 6 milestones
    assert.equal(BUILDING_JOURNEYS["dot-count"].totalMilestones, KIDS_DOT_GAME_LEVELS.length);

    // 4. Harakat Master: 9 levels -> 9 milestones
    assert.equal(BUILDING_JOURNEYS["harakat-master"].totalMilestones, KIDS_HARAKAT_GAME_LEVELS.length);

    // 5. Letter Match (Memory): 7 levels -> 7 milestones
    assert.equal(BUILDING_JOURNEYS["letter-match"].totalMilestones, KIDS_MEMORY_GAME_LEVELS.length);

    // 6. Sound Detective: 7 levels -> 7 milestones
    assert.equal(BUILDING_JOURNEYS["sound-detective"].totalMilestones, KIDS_SOUND_DETECTIVE_LEVELS.length);

    // 7. Trace Letter: 4 groups -> 4 milestones
    assert.equal(BUILDING_JOURNEYS["trace-letter"].totalMilestones, KIDS_TRACING_GROUPS.length);
  });

  await t.test("getBuildingJourney fallback returns default journey safely", () => {
    const fallback = getBuildingJourney("non-existent-game-id");
    assert.ok(fallback);
    assert.equal(fallback.id, "drag-drop-letter");
  });
});

