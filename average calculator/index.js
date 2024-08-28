const express = require('express');
const { performance } = require('perf_hooks');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(express.json());

const WINDOW_SIZE = 10;
const TIMEOUT_LIMIT = 500;

const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzI0ODIxOTcwLCJpYXQiOjE3MjQ4MjE2NzAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjhjM2FiZjYzLWQ0YWItNDA5YS05YTk0LTM4YmMyNzZjNDFkYSIsInN1YiI6ImNvZGVyZGlndmlqYXlAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiRGlndmlqYXkgU2luZ2giLCJjbGllbnRJRCI6IjhjM2FiZjYzLWQ0YWItNDA5YS05YTk0LTM4YmMyNzZjNDFkYSIsImNsaWVudFNlY3JldCI6IlN1UG11Z3JDbkhMbnRvUVciLCJvd25lck5hbWUiOiJEaWd2aWpheSBTaW5naCIsIm93bmVyRW1haWwiOiJjb2RlcmRpZ3ZpamF5QGdtYWlsLmNvbSIsInJvbGxObyI6IjIxMDE5MjE1MjAwNzMifQ.nn9YfxlG0RSnUl-joctYJvEuqITYzKwU7qV6A7BdBmU';

const TYPE_MAP = {
  'p': 'prime',
  'r': 'random',
  'e': 'even',
  'f': 'fibonacci'
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;

  let sum = 0;

  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }

  const average = (sum / numbers.length).toFixed(2);
  return average;
};

const isPrime = (num) => {
  if (num <= 1) return false;
  for (let i = 2; i < num; i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const isEven = (num) => num % 2 === 0;

const isFibonacci = (num) => {
  if (num < 0) return false;
  if (num === 0 || num === 1) return true;

  let a = 0, b = 1;

  while (b < num) {
    const temp = a;
    a = b;
    b = temp + b;
  }

  return b === num;
};

app.post('/numbers/:type', async (req, res) => {
  const { type } = req.params;
  
  if (!Object.keys(TYPE_MAP).includes(type)) {
    return res.status(400).json({ error: "Please provide a valid number type: prime, random, even, fibonacci." });
  }

  const fullType = TYPE_MAP[type];
  const startTime = performance.now();

  let fetchedNumbers = [];
  try {
    const response = await fetch(`https://20.244.56.144/test/${fullType}`, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: `HTTP error! status: ${response.status}` });
    }

    fetchedNumbers = await response.json();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

  let filteredNumbers = [];
  switch (type) {
    case 'p':
      filteredNumbers = fetchedNumbers.filter(isPrime);
      break;
    case 'e':
      filteredNumbers = fetchedNumbers.filter(isEven);
      break;
    case 'f':
      filteredNumbers = fetchedNumbers.filter(isFibonacci);
      break;
    case 'r':
      filteredNumbers = fetchedNumbers;
      break;
    default:
      filteredNumbers = [];
  }

  const uniqueNumbers = [...new Set(filteredNumbers)];
  const windowPrevState = [...windowState];
  windowState = [...windowState, ...uniqueNumbers].slice(-WINDOW_SIZE);
  const average = calculateAverage(windowState);

  const endTime = performance.now();
  const responseTime = endTime - startTime;

  if (responseTime > TIMEOUT_LIMIT) {
    return res.status(500).json({ msg: "Taking too long for this request." });
  }

  res.json({
    numbers: uniqueNumbers,
    windowPrevState,
    windowCurrState: windowState,
    avg: parseFloat(average),
    responseTime: `${responseTime.toFixed(2)}ms`
  });
});

app.listen(PORT, () => {
  console.log(`Server is starting at port ${PORT}`);
});

