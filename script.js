function showNotification(type, title, message) {
    const notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) return; // Exit if the container isn't found
    
    const icon = type === 'success' ? '✅' : '❌';
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-body">
            <p>${title}</p>
            <span>${message}</span>
        </div>
    `;
    notificationContainer.appendChild(notification);
    // Automatically remove the notification after 5 seconds
    setTimeout(() => { if (notification) notification.remove(); }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Copy to Clipboard Functionality ---
    const copyButton = document.getElementById('copy-button');
    const contractText = document.getElementById('contract-text');

    if (copyButton && contractText) {
        copyButton.addEventListener('click', () => {
            const textToCopy = contractText.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Provide user feedback
                copyButton.innerText = 'Copied!';
                setTimeout(() => {
                    copyButton.innerText = 'Copy';
                }, 2000); // Reset text after 2 seconds
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }

    // --- Fade-in on Scroll Animation ---
    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Start animating a little before it's fully in view
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once it's visible
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

});
    // --- Clobonomics Page Copy Button ---
    const clobonomicsCopyButton = document.getElementById('clobonomics-copy-button');
    const clobonomicsContractText = document.getElementById('clobonomics-contract-text');

    if (clobonomicsCopyButton && clobonomicsContractText) {
        clobonomicsCopyButton.addEventListener('click', () => {
            const textToCopy = clobonomicsContractText.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                clobonomicsCopyButton.innerText = 'Copied!';
                setTimeout(() => {
                    clobonomicsCopyButton.innerText = 'Copy';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }
    // --- Master Function to run after page loads ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Check if core libraries are loaded. If not, stop everything. ---
    if (typeof ethers === 'undefined' || typeof Web3Modal === 'undefined' || typeof WalletConnectProvider === 'undefined') {
        console.error('CRITICAL ERROR: A required library (Ethers, Web3Modal, or WalletConnect) did not load. Check your script tags in index.html and make sure the .js files are in your project folder.');
        alert('A critical error occurred loading the website. Please check the console (F12).');
        return;
    }

    // ==========================================================
    //               THE CLOB CHAD ARCADE LOGIC
    // ==========================================================
    const arcadeSection = document.getElementById('arcade');

    // --- ADD THIS BLOCK ---
// Configuration for Monad Testnet and Payments
const monadTestnetConfig = {
    chainId: '10143', // This is a placeholder! Replace with Monad's real Testnet Chain ID.
    chainName: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: ['https://testnet-rpc.monad.xyz/'], // Replace with Monad's real RPC URL.
    blockExplorerUrls: ['https://testnet.monadexplorer.com/'] // Replace with Monad's real block explorer.
};
const paymentAddress = '0xd3799677972dF0A240BC6B4d6Ca9988c3176d478'; // <--- !!! IMPORTANT: REPLACE WITH YOUR WALLET ADDRESS !!!
const paymentAmount = '0.1';

// New State Variable for Credits
let userCredits = 0; // In a real app, this would be fetched from a backend.

// New DOM Elements for Credits UI
const playerCreditsEl = document.getElementById('player-credits');
const addCreditsBtn = document.getElementById('add-credits-btn');
// --- END OF BLOCK TO ADD ---
    
    // Only run Arcade code if the section exists on the page
    if (arcadeSection) {
        const Web3Modal = window.Web3Modal.default;
        const WalletConnectProvider = window.WalletConnectProvider.default;

        // --- DOM Elements ---
        const connectBtn = document.getElementById('connect-wallet-btn');
        const playerStatsEl = document.querySelector('.player-stats');
        const walletAddressEl = document.getElementById('wallet-address');
        const leaderboardTable = document.getElementById('leaderboard-table');
        
        // --- Web3Modal Initialization ---
        const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            // Using Infura ID is better for reliability
            infuraId: "84842078b09946638c03157f83405213",
        }
    }
};

        const web3Modal = new Web3Modal({
            cacheProvider: false,
            providerOptions,
            theme: "dark"
        });

       // --- REPLACE THE OLD connectWallet FUNCTION WITH THIS NEW VERSION ---

let provider, signer, userAddress; // Make these variables accessible to other functions

async function connectWallet() {
    try {
        await web3Modal.clearCachedProvider();
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        console.log("Wallet Connected:", userAddress);

        // This will now ask the user to switch/add the Monad network
        await switchToMonadTestnet(); 
        
        // This will update the entire UI, including credits
        updateUIForConnectedState();

    } catch (error) {
        console.error("User closed modal or an error occurred:", error);
    }
}

function updateUIForConnectedState() {
    connectBtn.style.display = 'none';
    playerStatsEl.style.display = 'block';
    walletAddressEl.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
    updateCreditsDisplay(); // Update credits display on connect
}
// --- ADD THESE THREE FUNCTIONS AFTER connectWallet ---

async function switchToMonadTestnet() {
    if (!window.ethereum) return;
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: monadTestnetConfig.chainId }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) { // This error code means the chain is not in MetaMask
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [monadTestnetConfig],
                });
            } catch (addError) {
                console.error("Failed to add Monad Testnet", addError);
                alert("Failed to add the Monad Testnet to your wallet.");
            }
        }
    }
}

async function addCredits() {
    if (!signer) { // `signer` is a variable we will define inside connectWallet
       showNotification('error', 'Wallet Not Connected', 'Please connect your wallet first.');
        return;
    }

    try {
        const tx = await signer.sendTransaction({
            to: paymentAddress,
            value: ethers.utils.parseEther(paymentAmount)
        });
        
        showNotification('success', 'Transaction Sent', 'Please confirm in your wallet.');
        await tx.wait(); // Wait for 1 confirmation
        
        userCredits++;
        updateCreditsDisplay();
        showNotification('success', 'Payment Confirmed!', `You now have ${userCredits} Arcade Credit(s).`);
    } catch (error) {
        console.error("Payment failed:", error);
        showNotification('error', 'Payment Failed', 'Make sure you have enough testnet MON.');
    }
}

function updateCreditsDisplay() {
    if(playerCreditsEl) {
        playerCreditsEl.textContent = userCredits;
    }
}
function launchGame(gameId) {
    if(userCredits <= 0) {
       showNotification('error', 'No Credits!', 'Buy a credit for 0.1 MON to play.');
        return;
    }
    
    // In a real app with a backend, this would be more complex
    userCredits--; 
    updateCreditsDisplay();
    
    // We get the HTML elements for the modal
    const modal = document.getElementById('game-modal');
    const gameContainer = document.getElementById('game-container');
    
    // Clear any previous game from the container and show the modal
    gameContainer.innerHTML = ''; 
    modal.style.display = "flex";
    
    if (gameId === 'order-flow-hero') {
        // Now, we call the game function we already created
        startOrderFlowHero(gameContainer);
    } else if (gameId === 'flappy-chad') {
         startFlappyChad(gameContainer);
        // We will add the logic for Flappy Chad here later
    }
}

// --- END OF BLOCK TO ADD ---

        // --- Event Listeners ---
// --- Event Listeners ---
if (connectBtn) { /* This block is already here */ }
if (addCreditsBtn) { /* This block is already here */ }

// ADD THIS NEW BLOCK
document.querySelectorAll('.game-card').forEach(card => {
    if (!card.classList.contains('coming-soon')) {
        card.addEventListener('click', () => {
            if (!userAddress) {
               showNotification('error', 'Wallet Not Connected', 'Please connect your wallet to play!');

                return;
            }
            const gameId = card.dataset.game;
            launchGame(gameId);
        });
    }
});

const closeModalBtn = document.getElementById('close-modal-btn');
if(closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        const modal = document.getElementById('game-modal');
        modal.style.display = "none";
        // We will add logic here to stop the game timers
    });
}


        if (connectBtn) {
            connectBtn.addEventListener('click', connectWallet);
        }

        if (addCreditsBtn) {
    addCreditsBtn.addEventListener('click', addCredits);
}

        // --- Leaderboard Mockup Logic (from previous step) ---
        if (leaderboardTable) {
            const mockLeaderboard = [
                { rank: 1, address: '0xGIGA...CHAD', score: 9999 },
                { rank: 2, address: 'FEELSGOOD...MAN', score: 8008 },
                { rank: 3, address: 'SATOSHI...JR', score: 7777 },
                { rank: 4, address: 'LimitOrderGod', score: 6969 },
                { rank: 5, address: 'Clobstradamus', score: 5555 }
            ];
            leaderboardTable.innerHTML = `<thead><tr><th>Rank</th><th>Chad</th><th>Score</th></tr></thead>`;
            const tbody = document.createElement('tbody');
            mockLeaderboard.forEach(player => {
                const row = tbody.insertRow();
                row.innerHTML = `<td style="text-align: center;">${player.rank}</td><td style="font-family: monospace;">${player.address}</td><td style="text-align: right; color: var(--primary-green); font-weight: bold;">${player.score}</td>`;
            });
            leaderboardTable.appendChild(tbody);
        }
    }
});
// ==========================================================
//               GAME: ORDER FLOW HERO
// ==========================================================
function startOrderFlowHero(gameContainer) {
    // 1. Create Game Structure
    gameContainer.innerHTML = `
        <h5>Order Flow Hero</h5>
        <div class="game-ui">Score: <span id="game-score">0</span> | Time: <span id="game-time">20</span>s</div>
        <div class="order-flow-grid"></div>
        <button id="start-game-button" class="btn btn-primary" style="display:block; margin: 1rem auto;">Start</button>
    `;

    // 2. Get Game Elements
    const grid = gameContainer.querySelector('.order-flow-grid');
    const scoreDisplay = gameContainer.querySelector('#game-score');
    const timeDisplay = gameContainer.querySelector('#game-time');
    const startButton = gameContainer.querySelector('#start-game-button');
    let cells = [];

    // Create 4x4 grid cells
    for(let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        grid.appendChild(cell);
        cells.push(cell);
    }
    
    // 3. Game State Variables
    let score = 0;
    let timeLeft = 20;
    let gameInterval = null;
    let timerInterval = null;
    let activeCell = -1;

    // 4. Game Functions
    function runGame() {
        // Hide start button and reset state
        startButton.style.display = 'none';
        score = 0;
        timeLeft = 20;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        
        // Start timers
        timerInterval = setInterval(updateTimer, 1000);
        gameInterval = setInterval(spawnOrder, 900); // New order appears every 0.9s
    }

    function updateTimer() {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }
    
    function spawnOrder() {
        // Clear previous cell
        if (activeCell !== -1) cells[activeCell].className = 'grid-cell';
        
        // Pick a new random cell
        activeCell = Math.floor(Math.random() * cells.length);
        const cell = cells[activeCell];
        const isGood = Math.random() > 0.4; // 60% chance of good order
        
        cell.classList.add(isGood ? 'good' : 'bad');
    }

    function cellClicked(e) {
        if (!gameInterval || !e.target.classList.contains('grid-cell')) return;
        
        if (e.target.classList.contains('good')) {
            score += 100;
            e.target.classList.add('tapped-good');
        } else if (e.target.classList.contains('bad')) {
            score -= 50;
            e.target.classList.add('tapped-bad');
        }
        
        scoreDisplay.textContent = score;
        // Clear immediately for faster gameplay
        if (activeCell !== -1) cells[activeCell].className = 'grid-cell';
        clearInterval(gameInterval);
        gameInterval = setInterval(spawnOrder, 900);
        spawnOrder();
    }
    
    function endGame() {
        clearInterval(gameInterval);
        clearInterval(timerInterval);
        gameInterval = null;
        showNotification('success', 'Game Over!', `Your final score: ${score}`);
        
        // In the future, this would submit the score to the leaderboard backend
        // e.g. submitScore(userAddress, score);
        startButton.style.display = 'block';
    }
    
    // 5. Add Event Listeners
    startButton.addEventListener('click', runGame);
    grid.addEventListener('click', cellClicked);
}
// ==========================================================
//               GAME: FLAPPY CHAD
// ==========================================================
function startFlappyChad(gameContainer) {
    // 1. Create Game Structure
    gameContainer.innerHTML = `
        <h5>Flappy Chad</h5>
        <canvas id="flappy-canvas" class="flappy-chad-canvas" width="400" height="500"></canvas>
        <div id="flappy-game-over" class="game-over-screen">
            <h2>GAME OVER</h2>
            <p>Your Score: <span id="final-score">0</span></p>
            <button id="restart-flappy-btn" class="btn btn-primary">Try Again</button>
        </div>
    `;

    // 2. Get Game Elements & Context
    const canvas = gameContainer.querySelector('#flappy-canvas');
    const ctx = canvas.getContext('2d');
    const gameOverScreen = gameContainer.querySelector('#flappy-game-over');
    const finalScoreEl = gameContainer.querySelector('#final-score');
    const restartBtn = gameContainer.querySelector('#restart-flappy-btn');

    // 3. Load Chad Image
    const chadImage = new Image();
    chadImage.src = 'flappy-chad.png'; // Make sure you have this image in your folder!

    // 4. Game Variables
    let chadX = 50;
    let chadY = 200;
    let velocityY = 0;
    const gravity = 0.25;
    const jump = -6;
    let score = 0;
    let pipes = [];
    let pipeGap = 150;
    let pipeInterval = 120; // Frames between new pipes
    let frameCount = 0;
    let gameIsOver = false;

    // 5. Game Loop
    function gameLoop() {
        if (gameIsOver) return;

        // Update game state
        update();
        // Draw everything
        draw();
        // Repeat
        requestAnimationFrame(gameLoop);
    }
    
    // 6. Update Logic
    function update() {
        // Move Chad
        velocityY += gravity;
        chadY += velocityY;

        // Move pipes
        if (frameCount % pipeInterval === 0) {
            let pipeY = Math.random() * (canvas.height - pipeGap - 100) + 50;
            pipes.push({ x: canvas.width, y: pipeY });
        }
        frameCount++;

        pipes.forEach(pipe => {
            pipe.x -= 2;
        });

        // Add score
        if(pipes[0] && pipes[0].x < chadX && !pipes[0].passed) {
            score++;
            pipes[0].passed = true;
        }

        // Remove off-screen pipes
        pipes = pipes.filter(pipe => pipe.x + 50 > 0);

        // Check for collisions
        checkCollisions();
    }

    // 7. Drawing Logic
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Chad
        ctx.save();
ctx.translate(chadX + 20, chadY + 20);
let rotation = Math.PI / 6 * (velocityY / 15);
if (rotation > Math.PI / 4) rotation = Math.PI / 4;
ctx.rotate(rotation);
ctx.drawImage(chadImage, -20, -20, 40, 40);
ctx.restore();

        // Draw Pipes
       ctx.fillStyle = 'var(--primary-green)';
        pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, 0, 50, pipe.y); // Top pipe
            ctx.fillRect(pipe.x, pipe.y + pipeGap, 50, canvas.height); // Bottom pipe
        });

        // Draw Score
        ctx.fillStyle = 'white';
        ctx.font = '30px "Anton", sans-serif';
        ctx.fillText(score, canvas.width / 2, 50);
    }
    
    // 8. Player Input (Jump)
    function jumpChad() {
        if (!gameIsOver) {
            velocityY = jump;
        }
    }

    // 9. Collision Detection
    function checkCollisions() {
        // Floor/ceiling collision
        if(chadY + 40 > canvas.height || chadY < 0) {
            gameOver();
        }
        // Pipe collision
        pipes.forEach(pipe => {
            if (chadX + 40 > pipe.x && chadX < pipe.x + 50 &&
               (chadY < pipe.y || chadY + 40 > pipe.y + pipeGap)) {
                gameOver();
            }
        });
    }

    // 10. Game Over
    function gameOver() {
        gameIsOver = true;
        finalScoreEl.textContent = score;
        gameOverScreen.style.display = 'flex';
        showNotification('error', 'You Got Rugged!', `Your final score: ${score}`);
        // In the future, this is where you submit the score
    }

    // 11. Restart Game
    function restartGame() {
        chadY = 200;
        velocityY = 0;
        score = 0;
        pipes = [];
        frameCount = 0;
        gameIsOver = false;
        gameOverScreen.style.display = 'none';
        gameLoop();
    }

    // Add Event Listeners
    canvas.addEventListener('click', jumpChad);
    restartBtn.addEventListener('click', restartGame);

    // ===================================
//      ADD THIS NEW BLOCK
// ===================================
document.addEventListener('keydown', (e) => {
    // We only want the spacebar to work when the game modal is open
    const modal = document.getElementById('game-modal');
    if (modal.style.display === "flex" && e.code === 'Space') {
        e.preventDefault(); // Prevents the page from scrolling down
        jumpChad();
    }
});
    
    // Initial draw to show the canvas before game starts
    draw();
    // Wait for a click to start the gravity/game loop
    canvas.addEventListener('click', function startInitialLoop() {
        if (frameCount === 0) {
             gameLoop();
        }
       canvas.removeEventListener('click', startInitialLoop);
    }, { once: true });
}