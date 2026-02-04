// 100 Notable Names compiled from DOJ releases (Dec 2025 - Jan 2026)
export interface NotablePerson {
  rank: number;
  name: string;
  category: string;
  description: string;
  slug: string;
}

function createSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const rawNames = [
  // Politicians
  { rank: 1, name: "Donald Trump", category: "Politician", description: "Current U.S. President. Thousands of references; FBI compiled unverified tip-line allegations. Denies wrongdoing." },
  { rank: 2, name: "Bill Clinton", category: "Politician", description: "Former U.S. President. Photos in Epstein's home, flight logs, Epstein invoked Fifth Amendment about him in 2016 deposition." },
  { rank: 3, name: "Al Gore", category: "Politician", description: "Former U.S. Vice President. Listed in flight logs for trips on Epstein's aircraft." },
  { rank: 4, name: "Bill Richardson", category: "Politician", description: "Former Governor of New Mexico and Secretary of Energy (deceased). Named by accusers; denied allegations." },
  { rank: 5, name: "George Mitchell", category: "Politician", description: "Former U.S. Senator and peace envoy. Scholarship renamed after abuse allegations emerged; he denied them." },
  { rank: 6, name: "Alexander Acosta", category: "Politician", description: "Former U.S. Attorney who approved Epstein's lenient 2008 plea deal; later Trump's Labor Secretary." },
  { rank: 7, name: "Stacey Plaskett", category: "Politician", description: "U.S. Virgin Islands Delegate. Was texting Epstein during a 2019 House hearing; censure effort failed." },
  { rank: 8, name: "Peter Mandelson", category: "Politician", description: "Former UK Ambassador to U.S. Resigned from Labour Party. Banking records suggest $75K in Epstein transfers." },
  { rank: 9, name: "Keir Starmer", category: "Politician", description: "UK Prime Minister (mentioned in context of calling for Prince Andrew to cooperate with investigators)." },
  { rank: 10, name: "Ehud Barak", category: "Politician", description: "Former Israeli Prime Minister. Appears frequently; stayed in regular contact for years; denies wrongdoing." },
  { rank: 11, name: "Narendra Modi", category: "Politician", description: "Indian Prime Minister. Name surfaced in files; sparked opposition protests in India demanding his resignation." },
  { rank: 12, name: "Tony Blair", category: "Politician", description: "Former UK Prime Minister. Listed in Epstein's address book ('black book')." },
  { rank: 13, name: "John Kerry", category: "Politician", description: "Former U.S. Secretary of State. Listed in Epstein's printed phone directories." },
  { rank: 14, name: "Andrew Cuomo", category: "Politician", description: "Former New York Governor. Listed in Epstein's 'black book' contact directories." },
  { rank: 15, name: "Robert F. Kennedy Jr.", category: "Politician", description: "Environmental lawyer and presidential candidate. Referenced in released documents." },

  // Royalty
  { rank: 16, name: "Prince Andrew", category: "Royalty", description: "Formerly Prince Andrew. Hundreds of mentions; photos over unidentified woman; emails about Buckingham Palace dinners. Stripped of titles." },
  { rank: 17, name: "Sarah Ferguson", category: "Royalty", description: "Duchess of York. Epstein paid her debts; she continued emailing him for advice months after publicly cutting ties." },
  { rank: 18, name: "Mette-Marit", category: "Royalty", description: "Crown Princess of Norway. Files led to increased scrutiny of her connections to Epstein." },

  // Tech Billionaires
  { rank: 19, name: "Elon Musk", category: "Tech", description: "Tesla/SpaceX CEO. Email exchanges about island visits in 2012-2014; scheduling notes for island trip. Says he declined invitations." },
  { rank: 20, name: "Bill Gates", category: "Tech", description: "Microsoft co-founder. Epstein sent himself unverified allegations about Gates. Gates spokesperson calls claims 'absurd and completely false.'" },
  { rank: 21, name: "Jeff Bezos", category: "Tech", description: "Amazon founder. Mentioned in email placing him at a Maxwell after-party in 2009." },
  { rank: 22, name: "Sergey Brin", category: "Tech", description: "Google co-founder. Made plans to meet Epstein/Maxwell at NYC townhouse; offered to bring Google CEO Eric Schmidt." },
  { rank: 23, name: "Eric Schmidt", category: "Tech", description: "Former Google CEO. Referenced in Brin's emails offering to bring him to dinner at Epstein's home." },
  { rank: 24, name: "Reid Hoffman", category: "Tech", description: "LinkedIn co-founder. Mentioned in fundraising activities and social meetings; apologized for interacting with Epstein." },
  { rank: 25, name: "Peter Thiel", category: "Tech", description: "PayPal co-founder. Documents show Epstein maintained connections with him." },
  { rank: 26, name: "Mark Zuckerberg", category: "Tech", description: "Meta/Facebook CEO. Previously known to have attended events where Epstein was present." },
  { rank: 27, name: "Larry Page", category: "Tech", description: "Google co-founder. Previously known social connection to Epstein." },

  // Business/Finance
  { rank: 28, name: "Howard Lutnick", category: "Business", description: "U.S. Commerce Secretary. Emails show family visited Epstein's island in 2012, contradicting prior statements of cutting ties." },
  { rank: 29, name: "Leslie Wexner", category: "Business", description: "L Brands founder. Epstein's primary financial patron; files detail transfer of vast assets and power of attorney." },
  { rank: 30, name: "Leon Black", category: "Business", description: "Apollo Global founder. Referenced in financial and meeting logs; admitted paying Epstein millions for tax advice." },
  { rank: 31, name: "Steve Tisch", category: "Business", description: "NY Giants co-owner, film producer. Mentioned 400+ times; Epstein offered to connect him with women." },
  { rank: 32, name: "Casey Wasserman", category: "Business", description: "LA 2028 Olympics chairman. Exchanged flirty emails with Maxwell. Says he never had a relationship with Epstein." },
  { rank: 33, name: "Jes Staley", category: "Business", description: "Former Barclays CEO. Named as executor of Epstein estate; deep financial ties documented." },
  { rank: 34, name: "Mortimer Zuckerman", category: "Business", description: "Media executive and real estate investor. Former Harvard/Yale professor. Named in files." },
  { rank: 35, name: "Tom Barrack", category: "Business", description: "Investor and Trump ally. Longtime friend of Epstein referenced in documents." },
  { rank: 36, name: "Glenn Dubin", category: "Business", description: "Hedge fund manager. Features frequently in financial and social logs; denies knowledge of wrongdoing." },
  { rank: 37, name: "Ronald Perelman", category: "Business", description: "Billionaire investor. Previously known social connection documented in files." },
  { rank: 38, name: "Tom Pritzker", category: "Business", description: "Hyatt Hotels Executive Chairman. Named in legal documents; denies inappropriate conduct." },
  { rank: 39, name: "Rupert Murdoch", category: "Business", description: "Media mogul. Listed in Epstein's printed phone directories ('black books')." },
  { rank: 40, name: "David Koch", category: "Business", description: "Industrialist (deceased). Listed in Epstein's 'black book' contact directories." },
  { rank: 41, name: "Lewis Ranieri", category: "Business", description: "Pioneer of mortgage-backed securities. Previously known Epstein social contact." },
  { rank: 82, name: "Richard Branson", category: "Business", description: "Virgin Group founder. Email exchanges; photo on tropical island with Epstein. Company says dealings were 'limited.'" },
  { rank: 83, name: "Steve Bannon", category: "Business", description: "Former Trump strategist. Hundreds of friendly texts; discussed politics, travel, documentary to salvage Epstein's image." },
  { rank: 88, name: "Michael Bloomberg", category: "Business", description: "Former NYC Mayor, media mogul. Listed in Epstein's printed phone directories." },
  { rank: 89, name: "Eva Andersson-Dubin", category: "Business", description: "Former Miss Sweden, physician. Once dated Epstein; continued social correspondence as part of his close circle." },
  { rank: 90, name: "Jean-Luc Brunel", category: "Business", description: "French modeling agent (deceased). Named extensively as key associate who procured women for Epstein." },

  // Entertainment
  { rank: 42, name: "Kevin Spacey", category: "Entertainment", description: "Actor. Photographed with Maxwell, Clinton, and others in Epstein's collection." },
  { rank: 43, name: "Chris Tucker", category: "Entertainment", description: "Comedian/actor. Photographed on airport runway with Maxwell." },
  { rank: 44, name: "Woody Allen", category: "Entertainment", description: "Director. Photos socializing with Epstein; messages asking about personal matters." },
  { rank: 45, name: "Mick Jagger", category: "Entertainment", description: "Rolling Stones frontman. Photographed alongside Clinton in documents." },
  { rank: 46, name: "Michael Jackson", category: "Entertainment", description: "Singer (deceased). Photographed with Epstein and separately with Clinton and Diana Ross." },
  { rank: 47, name: "Diana Ross", category: "Entertainment", description: "Singer. Appears in photos with Clinton and Michael Jackson from Epstein's collection." },
  { rank: 48, name: "Jay-Z", category: "Entertainment", description: "Rapper/mogul. Named in unverified FBI hotline tip from 2019; not from Epstein's own logs. Denies involvement." },
  { rank: 49, name: "Harvey Weinstein", category: "Entertainment", description: "Disgraced film producer. Named in the same unverified FBI intake report as Jay-Z." },
  { rank: 50, name: "Pusha T", category: "Entertainment", description: "Rapper. Named in unverified FBI hotline tip; no corroborating evidence found." },
  { rank: 51, name: "Brett Ratner", category: "Entertainment", description: "Film director. Photos show him with Epstein, Brunel, and young women on a couch." },
  { rank: 52, name: "Phil Collins", category: "Entertainment", description: "Musician. He and then-wife Orianne appeared in Epstein's 'Contact Book.'" },
  { rank: 53, name: "Minnie Driver", category: "Entertainment", description: "Actress. Listed in Epstein's 'Contact Book' documents." },
  { rank: 54, name: "Naomi Campbell", category: "Entertainment", description: "Supermodel. Previously known social connection; frequented events with Epstein." },
  { rank: 55, name: "David Copperfield", category: "Entertainment", description: "Magician. Attended gatherings hosted by Epstein; appears in flight logs and dinner schedules." },
  { rank: 56, name: "Walter Cronkite", category: "Entertainment", description: "Journalist (deceased). Photos show him alongside Epstein in a home." },
  { rank: 57, name: "Lady Gaga", category: "Entertainment", description: "Singer. Name appears 2013-2016 in Chopra's emails suggesting philanthropic invites; no evidence of contact with Epstein." },
  { rank: 58, name: "Timothee Chalamet", category: "Entertainment", description: "Actor. Mentioned in passing in a 2018 publicist email about Woody Allen/MeToo; no direct Epstein connection." },
  { rank: 59, name: "Alec Baldwin", category: "Entertainment", description: "Actor. Listed in Epstein's printed phone directories ('black book')." },
  { rank: 60, name: "Katie Couric", category: "Entertainment", description: "Journalist. Previously known to have attended events where Epstein was present." },
  { rank: 84, name: "Mira Nair", category: "Entertainment", description: "Filmmaker (mother of NYC Mayor Mamdani). Mentioned in 2009 email about attending a Maxwell after-party; no wrongdoing implied." },
  { rank: 86, name: "Carole Radziwill", category: "Entertainment", description: "Reality TV star (Real Housewives). Mentioned multiple times; received FedEx package from Maxwell; says she didn't know about crimes." },
  { rank: 87, name: "Whitney Sudler-Smith", category: "Entertainment", description: "Southern Charm producer. Mentioned in 2014 email about someone relaying a dinner meeting to Epstein." },
  { rank: 92, name: "Caroline Stanbury", category: "Entertainment", description: "Reality TV star. Named on a 'wish list' of actresses sent to Ghislaine Maxwell." },

  // Media
  { rank: 61, name: "Peggy Siegal", category: "Media", description: "Hollywood publicist. Described as a key connector between Epstein and celebrities; her emails reference many names." },
  { rank: 62, name: "David Brooks", category: "Media", description: "NYT columnist. Pictured at a dinner alongside Sergey Brin in Epstein's photo collection." },
  { rank: 63, name: "Dr. Mehmet Oz", category: "Media", description: "TV doctor, now CMS Administrator. 2004 transaction report shows Epstein paid for his travel; exchanged emails in 2016." },
  { rank: 85, name: "George Stephanopoulos", category: "Media", description: "ABC News anchor. Previously known to have attended events where Epstein was present." },
  { rank: 93, name: "Merrie Spaeth", category: "Media", description: "Former Reagan media adviser. Coached Epstein on crisis communications and drafted apology letters." },

  // Academics & Scientists
  { rank: 64, name: "Noam Chomsky", category: "Academic", description: "MIT linguist. 50+ document mentions; wrote letter calling Epstein a 'highly valued friend'; photographed on his plane." },
  { rank: 65, name: "Larry Summers", category: "Academic", description: "Former Treasury Secretary/Harvard president. Intimate personal chats with Epstein; called interactions 'a major error of judgment.'" },
  { rank: 66, name: "Stephen Hawking", category: "Academic", description: "Physicist (deceased). Referenced regarding a sponsored conference organized by Epstein." },
  { rank: 67, name: "Marvin Minsky", category: "Academic", description: "AI pioneer (deceased). Named in depositions; allegations of misconduct on visits to Epstein properties." },
  { rank: 68, name: "Lawrence Krauss", category: "Academic", description: "Theoretical physicist. Mentioned in relation to scientific events organized and funded by Epstein." },
  { rank: 69, name: "Stephen Kosslyn", category: "Academic", description: "Harvard psychologist/neuroscientist. Named in file documents." },
  { rank: 70, name: "Joi Ito", category: "Academic", description: "Former MIT Media Lab director. Named in documents; resigned from MIT in 2019 over Epstein ties." },
  { rank: 71, name: "Boris Nikolic", category: "Academic", description: "Former Gates science advisor. Named in draft emails where Epstein allegedly used his name as proxy." },

  // Legal
  { rank: 72, name: "Alan Dershowitz", category: "Legal", description: "Harvard Law professor emeritus. Photographed with Epstein; long-known connections; denied accusations." },
  { rank: 73, name: "Kenneth Starr", category: "Legal", description: "Former independent counsel (deceased). Previously known to have been part of Epstein's legal team." },
  { rank: 74, name: "Alex Spiro", category: "Legal", description: "Attorney. Described as a 'stone cold killer' in files; represents Jay-Z and formerly represented Weinstein." },
  { rank: 75, name: "Kathryn Ruemmler", category: "Legal", description: "Former Obama White House Counsel. Said she 'adores' Epstein in 2015 email; met with him dozens of times." },

  // Diplomats
  { rank: 76, name: "Miroslav Lajcak", category: "Diplomat", description: "Former UN General Assembly president. Resigned as Slovakia's national security adviser after files revealed communications." },
  { rank: 77, name: "Joanna Rubinstein", category: "Diplomat", description: "Former chair of Sweden for UNHCR. Resigned after files showed she visited Epstein's island in 2012." },
  { rank: 78, name: "Kevin Rudd", category: "Diplomat", description: "Former Australian PM. Name surfaced in files amid international fallout." },
  { rank: 79, name: "Mohammed bin Salman", category: "Diplomat", description: "Saudi Crown Prince. Listed in Epstein's printed phone directory ('black book')." },

  // Other
  { rank: 80, name: "Deepak Chopra", category: "Author", description: "Wellness guru. Voice message found in files seeking financial advice from Epstein." },
  { rank: 81, name: "Elie Wiesel", category: "Author", description: "Holocaust survivor and author (deceased). Listed in Epstein's 'Contact Book' documents." },

  // Epstein's Inner Circle
  { rank: 91, name: "Ghislaine Maxwell", category: "Inner Circle", description: "Epstein's convicted accomplice. Currently serving 20-year prison sentence for sex trafficking." },
  { rank: 94, name: "Larry Visoski", category: "Inner Circle", description: "Epstein's longtime personal pilot. Named extensively in flight log documentation." },
  { rank: 95, name: "Nadia Marcinkova", category: "Inner Circle", description: "Close friend and purported recruiter for Epstein. Named in investigative documents." },
  { rank: 96, name: "Sarah Kellen", category: "Inner Circle", description: "Former Epstein assistant and scheduler. Named as key associate in trafficking operation." },
  { rank: 97, name: "Lesley Groff", category: "Inner Circle", description: "Epstein's executive assistant. Coordinated scheduling for visits by prominent figures." },
  { rank: 98, name: "Peter Listerman", category: "Inner Circle", description: "Russian model scout described in files as a subject/witness and 'matchmaker.'" },
  { rank: 99, name: "Karyna Shuliak", category: "Inner Circle", description: "Epstein's final partner. A practicing dentist named in personal documents." },
  { rank: 100, name: "Mark Epstein", category: "Inner Circle", description: "Jeffrey Epstein's brother and business associate. Referenced throughout estate documents." },
];

