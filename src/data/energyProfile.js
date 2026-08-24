// Career Compass — Behavioral Energy Profile
// Proprietary four-axis model. Not derived from Insights Discovery, MBTI, or DISC.
// Measures Natural style and Adapted style separately.

export const ENERGY_AXES = [
  { id: "decisive_deliberate", low: "Deliberate", high: "Decisive" },
  { id: "expressive_reserved", low: "Reserved", high: "Expressive" },
  { id: "relationship_outcome", low: "Relationship-led", high: "Outcome-led" },
  { id: "adaptive_structured", low: "Adaptive", high: "Structured" },
];

export const ENERGY_MODES = {
  natural: {
    label: "Natural style",
    context: "How you usually act when you're at ease and not trying to meet anyone's expectations.",
  },
  adapted: {
    label: "Adapted style",
    context: "How you act when it really counts — under judgement, evaluation, or pressure to deliver.",
  },
};

// pole: "high" | "low" relative to each axis's high/low labels.
export const ENERGY_ITEMS = [
  // ---- NATURAL (12) ----
  { id: "n1", mode: "natural", axis: "decisive_deliberate", a: { pole: "high", text: "I decide quickly and move." }, b: { pole: "low", text: "I prefer to think it through calmly first." } },
  { id: "n2", mode: "natural", axis: "expressive_reserved", a: { pole: "high", text: "I think out loud easily." }, b: { pole: "low", text: "I order my thoughts internally first." } },
  { id: "n3", mode: "natural", axis: "relationship_outcome", a: { pole: "low", text: "The people matter more than the metric." }, b: { pole: "high", text: "The result matters more than the relationship." } },
  { id: "n4", mode: "natural", axis: "adaptive_structured", a: { pole: "low", text: "I respond to whatever happens." }, b: { pole: "high", text: "I stick to a plan." } },
  { id: "n5", mode: "natural", axis: "decisive_deliberate", a: { pole: "high", text: "Acting beats over-thinking for me." }, b: { pole: "low", text: "Reflecting beats rushing for me." } },
  { id: "n6", mode: "natural", axis: "expressive_reserved", a: { pole: "high", text: "I show energy openly." }, b: { pole: "low", text: "I keep my energy contained." } },
  { id: "n7", mode: "natural", axis: "relationship_outcome", a: { pole: "low", text: "I lead through trust." }, b: { pole: "high", text: "I lead through goals." } },
  { id: "n8", mode: "natural", axis: "adaptive_structured", a: { pole: "low", text: "I adapt as I learn." }, b: { pole: "high", text: "I commit to a clear plan." } },
  { id: "n9", mode: "natural", axis: "decisive_deliberate", a: { pole: "high", text: "I'd rather move and adjust." }, b: { pole: "low", text: "I'd rather plan than redo." } },
  { id: "n10", mode: "natural", axis: "expressive_reserved", a: { pole: "high", text: "I talk to figure things out." }, b: { pole: "low", text: "I think to figure things out." } },
  { id: "n11", mode: "natural", axis: "relationship_outcome", a: { pole: "low", text: "Reaching out to people is my default." }, b: { pole: "high", text: "Hitting targets is my default." } },
  { id: "n12", mode: "natural", axis: "adaptive_structured", a: { pole: "low", text: "I'm comfortable changing course." }, b: { pole: "high", text: "I'm comfortable holding the line." } },

  // ---- ADAPTED (12) ----
  { id: "a1", mode: "adapted", axis: "decisive_deliberate", a: { pole: "high", text: "Under pressure I push harder for the result." }, b: { pole: "low", text: "Under pressure I slow down to be careful." } },
  { id: "a2", mode: "adapted", axis: "expressive_reserved", a: { pole: "high", text: "When it counts I speak up and rally." }, b: { pole: "low", text: "When it counts I stay composed and precise." } },
  { id: "a3", mode: "adapted", axis: "relationship_outcome", a: { pole: "low", text: "When stakes are high I protect the team." }, b: { pole: "high", text: "When stakes are high I protect the goal." } },
  { id: "a4", mode: "adapted", axis: "adaptive_structured", a: { pole: "low", text: "Under pressure I adapt to reality." }, b: { pole: "high", text: "Under pressure I stick to the plan." } },
  { id: "a5", mode: "adapted", axis: "decisive_deliberate", a: { pole: "high", text: "When judged, I act decisively." }, b: { pole: "low", text: "When judged, I become more deliberate." } },
  { id: "a6", mode: "adapted", axis: "expressive_reserved", a: { pole: "high", text: "When it matters I show more energy." }, b: { pole: "low", text: "When it matters I stay measured." } },
  { id: "a7", mode: "adapted", axis: "relationship_outcome", a: { pole: "low", text: "When results matter I focus on people." }, b: { pole: "high", text: "When results matter I focus on outcomes." } },
  { id: "a8", mode: "adapted", axis: "adaptive_structured", a: { pole: "high", text: "When it counts I keep the method." }, b: { pole: "low", text: "When it counts I flex to the situation." } },
  { id: "a9", mode: "adapted", axis: "decisive_deliberate", a: { pole: "high", text: "In graded situations I trust fast decisions." }, b: { pole: "low", text: "In graded situations I verify before acting." } },
  { id: "a10", mode: "adapted", axis: "expressive_reserved", a: { pole: "high", text: "When evaluated I communicate more." }, b: { pole: "low", text: "When evaluated I listen more and speak less." } },
  { id: "a11", mode: "adapted", axis: "relationship_outcome", a: { pole: "low", text: "Under evaluation I prioritise the team." }, b: { pole: "high", text: "Under evaluation I prioritise impact." } },
  { id: "a12", mode: "adapted", axis: "adaptive_structured", a: { pole: "high", text: "When it counts I keep the structure." }, b: { pole: "low", text: "When it counts I improvise." } },
];