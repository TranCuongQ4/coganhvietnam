// =========================================================
// LUẬT CỜ GÁNH VIỆT NAM (CHUẨN & TỐI ƯU)
// =========================================================

const LuatCoGanh = {

    // =========================================================
    // 1. KIỂM TRA TỌA ĐỘ HỢP LỆ
    // =========================================================
    isValid: (r, c) => r >= 0 && r < 5 && c >= 0 && c < 5,

    // =========================================================
    // 2. LẤY CÁC NƯỚC ĐI HỢP LỆ (Quan trọng: Có đường chéo nếu tổng tọa độ chẵn)
    // =========================================================
    getValidMoves(r, c) {
        const moves = [];
        // 4 hướng cơ bản (lên, xuống, trái, phải)
        const basicDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        // Thêm 4 hướng chéo nếu ô hiện tại có tổng tọa độ (r + c) là số chẵn
        // (Quy tắc quan trọng nhất của Cờ Gánh)
        let dirs = [...basicDirs];
        if ((r + c) % 2 === 0) {
            const diagonalDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
            dirs = dirs.concat(diagonalDirs);
        }
        
        for (let [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (this.isValid(nr, nc)) {
                moves.push({ r: nr, c: nc });
            }
        }
        return moves;
    },

    // =========================================================
    // 3. LUẬT GÁNH & GÁNH KẸP (Chỉ xét hiệu ứng sinh ra từ ô vừa đi)
    // =========================================================
    checkGanh(board, r, c, currentTurn) {
        const opponent = (currentTurn === 'L') ? 'D' : 'L';
        const captured = [];
        
        // Định nghĩa 4 hướng cốt lõi (Mỗi hướng gồm vector bước đi đơn vị)
        const directions = [
            [-1, 0],  // Dọc (Lên / Xuống)
            [0, -1]   // Ngang (Trái / Phải)
        ];
        
        // Nếu ô vừa đi nằm trên vị trí có đường chéo (tổng tọa độ chẵn), thêm 2 hướng chéo
        if ((r + c) % 2 === 0) {
            directions.push(
                [-1, -1], // Chéo chính
                [-1, 1]   // Chéo phụ
            );
        }
        
        for (let [dr, dc] of directions) {
            // -----------------------------------------------------
            // TH 1: LUẬT GÁNH GỐC (Quân vừa đi nhảy vào CHÍNH GIỮA 2 quân địch)
            // Trận thế dọc/ngang/chéo: [Quân địch 1] - [Quân ta vừa đi (r,c)] - [Quân địch 2]
            // -----------------------------------------------------
            const r1 = r + dr, c1 = c + dc;
            const r2 = r - dr, c2 = c - dc;
            
            if (this.isValid(r1, c1) && this.isValid(r2, c2)) {
                if (board[r1][c1] === opponent && board[r2][c2] === opponent) {
                    captured.push({ r: r1, c: c1 });
                    captured.push({ r: r2, c: c2 });
                }
            }
            
            // -----------------------------------------------------
            // TH 2: LUẬT GÁNH KẸP CHỦ ĐỘNG (Quân vừa đi khóa đầu biến địch thành nằm giữa)
            // Chúng ta kiểm tra cả 2 phía kéo dài của vector hướng hiện tại.
            // -----------------------------------------------------
            
            // Hướng tiến: [Quân ta vừa đi (r,c)] -> [Quân địch] -> [Quân ta đứng sẵn]
            const f1_r = r + dr, f1_c = c + dc;         // Vị trí quân địch nghi vấn
            const f2_r = r + (dr * 2), f2_c = c + (dc * 2); // Vị trí quân ta đứng sẵn chặn đầu
            if (this.isValid(f1_r, f1_c) && this.isValid(f2_r, f2_c)) {
                if (board[f1_r][f1_c] === opponent && board[f2_r][f2_c] === currentTurn) {
                    // Để kẹp chéo hợp lệ, ô trung gian cũng phải tuân thủ luật chéo nếu có
                    if ((dr === 0 || dc === 0) || ((f1_r + f1_c) % 2 === 0)) {
                        captured.push({ r: f1_r, c: f1_c });
                    }
                }
            }
            
            // Hướng lùi: [Quân ta đứng sẵn] <- [Quân địch] <- [Quân ta vừa đi (r,c)]
            const b1_r = r - dr, b1_c = c - dc;         // Vị trí quân địch nghi vấn
            const b2_r = r - (dr * 2), b2_c = c - (dc * 2); // Vị trí quân ta đứng sẵn chặn đầu
            if (this.isValid(b1_r, b1_c) && this.isValid(b2_r, b2_c)) {
                if (board[b1_r][b1_c] === opponent && board[b2_r][b2_c] === currentTurn) {
                    if ((dr === 0 || dc === 0) || ((b1_r + b1_c) % 2 === 0)) {
                        captured.push({ r: b1_r, c: b1_c });
                    }
                }
            }
        }
        
        // Loại bỏ tọa độ trùng lặp nếu một quân bị kẹp từ nhiều phía hướng về ô vừa đi
        return captured.filter((item, index, self) => 
            index === self.findIndex(p => p.r === item.r && p.c === item.c)
        );
    },

    // =========================================================
    // 4. LUẬT VÂY (CHẸT) - Thu phục quân địch bị bao vây hoàn toàn
    //    BỔ SUNG: Không tính quân vừa đi của đối phương nếu họ chủ động "mở đường"
    // =========================================================
    checkVay(board, currentTurn, lastMoveTo = null) {
        const opponent = (currentTurn === 'L') ? 'D' : 'L';
        const visited = Array.from({ length: 5 }, () => Array(5).fill(false));
        const captured = [];
        
        // Duyệt từng ô có quân địch
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (board[r][c] === opponent && !visited[r][c]) {
                    // BFS để tìm toàn bộ vùng quân địch liên thông
                    const queue = [{ r, c }];
                    visited[r][c] = true;
                    const group = [{ r, c }];
                    let hasLiberty = false; // Có "khí" (đường sống) không?
                    let containsLastMovePiece = false; // Nhóm này có chứa quân vừa đi không?
                    
                    while (queue.length > 0) {
                        const { r: cr, c: cc } = queue.shift();
                        
                        if (lastMoveTo && cr === lastMoveTo.r && cc === lastMoveTo.c) {
                            containsLastMovePiece = true;
                        }
                        
                        const neighbors = this.getValidMoves(cr, cc);
                        for (let nb of neighbors) {
                            const cell = board[nb.r][nb.c];
                            if (cell === null) {
                                hasLiberty = true; // Có ô trống kề cạnh -> còn đường sống
                            } else if (cell === opponent && !visited[nb.r][nb.c]) {
                                visited[nb.r][nb.c] = true;
                                queue.push({ r: nb.r, c: nb.c });
                                group.push({ r: nb.r, c: nb.c });
                            }
                        }
                    }
                    
                    // Nếu cụm quân bị vây không có đường đi tiếp và KHÔNG phải do đối phương tự hiến quân xin đường
                    if (!hasLiberty && !containsLastMovePiece) {
                        captured.push(...group);
                    }
                }
            }
        }
        return captured;
    },

    // =========================================================
    // 5. KIỂM TRA XEM CÓ BẤT KỲ NƯỚC GÁNH NÀO ĐANG KHẢ DỤNG HAY KHÔNG
    //    (Để áp dụng luật "bắt buộc phải gánh")
    // =========================================================
    hasAnyGanhMove(board, player) {
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (board[r][c] === player) {
                    const moves = this.getValidMoves(r, c);
                    for (let mv of moves) {
                        if (board[mv.r][mv.c] === null) {
                            // Giả lập thử nước đi
                            const tempBoard = JSON.parse(JSON.stringify(board));
                            tempBoard[mv.r][mv.c] = player;
                            tempBoard[r][c] = null;
                            const ganhResult = this.checkGanh(tempBoard, mv.r, mv.c, player);
                            if (ganhResult.length > 0) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    },

    // =========================================================
    // 6. THỰC HIỆN MỘT NƯỚC ĐI HOÀN CHỈNH (Cập nhật bàn cờ)
    //    Dùng trong AI Minimax để giả lập nhanh
    // =========================================================
    applyMove(board, from, to, player) {
        // Clone bàn cờ hiện tại
        const newBoard = JSON.parse(JSON.stringify(board));
        
        // Di chuyển quân
        newBoard[to.r][to.c] = player;
        newBoard[from.r][from.c] = null;
        
        // Xử lý hiệu ứng GÁNH & GÁNH KẸP CHỦ ĐỘNG
        const ganhList = this.checkGanh(newBoard, to.r, to.c, player);
        for (let p of ganhList) {
            newBoard[p.r][p.c] = player;
        }
        
        // Xử lý hiệu ứng VÂY (Truyền kèm ô đích `to`)
        const vayList = this.checkVay(newBoard, player, to);
        for (let p of vayList) {
            newBoard[p.r][p.c] = player;
        }
        
        return newBoard;
    }
};