import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing on server.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid user message string is required.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format chat history for Gemini API
    const contents = [];
    if (Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg && msg.text) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      });
    }

    // Append latest user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const systemInstruction = `You are Explore Georgia's intelligent, friendly, and authentic AI Travel Assistant.
You help users explore the country of Georgia (Caucasus), its regions, culture, nature, sea, mountains, food, and travel planning.

You must analyze the user message and conversation history and return a JSON object with:
1. "reply": A natural, conversational text response in the SAME language the user wrote in (Georgian, English, or Russian).
2. "intent": One of ["greeting", "thanks", "guide_service", "general_qa", "place_search", "clarification"]
3. "searchCriteria": Object containing instructions for filtering real database places.

RULES FOR INTENT & RESPONSE:
- "greeting": If user says hi/hello/გამარჯობა/სალამი/привет, respond naturally and warmly. DO NOT suggest random places. Set searchCriteria.wantsPlaces = false.
- "thanks": If user says thank you/მადლობა/спасибо, respond nicely. Set searchCriteria.wantsPlaces = false.
- "guide_service": If user asks for a guide/service/booking (e.g., "მინდა კარგი გიდი"), ask which region/city they need a guide for, or explain guide services. DO NOT return tourist places as guides. Set searchCriteria.wantsPlaces = false.
- "place_search": User wants place recommendations (e.g. "მინდა მთა", "მინდა ზღვა", "გურია", "მარტვილის კანიონი", "გურიაში კარგი რესტორანი"). Set searchCriteria.wantsPlaces = true. Extract region, category, specificPlaceName, isQuiet, budgetMax if mentioned.
- "general_qa": General travel question (e.g. "რა ვნახო?", "2 დღით სად წავიდე?", "რა ვნახო საქართველოში?"). Give a logical travel answer. Set searchCriteria.wantsPlaces = true.
- "clarification": If the request cannot be understood or matched, politely ask a clarification question. Set searchCriteria.wantsPlaces = false.

GEORGIAN REGIONS IN DATABASE:
"გურია", "აჭარა", "სამეგრელო", "იმერეთი", "კახეთი", "სვანეთი", "რაჭა", "თბილისი", "მცხეთა-მთიანეთი", "სამცხე-ჯავახეთი", "ქვემო ქართლი", "შიდა ქართლი", "აფხაზეთი".
Map region requests accurately! "გურია" must ONLY map region = "გურია".

CATEGORIES:
"sea" (ზღვა/პლაჟი/სანაპირო), "mountain" (მთა/მწვერვალი), "canyon" (კანიონი), "waterfall" (ჩანჩქერი), "lake" (ტბა), "river" (მდინარე), "cave" (მღვიმე), "nature" (ბუნება/პარკი/ხედი), "culture" (ისტორიული/ციხე/ტაძარი/მუზეუმი), "food" (რესტორანი/მარანი/კაფე/ღვინო).

CONVERSATION CONTEXT:
Use recent messages in conversation history. If user previously asked for sea and now says "უფრო მშვიდი მინდა", understand they want quiet sea places!`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            reply: {
              type: 'STRING',
              description: 'Natural text response to user in their language.'
            },
            intent: {
              type: 'STRING',
              enum: ['greeting', 'thanks', 'guide_service', 'general_qa', 'place_search', 'clarification'],
              description: 'Classified intent.'
            },
            searchCriteria: {
              type: 'OBJECT',
              properties: {
                wantsPlaces: {
                  type: 'BOOLEAN',
                  description: 'True ONLY if place recommendations should be displayed.'
                },
                region: {
                  type: 'STRING',
                  description: 'Region name if specified, otherwise null.'
                },
                category: {
                  type: 'STRING',
                  description: 'Category key if specified, otherwise null.'
                },
                specificPlaceName: {
                  type: 'STRING',
                  description: 'Specific place name if specified, otherwise null.'
                },
                isQuiet: {
                  type: 'BOOLEAN',
                  description: 'True if user asked for quiet/peaceful spots.'
                },
                budgetMax: {
                  type: 'NUMBER',
                  description: 'Max budget limit if specified.'
                }
              },
              required: ['wantsPlaces']
            }
          },
          required: ['reply', 'intent', 'searchCriteria']
        }
      }
    });

    const replyText = response.text || '';
    let parsedData = null;
    try {
      parsedData = JSON.parse(replyText);
    } catch (e) {
      console.warn('Failed to parse Gemini JSON output:', replyText);
    }

    if (parsedData && parsedData.reply) {
      return res.status(200).json(parsedData);
    } else {
      return res.status(200).json({
        reply: replyText || 'რით შემიძლია დაგეხმაროთ?',
        intent: 'general_qa',
        searchCriteria: { wantsPlaces: false }
      });
    }
  } catch (err) {
    console.error('Error in Gemini Chat Endpoint:', err);
    return res.status(500).json({
      error: 'An error occurred while generating AI response.'
    });
  }
}

