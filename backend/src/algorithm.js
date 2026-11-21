/**
 * Secret Santa draw algorithm with family constraint.
 * No participant can be assigned someone from their own family.
 *
 * Uses a constrained Fisher-Yates shuffle with retry.
 * At the scale of a family gathering this resolves in < 10 attempts virtually always.
 */

/**
 * @param {Array<{id: string, name: string, familyId: string}>} participants
 * @returns {Array<{giverId: string, receiverId: string}>} assignments
 */
function runDraw(participants) {
  if (participants.length < 2) {
    throw new Error("Need at least 2 participants for a draw.");
  }

  const MAX_ATTEMPTS = 1000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const shuffled = shuffle([...participants]);
    const assignments = [];
    let valid = true;

    for (let i = 0; i < participants.length; i++) {
      const giver = participants[i];
      const receiver = shuffled[i];

      // A person cannot give to themselves or to their own family
      if (giver.id === receiver.id || giver.familyId === receiver.familyId) {
        valid = false;
        break;
      }

      assignments.push({ giverId: giver.id, receiverId: receiver.id });
    }

    if (valid) return assignments;
  }

  throw new Error(
    "Could not find a valid draw after many attempts. " +
    "This can happen if one family has more than half of all participants. " +
    "Try adding more participants or splitting large families."
  );
}

/**
 * Fisher-Yates shuffle (in-place, returns array)
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

module.exports = { runDraw };
