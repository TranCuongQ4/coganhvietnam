// =========================================================
// KHỞI TẠO BÀN CỜ GÁNH VIỆT NAM
// =========================================================

let boardState = [
    ['L', 'L', 'L', 'L', 'L'],
    ['L', null, null, null, 'L'],
    ['D', null, null, null, 'L'],
    ['D', null, null, null, 'D'],
    ['D', 'D', 'D', 'D', 'D']
];

let currentTurn = 'L';
let selectedPiece = null;

// Tự động khôi phục chế độ chơi cũ từ localStorage (mặc định là 'player')
let gameMode = localStorage.getItem('coGanh_gameMode') || 'player';

// Biến quản lý bộ đếm thời gian reset tránh trùng lặp lồng nhau
let resetCountdownTimer = null;

// =========================================================
// DOM ELEMENTS
// =========================================================

const boardGrid = document.getElementById('board-grid');
const turnIndicator = document.getElementById('turn-indicator');

const guideModal = document.getElementById('guide-modal');
const btnGuide = document.getElementById('btn-guide');
const guideText = document.getElementById('guide-text');

const btnMode = document.getElementById('btn-mode');
const modeModal = document.getElementById('mode-modal');

const btnVsPlayer = document.getElementById('btn-vs-player');
const btnVsBot = document.getElementById('btn-vs-bot');

// Âm thanh phần tử mở rộng
const bgMusic = document.getElementById('bg-music');
const btnAudioToggle = document.getElementById('btn-audio-toggle');
const audioIcon = document.getElementById('audio-icon');

let isMusicInitialized = false;

// =========================================================
// QUẢN LÝ NHẠC NỀN TỰ ĐỘNG PHÁT VÀ ĐIỀU KHIỂN LOA
// =========================================================

function initGlobalAudio() {
    if (isMusicInitialized) return;
    bgMusic.play().then(() => {
        isMusicInitialized = true;
    }).catch(err => {
        // Trình duyệt chặn tự động phát cho đến khi có click thực tế
        console.log("Đang đợi tương tác người dùng để phát nhạc.");
    });
}

// Lắng nghe click toàn màn hình để tự phát nhạc khi nhấn bất kỳ đâu
document.addEventListener('click', initGlobalAudio, { once: false });

btnAudioToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // Tránh kích hoạt lại trình nghe toàn cục
    initGlobalAudio();

    if (bgMusic.paused) {
        bgMusic.play();
        audioIcon.textContent = "🔊";
        btnAudioToggle.classList.remove('muted');
    } else {
        bgMusic.pause();
        audioIcon.textContent = "🔇";
        btnAudioToggle.classList.add('muted');
    }
});

// =========================================================
// CHẶN QUÉT KHỐI, COPY, CHUỘT PHẢI
// =========================================================

document.addEventListener('contextmenu', (e) => { e.preventDefault(); }, false);
document.addEventListener('selectstart', (e) => { e.preventDefault(); }, false);
document.addEventListener('copy', (e) => { e.preventDefault(); }, false);

// =========================================================
// VẼ BÀN CỜ
// =========================================================

function renderBoard() {
    boardGrid.innerHTML = '';

    const isBotTurn = (gameMode === 'bot' && currentTurn === 'D');

    // TÌM CÁC Ô CÓ THỂ ĐI
    let movablePoints = [];
    if (selectedPiece && !isBotTurn) {
        const allMoves = LuatCoGanh.getValidMoves(selectedPiece.r, selectedPiece.c);
        movablePoints = allMoves.filter(m => boardState[m.r][m.c] === null);
    }

    // VẼ LƯỚI BÀN CỜ 5x5
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const pointEl = document.createElement('div');
            pointEl.classList.add('point');
            pointEl.dataset.row = r;
            pointEl.dataset.col = c;

            // ĐẶT QUÂN CỜ NẾU CÓ
            if (boardState[r][c]) {
                const pieceEl = document.createElement('div');
                pieceEl.classList.add('piece', boardState[r][c]);

                // Đánh dấu quân cờ đang được chọn phát sáng
                if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
                    pieceEl.classList.add('selected');
                }
                pointEl.appendChild(pieceEl);
            }

            // ĐÁNH DẤU Ô GỢI Ý ĐƯỜNG ĐI
            const isMovable = movablePoints.some(m => m.r === r && m.c === c);
            if (isMovable) {
                pointEl.classList.add('movable');
            }

            // SỰ KIỆN CLICK VÀO Ô BÀN CỜ
            pointEl.addEventListener('click', () => {
                if (isBotTurn) return;
                handlePointClick(r, c, isMovable);
            });

            boardGrid.appendChild(pointEl);
        }
    }
}

// =========================================================
// XỬ LÝ CLICK CHỌN VÀ DI CHUYỂN QUÂN CỜ
// =========================================================

