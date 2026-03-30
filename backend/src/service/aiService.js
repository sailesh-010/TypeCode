/**
 * AI Service - Provides AI-powered features
 */

const llm = require('../ai/llm');
const scoreModel = require('../../models/scoremodel');
const userModel = require('../../models/userModel');
const logger = require('../../utils/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { normalizeLanguage, getDisplayName, isSupported } = require('../utils/languageNormalizer');
const { validateLanguage } = require('../utils/codeValidator');

// Initialize Google AI
const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyCRowZrsPXf7P70A--q7ur4nEx9-WNB07A';
const genAI = new GoogleGenerativeAI(apiKey);
const MODEL_NAME = 'gemini-2.0-flash';

class AIService {
  /**
   * Generate code snippet for typing practice using AI
   */
  async generateCodeForPractice(language = 'Random', difficulty = 'Random', topic = 'Random') {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      // Handle random selections
      const langs = ['Python', 'C', 'Java', 'JavaScript', 'C++'];
      const diffs = ['Easy', 'Medium', 'Hard'];
      
      const actualLang = (!language || language.toLowerCase() === 'random') 
        ? langs[Math.floor(Math.random() * langs.length)] 
        : language;
        
      const actualDiff = (!difficulty || difficulty.toLowerCase() === 'random') 
        ? diffs[Math.floor(Math.random() * diffs.length)] 
        : difficulty;

      // Normalize language immediately after receiving it
      const normalizedLang = normalizeLanguage(actualLang);
      const displayName = getDisplayName(normalizedLang);

      // Log warning when unknown language variation is encountered
      if (!isSupported(actualLang)) {
        logger.warn('Unknown language variation encountered', {
          requestedLanguage: actualLang,
          normalizedTo: normalizedLang,
          difficulty: actualDiff,
          topic: topic || 'Random'
        });
      }

      let topicInstruction = '';
      if (topic && topic.toLowerCase() !== 'random' && topic.trim() !== '') {
        topicInstruction = `The code MUST be specifically related to the following topic: "${topic}".`;
      } else {
        topicInstruction = 'The code can be about any standard programming concept, algorithm, or everyday functionality.';
      }
      
      const difficultyLower = actualDiff.toLowerCase();
      
      // Use normalized language key in AI prompt generation
      const prompts = {
        easy: `Generate a very simple, beginner-friendly ${displayName} code snippet (about 3-5 lines). It should be easy to type. ${topicInstruction} Do not include markdown formatting or explanations, just the plain code.`,
        medium: `Generate a moderately complex ${displayName} function (about 8-12 lines) showing standard syntax and logic. ${topicInstruction} Do not include markdown formatting or explanations, just the plain code.`,
        hard: `Generate an advanced algorithmic or complex ${displayName} code snippet (about 15-20 lines) including advanced features of the language. ${topicInstruction} Use standard indentation. Do not include markdown formatting or explanations, just the plain code.`
      };

      const prompt = prompts[difficultyLower] || prompts.medium;
      
      const result = await model.generateContent(prompt);
      let generatedCode = result.response.text().trim();
      
      // Remove any markdown code block wrap if the AI ignored instructions
      generatedCode = generatedCode.replace(/^```[a-z+]*\n/im, '').replace(/\n```$/m, '').trim();

      // Add validation step after AI code generation
      const validation = validateLanguage(generatedCode, normalizedLang);
      
      if (!validation.isValid) {
        // If validation fails, log warning and use fallback code
        logger.warn('Language mismatch detected', {
          requestedLanguage: normalizedLang,
          detectedLanguage: validation.detectedLanguage || 'unknown',
          confidence: validation.confidence.toFixed(2),
          difficulty: actualDiff,
          topic: topic || 'Random'
        });
        
        // Use fallback code instead
        return this.getFallbackCode(normalizedLang, actualDiff, topic);
      }

      return {
        success: true,
        exercise: {
          id: Date.now(),
          language: displayName,
          difficulty: actualDiff,
          topic: topic,
          content: generatedCode,
          timeLimit: difficultyLower === 'easy' ? 60 : difficultyLower === 'medium' ? 120 : 240,
        }
      };
    } catch (error) {
      // Log AI generation failure with full context
      const actualLangForFallback = (!language || language.toLowerCase() === 'random') ? 'JavaScript' : language;
      const actualDiffForFallback = (!difficulty || difficulty.toLowerCase() === 'random') ? 'Medium' : difficulty;
      const normalizedLang = normalizeLanguage(actualLangForFallback);
      
      logger.error('AI generation failed', {
        requestedLanguage: normalizedLang,
        difficulty: actualDiffForFallback,
        topic: topic || 'Random',
        error: error.message || String(error)
      });
      
      // Use normalized language for fallback
      return this.getFallbackCode(normalizedLang, actualDiffForFallback, topic);
    }
  }

  /**
   * Get fallback code for a given language and difficulty
   */
  getFallbackCode(normalizedLang, difficulty, topic) {
    const diffKey = difficulty.toLowerCase();
    const displayName = getDisplayName(normalizedLang);

    // Log when fallback code is used
    logger.info('Using fallback code', {
      requestedLanguage: normalizedLang,
      difficulty: difficulty,
      topic: topic || 'Random'
    });

    // Fallback code dictionary with normalized keys (lowercase, "c++" not "cpp")
    const fallbacks = {
      python: {
        easy: 'def hello_world():\n    print("Hello, world!")\n\nhello_world()',
        medium: 'def calculate_total(items):\n    total = 0\n    for item in items:\n        total += item.price * item.quantity\n    return total',
        hard: 'class DataFetcher:\n    def __init__(self, url):\n        self.url = url\n\n    async def fetch(self):\n        import aiohttp\n        async with aiohttp.ClientSession() as session:\n            async with session.get(self.url) as response:\n                return await response.json()'
      },
      javascript: {
        easy: 'console.log("Hello, World!");\nlet x = 10;\nlet y = 20;\nconsole.log(x + y);',
        medium: 'function calculateTotal(items) {\n  let total = 0;\n  for (let item of items) {\n    total += item.price * item.quantity;\n  }\n  return total;\n}',
        hard: 'class User {\n  constructor(name) {\n    this.name = name;\n  }\n\n  async fetchData() {\n    const response = await fetch("/api/data");\n    return await response.json();\n  }\n}'
      },
      java: {
        easy: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
        medium: 'public int calculateTotal(Item[] items) {\n    int total = 0;\n    for (Item item : items) {\n        total += item.getPrice() * item.getQuantity();\n    }\n    return total;\n}',
        hard: 'import java.util.concurrent.CompletableFuture;\n\npublic class Fetcher {\n    public CompletableFuture<String> fetchData() {\n        return CompletableFuture.supplyAsync(() -> {\n            try {\n                Thread.sleep(1000);\n                return "Data loaded";\n            } catch (InterruptedException e) {\n                return "Error";\n            }\n        });\n    }\n}'
      },
      c: {
        easy: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
        medium: 'int calculateTotal(int prices[], int quantities[], int size) {\n    int total = 0;\n    for(int i=0; i<size; i++) {\n        total += prices[i] * quantities[i];\n    }\n    return total;\n}',
        hard: '#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct Node {\n    int data;\n    struct Node* next;\n} Node;\n\nNode* createNode(int value) {\n    Node* newNode = (Node*)malloc(sizeof(Node));\n    newNode->data = value;\n    newNode->next = NULL;\n    return newNode;\n}'
      },
      'c++': {
        easy: '#include <iostream>\n\nint main() {\n    std::cout << "Hello World!" << std::endl;\n    return 0;\n}',
        medium: '#include <vector>\n\nint calculateTotal(const std::vector<int>& prices) {\n    int total = 0;\n    for(int price : prices) {\n        total += price;\n    }\n    return total;\n}',
        hard: '#include <iostream>\n#include <memory>\n\nclass Shape {\npublic:\n    virtual void draw() const = 0;\n    virtual ~Shape() = default;\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() const override {\n        std::cout << "Drawing a circle\\n";\n    }\n};'
      }
    };

    // Use normalized key for fallback code lookup
    const langFallbacks = fallbacks[normalizedLang] || fallbacks.javascript;
    const fallbackCode = langFallbacks[diffKey] || langFallbacks.medium;

    return {
      success: false,
      error: 'Failed to generate code with AI. Returning fallback code.',
      exercise: {
        id: Date.now(),
        language: displayName,
        difficulty: difficulty,
        topic: topic,
        content: fallbackCode,
        timeLimit: diffKey === 'easy' ? 60 : diffKey === 'medium' ? 120 : 240
      }
    };
  }

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId) {
    try {
      const userScores = scoreModel.getUserScores(userId);

      if (userScores.length === 0) {
        return [
          'Start taking typing tests to get personalized recommendations',
          'Try different test types and difficulties to find what suits you',
          'Focus on accuracy before speed'
        ];
      }

      const analysis = llm.analyzeTypingPatterns(userScores);

      if (!analysis.success) {
        return [];
      }

      const recommendations = [analysis.analysis.recommendation];

      // Additional recommendations based on performance
      if (analysis.analysis.averageAccuracy < 90) {
        recommendations.push('Consider using an on-screen keyboard guide for reference');
        recommendations.push('Take breaks to avoid fatigue affecting accuracy');
      }

      if (analysis.analysis.averageWPM < 60) {
        recommendations.push('Try practicing with faster-paced exercises');
        recommendations.push('Attempt timed tests to push your speed');
      }

      if (analysis.analysis.trend === 'improving') {
        recommendations.push('Great improvement! Keep maintaining this progression');
        recommendations.push('Try challenging yourself with harder texts');
      }

      return recommendations;
    } catch (error) {
      logger.error('Recommendations generation error:', error);
      return [];
    }
  }

  /**
   * Chat with AI about typing
   */
  async chat(message, userId) {
    try {
      const user = userModel.findById(userId);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Simple intent detection and response
      const response = this.generateChatResponse(message, user);

      logger.info(`Chat for user ${user.email}: ${message.substring(0, 50)}`);

      return {
        success: true,
        response,
        userId
      };
    } catch (error) {
      logger.error('Chat error:', error);
      return {
        success: false,
        error: 'Failed to process chat'
      };
    }
  }

  /**
   * Generate chat response based on user message
   */
  generateChatResponse(message, user) {
    const lowerMessage = message.toLowerCase();

    // Intent-based responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return {
        type: 'help',
        content: 'I can help you improve your typing! You can ask me about: improving speed, accuracy tips, exercise suggestions, or your progress statistics.'
      };
    }

    if (lowerMessage.includes('speed') || lowerMessage.includes('wpm')) {
      return {
        type: 'suggestion',
        content: 'To improve your WPM: 1) Practice regularly with timed tests 2) Focus on finger positioning 3) Avoid looking at the keyboard 4) Use proper posture. Would you like an exercise?'
      };
    }

    if (lowerMessage.includes('accuracy')) {
      return {
        type: 'suggestion',
        content: 'For better accuracy: 1) Slow down initially 2) Use touch typing 3) Practice specific difficult words 4) Take our accuracy-focused exercises.'
      };
    }

    if (lowerMessage.includes('exercise') || lowerMessage.includes('practice')) {
      return {
        type: 'suggestion',
        content: `Hi ${user.username}! Would you like an easy, medium, or hard typing exercise? Reply with your preference!`
      };
    }

    if (lowerMessage.includes('stats') || lowerMessage.includes('progress')) {
      const stats = scoreModel.getUserScores(user.id);
      if (stats.length === 0) {
        return {
          type: 'info',
          content: 'You haven\'t taken any tests yet. Start by taking a typing test to see your statistics!'
        };
      }
      return {
        type: 'info',
        content: `You've completed ${stats.length} tests. Keep testing to improve!`
      };
    }

    if (lowerMessage.includes('easy') || lowerMessage.includes('beginner')) {
      return {
        type: 'exercise',
        difficulty: 'easy',
        content: 'Great! I\'ll give you an easy exercise to start with.'
      };
    }

    if (lowerMessage.includes('medium') || lowerMessage.includes('intermediate')) {
      return {
        type: 'exercise',
        difficulty: 'medium',
        content: 'Perfect! Here\'s a medium-level exercise for you.'
      };
    }

    if (lowerMessage.includes('hard') || lowerMessage.includes('advanced')) {
      return {
        type: 'exercise',
        difficulty: 'hard',
        content: 'Challenge accepted! Here\'s a difficult exercise.'
      };
    }

    // Default response
    return {
      type: 'info',
      content: `Hi ${user.username}! You can ask me about typing tips, exercises, statistics, or just chat. What would you like to know?`
    };
  }

  /**
   * Generate performance insights
   */
  async generateInsights(userId) {
    try {
      const userScores = scoreModel.getUserScores(userId);

      if (userScores.length < 3) {
        return {
          success: false,
          error: 'Need at least 3 test results for insights'
        };
      }

      const analysis = llm.analyzeTypingPatterns(userScores);

      return {
        success: true,
        insights: {
          performance: analysis.analysis,
          summary: `${userScores.length} tests completed. Your best WPM is ${analysis.analysis.averageWPM}. Keep practicing!`
        }
      };
    } catch (error) {
      logger.error('Insights generation error:', error);
      return {
        success: false,
        error: 'Failed to generate insights'
      };
    }
  }

  /**
   * Get study plan recommendation
   */
  async getStudyPlan(userId) {
    try {
      const userScores = scoreModel.getUserScores(userId);
      const analysis = llm.analyzeTypingPatterns(userScores);

      if (!analysis.success) {
        return {
          success: false,
          error: 'Cannot generate study plan'
        };
      }

      const plan = {
        duration: '4 weeks',
        frequency: '5 days per week',
        activities: []
      };

      const { averageWPM, averageAccuracy } = analysis.analysis;

      if (averageAccuracy < 85) {
        plan.activities.push('10 mins - Accuracy focused exercises');
        plan.activities.push('10 mins - Slow typing practice');
      }

      if (averageWPM < 50) {
        plan.activities.push('15 mins - Speed building exercises');
      } else {
        plan.activities.push('10 mins - Challenging texts');
      }

      plan.activities.push('5 mins - Cool down with light practice');

      return {
        success: true,
        plan
      };
    } catch (error) {
      logger.error('Study plan generation error:', error);
      return {
        success: false,
        error: 'Failed to generate study plan'
      };
    }
  }
}

const aiService = new AIService();

// Test the code generation
if (require.main === module) {
  (async () => {
    console.log('🤖 Testing AI Code Generation for Practice Session...');
    
    console.log('\n➡️  Generating EASY python practice...');
    const easyCode = await aiService.generateCodeForPractice('Python', 'Easy', '');
    console.log(easyCode.exercise);
    
    console.log('\n➡️  Generating CUSTOM TOPIC javascript practice...');
    const topicCode = await aiService.generateCodeForPractice('JavaScript', 'Hard', 'Binary Search Tree');
    console.log(topicCode.exercise);

    console.log('\n➡️  Generating RANDOM practice...');
    const randomCode = await aiService.generateCodeForPractice('Random', 'Random', 'Random');
    console.log(randomCode.exercise);
  })();
}

module.exports = aiService;
