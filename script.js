 alert('You are only allowed to spin once, if you re lucky to win,please validate your code and send it to Godswill Owen to claim your Prize. \n \n \nGoodluck 🥰 ')
 
 // Game Elements
 const wheel = document.getElementById('wheel');
 const ctx = wheel.getContext('2d');
 const spinBtn = document.getElementById('spin-btn');
 const resultDisplay = document.getElementById('result');
 const prizeCodeDisplay = document.getElementById('prize-code');
 const prizeCodeContainer = document.getElementById('prize-code-container');
 const claimSection = document.getElementById('claim-section');
 const codeInput = document.getElementById('code-input');
 const claimBtn = document.getElementById('claim-btn');
 const claimStatus = document.getElementById('claim-status');
 const cooldownMessage = document.getElementById('cooldown-message');

 // Game Configuration
 const prizes = [
     { name: "TRY AGAIN", type: "NONE", color: "#33CC33", probability: 1 },
     { name: "1GB DATA", type: "DATA", color: "#0099CC", probability: 1 },
     { name: "5H AIRTIME", type: "AIRT", color: "#6666FF", probability: 1 },
     { name: "1GB DATA", type: "DATA", color: "#FF69B4", probability: 1 },
     { name: "TRY AGAIN", type: "NONE", color: "#FF9966", probability: 1 },
     { name: "TRY AGAIN", type: "NONE", color: "#CC66FF", probability: 1 }
 ];

 // Game State
 let isSpinning = false;
 let currentRotation = 0;
 let generatedCodes = {};
 let lastSpinDate = localStorage.getItem('lastSpinDate');
 let validCodes = JSON.parse(localStorage.getItem('validCodes')) || {};

 // Initialize Game
 function initGame() {
     resizeCanvas();
     drawWheel();
     setupEventListeners();
     checkSpinCooldown();
 }

 // Check if user can spin
 function checkSpinCooldown() {
     if (!lastSpinDate) return;
     
     const lastDate = new Date(lastSpinDate);
     const today = new Date();
     const diffTime = today - lastDate;
     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
     
     if (diffDays < 365) {
         spinBtn.disabled = true;
         const daysLeft = 365 - diffDays;
         cooldownMessage.textContent = `You've already spun this year. Please spin again in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`;
         cooldownMessage.classList.remove('hidden');
     }
 }

 // Handle Resizing
 function resizeCanvas() {
     const size = Math.min(350, window.innerWidth - 60);
     wheel.width = size;
     wheel.height = size;
     drawWheel();
 }

 // Draw Wheel
 function drawWheel() {
     ctx.clearRect(0, 0, wheel.width, wheel.height);
     const center = wheel.width / 2;
     const radius = center - 10;
     const segmentAngle = (Math.PI * 2) / prizes.length;
     const fontSize = Math.max(14, wheel.width / 20);

     prizes.forEach((prize, index) => {
         // Draw segment
         ctx.beginPath();
         ctx.moveTo(center, center);
         ctx.arc(center, center, radius, currentRotation + (index * segmentAngle), 
                currentRotation + ((index + 1) * segmentAngle));
         ctx.closePath();
         ctx.fillStyle = prize.color;
         ctx.fill();
         ctx.strokeStyle = 'white';
         ctx.lineWidth = 2;
         ctx.stroke();

         // Draw text
         ctx.save();
         ctx.translate(center, center);
         ctx.rotate(currentRotation + (index * segmentAngle) + (segmentAngle / 2));
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';
         ctx.fillStyle = 'white';
         ctx.font = `bold ${fontSize}px Arial`;
         
         // Split text if needed
         const lines = prize.name.split(' ');
         lines.forEach((line, i) => {
             ctx.fillText(line, radius * 0.6, i * fontSize - (lines.length > 1 ? fontSize/2 : 0));
         });
         
         ctx.restore();
     });
 }

 // Generate Unique Prize Code
 function generatePrizeCode(prizeType) {
     const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
     let code;
     
     do {
         code = '';
         for (let i = 0; i < 6; i++) {
             code += chars.charAt(Math.floor(Math.random() * chars.length));
         }
         code = prizeType + code;
     } while (generatedCodes[code]);
     
     generatedCodes[code] = true;
     validCodes[code] = { 
         type: prizeType, 
         claimed: false,
         date: new Date().toISOString()
     };
     localStorage.setItem('validCodes', JSON.stringify(validCodes));
     
     return code;
 }

 // Spin Wheel
 function spinWheel() {
     if (isSpinning) return;
     
     isSpinning = true;
     spinBtn.disabled = true;
     resultDisplay.textContent = "Spinning...";
     prizeCodeContainer.classList.add('hidden');
     claimSection.classList.add('hidden');
     
     // Determine winning segment (weighted by probability)
     const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);
     let random = Math.random() * totalProbability;
     let winningIndex = 0;
     let accumulatedProbability = 0;
     
     for (let i = 0; i < prizes.length; i++) {
         accumulatedProbability += prizes[i].probability;
         if (random <= accumulatedProbability) {
             winningIndex = i;
             break;
         }
     }
     
     // Calculate target rotation (5 full spins + winning segment)
     const spinDuration = 5000; // 5 seconds
     const extraRotations = 5;
     const targetRotation = currentRotation + 
                           (Math.PI * 2 * extraRotations) + 
                           (winningIndex * (Math.PI * 2 / prizes.length));
     
     // Animate spinning
     const startTime = performance.now();
     
     function animate(currentTime) {
         const elapsed = currentTime - startTime;
         const progress = Math.min(elapsed / spinDuration, 1);
         const easeProgress = 1 - Math.pow(1 - progress, 4); // Easing function
         
         currentRotation = easeProgress * targetRotation;
         drawWheel();
         
         if (progress < 1) {
             requestAnimationFrame(animate);
         } else {
             finishSpin(winningIndex);
         }
     }
     
     requestAnimationFrame(animate);
 }

 // Handle Spin Completion
 function finishSpin(winningIndex) {
     isSpinning = false;
     const prize = prizes[winningIndex];
     
     // Save spin date
     lastSpinDate = new Date().toISOString();
     localStorage.setItem('lastSpinDate', lastSpinDate);
     
     if (prize.type === "NONE") {
         resultDisplay.textContent = prize.name;
         resultDisplay.style.color = prize.color;
         spinBtn.disabled = true;
         cooldownMessage.textContent = "Please spin again next 29th April";
         cooldownMessage.classList.remove('hidden');
     } else {
         // Generate unique prize code
         const prizeCode = generatePrizeCode(prize.type);
         prizeCodeDisplay.textContent = prizeCode;
         
         resultDisplay.textContent = `Congratulations! You won: ${prize.name}`;
         resultDisplay.style.color = prize.color;
         prizeCodeContainer.classList.remove('hidden');
         claimSection.classList.remove('hidden');
         
         // Disable spin button for 1 year
         spinBtn.disabled = true;
         cooldownMessage.textContent = "You can spin again next year";
         cooldownMessage.classList.remove('hidden');
     }
 }

 // Validate Prize Code
 function validatePrizeCode() {
     const code = codeInput.value.trim().toUpperCase();
     claimStatus.textContent = "";
     claimStatus.className = "";
     
     if (!code) {
         claimStatus.textContent = "Please enter a prize code";
         claimStatus.classList.add('invalid-code');
         return;
     }
     
     // Check if code exists and is valid
     if (validCodes[code]) {
         if (validCodes[code].claimed) {
             claimStatus.textContent = "This code has already been claimed";
             claimStatus.classList.add('invalid-code');
         } else {
             // Mark code as claimed
             validCodes[code].claimed = true;
             localStorage.setItem('validCodes', JSON.stringify(validCodes));
             
             claimStatus.textContent = "✓ Valid code! Share Code To Celebrant For Your Prize";
             claimStatus.classList.add('valid-code');
             codeInput.value = "";
             
             // In a real implementation, you would:
             // 1. Process the prize redemption
             // 2. Maybe send to your backend
         }
     } else {
         claimStatus.textContent = "✗ Invalid prize code";
         claimStatus.classList.add('invalid-code');
     }
 }

 // Event Listeners
 function setupEventListeners() {
     spinBtn.addEventListener('click', spinWheel);
     claimBtn.addEventListener('click', validatePrizeCode);
     codeInput.addEventListener('keypress', (e) => {
         if (e.key === 'Enter') validatePrizeCode();
     });
     window.addEventListener('resize', resizeCanvas);
 }

 // Start Game
 initGame();