function handlePointClick(r, c, isMovable) {
    const clickedCell = boardState[r][c];

    // CHỌN QUÂN CỜ CÙNG MÀU
    if (clickedCell === currentTurn) {
        selectedPiece = { r, c };
        renderBoard();
        return;
    }

    // DI CHUYỂN QUÂN ĐẾN Ô TRỐNG HỢP LỆ
    if (isMovable && selectedPiece) {
        const mustCapture = LuatCoGanh.hasAnyGanhMove(boardState, currentTurn);

        // Giả lập nước đi để kiểm tra xem có gánh hay không
        const tempBoard = JSON.parse(JSON.stringify(boardState));
        tempBoard[r][c] = currentTurn;
        tempBoard[selectedPiece.r][selectedPiece.c] = null;

        const ganhPreview = LuatCoGanh.checkGanh(tempBoard, r, c, currentTurn);

        if (mustCapture && ganhPreview.length === 0) {
            alert("Bạn bắt buộc phải đi nước Gánh!");
            return;
        }

        // Cập nhật trạng thái di chuyển thực tế
        boardState[r][c] = currentTurn;
        boardState[selectedPiece.r][selectedPiece.c] = null;

        // XỬ LÝ LUẬT GÁNH
        const ganhList = LuatCoGanh.checkGanh(boardState, r, c, currentTurn);
        ganhList.forEach(p => { boardState[p.r][p.c] = currentTurn; });

        // XỬ LÝ LUẬT VÂY
        const vayList = LuatCoGanh.checkVay(boardState, currentTurn);
        vayList.forEach(p => { boardState[p.r][p.c] = currentTurn; });

        selectedPiece = null;
        currentTurn = (currentTurn === 'L') ? 'D' : 'L';

        updateTurnPanel();
        renderBoard();

        if (!checkGameOver()) {
            if (gameMode === 'bot' && currentTurn === 'D') {
                setTimeout(triggerBotAI, 400);
            }
        }
    }
}

// =========================================================
// BOT AI XỬ LÝ NƯỚC ĐI TỰ ĐỘNG
// =========================================================

function triggerBotAI() {
    let bestMove = BotGame.getBestMove(boardState);
    const mustCapture = LuatCoGanh.hasAnyGanhMove(boardState, 'D');

    if (mustCapture) {
        let found = null;
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (boardState[r][c] === 'D') {
                    const moves = LuatCoGanh.getValidMoves(r, c);
                    for (const mv of moves) {
                        if (boardState[mv.r][mv.c] === null) {
                            const temp = JSON.parse(JSON.stringify(boardState));
                            temp[mv.r][mv.c] = 'D';
                            temp[r][c] = null;

                            const ganh = LuatCoGanh.checkGanh(temp, mv.r, mv.c, 'D');
                            if (ganh.length > 0) {
                                found = { from: { r, c }, to: { r: mv.r, c: mv.c } };
                                break;
                            }
                        }
                    }
                }
                if (found) break;
            }
            if (found) break;
        }
        if (found) bestMove = found;
    }

    if (!bestMove) {
        alert("Bot hết nước đi!");
        return;
    }

    boardState[bestMove.to.r][bestMove.to.c] = 'D';
    boardState[bestMove.from.r][bestMove.from.c] = null;

    const ganhList = LuatCoGanh.checkGanh(boardState, bestMove.to.r, bestMove.to.c, 'D');
    ganhList.forEach(p => { boardState[p.r][p.c] = 'D'; });

    const vayList = LuatCoGanh.checkVay(boardState, 'D');
    vayList.forEach(p => { boardState[p.r][p.c] = 'D'; });

    currentTurn = 'L';
    updateTurnPanel();
    renderBoard();
    checkGameOver();
}

// =========================================================
// CẬP NHẬT THANH TRẠNG THÁI LƯỢT CHƠI
// =========================================================

function updateTurnPanel() {
    if (currentTurn === 'L') {
        turnIndicator.textContent = "Lượt Của: Quân Xanh Lá";
        turnIndicator.className = "turn-box xanh-la";
    } else {
        turnIndicator.textContent = (gameMode === 'bot') ? "Bot Đang Tính Toán..." : "Lượt Của: Quân Xanh Dương";
        turnIndicator.className = "turn-box xanh-duong";
    }
}

// =========================================================
// THÔNG BÁO KẾT THÚC TRẬN ĐẤU
// =========================================================

