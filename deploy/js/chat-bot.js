/**
 * MindMitra — Empathetic Peer Support Chatbot Engine
 * Provides rule-based supportive dialogue, peer guidance, and immediate crisis routing.
 */

(function () {
  const CRISIS_MESSAGE =
    "I'm really glad you reached out. You deserve immediate support from a real professional. Please use MindMitra's Urgent Help option or contact local emergency/crisis services immediately. If you're in immediate danger, please call 112 or Tele-MANAS (14416) right away.";

  const RULES = [
    {
      keywords: ['kill myself', 'suicide', 'want to die', 'hurt myself', 'self harm', 'end my life', 'no reason to live', 'cut myself'],
      response: CRISIS_MESSAGE,
      isCrisis: true,
    },
    {
      keywords: ['stress', 'stressed', 'pressure', 'overwhelmed', 'workload', 'burnout'],
      response: "That sounds like a lot to carry right now. When everything piles up, our minds try to solve 10 things at once. You don't have to tackle it all today. Would you like to tell me what's causing the biggest pressure right now?",
      isCrisis: false,
    },
    {
      keywords: ['exam', 'exams', 'test', 'tests', 'studying', 'study', 'marks', 'grades', 'assignment', 'deadline', 'gpa', 'fail', 'failing'],
      response: "Academic pressure is one of the hardest things students go through. Remember that your grades don't define your entire worth or future. What is one small assignment or chapter you can look at for just 15 minutes?",
      isCrisis: false,
    },
    {
      keywords: ['lonely', 'alone', 'isolated', 'nobody', 'no one', 'no friends', 'left out'],
      response: "Feeling alone on campus can be really painful, but you are not invisible here. I am right here listening without judgment. What has your week been feeling like?",
      isCrisis: false,
    },
    {
      keywords: ['sleep', 'sleeping', 'insomnia', 'tired', "can't sleep", 'cannot sleep', 'exhausted', 'nightmare'],
      response: "When our thoughts are racing, our nervous system stays on high alert. You might try the 2-minute box breathing reset before closing your eyes. What's the main thought keeping you awake right now?",
      isCrisis: false,
    },
    {
      keywords: ['sad', 'unhappy', 'crying', 'depressed', 'hopeless', 'worthless', 'down'],
      response: "I'm so sorry things are feeling heavy right now. It is completely okay to not be okay, and you don't need to apologize for feeling this way. Would you like to vent about whatever is on your chest?",
      isCrisis: false,
    },
    {
      keywords: ['anxiety', 'anxious', 'nervous', 'panic', 'worried', 'worry', 'scared', 'fear', 'heart racing'],
      response: "Let's take a slow breath together. Inhale gently... and let it out. Right now, in this exact moment, you are safe here. Can you tell me what your mind is telling you right now?",
      isCrisis: false,
    },
    {
      keywords: ['motivation', 'motivated', 'lazy', 'useless', "can't focus", 'cannot focus', 'focus', 'procrastinating', 'procrastination', 'stuck'],
      response: "When our brain is overwhelmed, it often freezes — which we mistakenly call 'laziness'. Be kind to yourself today. What is the single smallest action you can do without exhausting yourself?",
      isCrisis: false,
    },
    {
      keywords: ['friend', 'friends', 'friendship', 'relationship', 'breakup', 'boyfriend', 'girlfriend', 'family', 'parents', 'roommate'],
      response: "Relationships can affect our mental wellbeing deeply. It takes courage to process emotional friction. If you feel comfortable sharing, what happened?",
      isCrisis: false,
    },
    {
      keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo'],
      response: "Hey! I'm your peer support mentor. I'm here to listen, offer a calming space, and help you talk through whatever is going on. What's on your mind today?",
      isCrisis: false,
    },
    {
      keywords: ['thank', 'thanks', 'appreciate', 'helpful'],
      response: "You are so welcome! Taking time to check in with yourself is a sign of real strength. I'm always here whenever you need a friendly space.",
      isCrisis: false,
    },
  ];

  const FALLBACK_RESPONSES = [
    "Thank you for sharing that with me. I hear you, and your feelings are completely valid. Could you tell me a little more about what's been happening?",
    "That sounds tough to navigate. You don't have to carry it all by yourself. What would make today even 5% easier for you?",
    "I appreciate you being open. Sometimes putting words to what we feel is the first step toward feeling lighter. What is the biggest thought on your mind right now?",
  ];

  let fallbackIndex = 0;

  const ChatBot = {
    getReply(userInput) {
      if (!userInput || typeof userInput !== 'string') {
        return {
          text: "I'm here for you. Feel free to type anything that's on your mind.",
          isCrisis: false,
        };
      }

      const normalized = userInput.toLowerCase();

      for (const rule of RULES) {
        if (rule.keywords.some((kw) => normalized.includes(kw))) {
          return {
            text: rule.response,
            isCrisis: rule.isCrisis,
          };
        }
      }

      const text = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
      fallbackIndex++;
      return {
        text,
        isCrisis: false,
      };
    },
  };

  window.MindMitraChatBot = ChatBot;
})();
