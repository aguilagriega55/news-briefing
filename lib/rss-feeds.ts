// International football — shared by both the FOOTBALL and WORLD CUP tabs.
const INTL_FOOTBALL = [
  { name: "BBC Sport Football", url: "http://feeds.bbci.co.uk/sport/football/rss.xml" },
  { name: "MARCA English Football", url: "https://e00-marca.uecdn.es/rss/en/football.xml" },
  { name: "ESPN Soccer", url: "https://www.espn.com/espn/rss/soccer/news" },
  { name: "Sky Sports Football", url: "https://www.skysports.com/rss/12040" },
  { name: "FourFourTwo", url: "https://www.fourfourtwo.com/feeds/all" },
  { name: "The Guardian Football", url: "https://www.theguardian.com/football/rss" },
];

// Permanent FOOTBALL tab: international + Liga MX + Pumas-targeted feeds. The
// Google News queries guarantee Pumas men's and women's coverage, which the
// general Mexican feeds bury behind the rest of Liga MX.
const FOOTBALL_FEEDS = [
  ...INTL_FOOTBALL,
  { name: "Record Mexico", url: "https://www.record.com.mx/rss" },
  { name: "Reforma Deportes", url: "https://www.reforma.com/rss/deportes.xml" },
  { name: "ESPN Mexico", url: "https://espndeportes.espn.com/rss/news" },
  { name: "Pumas UNAM (Google News)", url: "https://news.google.com/rss/search?q=%22Pumas+UNAM%22+Liga+MX&hl=es-419&gl=MX&ceid=MX:es-419" },
  { name: "Pumas Femenil (Google News)", url: "https://news.google.com/rss/search?q=%22Pumas+Femenil%22&hl=es-419&gl=MX&ceid=MX:es-419" },
];

// Temporal WORLD CUP tab: international coverage + ESPN Mexico for El Tri.
const WORLDCUP_FEEDS = [
  ...INTL_FOOTBALL,
  { name: "ESPN Mexico", url: "https://espndeportes.espn.com/rss/news" },
];

