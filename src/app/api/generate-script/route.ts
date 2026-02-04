import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface ScriptRequest {
  personName: string;
  personDescription: string;
  category: string;
  duration: number;
  tone: string;
}

// Word count targets based on duration (speaking rate ~150 wpm)
const WORD_TARGETS: Record<number, { min: number; max: number }> = {
  30: { min: 70, max: 90 },
  60: { min: 140, max: 180 },
  120: { min: 280, max: 360 },
  300: { min: 700, max: 900 },
};

// Hook templates by tone
const HOOK_TEMPLATES: Record<string, string[]> = {
  investigative: [
    "The Epstein files just revealed something shocking about {name}...",
    "You won't believe what the court documents say about {name}.",
    "Breaking: New details emerge about {name}'s connection to Epstein.",
    "The document everyone's talking about mentions {name}. Here's why it matters.",
  ],
  educational: [
    "Let me explain {name}'s connection to the Epstein case.",
    "Here's what the Epstein documents actually say about {name}.",
    "Who is {name} and why are they in the Epstein files?",
    "The facts about {name} in the Epstein documents, explained.",
  ],
  dramatic: [
    "When I saw {name}'s name in the Epstein files, I had to look deeper...",
    "This document changes everything we thought about {name}.",
    "The Epstein connection to {name} is more disturbing than you think.",
    "What {name} doesn't want you to know about their Epstein ties.",
  ],
  neutral: [
    "{name} appears in the recently released Epstein documents.",
    "Court documents reference {name}. Here's the context.",
    "An overview of {name}'s mentions in the Epstein case files.",
    "Examining the documented connections between {name} and Epstein.",
  ],
};

// CTA templates
const CTA_TEMPLATES = [
  "Follow for more Epstein file breakdowns. Link to documents in bio.",
  "Search ChatFiles.org to read the full documents yourself.",
  "Part 2 coming soon. Follow to see what else the files reveal.",
  "Comment who you want me to investigate next from the Epstein files.",
  "Share this so more people know the truth. Full docs at ChatFiles.org.",
];

