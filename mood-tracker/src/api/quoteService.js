const QUOTES_API_URL = 'http://api.quotable.io';

// Fallback quotes collection
const LOCAL_QUOTES = [
  {
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    content: "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama"
  },
  {
    content: "The future depends on what you do today.",
    author: "Mahatma Gandhi"
  },
  {
    content: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Zig Ziglar"
  },
  {
    content: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    content: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair"
  },
  {
    content: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    content: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    content: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    content: "Every moment is a fresh beginning.",
    author: "T.S. Eliot"
  }
];

function getRandomLocalQuote() {
  const randomIndex = Math.floor(Math.random() * LOCAL_QUOTES.length);
  return LOCAL_QUOTES[randomIndex];
}

export async function getRandomQuote() {
  try {
    const response = await fetch(`${QUOTES_API_URL}/random?tags=inspirational`);
    if (!response.ok) throw new Error('Failed to fetch quote');
    const data = await response.json();
    return {
      content: data.content,
      author: data.author
    };
  } catch (error) {
    console.log('Using local quote due to API error');
    return getRandomLocalQuote();
  }
}

// Export getRandomQuote as getDailyQuote for backward compatibility
export const getDailyQuote = getRandomQuote;