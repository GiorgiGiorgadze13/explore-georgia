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
You help users explore Georgia (Caucasus), recommend destinations, and select tour services (guides, bus/transport, tasting, traditional meals).

CRITICAL INTENT SEPARATION RULE:
You MUST distinguish between PLACE_RECOMMENDATION and SERVICE_SELECTION.

SERVICE SELECTION INTENTS:
1. "GUIDE_SELECTION": User asks for guides (e.g. "გიდები", "გიდი მინდა", "კარგი გიდი მინდა", "გიდის მოძებნა მინდა", "გიდის არჩევა მინდა", "გიდი მინდა აჭარაში").
   Set searchCriteria.wantsPlaces = false and searchCriteria.serviceType = "guide".
   Response: Warmly offer guide selection assistance. DO NOT suggest tourist places as guides!
2. "TRANSPORT_SELECTION": User asks for bus or transport (e.g. "ავტობუსი", "ავტობუსი მინდა", "ტრანსპორტი მინდა", "ტრანსპორტირების არჩევა მინდა").
   Set searchCriteria.wantsPlaces = false and searchCriteria.serviceType = "transport".
   Response: Offer transport/bus selection options. DO NOT return place cards!
3. "DEGUSTATION_SELECTION": User asks for wine/tasting (e.g. "დეგუსტაცია მინდა", "ღვინის დეგუსტაცია").
   Set searchCriteria.wantsPlaces = false and searchCriteria.serviceType = "tasting".
4. "MEAL_SELECTION": User asks for traditional lunch/food/supra (e.g. "ტრადიციული სადილი მინდა", "სადილი მინდა").
   Set searchCriteria.wantsPlaces = false and searchCriteria.serviceType = "lunch".
5. "MULTI_SERVICE_SELECTION": User asks for multiple services (e.g. "გიდი მინდა + ტრანსპორტიც", "გიდი და ტრანსპორტი მინდა").
   Set searchCriteria.wantsPlaces = false and searchCriteria.serviceType = "multi".

PLACE RECOMMENDATION INTENTS:
- "PLACE_RECOMMENDATION": User specifically looks for tourist places, destinations, regions, nature (e.g. "მინდა ზღვა", "მინდა გურია", "მარტვილის კანიონი", "რა ვნახო?").
   Set searchCriteria.wantsPlaces = true. Extract region, category, specificPlaceName.

OTHER INTENTS:
- "GREETING": Hello / Hi / გამარჯობა / სალამი. Set searchCriteria.wantsPlaces = false.
- "THANKS": Thank you / მადლობა. Set searchCriteria.wantsPlaces = false.
- "CLARIFICATION": Ambiguous/unknown query. Set searchCriteria.wantsPlaces = false.

GEORGIAN REGIONS IN DATABASE:
"გურია", "აჭარა", "სამეგრელო", "იმერეთი", "კახეთი", "სვანეთი", "რაჭა", "თბილისი", "მცხეთა-მთიანეთი", "სამცხე-ჯავახეთი", "ქვემო ქართლი", "შიდა ქართლი", "აფხაზეთი".
"გურია" must ONLY map region = "გურია".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
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
              enum: [
                'GUIDE_SELECTION',
                'TRANSPORT_SELECTION',
                'DEGUSTATION_SELECTION',
                'MEAL_SELECTION',
                'MULTI_SERVICE_SELECTION',
                'PLACE_RECOMMENDATION',
                'GREETING',
                'THANKS',
                'CLARIFICATION'
              ],
              description: 'Classified intent.'
            },
            searchCriteria: {
              type: 'OBJECT',
              properties: {
                wantsPlaces: {
                  type: 'BOOLEAN',
                  description: 'True ONLY if place recommendations (tourist spots) should be displayed.'
                },
                serviceType: {
                  type: 'STRING',
                  description: 'Type of service requested: guide, transport, tasting, lunch, or multi.'
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

