const express = require('express');
const { performance } = require('perf_hooks');

const app = express();
const PORT = 3000;


app.use(express.json());


const WINDOW_SIZE = 10;
const TIMEOUT_LIMIT = 500; 

let windowState = [];


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
  


app.post('/numbers/:type', (req, res) => {
  const { type } = req.params; 
  const numbers = req.body.numbers;
  const startTime = performance.now();

  console.log(`Received request for type: ${type} with numbers: ${numbers}`);

  if (!numbers || !Array.isArray(numbers)) {
    return res.status(400).json({ msg: "Please provide an array of numbers." });
  }

  if (!['p', 'e', 'f', 'r'].includes(type)) {
    return res.status(400).json({ error: "Please provide a valid number type: prime, even, fibonacci, random." });
  }

 
  const timeoutId = setTimeout(() => {
    return res.status(500).json({ error: "Taking too long for this request." });
  }, TIMEOUT_LIMIT);

  
  let filteredNumbers = [];
  switch (type) {
    case 'p':
      filteredNumbers = numbers.filter(isPrime);
      break;
    case 'e':
      filteredNumbers = numbers.filter(isEven);
      break;
    case 'f':
      filteredNumbers = numbers.filter(isFibonacci);
      break;
    case 'r':
      filteredNumbers = numbers; 
      break;
    default:
      filteredNumbers = [];
  }

  clearTimeout(timeoutId);

 
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
    avg: parseFloat(average)
   
  });
});


app.listen(PORT, () => {
  console.log(`server is staring at port ${PORT}`);
});
