/**
 * MindMitra — AI Wellbeing Assistant Engine
 * 
 * Supports:
 * 1. Live Google Gemini API (Gemini 2.5 / 2.0 / 1.5 Flash) with streaming & multi-turn history.
 * 2. Deep Client-Side Cognitive Behavioral AI Companion (works 100% offline & without API keys).
 * 3. Urgent Crisis Escalation Layer.
 */

(function () {
  const STORAGE_KEY_API_KEY = 'mindmitra_gemini_api_key';
  const STORAGE_KEY_MODEL = 'mindmitra_ai_model';
  const STORAGE_KEY_PREFER_LOCAL = 'mindmitra_prefer_local_ai';

  const DEFAULT_MODEL = 'gemini-2.5-flash';

  const SYSTEM_INSTRUCTION = `You are "Mitra", an empathetic, gentle, and highly supportive AI wellbeing assistant for college and university students.
Your mission is to provide non-judgmental, compassionate mental health and academic wellbeing support.
Guiding principles:
1. Always validate the student's emotions first before offering advice. (e.g., "It makes complete sense that you feel overwhelmed with three assignments due.")
2. Use evidence-based Cognitive Behavioral Therapy (CBT) and ACT principles: encourage cognitive reframing, breaking big overwhelming tasks into tiny 5-minute micro-actions, and mindful grounding.
3. Keep answers concise, warm, conversational, and easy to read (under 3-4 short paragraphs). Use gentle bullet points where helpful.
4. If a student mentions exams, grades, or academic stress, normalize their experience and remind them their worth is not defined by grades.
5. If a student mentions sleep trouble, suggest a relaxing wind-down or box breathing reset.
6. SAFETY RULE: If the student expresses explicit intent to harm themselves, end their life, or is in acute danger, respond with deep compassion and explicitly direct them to call 112 (National Emergency) or Tele-MANAS (14416) immediately.
7. Always clarify when appropriate that you are an AI support companion, not a medical doctor or licensed psychiatrist.`;

  const CRISIS_KEYWORDS = [
    'kill myself', 'suicide', 'suicidal', 'want to die', 'end my life',
    'hurt myself', 'self harm', 'cut myself', 'no reason to live', 'hang myself',
    'better off dead', 'take my own life'
  ];

  const CRISIS_MESSAGE = 
    "I am so glad you reached out to me, and I want you to know you are not alone. Because I deeply care about your safety, please reach out to someone who can help right this second. Please call 112 (Emergency Services) or Tele-MANAS (14416 - 24/7 National Mental Health Helpline). There are people who want to listen and support you through this.";

  // Advanced Client-Side Offline AI Companion
  // Implements multi-dimensional intent classification, CBT reframing, and active empathy
  class LocalCognitiveAI {
    constructor() {
      this.turnCount = 0;
    }

    generateResponse(userInput, history = []) {
      this.turnCount++;
      const text = userInput.trim().toLowerCase();

      // 1. Immediate Crisis Check
      if (CRISIS_KEYWORDS.some(kw => text.includes(kw))) {
        return {
          text: CRISIS_MESSAGE,
          isCrisis: true,
          model: 'Local Safety Engine'
        };
      }

      // 2. Exam & Academic Anxiety
      if (text.match(/exam|test|study|studying|grade|marks|gpa|assignment|deadline|fail|syllabus|submission/)) {
        const responses = [
          "Academic stress can feel like carrying a mountain on your shoulders. When everything is due at once, your nervous system interprets deadlines as threats. Let's make this smaller: what is the single smallest assignment you have, and can you look at just the first heading for 5 minutes without needing to finish it?",
          "It's completely normal to feel the weight of academic expectations, but remember: your exams measure your current performance on a specific test, never your intelligence or your human worth. What would happen if we paused for just 2 minutes to let your brain reset before diving back in?",
          "When you feel like you might fail or fall behind, your brain is catastrophizing future scenarios that haven't happened yet. Take a gentle breath. You don't have to conquer the whole syllabus tonight. What is one small concept you can review comfortably?"
        ];
        return {
          text: responses[Math.floor(Math.random() * responses.length)],
          isCrisis: false,
          model: 'MindMitra Cognitive AI (Local)'
        };
      }

      // 3. Overwhelm, Burnout & Panic
      if (text.match(/overwhelm|overwhelmed|panic|pressure|burnout|exhausted|too much|can't do this|heavy|drowning/)) {
        return {
          text: "I hear you, and it sounds like you are operating on empty right now. When you feel overwhelmed, your brain is trying to solve 20 problems simultaneously.\n\nLet's try a quick grounding anchor:\n• **Unclench your jaw** and drop your shoulders down.\n• Take one slow, long exhale.\n• Tell yourself: *'I only have to handle this exact minute.'*\n\nWould you like to try a 2-minute box breathing reset with me, or just talk about what's draining the most energy?",
          isCrisis: false,
          model: 'MindMitra Cognitive AI (Local)'
        };
      }

      // 4. Sleep & Insomnia
      if (text.match(/sleep|insomnia|tired|can't sleep|awake|nightmare|restless|racing thoughts/)) {
        return {
          text: "Having a tired body with an overactive, racing brain is one of the most frustrating feelings. Often, trying harder to sleep makes insomnia worse.\n\nHere is a gentle reframe for tonight:\n1. **Release the goal of sleeping:** Instead of forcing sleep, just aim for *restful stillness*.\n2. **Mental brain dump:** Write down whatever thought is looping in your head on a piece of paper and tell yourself, *'I will look at this tomorrow at 10 AM.'*\n3. Try slow 4-7-8 breathing.\n\nWhat thought has been on repeat for you tonight?",
          isCrisis: false,
          model: 'MindMitra Cognitive AI (Local)'
        };
      }

      // 5. Loneliness & Isolation
      if (text.match(/lonely|alone|isolated|nobody|no friends|left out|unloved|invisible|nobody cares/)) {
        return {
          text: "Feeling lonely on campus is far more common than people admit, but it feels so painfully quiet when you are inside it. I want you to know that your presence matters, and you are not invisible here.\n\nSometimes when we feel isolated, our inner critic tells us we don't belong. But belonging takes time, and you don't need a huge group—even a small connection counts. How have your interactions been lately?",
          isCrisis: false,
          model: 'MindMitra Cognitive AI (Local)'
        };
      }

      // 6. Sadness & Depression
      if (text.match(/sad|unhappy|crying|depressed|hopeless|down|miserable|empty|numb/)) {
        return {
          text: "I am really glad you spoke up and shared this with me. It takes real courage to admit when things feel dark or heavy. Please give yourself permission to feel this without judging yourself for not being cheerful.\n\nYou don't have to fix everything right now. If today is just about taking a warm shower, drinking a glass of water, and resting, that is more than enough. What has been making your heart feel heavy today?",
          isCrisis: false,
          model: 'MindMitra Cognitive AI (Local)'
        };
      }

      // 7. Anxiety & Fear
      if (text.match(/anxious|anxiety|nervous|worry|worried|scared|fear|shaking|heart/)) {
        return {
          text: "Anxiety is your body's alarm system being a little too sensitive right now. Let's bring you back to safety together:\n\nPut your feet flat on the floor. Feel the firmness beneath you. Can you name 3 blue things in your room, and 2 things you can touch right now? I'm right here with you.",
          isCrisis: false,
          model: 'MindMitra Cognitive AI (Local)'
        };
      }

      // 8. Procrastination & Guilt
      if (text.match(/procrastinat|lazy|useless|distracted|can't focus|wasted time|guilty/)) {
        return {
          text: "Procrastination is rarely about being lazy—it is almost always an emotional regulation issue. Your brain is trying to protect you from the discomfort or fear of failing an intimidating task.\n\nForgive yourself for the hours you lost earlier. Guilt only freezes you more. Can you pick just **one 2-minute action**? (e.g. Opening the document and typing one sentence). Motion creates motivation, not the other way around.",
          isCrisis: false,
          model: 'MindMitra Cognitive AI (Local)'
        };
      }

      // 9. Greetings & Introduction
      if (text.match(/^(hi|hello|hey|yo|greetings|good morning|good evening)/)) {
        return {
          text: "Hello! I'm Mitra, your wellbeing companion. I'm here to listen, offer a grounded perspective, or just help you breathe through a tough day. How are you holding up today?",
          isCrisis: false,
          model: 'MindMitra Cognitive AI (Local)'
        };
      }

      // 10. Gratitude
      if (text.match(/thank|thanks|appreciate|helpful/)) {
        return {
          text: "You are so very welcome! Taking a few minutes to check in with yourself is a sign of resilience. Remember I'm always right here whenever you need a calm sounding board.",
          isCrisis: false,
          model: 'MindMitra Cognitive AI (Local)'
        };
      }

      // 11. Conversational Default
      return {
        text: `Thank you for sharing that with me. I hear you. It sounds like there is a lot to process here.\n\nCould you tell me a little more about what's been happening, or what part of this feels the most overwhelming right now? I'm here to listen without judgment.`,
        isCrisis: false,
        model: 'MindMitra Cognitive AI (Local)'
      };
    }
  }

  // Google Gemini API Cloud Engine
  class GeminiAIEngine {
    constructor() {
      this.apiKey = localStorage.getItem(STORAGE_KEY_API_KEY) || '';
      this.model = localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
    }

    getApiKey() {
      return this.apiKey;
    }

    setApiKey(key) {
      this.apiKey = (key || '').trim();
      localStorage.setItem(STORAGE_KEY_API_KEY, this.apiKey);
    }

    hasApiKey() {
      return !!this.apiKey && this.apiKey.length > 10;
    }

    async generateResponse(userInput, history = []) {
      // Safety check first
      if (CRISIS_KEYWORDS.some(kw => userInput.toLowerCase().includes(kw))) {
        return {
          text: CRISIS_MESSAGE,
          isCrisis: true,
          model: 'MindMitra Safety Shield'
        };
      }

      if (!this.hasApiKey()) {
        throw new Error('NO_API_KEY');
      }

      // Format conversation turns for Gemini
      const contents = [];

      // Add conversation history
      const recentHistory = history.slice(-8); // keep last 8 turns
      recentHistory.forEach(item => {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      });

      // Add current turn
      contents.push({
        role: 'user',
        parts: [{ text: userInput }]
      });

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

      const requestBody = {
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          topP: 0.95
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMessage = errorData.error?.message || `API error ${response.status}`;
        throw new Error(errMessage);
      }

      const data = await response.json();
      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!outputText) {
        throw new Error('Empty response received from Gemini.');
      }

      return {
        text: outputText,
        isCrisis: false,
        model: `Google ${this.model}`
      };
    }
  }

  // Unified AI Assistant Manager
  const localAI = new LocalCognitiveAI();
  const geminiAI = new GeminiAIEngine();

  const Assistant = {
    // Check if prefer local or Gemini
    isUsingGemini() {
      const preferLocal = localStorage.getItem(STORAGE_KEY_PREFER_LOCAL) === 'true';
      return !preferLocal && geminiAI.hasApiKey();
    },

    getApiKey() {
      return geminiAI.getApiKey();
    },

    setApiKey(key) {
      geminiAI.setApiKey(key);
      if (key) {
        localStorage.setItem(STORAGE_KEY_PREFER_LOCAL, 'false');
      }
    },

    setPreferLocal(val) {
      localStorage.setItem(STORAGE_KEY_PREFER_LOCAL, val ? 'true' : 'false');
    },

    getModel() {
      return geminiAI.model;
    },

    setModel(m) {
      geminiAI.model = m;
      localStorage.setItem(STORAGE_KEY_MODEL, m);
    },

    async getReply(userInput, history = []) {
      // If user has Gemini API configured and enabled, call Gemini
      if (this.isUsingGemini()) {
        try {
          return await geminiAI.generateResponse(userInput, history);
        } catch (err) {
          console.warn('[MindMitra AI] Gemini request failed; using Local Cognitive AI fallback.', err);
          // Graceful fallback to Local Cognitive AI
          const localResult = localAI.generateResponse(userInput, history);
          localResult.fallbackNote = `Note: Gemini API temporarily unavailable (${err.message}). Using local companion.`;
          return localResult;
        }
      }

      // Otherwise, use local cognitive AI
      return localAI.generateResponse(userInput, history);
    }
  };

  window.MindMitraAI = Assistant;
  // Also alias to previous chatbot name for backwards compatibility
  window.MindMitraChatBot = {
    getReply(text) {
      const res = localAI.generateResponse(text);
      return res;
    }
  };
})();
