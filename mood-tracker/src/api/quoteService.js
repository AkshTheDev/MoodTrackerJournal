const QUOTES_API_URL = 'https://api.quotable.io';

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
    console.error('Error fetching quote:', error);
    return {
      content: 'Every day is a new beginning.',
      author: 'Unknown'
    };
  }
}

export async function getDailyQuote() {
  const today = new Date().toISOString().split('T')[0];
  const cachedQuote = localStorage.getItem(`daily-quote-${today}`);
  
  if (cachedQuote) {
    return JSON.parse(cachedQuote);
  }

  const quote = await getRandomQuote();
  localStorage.setItem(`daily-quote-${today}`, JSON.stringify(quote));
  return quote;
}