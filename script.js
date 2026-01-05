// ชุดผักที่เราจะใช้ (ใช้ Emoji เพื่อให้ง่ายและดูน่ารัก)
const vegetables = [
    '🥕', '🥦', '🍄', '🌶️',
    '🌽', '🍅', '🧅', '🥔'
];

let cards = []; // เก็บชุดไพ่ทั้งหมด (16 ใบ)
let flippedCards = []; // เก็บไพ่ที่ถูกพลิกในรอบปัจจุบัน (สูงสุด 2 ใบ)
let matchedPairs = 0;
let moves = 0;
let score = 0;
let timer;
let timeLeft = 60; // เริ่มต้นที่ 60 วินาที

const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const movesDisplay = document.getElementById('moves');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');

/**
 * ฟังก์ชันสุ่มและสร้างไพ่ทั้งหมด
 */
function createCards() {
    // สร้างชุดผักคู่กัน (8 คู่ = 16 ใบ)
    cards = [...vegetables, ...vegetables]; 
    
    // สุ่มตำแหน่งของไพ่ (Fisher-Yates (Knuth) Shuffle)
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    gameBoard.innerHTML = ''; // ล้างบอร์ดเก่า
    
    // สร้าง Element ของไพ่
    cards.forEach((veg, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.vegetable = veg;
        card.dataset.index = index;
        card.onclick = handleCardClick;

        // ด้านหลังไพ่ (Back)
        const backFace = document.createElement('div');
        backFace.classList.add('card-face', 'back');
        backFace.textContent = '❓'; // สัญลักษณ์ด้านหลัง

        // ด้านหน้าไพ่ (Front)
        const frontFace = document.createElement('div');
        frontFace.classList.add('card-face', 'front');
        frontFace.textContent = veg;

        card.appendChild(backFace);
        card.appendChild(frontFace);
        gameBoard.appendChild(card);
    });
}

/**
 * ฟังก์ชันจัดการการคลิกไพ่
 * @param {Event} event - เหตุการณ์การคลิก
 */
function handleCardClick(event) {
    const card = event.currentTarget;

    // ไม่ทำอะไรเลยถ้าไพ่ถูกพลิกอยู่แล้ว, ถูกจับคู่แล้ว, หรือมีไพ่พลิกอยู่ 2 ใบ
    if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length === 2) {
        return;
    }

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        setTimeout(checkForMatch, 1000); // หน่วงเวลา 1 วินาทีเพื่อดูไพ่
    }
}

/**
 * ฟังก์ชันตรวจสอบว่าไพ่ 2 ใบที่พลิกขึ้นมาตรงกันหรือไม่
 */
function checkForMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.vegetable === card2.dataset.vegetable) {
        // --- ตรงกัน (Match) ---
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        score += 10; // เพิ่ม 10 คะแนน
        scoreDisplay.textContent = score;

        if (matchedPairs === vegetables.length) {
            // จบเกมเมื่อจับคู่ครบ
            endGame(true);
        }
    } else {
        // --- ไม่ตรงกัน (No Match) ---
        // ลด 1 คะแนน
        score = Math.max(0, score - 1); 
        scoreDisplay.textContent = score;

        // พลิกไพ่กลับ
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }

    // ล้างชุดไพ่ที่ถูกพลิกสำหรับรอบถัดไป
    flippedCards = [];
}

/**
 * ฟังก์ชันอัปเดตตัวจับเวลา
 */
function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
        endGame(false); // จบเกมเมื่อหมดเวลา
    }
}

/**
 * ฟังก์ชันจบเกมและแสดงผลลัพธ์
 * @param {boolean} isWin - เป็นจริงถ้าชนะ (จับคู่ครบ), เป็นเท็จถ้าแพ้ (หมดเวลา)
 */
function endGame(isWin) {
    clearInterval(timer);
    gameBoard.querySelectorAll('.card').forEach(card => card.onclick = null); // ปิดการคลิก

    if (isWin) {
        modalMessage.innerHTML = `🎉 ยอดเยี่ยม! คุณจับคู่ครบหมดแล้ว!<br>คะแนนสุดท้าย: **${score}**<br>จำนวนครั้ง: **${moves}**`;
        modal.style.display = 'block';
    } else {
        modalMessage.innerHTML = `⏱️ หมดเวลาแล้ว!<br>คุณจับคู่ได้ ${matchedPairs} คู่<br>คะแนนสุดท้าย: **${score}**`;
        modal.style.display = 'block';
    }
}

/**
 * ฟังก์ชันปิด Modal
 */
function closeModal() {
    modal.style.display = 'none';
}

/**
 * ฟังก์ชันเริ่มต้นเกมใหม่
 */
function startGame() {
    // ตั้งค่าตัวแปรเริ่มต้น
    matchedPairs = 0;
    moves = 0;
    score = 0;
    timeLeft = 60;
    flippedCards = [];
    
    // อัปเดต UI
    timerDisplay.textContent = timeLeft;
    scoreDisplay.textContent = score;
    movesDisplay.textContent = moves;
    
    closeModal();

    // เริ่มเกม
    createCards();
    
    // เริ่มจับเวลาใหม่
    clearInterval(timer); 
    timer = setInterval(updateTimer, 1000); // อัปเดตทุก 1 วินาที
}

// เริ่มต้นเกมครั้งแรกเมื่อโหลดหน้า
startGame();

// ทำให้ฟังก์ชัน closeModal เข้าถึงได้จาก HTML (สำหรับปุ่ม X)
window.closeModal = closeModal;
window.startGame = startGame;