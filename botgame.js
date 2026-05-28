// =========================================================
// BOT AI - THUẬT TOÁN MINIMAX (THAM KHẢO TỪ REPOSITORY HCMUT)
// =========================================================

const BotGame = {

    // ---------------------------------------------------------
    // 1. HÀM ĐÁNH GIÁ BÀN CỜ (Cải tiến hơn bản cũ)
    // ---------------------------------------------------------
    evaluateBoard: function(board) {
        let score = 0;
        // Trọng số chiến lược cho các ô (khuyến khích kiểm soát trung tâm và biên)
        const positionWeight = [
            [3, 2, 2, 2, 3],
            [2, 4, 5, 4, 2],
            [2, 5, 8, 5, 2],  // Ô trung tâm (2,2) quan trọng nhất
            [2, 4, 5, 4, 2],
            [3, 2, 2, 2, 3]
        ];

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (board[i][j] === 'D') {
                    // Bot là quân D (Xanh Dương)
                    score += 100 + positionWeight[i][j]; // Giá trị quân + vị trí
                } else if (board[i][j] === 'L') {
                    // Đối thủ là quân L (Xanh Lá)
                    score -= 100 + positionWeight[i][j];
                }
            }
        }
        return score;
    },

    // ---------------------------------------------------------
    // 2. LẤY TẤT CẢ NƯỚC ĐI HỢP LỆ CỦA MỘT QUÂN
    // ---------------------------------------------------------
    getAllMoves: function(board, player) {
        const moves = [];
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (board[r][c] === player) {
                    const validPoints = LuatCoGanh.getValidMoves(r, c);
                    for (let pt of validPoints) {
                        if (board[pt.r][pt.c] === null) {
                            moves.push({ from: { r, c }, to: pt });
                        }
                    }
                }
            }
        }
        return moves;
    },

    // ---------------------------------------------------------
    // 3. GIẢ LẬP NƯỚC ĐI (Áp dụng luật Gánh và Vây)
    // ---------------------------------------------------------
    makeSimulatedMove: function(board, move, player) {
        // Clone bàn cờ để không ảnh hưởng bàn thật
        const newBoard = JSON.parse(JSON.stringify(board));
        
        // Di chuyển quân
        newBoard[move.to.r][move.to.c] = player;
        newBoard[move.from.r][move.from.c] = null;
        
        // Xử lý Gánh
        const ganhList = LuatCoGanh.checkGanh(newBoard, move.to.r, move.to.c, player);
        for (let p of ganhList) newBoard[p.r][p.c] = player;
        
        // Xử lý Vây (Chẹt)
        const vayList = LuatCoGanh.checkVay(newBoard, player);
        for (let p of vayList) newBoard[p.r][p.c] = player;
        
        return newBoard;
    },

    // ---------------------------------------------------------
    // 4. THUẬT TOÁN MINIMAX + CẮT TỈA ALPHA-BETA (Cốt lõi từ repo)
    // ---------------------------------------------------------
    minimax: function(board, depth, alpha, beta, isMaximizing) {
        // Kiểm tra kết thúc game (ai thắng)
        let countL = 0, countD = 0;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (board[i][j] === 'L') countL++;
                if (board[i][j] === 'D') countD++;
            }
        }
        
        // Nếu thắng thua tuyệt đối, trả về điểm cực lớn để ưu tiên
        if (countD === 0) return -10000 - depth;  // Bot thua
        if (countL === 0) return 10000 + depth;  // Bot thắng
        
        if (depth === 0) {
            return this.evaluateBoard(board);
        }
        
        if (isMaximizing) {
            // Lượt của BOT (MAX)
            let maxEval = -Infinity;
            const moves = this.getAllMoves(board, 'D');
            
            for (let move of moves) {
                const newBoard = this.makeSimulatedMove(board, move, 'D');
                const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break; // Cắt tỉa Beta
            }
            return maxEval;
        } else {
            // Lượt của NGƯỜI CHƠI (MIN)
            let minEval = Infinity;
            const moves = this.getAllMoves(board, 'L');
            
            for (let move of moves) {
                const newBoard = this.makeSimulatedMove(board, move, 'L');
                const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break; // Cắt tỉa Alpha
            }
            return minEval;
        }
    },

    // ---------------------------------------------------------
    // 5. LẤY NƯỚC ĐI TỐT NHẤT CHO BOT (D)
    // ---------------------------------------------------------
    getBestMove: function(board) {
        // ĐỘ SÂU = 3 (Thông minh vừa đủ, chạy nhanh trên web)
        // Bạn có thể thử tăng lên 4 nếu thấy máy vẫn khỏe
        const DEPTH = 3;
        let bestMove = null;
        let bestValue = -Infinity;
        const alpha = -Infinity;
        const beta = Infinity;
        
        const moves = this.getAllMoves(board, 'D');
        
        // Quét từng nước đi để tìm nước tối ưu
        for (let move of moves) {
            const newBoard = this.makeSimulatedMove(board, move, 'D');
            const moveValue = this.minimax(newBoard, DEPTH - 1, alpha, beta, false);
            
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
};