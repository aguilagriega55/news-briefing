// Deterministic US→AU spelling conversion so criterion 12 is enforced, not just
// requested in the prompt. Curated whole-word list only — a blanket "-ize→-ise"
// regex would wreck "size"/"prize", and "-or→-our" would wreck "doctor"/"actor".
// Keys are lowercase US spellings; matching is whole-word and case-preserving.

const US_TO_AU: Record<string, string> = {
  // -our
  color: "colour", colors: "colours", colored: "coloured", coloring: "colouring",
  favor: "favour", favors: "favours", favored: "favoured", favorite: "favourite",
  favorites: "favourites", favorable: "favourable",
  honor: "honour", honors: "honours", honored: "honoured",
  labor: "labour", labors: "labours",
  neighbor: "neighbour", neighbors: "neighbours", neighborhood: "neighbourhood",
  behavior: "behaviour", behaviors: "behaviours",
  flavor: "flavour", flavors: "flavours",
  rumor: "rumour", rumors: "rumours", rumored: "rumoured",
  harbor: "harbour", harbors: "harbours",
  humor: "humour", endeavor: "endeavour", valor: "valour",
  // -re
  center: "centre", centers: "centres", centered: "centred",
  theater: "theatre", theaters: "theatres",
  meter: "metre", meters: "metres", liter: "litre", liters: "litres",
  fiber: "fibre", fibers: "fibres",
  // -ise / -yse (curated real verbs only)
  organize: "organise", organized: "organised", organizing: "organising",
  organization: "organisation", organizations: "organisations",
  realize: "realise", realized: "realised", realizing: "realising",
  recognize: "recognise", recognized: "recognised",
  analyze: "analyse", analyzed: "analysed", analyzing: "analysing",
  paralyze: "paralyse", paralyzed: "paralysed",
  apologize: "apologise", apologized: "apologised",
  emphasize: "emphasise", emphasized: "emphasised",
  criticize: "criticise", criticized: "criticised",
  // -ce nouns
  defense: "defence", defenses: "defences",
  offense: "offence", offenses: "offences",
  license: "licence", pretense: "pretence",
  // -lling / -lled
  traveler: "traveller", travelers: "travellers", traveling: "travelling", traveled: "travelled",
  canceled: "cancelled", canceling: "cancelling",
  labeled: "labelled", labeling: "labelling",
  modeling: "modelling", fueled: "fuelled", fueling: "fuelling",
  // -gue / misc
  catalog: "catalogue", dialog: "dialogue",
  gray: "grey", jewelry: "jewellery", aluminum: "aluminium",
  maneuver: "manoeuvre", mustache: "moustache", plow: "plough",
  practiced: "practised", practicing: "practising",
};

function applyCase(src: string, repl: string): string {
  if (src === src.toUpperCase()) return repl.toUpperCase();           // ALL CAPS
  if (src[0] === src[0].toUpperCase()) return repl[0].toUpperCase() + repl.slice(1); // Title
  return repl;
}

const RE = new RegExp(`\\b(${Object.keys(US_TO_AU).join("|")})\\b`, "gi");

export function toAustralianEnglish(text: string): string {
  if (!text) return text;
  return text.replace(RE, (m) => applyCase(m, US_TO_AU[m.toLowerCase()]));
}
