// Open-ended coaching question banks (mirrors base44/shared/assessmentConfig.ts).
// Used by the OpenModule UI to resolve a saved response's question text from its id,
// since older Response records were stored before the question_text field existed.

export const COACH_BANKS = {
  session1: [
    { id: "s1_q1", text: "If you didn't have to choose studies or work for the next year, and had enough money for a normal life, what would you do Monday to Friday?" },
    { id: "s1_q2", text: "Name three moments from the last few years when you were genuinely proud of yourself. What exactly did you do?" },
    { id: "s1_q3", text: "What comes easier to you than to most people your age?" },
    { id: "s1_q4", text: "What do other people most often come to you for help with?" },
    { id: "s1_q5", text: "What have you learned on your own, even though nobody forced you to?" },
    { id: "s1_q6", text: "What required the most consistency from you over the last two years?" },
    { id: "s1_q7", text: "Why were you able to maintain that consistency?" },
    { id: "s1_q8", text: "What do you often start with enthusiasm but later abandon?" },
    { id: "s1_q9", text: "When did you last lose track of time while doing something?" },
    { id: "s1_q10", text: "Tell me about a time you failed. What did you do afterwards?" },
    { id: "s1_q11", text: "Do you prefer achieving a great result alone, or being part of a team that achieves a great result? Why?" },
    { id: "s1_q12", text: "What kind of problems do you enjoy solving?" },
    { id: "s1_q13", text: "What tasks do you procrastinate most often?" },
    { id: "s1_q14", text: "For what achievement would you most want to be respected?" },
    { id: "s1_q15", text: "What would you like to be genuinely good at in five years?" },
  ],
  sport: [
    { id: "sport_q1", text: "What did you like most about sport: the game, the competition, the team, training, improving skills, winning, or something else?" },
    { id: "sport_q2", text: "What did you like least?" },
    { id: "sport_q3", text: "If you could train very seriously six days a week for three years, how would you react?" },
    { id: "sport_q4", text: "What's more interesting: achieving a result yourself, or helping someone else achieve one?" },
    { id: "sport_q5", text: "Are you interested in why a specific training method works?" },
    { id: "sport_q6", text: "Are you interested in anatomy, physiology, recovery, or programming training?" },
    { id: "sport_q7", text: "Could you guide for half a year a person far less disciplined than you?" },
    { id: "sport_q8", text: "What would interest you more: running training sessions, running a club/gym, or the business around sport?" },
  ],
  gaming: [
    { id: "game_q1", text: "Which games do you most enjoy playing?" },
    { id: "game_q2", text: "What exactly makes them engaging for you?" },
    { id: "game_q3", text: "Have you ever wondered how a game was designed?" },
    { id: "game_q4", text: "Would you be interested in designing game mechanics?" },
    { id: "game_q5", text: "Graphics?" },
    { id: "game_q6", text: "Level design?" },
    { id: "game_q7", text: "Marketing?" },
    { id: "game_q8", text: "Community management?" },
    { id: "game_q9", text: "Esports or business?" },
  ],
  money: [
    { id: "money_q1", text: "What's more important to you: very good money, or very interesting work?" },
    { id: "money_q2", text: "How important is owning your own business?" },
    { id: "money_q3", text: "What worries you more: lack of money, or boring work?" },
    { id: "money_q4", text: "Would you prefer high pay with high pressure, or lower pay with more autonomy?" },
    { id: "money_q5", text: "How important is it that others see your success?" },
    { id: "money_q6", text: "Describe a thirty-year-old's life you absolutely would not want to lead." },
    { id: "money_q7", text: "What would a genuinely good ordinary Tuesday look like in your life at 30?" },
  ],
  decision_ownership: [
    { id: "do_q1", text: "If the country you're planning to move to were still available, but no one close to you lived there — would you still want to go?" },
    { id: "do_q2", text: "If you could live with someone close to you in any country, which country would you choose?" },
    { id: "do_q3", text: "If your current move plan became impossible tomorrow, what would your next plan be?" },
    { id: "do_q4", text: "What attracted you in your earlier life plan?" },
    { id: "do_q5", text: "Imagine that in three years your personal relationships change. Would you still be happy with your chosen education?" },
    { id: "do_q6", text: "What would have to be true for you to say: this was truly my decision?" },
  ],
};

// Flat id → text lookup across all banks.
export const QUESTION_TEXT = Object.fromEntries(
  Object.values(COACH_BANKS).flat().map((q) => [q.id, q.text])
);

// 1-based position of a question_id within its module bank (for labelling), or null.
export function questionIndex(moduleKey, questionId) {
  const bank = COACH_BANKS[moduleKey];
  if (!bank) return null;
  const i = bank.findIndex((q) => q.id === questionId);
  return i >= 0 ? i + 1 : null;
}