export const RSS_FEEDS: Record<string, { name: string; url: string }[]> = {
  finance: [
    { name: "CNBC Top News", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
    { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/" },
    { name: "Financial Times", url: "https://www.ft.com/rss/home" },
    { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex" },
    { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss" },
    { name: "WSJ Markets", url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml" },
  ],
  // Macro / central-bank section. Deliberately built from feeds already proven
  // live elsewhere in this file (banking, business, finance) rather than new
  // economics URLs — the central banks publish decisions and statements
  // straight to RSS, which is where the GDP/CPI/rate story actually breaks.
  // The Google News query is the one invented entry: it catches data releases
  // (ABS, BLS, Eurostat prints) that no single publisher feed reliably carries.
  economy: [
    { name: "Guardian Economics", url: "https://www.theguardian.com/business/economics/rss" },
    { name: "Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml" },
    { name: "ECB News", url: "https://www.ecb.europa.eu/rss/press.html" },
    { name: "Bank of England", url: "https://www.bankofengland.co.uk/rss/news" },
    { name: "RBA Media Releases", url: "https://www.rba.gov.au/rss/rss-cb-media-releases.xml" },
    { name: "Financial Times", url: "https://www.ft.com/rss/home" },
    { name: "Macro Data (Google News)", url: "https://news.google.com/rss/search?q=inflation+OR+GDP+OR+%22interest+rates%22+central+bank&hl=en-AU&gl=AU&ceid=AU:en" },
  ],
  politics: [
    { name: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "The Guardian World", url: "https://www.theguardian.com/world/rss" },
    { name: "The Hill", url: "https://thehill.com/news/feed/" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "The Guardian US", url: "https://www.theguardian.com/us-news/rss" },
    { name: "The Guardian Australia", url: "https://www.theguardian.com/australia-news/rss" },
  ],
  australia: [
    { name: "ABC Australia", url: "https://www.abc.net.au/news/feed/51120/rss.xml" },
    { name: "ABC Australia Top Stories", url: "https://www.abc.net.au/news/feed/45910/rss.xml" },
    { name: "The Guardian Australia", url: "https://www.theguardian.com/australia-news/rss" },
    { name: "SMH Top Stories", url: "https://www.smh.com.au/rss/feed.xml" },
    { name: "The Age", url: "https://www.theage.com.au/rss/feed.xml" },
    { name: "ABC Melbourne", url: "https://www.abc.net.au/news/feed/1534/rss.xml" },
  ],
  // Australian politics. Every URL here was probed live on 3 Oct 2026 — the
  // originally specified paths were mostly dead (ABC 2942 → 500, SMH and Age
  // /politics/rss.xml → 404, Herald Sun → unparseable XML) and rss-fetcher
  // drops failures silently via Promise.allSettled, so the section would have
  // run on two general-interest feeds without ever reporting a problem.
  // Same publishers, corrected paths; Nine mastheads use /rss/politics/federal.
  // Herald Sun has no working feed (already noted for the AFL section above),
  // so Victorian coverage comes from The Age's Victoria feed instead, and the
  // Google News query guarantees the mandatory VIC ELECTION story.
  auspol: [
    { name: "ABC Politics", url: "https://www.abc.net.au/news/feed/1538/rss.xml" },
    { name: "The Guardian Australia Politics", url: "https://www.theguardian.com/australia-news/australian-politics/rss" },
    { name: "SMH Politics", url: "https://www.smh.com.au/rss/politics/federal.xml" },
    { name: "The Age Politics", url: "https://www.theage.com.au/rss/politics/federal.xml" },
    { name: "The Age Victoria", url: "https://www.theage.com.au/rss/national/victoria.xml" },
    { name: "The Conversation AU Politics", url: "https://theconversation.com/au/politics/articles.atom" },
    { name: "Victorian Election (Google News)", url: "https://news.google.com/rss/search?q=%22Victorian+election%22+OR+%22Victorian+state+election%22&hl=en-AU&gl=AU&ceid=AU:en" },
  ],
  football: FOOTBALL_FEEDS,
  worldcup: WORLDCUP_FEEDS,
  sports: [
    // F1
    { name: "Formula 1", url: "https://www.formula1.com/content/fom-website/en/latest/all.xml" },
    { name: "Autosport F1", url: "https://www.autosport.com/rss/feed/f1" },
    { name: "BBC Sport F1", url: "http://feeds.bbci.co.uk/sport/formula1/rss.xml" },
    { name: "Motorsport.com", url: "https://www.motorsport.com/rss/f1/news/" },

    // AFL
    { name: "Guardian AFL", url: "https://www.theguardian.com/sport/afl/rss" },
    { name: "ABC Grandstand", url: "https://www.abc.net.au/news/feed/2942460/rss.xml" },

    // NFL
    { name: "ESPN NFL", url: "https://www.espn.com/espn/rss/nfl/news" },
    { name: "ProFootballTalk", url: "https://profootballtalk.nbcsports.com/feed/" },
    { name: "CBS Sports NFL", url: "https://www.cbssports.com/rss/headlines/nfl/" },
  ],
  // AFL finals. The Google News queries are load-bearing: the odds/tips angle
  // this section is built around lives on SEN, CODE, Fox Sports and bookmaker
  // preview pages that publish no usable RSS of their own. Fox Sports, Herald
  // Sun, SEN and The Roar were all specified but serve 404/403/empty to a feed
  // reader, so they are omitted rather than left in as silent no-ops.
  afl: [
    { name: "AFL.com.au", url: "https://www.afl.com.au/rss" },
    { name: "Guardian AFL", url: "https://www.theguardian.com/sport/afl/rss" },
    { name: "ABC Sport", url: "https://www.abc.net.au/news/feed/45924/rss.xml" },
    { name: "The Age AFL", url: "https://www.theage.com.au/rss/sport/afl.xml" },
    { name: "Zero Hanger", url: "https://www.zerohanger.com/feed/" },
    { name: "AFL Tips & Odds (Google News)", url: "https://news.google.com/rss/search?q=AFL+finals+odds+OR+tips+OR+predictions&hl=en-AU&gl=AU&ceid=AU:en" },
    { name: "AFL Finals (Google News)", url: "https://news.google.com/rss/search?q=AFL+finals+team+news+OR+injury&hl=en-AU&gl=AU&ceid=AU:en" },
  ],
  tech: [
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "Wired", url: "https://www.wired.com/feed/rss" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "MIT Tech Review", url: "https://www.technologyreview.com/feed/" },
    { name: "Hacker News", url: "https://hnrss.org/frontpage" },
  ],
  banking: [
    // Central banks
    { name: "Federal Reserve", url: "https://www.federalreserve.gov/feeds/press_all.xml" },
    { name: "ECB News", url: "https://www.ecb.europa.eu/rss/press.html" },
    { name: "Bank of England", url: "https://www.bankofengland.co.uk/rss/news" },
    { name: "RBA Speeches", url: "https://www.rba.gov.au/rss/rss-cb-speeches.xml" },
    { name: "RBA Media Releases", url: "https://www.rba.gov.au/rss/rss-cb-media-releases.xml" },
    // Banking trade press
    { name: "Banking Dive", url: "https://www.bankingdive.com/feeds/news/" },
    { name: "Finextra", url: "https://www.finextra.com/rss/headlines.aspx" },
    // Markets / finance majors
    { name: "Bloomberg Finance", url: "https://feeds.bloomberg.com/markets/news.rss" },
    { name: "CNBC Finance", url: "https://www.cnbc.com/id/10000664/device/rss/rss.html" },
    { name: "Financial Times", url: "https://www.ft.com/rss/home" },
    { name: "WSJ Markets", url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml" },
    { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/" },
  ],
  running: [
    { name: "Triathlete Magazine", url: "https://www.triathlete.com/feed/" },
    { name: "Trirating", url: "https://trirating.com/feed/" },
    { name: "SwimSwam", url: "https://swimswam.com/feed/" },
    { name: "Swim England", url: "https://www.swimming.org/swimengland/feed/" },
    { name: "VeloNews", url: "https://velonews.com/feed/" },
    { name: "Cycling News", url: "https://www.cyclingnews.com/rss/" },
    { name: "Runner's World", url: "https://www.runnersworld.com/rss/all.xml/" },
  ],
  business: [
    { name: "SmartCompany", url: "https://www.smartcompany.com.au/feed/" },
    { name: "Dynamic Business", url: "https://dynamicbusiness.com.au/feed" },
    { name: "ABC News", url: "https://www.abc.net.au/news/feed/45910/rss.xml" },
    { name: "Sydney Morning Herald", url: "https://www.smh.com.au/rss/feed.xml" },
    { name: "InnovationAus", url: "https://www.innovationaus.com/feed/" },
    { name: "Startup Daily", url: "https://www.startupdaily.net/feed/" },
    { name: "Guardian Economy", url: "https://www.theguardian.com/business/economics/rss" },
  ],
  latest: [
    { name: "NPR News", url: "https://feeds.npr.org/1001/rss.xml" },
    { name: "BBC Top Stories", url: "http://feeds.bbci.co.uk/news/rss.xml" },
    { name: "CBS News", url: "https://www.cbsnews.com/latest/rss/main" },
    { name: "ABC Australia", url: "https://www.abc.net.au/news/feed/45910/rss.xml" },
    { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
    { name: "CNBC", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
  ],
};