export async function POST(request: NextRequest) {
  try {
    const body: ScriptRequest = await request.json();
    const { personName, personDescription, category, duration, tone } = body;

    // Get word count targets
    const wordTarget = WORD_TARGETS[duration] || WORD_TARGETS[60];

    // Fetch relevant documents from database
    const searchResult = await pool.query(
      `SELECT id, filename, document_type, text_content
       FROM documents
       WHERE to_tsvector('english', COALESCE(text_content, '') || ' ' || COALESCE(filename, ''))
             @@ plainto_tsquery('english', $1)
       ORDER BY created_at DESC
       LIMIT 10`,
      [personName]
    );

    const documents = searchResult.rows;
    const documentCount = documents.length;

    // Extract key information from documents
    const documentSummaries: string[] = [];
    const mentionContexts: string[] = [];

    for (const doc of documents) {
      if (doc.text_content) {
        // Find sentences mentioning the person
        const sentences = doc.text_content.split(/[.!?]+/);
        const relevantSentences = sentences.filter((s: string) =>
          s.toLowerCase().includes(personName.toLowerCase().split(' ')[0].toLowerCase())
        ).slice(0, 2);

        if (relevantSentences.length > 0) {
          mentionContexts.push(...relevantSentences.map((s: string) => s.trim()).filter((s: string) => s.length > 20));
        }
      }

      if (doc.document_type) {
        documentSummaries.push(`${doc.document_type} (${doc.filename || doc.id})`);
      }
    }

    // Generate hooks
    const hookTemplates = HOOK_TEMPLATES[tone] || HOOK_TEMPLATES.neutral;
    const hooks = hookTemplates
      .slice(0, 3)
      .map(h => h.replace(/{name}/g, personName));

    // Build the script based on tone and duration
    const script = generateScript({
      personName,
      personDescription,
      category,
      documentCount,
      documentSummaries: documentSummaries.slice(0, 5),
      mentionContexts: mentionContexts.slice(0, 5),
      tone,
      wordTarget,
    });

    // Select random CTA
    const callToAction = CTA_TEMPLATES[Math.floor(Math.random() * CTA_TEMPLATES.length)];

    // Get source document IDs
    const sources = documents.slice(0, 5).map(d => d.filename || d.id);

    // Count words
    const wordCount = script.split(/\s+/).length;
    const estimatedDuration = `${Math.round(wordCount / 2.5)}s`;

    return NextResponse.json({
      script,
      wordCount,
      estimatedDuration,
      hooks,
      callToAction,
      sources,
    });
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

interface ScriptParams {
  personName: string;
  personDescription: string;
  category: string;
  documentCount: number;
  documentSummaries: string[];
  mentionContexts: string[];
  tone: string;
  wordTarget: { min: number; max: number };
}

function generateScript(params: ScriptParams): string {
  const {
    personName,
    personDescription,
    category,
    documentCount,
    documentSummaries,
    mentionContexts,
    tone,
    wordTarget,
  } = params;

  const firstName = personName.split(' ')[0];
  const isShort = wordTarget.max <= 100;
  const isMedium = wordTarget.max <= 200;

  // Different script structures based on tone
  const scripts: Record<string, string> = {
    investigative: generateInvestigativeScript(),
    educational: generateEducationalScript(),
    dramatic: generateDramaticScript(),
    neutral: generateNeutralScript(),
  };

  return scripts[tone] || scripts.neutral;

  function generateInvestigativeScript(): string {
    if (isShort) {
      return `${personName} - ${personDescription}.

The Epstein files mention them in ${documentCount} document${documentCount !== 1 ? 's' : ''}.

${mentionContexts[0] ? `One document states: "${cleanQuote(mentionContexts[0])}"` : `Documents include ${documentSummaries[0] || 'court filings and correspondence'}.`}

${documentCount > 1 ? `There's more. The full documents are on ChatFiles.org.` : `Read the full document at ChatFiles.org.`}`;
    }

    if (isMedium) {
      return `Let's talk about ${personName}.

${personDescription}. Their name appears in ${documentCount} Epstein document${documentCount !== 1 ? 's' : ''}.

${mentionContexts[0] ? `Here's what one document says: "${cleanQuote(mentionContexts[0])}"` : ''}

${mentionContexts[1] ? `Another document mentions: "${cleanQuote(mentionContexts[1])}"` : `The documents include ${documentSummaries.slice(0, 2).join(', ') || 'various court filings'}.`}

Now, being in these documents doesn't prove anything illegal. ${firstName} hasn't been charged in connection with Epstein.

But it raises questions that deserve answers.

You can read the full documents yourself at ChatFiles.org. Search "${personName}" to see everything.`;
    }

    return `I need to tell you about ${personName} and what the Epstein files reveal.

${personDescription}. You might know them from ${category.toLowerCase()} circles.

Their name appears in ${documentCount} document${documentCount !== 1 ? 's' : ''} from the Epstein case. Let me break down what we found.

${mentionContexts[0] ? `First, there's this: "${cleanQuote(mentionContexts[0])}"` : ''}

${mentionContexts[1] ? `Then we have: "${cleanQuote(mentionContexts[1])}"` : ''}

The document types include ${documentSummaries.slice(0, 3).join(', ') || 'depositions, flight logs, and correspondence'}.

${mentionContexts[2] ? `Here's another key quote: "${cleanQuote(mentionContexts[2])}"` : ''}

Now let me be clear. Being mentioned in these documents does not mean ${firstName} committed any crime. Many people had legitimate business or social connections to Epstein before his crimes were widely known.

But these connections deserve scrutiny. The public has a right to know who was in Epstein's orbit and in what capacity.

If you want to investigate further, all these documents are available at ChatFiles.org. Search for ${personName} and read the primary sources yourself.

The truth is in the documents. Let's keep digging.`;
  }

  function generateEducationalScript(): string {
    if (isShort) {
      return `${personName} is mentioned in the Epstein files.

${personDescription}. They appear in ${documentCount} document${documentCount !== 1 ? 's' : ''}.

${mentionContexts[0] ? `Context: "${cleanQuote(mentionContexts[0])}"` : `These include ${documentSummaries[0] || 'court records'}.`}

Remember: a mention isn't proof of wrongdoing. Read the documents at ChatFiles.org.`;
    }

    if (isMedium) {
      return `Who is ${personName} and why are they in the Epstein files?

${personDescription}. They're connected to the ${category.toLowerCase()} world.

The Epstein court documents mention them ${documentCount} time${documentCount !== 1 ? 's' : ''}.

${mentionContexts[0] ? `Here's the context: "${cleanQuote(mentionContexts[0])}"` : ''}

${documentSummaries.length > 0 ? `Document types: ${documentSummaries.slice(0, 2).join(', ')}.` : ''}

Important context: Many people knew Epstein socially or professionally before his crimes became public. A mention doesn't equal guilt.

For the full picture, read the documents at ChatFiles.org.`;
    }

    return `Let me explain ${personName}'s presence in the Epstein documents.

Background: ${personDescription}. They're known in ${category.toLowerCase()} circles.

The court documents reference them in ${documentCount} instance${documentCount !== 1 ? 's' : ''}. Here's what we know.

${mentionContexts[0] ? `Document excerpt: "${cleanQuote(mentionContexts[0])}"` : ''}

${mentionContexts[1] ? `Additional context: "${cleanQuote(mentionContexts[1])}"` : ''}

The types of documents include: ${documentSummaries.slice(0, 3).join(', ') || 'depositions, court filings, and related materials'}.

${mentionContexts[2] ? `Another reference: "${cleanQuote(mentionContexts[2])}"` : ''}

Historical context matters here. Jeffrey Epstein moved in elite circles for decades. Many powerful people encountered him at events, through business, or socially - often before his criminal activities were exposed.

A mention in these documents doesn't indicate criminal involvement. Each reference has its own context that matters.

For accurate understanding, I encourage you to read the primary sources. All documents are searchable at ChatFiles.org.

Education and transparency serve the public better than speculation.`;
  }

  function generateDramaticScript(): string {
    if (isShort) {
      return `${personName}.

${documentCount} documents. ${personDescription}.

${mentionContexts[0] ? `"${cleanQuote(mentionContexts[0])}"` : 'The files tell a story.'}

The question is: what else is in there?

ChatFiles.org. Search it yourself.`;
    }

    if (isMedium) {
      return `When I searched ${personName} in the Epstein files, I found something.

${personDescription}. ${documentCount} documents mention them.

${mentionContexts[0] ? `Listen to this: "${cleanQuote(mentionContexts[0])}"` : ''}

${mentionContexts[1] ? `And this: "${cleanQuote(mentionContexts[1])}"` : `Documents include ${documentSummaries[0] || 'court filings'}.`}

Now, I'm not saying ${firstName} did anything wrong. That's not what this is about.

But don't you think we deserve answers?

The full files are at ChatFiles.org. Go see for yourself.`;
    }

    return `This one caught my attention.

${personName}. ${personDescription}. A powerful name in ${category.toLowerCase()}.

When I searched the Epstein files, their name came up ${documentCount} time${documentCount !== 1 ? 's' : ''}.

${mentionContexts[0] ? `The first thing that jumped out: "${cleanQuote(mentionContexts[0])}"` : ''}

I kept reading.

${mentionContexts[1] ? `Then I found this: "${cleanQuote(mentionContexts[1])}"` : ''}

The documents include ${documentSummaries.slice(0, 3).join(', ') || 'depositions, correspondence, and court records'}.

${mentionContexts[2] ? `And there's more: "${cleanQuote(mentionContexts[2])}"` : ''}

Let me be real with you. Finding someone's name in these files doesn't make them guilty of anything. A lot of people crossed paths with Epstein over the years.

But here's what bothers me. For years, we were told this was just about one man. The documents tell a different story. They show a network. Connections. Names.

${firstName}'s name is in there. That's a fact. What it means? That's for you to decide.

Don't take my word for it. The documents are all public now. ChatFiles.org has them searchable.

Read them yourself. Form your own conclusions.

Because the truth? It's been hiding in plain sight.`;
  }

  function generateNeutralScript(): string {
    if (isShort) {
      return `${personName} appears in the Epstein documents.

${personDescription}. Referenced in ${documentCount} document${documentCount !== 1 ? 's' : ''}.

${mentionContexts[0] ? `Quote: "${cleanQuote(mentionContexts[0])}"` : `Includes ${documentSummaries[0] || 'court records'}.`}

Full documents available at ChatFiles.org.`;
    }

    if (isMedium) {
      return `${personName} is referenced in the Epstein case documents.

Background: ${personDescription}. They work in ${category.toLowerCase()}.

The documents mention them ${documentCount} time${documentCount !== 1 ? 's' : ''}.

${mentionContexts[0] ? `From the documents: "${cleanQuote(mentionContexts[0])}"` : ''}

${documentSummaries.length > 0 ? `Document types include: ${documentSummaries.slice(0, 2).join(', ')}.` : ''}

Note: Appearing in these documents does not imply wrongdoing.

Source documents are available at ChatFiles.org.`;
    }

    return `This is a factual overview of ${personName}'s mentions in the Epstein case documents.

${personDescription}. They are associated with ${category.toLowerCase()}.

The court documents reference ${personName} in ${documentCount} instance${documentCount !== 1 ? 's' : ''}.

${mentionContexts[0] ? `Document excerpt: "${cleanQuote(mentionContexts[0])}"` : ''}

${mentionContexts[1] ? `Additional excerpt: "${cleanQuote(mentionContexts[1])}"` : ''}

The document types include: ${documentSummaries.slice(0, 4).join(', ') || 'depositions, flight records, correspondence, and court filings'}.

${mentionContexts[2] ? `Further context: "${cleanQuote(mentionContexts[2])}"` : ''}

For accurate interpretation, several points should be noted:

First, many individuals had professional or social contact with Jeffrey Epstein before his crimes became widely known.

Second, a mention in legal documents does not constitute evidence of illegal activity.

Third, context matters. Each reference occurs in specific circumstances detailed in the full documents.

The complete documents are publicly available and searchable at ChatFiles.org. Readers are encouraged to review primary sources to form informed conclusions.`;
  }
}

function cleanQuote(text: string): string {
  // Clean up the quote for readability
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^["']|["']$/g, '')
    .slice(0, 200);
}
