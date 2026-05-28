// =========================================================
// HỆ THỐNG GỢI Ý TRỰC QUAN - CHỈ NƯỚC ĐI GÁNH TỰ ĐỘNG
// File: chinuoc.js (Không làm ảnh hưởng hay chỉnh sửa script.js)
// =========================================================

(function () {
    // 1. Tự động tiêm style hiệu ứng CSS vào document để tạo chuyển động chớp quân và lướt chấm
    const style = document.createElement('style');
    style.innerHTML = `
        /* Hiệu ứng chớp quân cờ có thể đi nước gánh */
        @keyframes chopQuanGanh {
            0% { transform: scale(1) translateY(var(--move-dir, 0px)); filter: drop-shadow(0 0 2px #f1c40f); }
            50% { transform: scale(1.15) translateY(var(--move-dir, 0px)); filter: drop-shadow(0 0 15px #f1c40f) brightness(1.3); }
            100% { transform: scale(1) translateY(var(--move-dir, 0px)); filter: drop-shadow(0 0 2px #f1c40f); }
        }
        .chinuoc-chop-piece {
            animation: chopQuanGanh 1s infinite ease-in-out !important;
            z-index: 10 !important;
            cursor: pointer;
        }

        /* Tạo điểm chấm nhỏ lướt/bay từ ô xuất phát tới ô đích */
        .chinuoc-luot-cham {
            position: absolute;
            width: 12px;
            height: 12px;
            background: #f1c40f;
            border-radius: 50%;
            z-index: 5;
            pointer-events: none;
            box-shadow: 0 0 8px #f1c40f, 0 0 12px #e67e22;
            animation: luotChamBay 1.4s infinite linear;
        }

        @keyframes luotChamBay {
            0% {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.6);
                opacity: 0;
            }
            15% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            85% {
                opacity: 1;
                transform: translate(calc(var(--target-x) - 50%), calc(var(--target-y) - 50%)) scale(0.8);
            }
            100% {
                top: 50%;
                left: 50%;
                transform: translate(calc(var(--target-x) - 50%), calc(var(--target-y) - 50%)) scale(0.4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Thuật toán quét và lấy danh sách chi tiết các nước đi gánh dựa vào boardState và currentTurn hiện tại
    function thongKeNuocGanh() {
        const danhSachGanh = [];
        // Lấy dữ liệu trực tiếp từ các biến toàn cục trong script.js
        if (typeof boardState === 'undefined' || typeof currentTurn === 'undefined' || typeof LuatCoGanh === 'undefined') {
            return danhSachGanh;
        }

        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (boardState[r][c] === currentTurn) {
                    const validMoves = LuatCoGanh.getValidMoves(r, c);
                    for (const mv of validMoves) {
                        if (boardState[mv.r][mv.c] === null) {
                            // Giả lập thử nước đi gánh giống thuật toán của game
                            const tempBoard = JSON.parse(JSON.stringify(boardState));
                            tempBoard[mv.r][mv.c] = currentTurn;
                            tempBoard[r][c] = null;
                            const ganhResult = LuatCoGanh.checkGanh(tempBoard, mv.r, mv.c, currentTurn);
                            
                            if (ganhResult.length > 0) {
                                danhSachGanh.push({
                                    from: { r: r, c: c },
                                    to: { r: mv.r, c: mv.c }
                                });
                            }
                        }
                    }
                }
            }
        }
        return danhSachGanh;
    }

    // 3. Xóa bỏ toàn bộ các lớp hiệu ứng chỉ nước cũ trên bàn cờ
    function donDepHieuUngChiNuoc() {
        document.querySelectorAll('.chinuoc-chop-piece').forEach(el => {
            el.classList.remove('chinuoc-chop-piece');
        });
        document.querySelectorAll('.chinuoc-luot-cham').forEach(el => {
            el.remove();
        });
    }

    // 4. Khởi tạo và bắn hiệu ứng đồ họa trực quan lên DOM bàn cờ
    function trienKhaiHieuUngChiNuoc() {
        donDepHieuUngChiNuoc();
        const cacNuocGanh = thongKeNuocGanh();
        if (cacNuocGanh.length === 0) return;

        cacNuocGanh.forEach(nuoc => {
            // Tìm ô xuất phát (ô có quân cờ) trên DOM grid
            const oXuatPhat = document.querySelector(`.point[data-row="${nuoc.from.r}"][data-col="${nuoc.from.c}"]`);
            // Tìm ô đích đến trên DOM grid
            const oDich = document.querySelector(`.point[data-row="${nuoc.to.r}"][data-col="${nuoc.to.c}"]`);

            if (oXuatPhat && oDich) {
                // Tạo hiệu ứng chớp cho quân cờ nằm trong ô xuất phát
                const quanCo = oXuatPhat.querySelector('.piece');
                if (quanCo) {
                    quanCo.classList.add('chinuoc-chop-piece');
                }

                // Tính khoảng cách pixel sai lệch giữa ô xuất phát và ô đích để làm quỹ đạo bay cho chấm nhỏ
                const rectFrom = oXuatPhat.getBoundingClientRect();
                const rectTo = oDich.getBoundingClientRect();
                const deltaX = rectTo.left - rectFrom.left;
                const deltaY = rectTo.top - rectFrom.top;

                // Tạo phần tử chấm nhỏ và gán biến CSS quỹ đạo bay tương đối
                const dot = document.createElement('div');
                dot.classList.add('chinuoc-luot-cham');
                dot.style.setProperty('--target-x', `${deltaX}px`);
                dot.style.setProperty('--target-y', `${deltaY}px`);

                // Đính chấm nhỏ vào ô xuất phát để nó lướt sang ô đích liên tục
                oXuatPhat.appendChild(dot);
            }
        });
    }

    // 5. Bẫy chặn (Intercept) hàm alert mặc định của hệ thống
    const originalAlert = window.alert;
    window.alert = function (message) {
        // Nếu hệ thống chuẩn bị thông báo bắt buộc gánh
        if (message && message.includes("Bạn bắt buộc phải đi nước Gánh!")) {
            // Thực hiện vẽ hiệu ứng chớp quân và lướt chấm ngay lập tức
            trienKhaiHieuUngChiNuoc();
            
            // Đồng thời vẫn giữ thông báo để người chơi bấm OK biết chuyện gì đang xảy ra
            originalAlert.apply(this, arguments);
            return;
        }
        // Các thông báo alert khác của game giữ nguyên trạng
        originalAlert.apply(this, arguments);
    };

    // 6. Cơ chế tự động dọn dẹp: Khi người chơi click chọn quân mới hoặc chuyển lượt thành công, xóa hiệu ứng chỉ nước đi cũ
    document.addEventListener('click', function(e) {
        // Trì hoãn một chút (10ms) để đợi script.js cập nhật xong renderBoard() mới thực hiện kiểm tra xóa
        setTimeout(() => {
            // Nếu người chơi bấm vào một ô cờ và trạng thái selectedPiece đổi sang quân khác hoặc đổi sang quân trống, xóa hiệu ứng cũ
            const cacNuocGanhMoi = thongKeNuocGanh();
            
            // Nếu có hiệu ứng chỉ nước nhưng người chơi đã chọn đúng một quân cờ hợp lệ để gánh, hoặc vừa thực hiện đi xong làm thay đổi bàn cờ
            if (document.querySelectorAll('.chinuoc-chop-piece').length > 0) {
                // Nếu quân đang chọn trùng khớp với một trong các quân có nước đi gánh, ta tạm ẩn hiệu ứng để họ đi cờ dễ dàng
                if (typeof selectedPiece !== 'undefined' && selectedPiece !== null) {
                    const dangChonQuanGanh = cacNuocGanhMoi.some(n => n.from.r === selectedPiece.r && n.from.c === selectedPiece.c);
                    if (dangChonQuanGanh) {
                        donDepHieuUngChiNuoc();
                    }
                }
            }
        }, 10);
    }, true);

    // Tự động dọn sạch hiệu ứng khi trò chơi kích hoạt hàm reset ván đấu
    const originalRenderBoard = window.renderBoard;
    if (typeof originalRenderBoard === 'function') {
        window.renderBoard = function() {
            donDepHieuUngChiNuoc();
            originalRenderBoard.apply(this, arguments);
        };
    }
})();