function showGameOverNotification(status, winnerPiece = null) {
    const oldNotify = document.getElementById('custom-gameover-notify');
    if (oldNotify) oldNotify.remove();
    if (resetCountdownTimer) clearInterval(resetCountdownTimer);

    const notifyBox = document.createElement('div');
    notifyBox.id = 'custom-gameover-notify';
    
    Object.assign(notifyBox.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '290px',
        height: 'auto',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        padding: '25px 20px',
        boxSizing: 'border-box',
        zIndex: '99999',
        fontFamily: 'sans-serif',
        textAlign: 'center'
    });

    let messageText = "";
    let countdownTime = 0;

    if (status === 'win') {
        countdownTime = 10;
        if (gameMode === 'bot') {
            messageText = `Chúc Mừng Bạn Đã Chiến Thắng Bot`;
        } else {
            // Chế độ người với người: ghi rõ bên thắng
            if (winnerPiece === 'L') {
                messageText = `Chúc Mừng Quân Xanh Lá Đã Chiến Thắng!`;
            } else {
                messageText = `Chúc Mừng Quân Xanh Dương Đã Chiến Thắng!`;
            }
        }
        Object.assign(notifyBox.style, { backgroundColor: '#c0392b', border: '4px solid #f1c40f', color: '#ffffff' });
    } else {
        countdownTime = 5;
        messageText = "Ồ Bạn Thua Rồi Chơi Ván Mới Nha";
        Object.assign(notifyBox.style, { backgroundColor: '#16a085', border: '4px solid #ffffff', color: '#ffffff' });
    }

    const msgEl = document.createElement('h1');
    msgEl.textContent = messageText;
    msgEl.style.fontSize = '20px';
    msgEl.style.lineHeight = '1.4';
    msgEl.style.margin = '0 0 15px 0';
    msgEl.style.fontWeight = 'bold';
    if (status === 'win') msgEl.style.color = '#f1c40f';
    notifyBox.appendChild(msgEl);

    const countdownEl = document.createElement('p');
    countdownEl.textContent = `Tự động chơi lại sau ${countdownTime} giây...`;
    countdownEl.style.fontSize = '14px';
    countdownEl.style.margin = '0';
    countdownEl.style.fontWeight = 'bold';
    notifyBox.appendChild(countdownEl);

    const wrapper = document.querySelector('.game-container') || document.body;
    wrapper.appendChild(notifyBox);

    resetCountdownTimer = setInterval(() => {
        countdownTime--;
        if (countdownTime <= 0) {
            clearInterval(resetCountdownTimer);
            notifyBox.remove();
            resetGame();
        } else {
            countdownEl.textContent = `Tự động chơi lại sau ${countdownTime} giây...`;
        }
    }, 1000);
}

function checkGameOver() {
    let countL = 0;
    let countD = 0;

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (boardState[r][c] === 'L') countL++;
            if (boardState[r][c] === 'D') countD++;
        }
    }

    if (countL === 0) {
        if (gameMode === 'bot') {
            showGameOverNotification('lose');
        } else {
            // Chế độ người với người: thông báo bên thắng là D
            showGameOverNotification('win', 'D');
        }
        return true;
    }

    if (countD === 0) {
        // Trong chế độ người với người: winnerPiece là L
        // Trong chế độ bot: vẫn hiển thị thông báo win (không cần truyền winnerPiece vì dùng bot message)
        if (gameMode === 'player') {
            showGameOverNotification('win', 'L');
        } else {
            showGameOverNotification('win');
        }
        return true;
    }
    return false;
}

// =========================================================
// KHỞI ĐỘNG VÀ ĐIỀU KHIỂN CÁC MODAL HỆ THỐNG
// =========================================================

function resetGame() {
    boardState = [
        ['L', 'L', 'L', 'L', 'L'],
        ['L', null, null, null, 'L'],
        ['D', null, null, null, 'L'],
        ['D', null, null, null, 'D'],
        ['D', 'D', 'D', 'D', 'D']
    ];
    currentTurn = 'L';
    selectedPiece = null;
    updateTurnPanel();
    renderBoard();

    if (gameMode === 'bot' && currentTurn === 'D') {
        setTimeout(triggerBotAI, 400);
    }
}

// Gọi mở modal hướng dẫn và chèn nội dung có nút "Đã Hiểu"
btnGuide.addEventListener('click', () => {
    guideText.innerHTML = HuongDanCoGanh.getHtml();
    guideModal.classList.remove('hidden');
});

// Điều khiển mở modal chọn chế độ chơi
btnMode.addEventListener('click', () => {
    modeModal.classList.remove('hidden');
});

btnVsPlayer.addEventListener('click', () => {
    gameMode = 'player';
    localStorage.setItem('coGanh_gameMode', 'player');
    modeModal.classList.add('hidden');
    resetGame();
});

btnVsBot.addEventListener('click', () => {
    gameMode = 'bot';
    localStorage.setItem('coGanh_gameMode', 'bot');
    modeModal.classList.add('hidden');
    resetGame();
});

// Click ra ngoài vùng trống modal để tự động ẩn bảng
window.addEventListener('click', (e) => {
    if (e.target === guideModal) guideModal.classList.add('hidden');
    if (e.target === modeModal) modeModal.classList.add('hidden');
});

// KHỞI CHẠY LẦN ĐẦU TẢI TRANG
updateTurnPanel();
renderBoard();