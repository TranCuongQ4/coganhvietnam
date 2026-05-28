// =========================================================
// TIME.JS - HỆ THỐNG ĐẾM GIỜ CHO CỜ GÁNH
// =========================================================
// - Tổng thời gian trận đấu: 4 phút (240 giây)
// - Mỗi bên có 30 giây suy nghĩ, quá 30 giây không đi -> thua
// - Tự động thêm bộ đếm thời gian vào giao diện
// - Không cần chỉnh sửa bất kỳ file HTML, CSS hay script nào khác

(function() {
    // =========================================================
    // CẤU HÌNH
    // =========================================================
    const TOTAL_GAME_TIME = 240; // 4 phút = 240 giây
    const TURN_TIME = 30; // 30 giây cho mỗi lượt
    
    let gameTimeLeft = TOTAL_GAME_TIME; // Thời gian còn lại của trận đấu
    let turnTimeLeft = TURN_TIME; // Thời gian còn lại của lượt hiện tại
    let timerInterval = null;
    let turnTimerInterval = null;
    let isGameActive = true;
    let gameEndedByTime = false;
    let currentTurnPlayer = 'L'; // Lưu lượt hiện tại để theo dõi
    
    // =========================================================
    // TẠO GIAO DIỆN BỘ ĐẾM GIỜ
    // =========================================================
    function createTimerUI() {
        // Tìm nút audio toggle (cái loa)
        const audioButton = document.getElementById('btn-audio-toggle');
        if (!audioButton) {
            console.error('Không tìm thấy nút audio (btn-audio-toggle)');
            return;
        }
        
        // Tìm container cha của nút audio
        const audioContainer = audioButton.parentElement;
        if (!audioContainer) {
            console.error('Không tìm thấy container của audio');
            return;
        }
        
        // Tạo container chính cho timer
        const mainTimerContainer = document.createElement('div');
        mainTimerContainer.className = 'main-timer-container';
        mainTimerContainer.style.cssText = `
            display: flex;
            gap: 15px;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
        `;
        
        // === TIMER TRẬN ĐẤU (4 phút) ===
        const gameTimerDiv = document.createElement('div');
        gameTimerDiv.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            padding: 2px 6px;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border: 2px solid #ffd700;
        `;
        
        const gameClockIcon = document.createElement('span');
        gameClockIcon.textContent = '⏱️';
        gameClockIcon.style.cssText = `font-size: 20px;`;
        
        const gameTimerText = document.createElement('span');
        gameTimerText.id = 'game-timer-display';
        gameTimerText.textContent = formatTime(gameTimeLeft);
        gameTimerText.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;			
            min-width: 80px;
            text-align: center;
        `;
        
        const gameLabel = document.createElement('span');
        gameLabel.textContent = 'Trận';
        gameLabel.style.cssText = `font-size: 12px; color: #ffd700;`;
        
        gameTimerDiv.appendChild(gameClockIcon);
        gameTimerDiv.appendChild(gameTimerText);
        gameTimerDiv.appendChild(gameLabel);
        
        // === TIMER LƯỢT ĐI (30 giây) ===
        const turnTimerDiv = document.createElement('div');
        turnTimerDiv.id = 'turn-timer-container';
        turnTimerDiv.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: linear-gradient(135deg, #1a472a, #0d2818);
            padding: 2px 6px;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border: 2px solid #4ade80;
            transition: all 0.3s ease;
        `;
        
        const turnIcon = document.createElement('span');
        turnIcon.id = 'turn-icon';
        turnIcon.textContent = '🔵';
        turnIcon.style.cssText = `font-size: 20px;`;
        
        const turnTimerText = document.createElement('span');
        turnTimerText.id = 'turn-timer-display';
        turnTimerText.textContent = formatSeconds(turnTimeLeft);
        turnTimerText.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            background: linear-gradient(135deg, #4ade80, #22c55e);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            min-width: 60px;
            text-align: center;
        `;
        
        const turnLabel = document.createElement('span');
        turnLabel.textContent = 'Giây';
        turnLabel.style.cssText = `font-size: 12px; color: #4ade80;`;
        
        turnTimerDiv.appendChild(turnIcon);
        turnTimerDiv.appendChild(turnTimerText);
        turnTimerDiv.appendChild(turnLabel);
        
        mainTimerContainer.appendChild(gameTimerDiv);
        mainTimerContainer.appendChild(turnTimerDiv);
        
        // Chèn timer vào sau nút audio
        audioContainer.insertBefore(mainTimerContainer, audioButton.nextSibling);
        
        // Căn chỉnh container cha
        audioContainer.style.display = 'flex';
        audioContainer.style.alignItems = 'center';
        audioContainer.style.justifyContent = 'center';
        audioContainer.style.gap = '10px';
        audioContainer.style.flexWrap = 'wrap';
        
        return { gameTimerText, turnTimerText };
    }
    
    // =========================================================
    // HÀM ĐỊNH DẠNG THỜI GIAN
    // =========================================================
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function formatSeconds(seconds) {
        return `${seconds.toString().padStart(2, '0')}`;
    }
    
    // =========================================================
    // CẬP NHẬT HIỂN THỊ
    // =========================================================
    function updateDisplays() {
        const gameDisplay = document.getElementById('game-timer-display');
        const turnDisplay = document.getElementById('turn-timer-display');
        
        if (gameDisplay) {
            gameDisplay.textContent = formatTime(gameTimeLeft);
            
            // Đổi màu cảnh báo
            if (gameTimeLeft <= 60) {
                gameDisplay.style.background = 'linear-gradient(135deg, #ff4444, #ff6666)';
                gameDisplay.style.webkitBackgroundClip = 'text';
                gameDisplay.style.backgroundClip = 'text';
            } else if (gameTimeLeft <= 120) {
                gameDisplay.style.background = 'linear-gradient(135deg, #ffaa44, #ffcc66)';
                gameDisplay.style.webkitBackgroundClip = 'text';
                gameDisplay.style.backgroundClip = 'text';
            }
        }
        
        if (turnDisplay) {
            turnDisplay.textContent = formatSeconds(turnTimeLeft);
            
            // Đổi màu cảnh báo cho turn timer
            if (turnTimeLeft <= 10) {
                turnDisplay.style.background = 'linear-gradient(135deg, #ff4444, #ff6666)';
                turnDisplay.style.webkitBackgroundClip = 'text';
                turnDisplay.style.backgroundClip = 'text';
                
                // Nhấp nháy container
                blinkTurnTimer();
            } else if (turnTimeLeft <= 20) {
                turnDisplay.style.background = 'linear-gradient(135deg, #ffaa44, #ffcc66)';
                turnDisplay.style.webkitBackgroundClip = 'text';
                turnDisplay.style.backgroundClip = 'text';
            } else {
                turnDisplay.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
                turnDisplay.style.webkitBackgroundClip = 'text';
                turnDisplay.style.backgroundClip = 'text';
            }
        }
    }
    
    let turnBlinkInterval = null;
    function blinkTurnTimer() {
        if (turnBlinkInterval) clearInterval(turnBlinkInterval);
        const container = document.getElementById('turn-timer-container');
        if (!container) return;
        
        turnBlinkInterval = setInterval(() => {
            if (turnTimeLeft <= 0 || !isGameActive) {
                if (turnBlinkInterval) clearInterval(turnBlinkInterval);
                return;
            }
            container.style.borderColor = container.style.borderColor === 'rgb(255, 68, 68)' ? '#4ade80' : '#ff4444';
            container.style.boxShadow = container.style.borderColor === 'rgb(255, 68, 68)' 
                ? '0 0 20px rgba(255,68,68,0.8)' 
                : '0 4px 15px rgba(0,0,0,0.3)';
        }, 500);
    }
    
    // =========================================================
    // CẬP NHẬT ICON NGƯỜI CHƠI (THAY DẤU VUÔNG THÀNH MÀU XANH)
    // =========================================================
    function updateTurnIcon(turn) {
        const turnIcon = document.getElementById('turn-icon');
        const turnContainer = document.getElementById('turn-timer-container');
        
        if (turnIcon) {
            if (turn === 'L') {
                turnIcon.textContent = '●';
                turnIcon.style.color = '#4ade80';
                turnIcon.style.textShadow = '0 0 5px #4ade80';
                if (turnContainer) {
                    turnContainer.style.borderColor = '#4ade80';
                }
            } else {
                turnIcon.textContent = '●';
                turnIcon.style.color = '#60a5fa';
                turnIcon.style.textShadow = '0 0 5px #60a5fa';
                if (turnContainer) {
                    turnContainer.style.borderColor = '#60a5fa';
                }
            }
        }
    }
    
    // =========================================================
    // TÍNH TOÁN SỐ QUÂN
    // =========================================================
    function countPieces() {
        if (typeof boardState === 'undefined') {
            return { L: 0, D: 0 };
        }
        
        let countL = 0, countD = 0;
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (boardState[r][c] === 'L') countL++;
                if (boardState[r][c] === 'D') countD++;
            }
        }
        return { L: countL, D: countD };
    }
    
    // =========================================================
    // XỬ LÝ THUA DO HẾT GIỜ LƯỢT
    // =========================================================
    function endGameByTurnTimeout() {
        if (!isGameActive || gameEndedByTime) return;
        
        gameEndedByTime = true;
        isGameActive = false;
        
        let winner = null;
        let message = '';
        
        // Người chơi hiện tại bị thua do hết giờ suy nghĩ
        if (currentTurnPlayer === 'L') {
            winner = 'D';
            message = '⏰ QUÂN XANH LÁ HẾT 30 GIÂY SUY NGHĨ! QUÂN XANH DƯƠNG THẮNG!';
        } else {
            winner = 'L';
            message = '⏰ QUÂN XANH DƯƠNG HẾT 30 GIÂY SUY NGHĨ! QUÂN XANH LÁ THẮNG!';
        }
        
        // Dừng tất cả timer
        if (timerInterval) clearInterval(timerInterval);
        if (turnTimerInterval) clearInterval(turnTimerInterval);
        if (turnBlinkInterval) clearInterval(turnBlinkInterval);
        
        showTimeOverNotification(message, winner, 'turn');
    }
    
    // =========================================================
    // XỬ LÝ KẾT THÚC TRẬN DO HẾT 4 PHÚT
    // =========================================================
    function endGameByGameTime() {
        if (!isGameActive || gameEndedByTime) return;
        
        if (turnBlinkInterval) clearInterval(turnBlinkInterval);
        
        const { L, D } = countPieces();
        let winner = null;
        let message = '';
        
        if (L > D) {
            winner = 'L';
            message = '🏆 HẾT 4 PHÚT! QUÂN XANH LÁ THẮNG (NHIỀU QUÂN HƠN)! 🏆';
        } else if (D > L) {
            winner = 'D';
            message = '🏆 HẾT 4 PHÚT! QUÂN XANH DƯƠNG THẮNG (NHIỀU QUÂN HƠN)! 🏆';
        } else {
            message = '🤝 HẾT 4 PHÚT! HÒA (SỐ QUÂN BẰNG NHAU)! 🤝';
        }
        
        gameEndedByTime = true;
        isGameActive = false;
        
        if (timerInterval) clearInterval(timerInterval);
        if (turnTimerInterval) clearInterval(turnTimerInterval);
        
        showTimeOverNotification(message, winner, 'game');
    }
    
    // =========================================================
    // HIỂN THỊ THÔNG BÁO
    // =========================================================
    function showTimeOverNotification(message, winner, type) {
        const oldNotify = document.getElementById('timeout-notification');
        if (oldNotify) oldNotify.remove();
        
        const notifyBox = document.createElement('div');
        notifyBox.id = 'timeout-notification';
        notifyBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 450px;
            background: linear-gradient(135deg, #1e0a0a, #2d1515);
            border: 3px solid ${type === 'turn' ? '#ff6600' : '#ff4444'};
            border-radius: 20px;
            padding: 25px;
            text-align: center;
            z-index: 100000;
            box-shadow: 0 0 50px rgba(255,0,0,0.5);
            animation: timeAlertPulse 0.5s ease-in-out;
        `;
        
        if (!document.querySelector('#timeout-styles')) {
            const style = document.createElement('style');
            style.id = 'timeout-styles';
            style.textContent = `
                @keyframes timeAlertPulse {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.05); }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        const icon = document.createElement('div');
        icon.textContent = type === 'turn' ? '⏰⚡' : '🏆⏰';
        icon.style.cssText = `font-size: 70px; margin-bottom: 15px;`;
        notifyBox.appendChild(icon);
        
        const title = document.createElement('h2');
        title.textContent = type === 'turn' ? 'HẾT GIỜ SUY NGHĨ!' : 'HẾT THỜI GIAN TRẬN!';
        title.style.cssText = `
            color: ${type === 'turn' ? '#ff6600' : '#ff4444'};
            font-size: 28px;
            margin: 0 0 15px 0;
            font-weight: bold;
        `;
        notifyBox.appendChild(title);
        
        const msgEl = document.createElement('p');
        msgEl.textContent = message;
        msgEl.style.cssText = `color: #ffffff; font-size: 16px; margin: 10px 0; line-height: 1.5; font-weight: bold;`;
        notifyBox.appendChild(msgEl);
        
        const { L, D } = countPieces();
        const scoreEl = document.createElement('div');
        scoreEl.style.cssText = `
            background: rgba(0,0,0,0.5);
            border-radius: 15px;
            padding: 12px;
            margin: 15px 0;
        `;
        scoreEl.innerHTML = `
            <div style="display: flex; justify-content: space-around; gap: 20px;">
                <div style="text-align: center;">
                    <div style="color: #4ade80; font-size: 24px; font-weight: bold;">${L}</div>
                    <div style="color: #ffd700; font-size: 14px;">● XANH LÁ</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #60a5fa; font-size: 24px; font-weight: bold;">${D}</div>
                    <div style="color: #ffd700; font-size: 14px;">● XANH DƯƠNG</div>
                </div>
            </div>
        `;
        notifyBox.appendChild(scoreEl);
        
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 CHƠI LẠI';
        resetBtn.style.cssText = `
            background: linear-gradient(135deg, #ff4444, #cc0000);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 40px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 15px;
            transition: transform 0.2s;
        `;
        resetBtn.onclick = () => {
            if (typeof window.resetGame === 'function') {
                window.resetGame();
            }
            notifyBox.remove();
        };
        
        notifyBox.appendChild(resetBtn);
        document.body.appendChild(notifyBox);
    }
    
    // =========================================================
    // RESET TOÀN BỘ TIMER
    // =========================================================
    function resetAllTimers() {
        if (timerInterval) clearInterval(timerInterval);
        if (turnTimerInterval) clearInterval(turnTimerInterval);
        if (turnBlinkInterval) clearInterval(turnBlinkInterval);
        
        gameTimeLeft = TOTAL_GAME_TIME;
        turnTimeLeft = TURN_TIME;
        isGameActive = true;
        gameEndedByTime = false;
        
        // Lấy lượt hiện tại từ script chính
        if (typeof currentTurn !== 'undefined') {
            currentTurnPlayer = currentTurn;
            updateTurnIcon(currentTurnPlayer);
        }
        
        updateDisplays();
        startTimers();
    }
    
    // =========================================================
    // BẮT ĐẦU TIMER
    // =========================================================
    function startTimers() {
        // Timer cho trận đấu (4 phút)
        timerInterval = setInterval(() => {
            if (!isGameActive) return;
            
            if (gameTimeLeft > 0) {
                gameTimeLeft--;
                updateDisplays();
                
                if (gameTimeLeft <= 0) {
                    clearInterval(timerInterval);
                    clearInterval(turnTimerInterval);
                    endGameByGameTime();
                }
            }
        }, 1000);
        
        startTurnTimer();
    }
    
    function startTurnTimer() {
        if (turnTimerInterval) clearInterval(turnTimerInterval);
        
        turnTimerInterval = setInterval(() => {
            if (!isGameActive) return;
            
            if (turnTimeLeft > 0) {
                turnTimeLeft--;
                updateDisplays();
                
                if (turnTimeLeft <= 0) {
                    clearInterval(turnTimerInterval);
                    endGameByTurnTimeout();
                }
            }
        }, 1000);
    }
    
    // =========================================================
    // RESET TIMER LƯỢT (KHI CÓ NƯỚC ĐI)
    // =========================================================
    function resetTurnTimer() {
        if (!isGameActive || gameEndedByTime) return;
        
        turnTimeLeft = TURN_TIME;
        
        // Cập nhật icon lượt hiện tại
        if (typeof currentTurn !== 'undefined') {
            currentTurnPlayer = currentTurn;
            updateTurnIcon(currentTurnPlayer);
        }
        
        // Reset màu border
        const turnContainer = document.getElementById('turn-timer-container');
        if (turnContainer) {
            turnContainer.style.borderColor = currentTurnPlayer === 'L' ? '#4ade80' : '#60a5fa';
            turnContainer.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        }
        
        if (turnBlinkInterval) clearInterval(turnBlinkInterval);
        
        updateDisplays();
        
        // Khởi động lại turn timer
        if (turnTimerInterval) clearInterval(turnTimerInterval);
        startTurnTimer();
    }
    
    // =========================================================
    // THEO DÕI NƯỚC ĐI TỪ SCRIPT CHÍNH
    // =========================================================
    function hookGameMoves() {
        // Lưu lại hàm xử lý click gốc
        const originalHandlePointClick = window.handlePointClick;
        if (typeof originalHandlePointClick === 'function') {
            window.handlePointClick = function(r, c, isMovable) {
                const result = originalHandlePointClick.apply(this, arguments);
                // Sau mỗi nước đi thành công, reset turn timer
                if (isMovable && !gameEndedByTime) {
                    setTimeout(() => resetTurnTimer(), 50);
                }
                return result;
            };
        }
        
        // Theo dõi bot AI
        const originalTriggerBotAI = window.triggerBotAI;
        if (typeof originalTriggerBotAI === 'function') {
            window.triggerBotAI = function() {
                const result = originalTriggerBotAI.apply(this, arguments);
                setTimeout(() => resetTurnTimer(), 100);
                return result;
            };
        }
    }
    
    // =========================================================
    // THEO DÕI RESET GAME
    // =========================================================
    function hookGameReset() {
        const originalResetGame = window.resetGame;
        if (typeof originalResetGame === 'function') {
            window.resetGame = function() {
                resetAllTimers();
                return originalResetGame.apply(this, arguments);
            };
        }
    }
    
    // =========================================================
    // KHỞI TẠO
    // =========================================================
    function initTimer() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                createTimerUI();
                hookGameMoves();
                hookGameReset();
                
                // Lấy lượt hiện tại ban đầu
                if (typeof currentTurn !== 'undefined') {
                    currentTurnPlayer = currentTurn;
                    updateTurnIcon(currentTurnPlayer);
                }
                
                startTimers();
            });
        } else {
            createTimerUI();
            hookGameMoves();
            hookGameReset();
            
            if (typeof currentTurn !== 'undefined') {
                currentTurnPlayer = currentTurn;
                updateTurnIcon(currentTurnPlayer);
            }
            
            startTimers();
        }
    }
    
    // API public
    window.TimeManager = {
        getGameTimeLeft: () => gameTimeLeft,
        getTurnTimeLeft: () => turnTimeLeft,
        resetTurnTimer: resetTurnTimer,
        resetAllTimers: resetAllTimers,
        isGameActive: () => isGameActive
    };
    
    initTimer();
    
    console.log('Time.js đã được tải - 4 phút trận đấu, 30 giây mỗi lượt!');
})();