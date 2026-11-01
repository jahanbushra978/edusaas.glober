import assert from "node:assert/strict";
import test from "node:test";

import { addCorrectAnswerPoints, isCorrectAnswer } from "../src/features/games/game-rules.ts";

test("answer matching compares selected and target identifiers", () => {
  assert.equal(isCorrectAnswer("letter-ta", "letter-ta"), true);
  assert.equal(isCorrectAnswer("letter-ba", "letter-ta"), false);
});

test("only correct answers add points", () => {
  assert.equal(addCorrectAnswerPoints(0, true), 10);
  assert.equal(addCorrectAnswerPoints(20, false), 20);
});