export const notableNames: NotablePerson[] = rawNames.map(p => ({
  ...p,
  slug: createSlug(p.name),
}));

export const categories = [
  { id: "politician", label: "Politicians", color: "bg-blue-500" },
  { id: "royalty", label: "Royalty", color: "bg-purple-500" },
  { id: "tech", label: "Tech Billionaires", color: "bg-green-500" },
  { id: "business", label: "Business & Finance", color: "bg-yellow-500" },
  { id: "entertainment", label: "Entertainment", color: "bg-pink-500" },
  { id: "media", label: "Media", color: "bg-orange-500" },
  { id: "academic", label: "Academics & Scientists", color: "bg-cyan-500" },
  { id: "legal", label: "Legal", color: "bg-indigo-500" },
  { id: "diplomat", label: "Diplomats", color: "bg-teal-500" },
  { id: "author", label: "Authors & Wellness", color: "bg-lime-500" },
  { id: "inner circle", label: "Epstein's Inner Circle", color: "bg-red-500" },
];

export function getPersonBySlug(slug: string): NotablePerson | undefined {
  return notableNames.find(p => p.slug === slug);
}

export function getPersonByName(name: string): NotablePerson | undefined {
  return notableNames.find(p => p.name.toLowerCase() === name.toLowerCase());
}

export function getCategoryInfo(categoryId: string) {
  return categories.find(c => c.id === categoryId.toLowerCase());
}
