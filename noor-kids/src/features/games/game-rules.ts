export function isCorrectAnswer(selectedId: string, targetId: string): boolean {
  return selectedId === targetId;
}

export function addCorrectAnswerPoints(score: number, correct: boolean): number {
  return correct ? score + 10 : score;
}
