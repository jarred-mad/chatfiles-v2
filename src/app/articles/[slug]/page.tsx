import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query } from '@/lib/database';
import RandomArticles from '@/components/ui/RandomArticles';
import { AdBanner } from '@/components/ui/AdSlot';

// Article data - these are pre-written articles for SEO
const ARTICLES: Record<string, {
  name: string;
  title: string;
  description: string;
  image: string;
  imageCredit: string;
  content: string[];
  relatedSearches: string[];
}> = {
  'bill-clinton-flight-logs': {
    name: 'Bill Clinton',
    title: 'Bill Clinton in the Epstein Files: Flight Logs and Document References',
    description: 'An examination of former President Bill Clinton\'s appearances in the DOJ Epstein files, including flight log references and document mentions.',
    image: '/images/articles/Bill_Clinton.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Former President Bill Clinton appears in numerous documents within the Department of Justice\'s release of the Jeffrey Epstein files. The documents include references to flight logs, correspondence, and various records that mention the 42nd President of the United States. These references span a period from the late 1990s through the mid-2000s, coinciding with Clinton\'s post-presidency years when he was actively involved in global charitable work.',
      'The flight logs, which have been among the most scrutinized documents in the release, record multiple instances of Clinton traveling on Epstein\'s Boeing 727, commonly known as the "Lolita Express." According to these records, Clinton took at least 26 trips on the aircraft between 2001 and 2003. The destinations included Africa, Europe, and Asia, with many flights connected to Clinton Foundation humanitarian missions addressing issues like HIV/AIDS treatment access in developing nations.',
      'Clinton\'s representatives have consistently maintained that these trips were strictly related to charitable endeavors. A 2019 statement from Clinton\'s office acknowledged four trips on Epstein\'s plane but emphasized that staff, supporters, and Secret Service agents were present on each flight. The discrepancy between the flight log count and the official statement has fueled ongoing public interest and media investigation.',
      'The documents also reveal that Clinton and Epstein moved in overlapping social circles during the 1990s and early 2000s. Epstein was a donor to the Clinton Foundation and attended events where both were present. However, Clinton\'s team has stressed that the relationship was not close and that Clinton was unaware of Epstein\'s criminal activities.',
      'Several witnesses mentioned in the documents have provided testimony about Clinton\'s presence at various Epstein-related events and locations. However, no accusers have directly implicated Clinton in any wrongdoing. Virginia Giuffre, one of the most prominent Epstein accusers, stated in a 2011 deposition that she never witnessed Clinton engage in any inappropriate behavior.',
      'The release of these documents has reignited public debate about the relationships between powerful figures and Jeffrey Epstein. For researchers and journalists, the Clinton-related documents provide insight into how Epstein cultivated connections with political elites and leveraged his wealth and social access.',
      'It is important to note that appearing in these documents does not imply wrongdoing. Many prominent individuals appear in the files as acquaintances, business contacts, or in entirely incidental contexts. The documents span decades of Epstein\'s activities and include thousands of names. Clinton has never been charged with any crime related to Epstein, and he has denied any knowledge of or participation in Epstein\'s illegal activities.',
    ],
    relatedSearches: ['Clinton Foundation', 'Flight logs', 'Ghislaine Maxwell'],
  },
  'prince-andrew-settlement': {
    name: 'Prince Andrew',
    title: 'Prince Andrew and the Epstein Connection: What the Documents Reveal',
    description: 'A detailed look at Prince Andrew\'s appearances in the DOJ Epstein files and the documented connections between the Duke of York and Jeffrey Epstein.',
    image: '/images/articles/Prince_Andrew.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Prince Andrew, the Duke of York, features prominently in the Jeffrey Epstein files released by the Department of Justice. As the second son of Queen Elizabeth II, his connection to the convicted sex offender has become one of the most high-profile aspects of the entire Epstein scandal. The documents contain multiple references to the British royal, including allegations that led to a civil lawsuit and his eventual withdrawal from public royal duties.',
      'The relationship between Prince Andrew and Jeffrey Epstein dates back to the early 1990s, when they were introduced through mutual acquaintance Ghislaine Maxwell. Maxwell, the daughter of British media mogul Robert Maxwell, was a longtime associate of the prince and moved in similar social circles. The documents reveal a friendship that spanned over a decade, with Andrew visiting Epstein\'s properties in New York, Palm Beach, and the U.S. Virgin Islands.',
      'One of the most damaging pieces of evidence in the files is a photograph showing Prince Andrew with his arm around Virginia Giuffre (then Virginia Roberts), allegedly taken at Ghislaine Maxwell\'s London townhouse in 2001. Giuffre was 17 at the time. This photograph, combined with Giuffre\'s detailed allegations, formed the basis of her civil lawsuit against the prince.',
      'In November 2019, Prince Andrew gave a now-infamous interview to BBC Newsnight in an attempt to address the allegations. The interview was widely criticized as a public relations disaster. Andrew claimed he had no recollection of meeting Giuffre and offered explanations that many found implausible, including claiming he could not have been sweating at a nightclub because of a medical condition from the Falklands War.',
      'Following the interview, Prince Andrew announced he was stepping back from royal duties "for the foreseeable future." Major corporations and charities severed ties with him, and he lost his military affiliations and royal patronages in January 2022 after Giuffre\'s lawsuit moved forward in U.S. courts.',
      'In February 2022, Prince Andrew reached an out-of-court settlement with Virginia Giuffre for an undisclosed sum, reported to be around £12 million. The settlement included no admission of guilt, and Andrew continued to deny all allegations. As part of the agreement, he made a substantial donation to Giuffre\'s charity supporting victims\' rights.',
      'The DOJ documents include depositions from multiple witnesses who describe seeing Prince Andrew at Epstein\'s properties. Flight logs show trips that coincide with the prince\'s known visits. Correspondence between Epstein, Maxwell, and others references the royal by name and nickname.',
      'Prince Andrew has never been criminally charged in connection with any of the allegations. However, his reputation has been severely damaged, and questions about his relationship with Epstein continue to generate public interest. The documents released by the DOJ provide the most comprehensive publicly available record of his involvement in Epstein\'s social circle.',
    ],
    relatedSearches: ['Virginia Giuffre', 'Royal Family', 'Ghislaine Maxwell'],
  },
  'bill-gates-meetings': {
    name: 'Bill Gates',
    title: 'Bill Gates and Jeffrey Epstein: Documented Meetings and Connections',
    description: 'Examining the documented meetings between Microsoft founder Bill Gates and Jeffrey Epstein as revealed in the DOJ files.',
    image: '/images/articles/Bill_Gates.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Microsoft co-founder Bill Gates appears in documents within the DOJ\'s Epstein files release, revealing a relationship that has become one of the most scrutinized connections between Epstein and the tech elite. The files reference multiple meetings between Gates and Epstein that occurred after Epstein\'s 2008 conviction for soliciting prostitution from a minor—a fact that has raised questions about Gates\'s judgment.',
      'The relationship between Gates and Epstein began around 2011, when they were introduced through mutual connections in the scientific and philanthropic communities. Epstein had cultivated a reputation as a patron of science, hosting dinners with prominent researchers and Nobel laureates at his Manhattan mansion. Gates, through the Bill & Melinda Gates Foundation, was one of the world\'s most influential philanthropists.',
      'According to investigative reports from The New York Times, Gates visited Epstein\'s New York townhouse—one of the largest private residences in Manhattan—on multiple occasions between 2011 and 2014. Scheduling documents and emails obtained by journalists show at least six meetings during this period. Gates also flew on Epstein\'s private jet at least once, from New Jersey to Palm Beach in 2013.',
      'The stated purpose of these meetings was to discuss philanthropy and global health initiatives. Epstein expressed interest in creating a charitable fund with money from wealthy contacts, potentially involving the Gates Foundation. However, Gates has said these discussions never led to any actual collaboration or financial arrangements.',
      'In 2019, following renewed media scrutiny after Epstein\'s arrest and death, Gates publicly addressed the relationship. "I made a mistake in judgment that I thought those conversations, even though they were about philanthropy, global health, were a mistake," Gates told CNN. He described the meetings as a "huge mistake" and expressed regret for any association with Epstein.',
      'The Epstein connection reportedly contributed to strain in Gates\'s marriage to Melinda French Gates. In her 2022 interview with CBS, Melinda stated that meeting with Epstein was one factor in their divorce, saying she was "disturbed" by Bill\'s relationship with Epstein and had made her feelings clear from the beginning.',
      'Documents in the DOJ release include correspondence that references Gates by name in the context of Epstein\'s social calendar and fundraising ambitions. While Gates was not the only tech billionaire in Epstein\'s orbit—the documents also mention other prominent figures—his name appears with notable frequency.',
      'Gates has categorically denied any personal wrongdoing and stated he never had any business relationship with Epstein beyond exploratory philanthropic discussions. He has not been accused of any illegal activity. However, the association has complicated his public image and raised broader questions about how Epstein maintained access to powerful individuals even after his criminal conviction.',
    ],
    relatedSearches: ['Microsoft', 'Philanthropy', 'Melinda Gates'],
  },
  'donald-trump-relationship': {
    name: 'Donald Trump',
    title: 'Donald Trump in the Epstein Files: A Complex History',
    description: 'An analysis of former President Donald Trump\'s appearances in the DOJ Epstein files and their documented history.',
    image: '/images/articles/Donald_Trump.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Former President Donald Trump appears in numerous documents within the DOJ Epstein files, reflecting a social relationship that spanned roughly a decade before souring in the mid-2000s. Both men were prominent figures in the Palm Beach and New York social scenes during the 1990s and early 2000s, and their paths crossed frequently at parties, charity events, and real estate circles.',
      'The Trump-Epstein relationship is documented through various sources in the files, including party guest lists, media reports from the era, and witness testimony. Trump\'s Mar-a-Lago club in Palm Beach was a hub for wealthy socialites, and Epstein was a member for a period. The two were photographed together at multiple events, images that have been widely circulated in media coverage of the Epstein case.',
      'A frequently cited 2002 New York Magazine profile contains Trump\'s most quoted statement about Epstein: "I\'ve known Jeff for fifteen years. Terrific guy. He\'s a lot of fun to be with. It is even said that he likes beautiful women as much as I do, and many of them are on the younger side." This quote has been repeatedly referenced in discussions about Trump\'s awareness of Epstein\'s predatory behavior.',
      'Trump has since distanced himself dramatically from these comments. In 2019, following Epstein\'s arrest, Trump told reporters, "I had a falling out with him a long time ago. I don\'t think I\'ve spoken to him in 15 years. I was not a fan of his." He characterized their relationship as superficial, limited to occasionally seeing each other at Palm Beach gatherings.',
      'According to multiple accounts, Trump banned Epstein from Mar-a-Lago sometime in the mid-2000s. The exact timing and reason remain disputed. Trump\'s version, relayed through attorneys and public statements, is that he expelled Epstein after learning of inappropriate advances toward a club member\'s young daughter. Other accounts suggest the falling out may have been related to a real estate dispute over a Palm Beach mansion they both bid on.',
      'The documents contain references to at least one instance of Trump flying on Epstein\'s plane, though the flight logs show far fewer trips than those recorded for other prominent figures. Court documents from a 2009 lawsuit include a claim that Trump flew from Palm Beach to New York on Epstein\'s jet, which Trump\'s representatives have acknowledged as a single occurrence.',
      'In 2019, Alexander Acosta, Trump\'s Secretary of Labor, resigned after renewed scrutiny of his role in negotiating Epstein\'s lenient 2008 plea deal when Acosta was U.S. Attorney for Southern Florida. Trump accepted the resignation but defended Acosta\'s performance in his cabinet.',
      'Trump has never been charged with any crime related to Epstein. One accuser filed a lawsuit in 2016 alleging Trump assaulted her at an Epstein party when she was a minor, but the suit was withdrawn before the election. No evidence corroborating these claims has emerged in the DOJ documents. Trump has denied any wrongdoing and has pointed to his cooperation with Epstein investigators as evidence of his distancing from the financier.',
    ],
    relatedSearches: ['Mar-a-Lago', 'Palm Beach', 'New York society'],
  },
  'ghislaine-maxwell-role': {
    name: 'Ghislaine Maxwell',
    title: 'Ghislaine Maxwell: The Key Figure in the Epstein Files',
    description: 'Understanding Ghislaine Maxwell\'s central role in the Epstein case through the DOJ document release.',
    image: '/images/articles/Ghislaine_Maxwell.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Ghislaine Maxwell is the most frequently mentioned individual in the Epstein files after Jeffrey Epstein himself, appearing in thousands of documents that span nearly three decades. The British socialite and daughter of disgraced media mogul Robert Maxwell was convicted in December 2021 on federal charges of sex trafficking and conspiracy, marking the most significant legal accountability in the Epstein case following his death.',
      'Born in 1961, Ghislaine Maxwell grew up in extraordinary privilege as the youngest child of Robert Maxwell, a billionaire newspaper publisher. After her father\'s mysterious death in 1991—he fell from his yacht under suspicious circumstances, leaving behind a financial empire riddled with fraud—Ghislaine relocated to New York City. There, she entered a relationship with Jeffrey Epstein that would define the rest of her life.',
      'The DOJ documents paint a detailed picture of Maxwell\'s role in Epstein\'s world. She was far more than a romantic partner; prosecutors characterized her as Epstein\'s "partner in crime." The files show her managing Epstein\'s extensive property portfolio, coordinating his social calendar, hiring household staff, and—most damningly—allegedly identifying and grooming young victims.',
      'Victim testimony preserved in the documents describes a consistent pattern. Maxwell would approach young women, often teenagers from disadvantaged backgrounds, and befriend them. She would normalize sexual discussions and physical contact, gradually preparing them for abuse by Epstein. Multiple victims described Maxwell as present during their abuse, and some alleged she participated directly.',
      'The scope of Maxwell\'s involvement is evident in the flight logs, address books, and correspondence contained in the files. Her name appears on hundreds of flights aboard Epstein\'s aircraft. Her contacts extended throughout elite circles on both sides of the Atlantic, leveraging her family\'s social standing and her own charm to maintain Epstein\'s access to powerful people.',
      'Maxwell\'s trial in late 2021 brought many of these documents into public view. Four women testified about abuse they suffered as minors, with Maxwell facilitating their exploitation. The jury convicted her on five of six counts, including the most serious charge of sex trafficking of a minor. In June 2022, Judge Alison Nathan sentenced Maxwell to 20 years in federal prison.',
      'The documents also reveal the efforts Maxwell and Epstein made to protect themselves. Legal correspondence shows coordinated strategies to silence accusers. Financial records indicate payments to potential witnesses. The files demonstrate how wealth and connections were deployed to obstruct justice for years.',
      'Maxwell has maintained her innocence, and her attorneys have signaled intent to appeal. She is currently incarcerated at FCI Tallahassee, a low-security federal prison in Florida. The documents released by the DOJ represent the most comprehensive public record of her activities and provide crucial evidence for victims seeking to understand the full scope of the operation that victimized them.',
    ],
    relatedSearches: ['Sex trafficking', 'Conviction', 'Robert Maxwell'],
  },
  'alan-dershowitz-defense': {
    name: 'Alan Dershowitz',
    title: 'Alan Dershowitz: From Epstein\'s Defense Team to the Document Files',
    description: 'How renowned attorney Alan Dershowitz appears in the Epstein files, both as legal counsel and in allegations.',
    image: '/images/articles/Alan_Dershowitz.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Alan Dershowitz, the renowned Harvard Law professor emeritus and celebrity defense attorney, appears extensively in the Epstein documents in multiple and complex capacities. His involvement spans his professional work as Epstein\'s attorney, social connections documented in the files, and serious allegations made against him by one of Epstein\'s most prominent accusers.',
      'Dershowitz first entered Epstein\'s orbit professionally in 2006 when he joined the legal team defending Epstein against allegations in Florida. He worked alongside other high-profile attorneys including Kenneth Starr and Jay Lefkowitz. The defense team successfully negotiated what became known as the "sweetheart deal"—a controversial plea agreement that allowed Epstein to plead guilty to state prostitution charges and serve just 13 months in county jail with generous work release privileges.',
      'The documents reveal the extent of Dershowitz\'s involvement in crafting the plea agreement. Legal correspondence shows him advocating aggressively for favorable terms, including a non-prosecution agreement that protected Epstein\'s alleged co-conspirators. This NPA was later ruled unconstitutional by a federal judge for failing to notify victims, though this ruling came too late to affect Epstein\'s sentence.',
      'Beyond his legal representation, the files show Dershowitz had a social relationship with Epstein. He appears in flight logs and was a guest at Epstein\'s properties. Dershowitz has acknowledged these visits but characterized them as professional and social calls where he met other prominent individuals, including scientists and academics Epstein hosted.',
      'In 2014, Virginia Giuffre named Dershowitz in a court filing, alleging that Epstein and Maxwell had directed her to have sexual encounters with the attorney when she was a minor. Dershowitz responded with immediate and forceful denials, calling the allegations "totally false" and accusing Giuffre and her attorneys of fabrication.',
      'What followed was years of contentious litigation. Dershowitz filed defamation claims against Giuffre, and she countersued. The documents released by the DOJ include depositions and legal filings from this period, where both parties made extensive arguments about their credibility. The legal battle generated significant media attention and raised questions about how allegations against powerful individuals are adjudicated.',
      'In a dramatic development in 2024, Giuffre released a statement through her attorneys saying she "may have made a mistake" in identifying Dershowitz as one of her abusers. She acknowledged the possibility of being "manipulated" into making the allegations. Dershowitz declared this a complete vindication after years of what he called a "nightmare" of false accusations.',
      'The resolution of the Giuffre-Dershowitz dispute does not alter his documented role as Epstein\'s attorney or his presence in Epstein\'s social circle. For researchers examining the DOJ files, Dershowitz\'s appearances illuminate how Epstein assembled legal talent to protect himself and how those professional relationships sometimes blurred into social ones. Dershowitz continues to write and speak about the case, maintaining he was a victim of false allegations while defending his professional work on Epstein\'s behalf.',
    ],
    relatedSearches: ['Harvard Law', 'Virginia Giuffre', 'Legal defense'],
  },
  'les-wexner-connection': {
    name: 'Les Wexner',
    title: 'Les Wexner: The Billionaire Behind Epstein\'s Fortune',
    description: 'How retail magnate Les Wexner became Epstein\'s biggest benefactor and the mysterious financial relationship revealed in the files.',
    image: '/images/articles/Les_Wexner.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Leslie "Les" Wexner, the billionaire founder of L Brands (parent company of Victoria\'s Secret, Bath & Body Works, and The Limited), maintained one of the most puzzling and consequential relationships with Jeffrey Epstein documented in the DOJ files. Their connection, which spanned from the mid-1980s until 2007, resulted in Epstein gaining extraordinary financial power and access to elite circles.',
      'The relationship began around 1987 when Wexner, then one of America\'s wealthiest men, hired Epstein as his financial advisor. What made this arrangement extraordinary was that Epstein had no formal financial credentials—he had been fired from Bear Stearns in 1981 and had a murky professional history. Yet Wexner gave him sweeping power of attorney, access to his fortune, and an intimate role in managing his affairs.',
      'The documents reveal the extent of Epstein\'s control over Wexner\'s finances. Epstein had authority to sign checks, execute trades, hire employees, and make major financial decisions on Wexner\'s behalf. He was the only person outside the Wexner family to have such access. This arrangement continued for nearly two decades.',
      'Most controversially, Wexner transferred ownership of his Manhattan townhouse—the infamous 9 East 71st Street property—to Epstein. This limestone mansion, one of the largest private residences in New York City, became the location where numerous alleged crimes took place. The transfer was made for the nominal price of $0, though Epstein would later claim he had paid for it. The exact terms of this transfer remain disputed.',
      'Wexner has claimed he severed ties with Epstein around 2007, following Epstein\'s Florida arrest. In 2019, Wexner stated he had discovered that Epstein had "misappropriated" more than $46 million of his fortune. However, there is no record of Wexner pursuing legal action to recover these funds, raising questions about the nature of their arrangement.',
      'The files contain documents showing Epstein\'s involvement in Victoria\'s Secret operations. He reportedly used his connection to the modeling brand to approach young women, sometimes claiming he was a talent scout. Several victims have alleged that Epstein used Victoria\'s Secret as a lure, promising modeling opportunities.',
      'Maria Farmer, one of the first women to report Epstein to the FBI (in 1996), described encounters at Wexner\'s Ohio compound, where she worked as an artist. Her allegations, detailed in the files, suggest that Wexner\'s properties were used in Epstein\'s operations, though Wexner has denied knowledge of any improper activities.',
      'Wexner stepped down as L Brands CEO in 2020 amid the renewed Epstein scandal. He has never been charged with any crime and maintains he was deceived by Epstein. The DOJ files provide extensive documentation of their financial entanglement but leave unresolved questions about how much Wexner knew of Epstein\'s activities during their long association.',
    ],
    relatedSearches: ['Victoria\'s Secret', 'L Brands', 'Maria Farmer', 'Ohio'],
  },
  'flight-logs-analysis': {
    name: 'Flight Logs',
    title: 'The Epstein Flight Logs: A Complete Analysis of the "Lolita Express" Records',
    description: 'Deep dive into the flight records of Epstein\'s private aircraft, including who flew and when.',
    image: '/images/articles/Flight_Logs.jpg',
    imageCredit: 'DOJ Release',
    content: [
      'The flight logs from Jeffrey Epstein\'s private aircraft—particularly his Boeing 727-200, infamously dubbed the "Lolita Express"—represent some of the most scrutinized documents in the entire DOJ release. These records, spanning from 1995 to 2013, document thousands of flights and hundreds of passengers who traveled on Epstein\'s planes.',
      'Epstein owned or had access to multiple aircraft over the years. His Boeing 727 (tail number N908JE) was the largest and most notorious, capable of carrying dozens of passengers on intercontinental flights. He also operated a Gulfstream IV and later a Gulfstream G550. The flight logs from all these aircraft are included in the released documents.',
      'The logs follow standard aviation record-keeping format, documenting departure and arrival locations, dates, times, and most significantly—passenger manifests. These handwritten records list names of passengers on each leg of each flight. The documents reveal a staggering network of high-profile individuals who flew with Epstein.',
      'Among the most frequent flyers documented in the logs: Bill Clinton appears on approximately 26 flight entries, primarily to destinations in Africa and Asia during Clinton Foundation humanitarian missions. Prince Andrew is recorded on multiple flights to various Epstein properties. Ghislaine Maxwell appears more than any other individual besides Epstein himself.',
      'Other notable names appearing in the flight logs include: Kevin Spacey, Chris Tucker, Naomi Campbell, and various scientists, politicians, and business figures. It is crucial to note that appearance in flight logs does not imply involvement in any illegal activity—many passengers were traveling for legitimate business, charitable, or social purposes.',
      'The logs also document frequent trips to Epstein\'s private island, Little St. James, in the U.S. Virgin Islands. Flights to and from St. Thomas (the nearest commercial airport) are extensively recorded. These entries have been particularly scrutinized given allegations about activities that occurred on the island.',
      'Several anomalies in the logs have drawn investigative attention. Some entries show passengers recorded only by first name or initials. Others list generic descriptions like "female" without names. These gaps in documentation have fueled speculation and investigation about whether certain travelers were deliberately obscured.',
      'The flight logs represent just one piece of evidence in understanding Epstein\'s operation. They demonstrate how his aircraft served as mobile gathering spaces for the elite—and potentially as tools for transporting victims across state and international lines, which formed the basis for federal trafficking charges.',
    ],
    relatedSearches: ['Boeing 727', 'Gulfstream', 'Little St. James', 'N908JE'],
  },
  'black-book-contacts': {
    name: 'Black Book',
    title: 'Epstein\'s Black Book: The Contact List That Shocked the World',
    description: 'Inside the infamous address book containing phone numbers and contact details of the world\'s most powerful people.',
    image: '/images/articles/Black_Book.jpg',
    imageCredit: 'Court Records',
    content: [
      'Jeffrey Epstein\'s personal address book, known colloquially as the "Black Book," contains approximately 1,500 names and has become one of the most analyzed documents in the case. First leaked by a former employee in 2009, the complete book is now part of the DOJ release and provides an unprecedented window into Epstein\'s vast network of contacts.',
      'The book is organized alphabetically and includes not just names but multiple phone numbers, addresses, and personal details for each entry. Many entries include notations in Epstein\'s hand, with some contacts marked with a circled black dot—the meaning of which has been the subject of intense speculation.',
      'The roster reads like a who\'s who of global power: heads of state, Nobel laureates, Hollywood celebrities, Wall Street titans, European royalty, and prominent politicians from across the political spectrum. The book includes entries for Donald Trump (with 14 phone numbers), Bill Clinton, Prince Andrew, Michael Bloomberg, David Koch, Rupert Murdoch, Mick Jagger, Ralph Fiennes, Courtney Love, and hundreds of others.',
      'What makes the black book significant for investigators is its inclusion of details that go beyond normal business contacts. Some entries include names of household staff and personal schedulers, suggesting intimate access to these individuals\' lives. Others have annotations that appear to relate to travel arrangements or meeting schedules.',
      'Particularly concerning entries include those for massage therapists, some designated as available "24 hours" or with notes about their ages. Investigators have cross-referenced these entries with known victims and alleged co-conspirators in Epstein\'s trafficking operation.',
      'The existence of someone\'s name in the book does not imply criminal involvement—Epstein collected contacts obsessively and many entries appear to be standard business or social acquaintances. However, the book has been invaluable for establishing the scope of Epstein\'s social network and identifying potential witnesses.',
      'Several individuals listed in the book have been subpoenaed or deposed in various civil cases. The document has helped journalists map Epstein\'s social movements and identify events or locations where he came into contact with particular individuals. It remains one of the most referenced documents for researchers studying the case.',
      'The black book also serves as evidence of how Epstein cultivated and maintained powerful connections. His ability to collect such a comprehensive directory of elite contacts speaks to his social engineering skills and raises continuing questions about how he leveraged these relationships.',
    ],
    relatedSearches: ['Contact list', 'Address book', 'Powerful contacts'],
  },
  'jean-luc-brunel-modeling': {
    name: 'Jean-Luc Brunel',
    title: 'Jean-Luc Brunel: The Modeling Agent in Epstein\'s Network',
    description: 'The dark story of French modeling agent Jean-Luc Brunel and his decades-long connection to Jeffrey Epstein.',
    image: '/images/articles/Jean_Luc_Brunel.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Jean-Luc Brunel, the French modeling agent who founded MC2 Model Management with financial backing from Jeffrey Epstein, appears throughout the DOJ files as one of Epstein\'s closest and most troubling associates. Brunel\'s connections to the modeling industry provided Epstein with access to vulnerable young women on multiple continents.',
      'Brunel entered the modeling world in the 1970s and 1980s, founding and running agencies including Karin Models and Euro Models. Even before his association with Epstein, Brunel had faced allegations of sexual misconduct from models. A 1988 CBS investigation and a 1999 book by journalist Michael Gross documented accusations against him.',
      'The relationship between Epstein and Brunel intensified in the early 2000s when Epstein provided financial backing for MC2, which operated offices in New York, Miami, and Tel Aviv. The files contain financial records showing Epstein\'s investments in the agency and payments flowing between the two men.',
      'Multiple victims have alleged that Brunel procured girls for Epstein. Virginia Giuffre testified that she was trafficked to have sex with Brunel on multiple occasions and that he brought what she described as a "constant stream" of young women and girls to Epstein. The flight logs show Brunel as one of the most frequent passengers on Epstein\'s aircraft.',
      'Documents in the release include visa applications and travel records showing Brunel facilitating the movement of young models, primarily from Eastern Europe and South America, into the United States. Some of these women later alleged they were sexually exploited upon arrival.',
      'Brunel\'s prominence in the fashion industry provided cover for suspicious activities. He had legitimate business reasons to work with young models and to facilitate their travel. This made it difficult for victims to identify wrongdoing and for authorities to investigate.',
      'In December 2020, French authorities arrested Brunel on charges of rape of minors, sexual harassment, and sex trafficking as part of their investigation into the Epstein network. However, in February 2022, Brunel was found dead in his Paris jail cell in an apparent suicide—a death that drew immediate comparisons to Epstein\'s own demise in a New York detention facility.',
      'Brunel\'s death foreclosed the possibility of a trial that many hoped would expose more details about the modeling industry\'s connections to Epstein. The DOJ files remain among the most comprehensive public records of his activities and his role in what prosecutors characterized as an international trafficking operation.',
    ],
    relatedSearches: ['MC2 Models', 'Modeling industry', 'France', 'Virginia Giuffre'],
  },
  'private-islands-caribbean': {
    name: 'Private Islands',
    title: 'Epstein\'s Private Islands: Little St. James and Great St. James',
    description: 'Inside the Caribbean properties where Epstein allegedly conducted his most egregious crimes.',
    image: '/images/articles/Little_St_James.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Jeffrey Epstein\'s private islands in the U.S. Virgin Islands—Little St. James and Great St. James—feature prominently in the DOJ documents as alleged sites of systematic sexual abuse. These Caribbean properties, located near St. Thomas, provided Epstein with isolated locations where victims had no easy means of escape or communication.',
      'Little St. James, approximately 70 acres, was purchased by Epstein in 1998 for $7.95 million. He subsequently developed the island extensively, constructing multiple buildings including a main residential compound, guest houses, a library, cinema, a gym, and—most mysteriously—a striped temple-like structure visible in aerial photographs. The island became known locally as "Pedophile Island" or "Orgy Island."',
      'The files contain testimony from multiple victims who describe being transported to Little St. James, where they allege they were sexually abused by Epstein and trafficked to other powerful individuals. The isolation of the island made these crimes particularly insidious—victims were far from help and entirely dependent on Epstein for transportation back to the mainland.',
      'Property records and construction documents in the release detail the extensive infrastructure Epstein built on Little St. James. The island had its own power and water systems, a helipad, a private dock, and was staffed by a rotating crew of workers, many of whom were imported from other countries and reportedly signed strict non-disclosure agreements.',
      'In 2016, Epstein purchased neighboring Great St. James for $18 million, expanding his Caribbean holdings to nearly 170 acres combined. Development work on Great St. James was still underway at the time of his 2019 arrest. Workers described unusual construction requirements and restrictions on their movement and communication.',
      'Following Epstein\'s death, the U.S. Virgin Islands government filed a civil lawsuit against his estate, alleging decades of sexual abuse on the islands and seeking the forfeiture of both properties. The suit included detailed allegations based on employment records, victim testimony, and financial documents, many of which overlap with the DOJ release.',
      'The mysterious temple structure on Little St. James has generated enormous public fascination. Aerial photography shows a white building with blue and gold stripes and a gold dome. Workers who helped construct it have given conflicting accounts of its purpose, with explanations ranging from a music room to a gymnasium. The structure was damaged by hurricanes but remains standing.',
      'The islands were eventually sold in 2023 to a private buyer for approximately $60 million, with proceeds going to compensate Epstein\'s victims. The fate of the structures and whether they will be preserved or demolished remains undetermined. For investigators and journalists, the properties represent physical evidence of Epstein\'s operation and a haunting reminder of the crimes alleged to have occurred there.',
    ],
    relatedSearches: ['Little St. James', 'Great St. James', 'U.S. Virgin Islands', 'Temple'],
  },
  'epstein-prison-death': {
    name: 'Epstein Death',
    title: 'The Death of Jeffrey Epstein: Questions and Conspiracy Theories',
    description: 'Examining the circumstances surrounding Epstein\'s death in federal custody and the ongoing questions it has raised.',
    image: '/images/articles/MCC_New_York.jpg',
    imageCredit: 'Public Domain',
    content: [
      'Jeffrey Epstein was found dead in his cell at the Metropolitan Correctional Center (MCC) in New York City on August 10, 2019. The official ruling was suicide by hanging, but the circumstances have fueled widespread skepticism and conspiracy theories that persist to this day. Documents in the DOJ release provide some context for the events leading to his death.',
      'Epstein had been arrested on July 6, 2019, on federal charges of sex trafficking minors. He was denied bail and held at MCC, one of the most secure federal detention facilities in the country. Three weeks before his death, he was found injured in his cell in an apparent suicide attempt, leading to his placement on suicide watch.',
      'Crucially, Epstein was removed from suicide watch just six days before his death—a decision that has been heavily criticized. The files include Bureau of Prisons protocols that were seemingly violated in the days leading to his death. Two guards assigned to check on Epstein every 30 minutes allegedly fell asleep and falsified log entries claiming they had made their rounds.',
      'Security footage that could have captured activity outside Epstein\'s cell was reported to be unusable due to camera malfunctions—an explanation met with widespread disbelief given the facility\'s high-security status and Epstein\'s high-profile nature. The FBI and Department of Justice Inspector General both launched investigations.',
      'Medical examiner Barbara Sampson ruled the death a suicide by hanging. However, a forensic pathologist hired by Epstein\'s brother disagreed, pointing to evidence more consistent with homicidal strangulation, including broken bones in the neck. This conflicting expert opinion has fueled ongoing debate about the true cause of death.',
      'The phrase "Epstein didn\'t kill himself" became a viral meme and political statement, reflecting public skepticism about the official account. Given Epstein\'s connections to powerful individuals worldwide—some of whom might have been exposed had he testified—many found it difficult to believe that his death in federal custody was coincidental.',
      'The two guards who were supposed to be monitoring Epstein initially faced federal charges for falsifying records, but these charges were dismissed after they completed community service. Neither faced consequences proportional to what critics called a catastrophic failure that allowed a high-profile prisoner to die.',
      'Epstein\'s death foreclosed the possibility of a trial that could have produced testimony about his associates and the full scope of his operation. While civil suits and the Maxwell prosecution have revealed substantial information, many questions that only Epstein could answer died with him. The circumstances of his death remain one of the most controversial aspects of the entire case.',
    ],
    relatedSearches: ['MCC', 'Suicide', 'Metropolitan Correctional Center', 'Investigation'],
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface DocCountRow {
  count: string;
}

interface DocRow {
  id: string;
  filename: string;
  dataset_number: number;
}

export async function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: `${article.title} | ChatFiles.org`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: [article.image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) {
    notFound();
  }

  // Get document count from database
  let documentCount = 0;
  let sampleDocs: DocRow[] = [];

  try {
    const countResult = await query<DocCountRow>(
      `SELECT COUNT(*) as count FROM documents WHERE filename ILIKE $1 OR text_content ILIKE $1`,
      [`%${article.name}%`]
    );
    documentCount = parseInt(countResult[0]?.count || '0', 10);

    sampleDocs = await query<DocRow>(
      `SELECT id, filename, dataset_number FROM documents
       WHERE filename ILIKE $1 OR text_content ILIKE $1
       ORDER BY dataset_number LIMIT 5`,
      [`%${article.name}%`]
    );
  } catch (e) {
    console.error('Database error:', e);
  }

  const shareUrl = `https://chatfiles.org/articles/${slug}`;
  const shareText = `${article.title} - Read the full analysis at ChatFiles.org`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ad Banner */}
      <AdBanner className="py-4 bg-gray-100" />

      {/* Article Header */}
      <article className="max-w-4xl mx-auto">
        {/* Hero Image */}
        <div className="relative h-72 md:h-96 bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt={article.name}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="text-sm text-gray-300 mb-2">
              Photo: {article.imageCredit}
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white shadow-lg">
          <div className="p-6 md:p-10">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {documentCount.toLocaleString()} Documents Found
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI-Generated Article
              </span>
              <span className="text-gray-500 text-sm">
                ChatFiles.org
              </span>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {article.content.map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Documents Section */}
            {sampleDocs.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Sample Documents Mentioning {article.name}
                </h2>
                <div className="space-y-2 mb-4">
                  {sampleDocs.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-accent">{doc.filename}</span>
                      <span className="text-xs text-gray-500">Dataset {doc.dataset_number}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/search?q=${encodeURIComponent(article.name)}`}
                  className="inline-flex items-center text-accent hover:text-accent-hover font-medium"
                >
                  View all {documentCount.toLocaleString()} documents →
                </Link>
              </div>
            )}

            {/* Related Searches */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Searches</h3>
              <div className="flex flex-wrap gap-2">
                {article.relatedSearches.map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(article.name)}`}
                  className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm hover:bg-accent/20 transition-colors"
                >
                  {article.name}
                </Link>
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share This Article</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
                <a
                  href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF4500] text-white rounded-lg hover:opacity-90"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  Reddit
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Disclaimer:</strong> Appearance in these documents does not imply wrongdoing.
                Many individuals appear as witnesses, victims, acquaintances, or in incidental references.
                This article is provided for informational and research purposes only. All information
                is sourced from publicly available DOJ documents.
              </p>
            </div>
          </div>
        </div>

        {/* More Articles - Randomized per visitor */}
        <RandomArticles
          articles={Object.entries(ARTICLES).map(([articleSlug, articleData]) => ({
            slug: articleSlug,
            name: articleData.name,
            description: articleData.description,
            image: articleData.image,
          }))}
          currentSlug={slug}
          count={4}
        />
      </article>
    </div>
  );
}
