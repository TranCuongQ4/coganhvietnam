const HuongDanCoGanh = {
    title: "HƯỚNG DẪN CHƠI CỜ GÁNH",
    steps: [
	    "<strong>Time:</strong> 4 phút thi đấu , mổi bên có 30 giây suy nghĩ (quá thời gian xử thua).",
        "<strong>Mục tiêu:</strong> Làm cho đối phương hết sạch quân trên bàn cờ hoặc bị vây hãm không còn đường di chuyển.",
        "<strong>Di chuyển quân:</strong> Đến lượt, bạn chọn một quân cờ của mình di chuyển tới 1 ô trống lân cận theo các đường vạch nối có sẵn trên bàn cờ.",
        "<strong>Luật GÁNH:</strong> Khi quân bạn đi vào giữa 2 quân đối phương (tạo thế kẹp 3 quân thẳng hàng), 2 quân đối phương sẽ bị 'gánh' và biến đổi thành màu quân của bạn.",
        "<strong>Luật VÂY:</strong> Nếu sau nước đi của bạn, một nhóm quân đối phương bị bao vây hoàn toàn, không còn ô trống nào xung quanh để di chuyển, toàn bộ nhóm quân đó sẽ bị biến đổi thành quân của bạn.",
        "<strong>Luật CHẸT:</strong> Khi quân bạn đi vào kẹp 1 quân ở giữa sẽ khiến quân đó biến thành quân bạn."
    ],
    
    getHtml: function() {
        let html = `<h3>${this.title}</h3><ul>`;
        this.steps.forEach(step => {
            html += `<li>${step}</li>`;
        });
        html += `</ul>`;
        
        // Nút "Đã Hiểu" đóng modal hướng dẫn chuẩn xác
        html += `
        <div style="text-align: center; margin-top: 20px;">
            <button id="btn-close-guide" 
                    onclick="document.getElementById('guide-modal').classList.add('hidden')"
                    style="padding: 10px 24px; 
                           font-size: 15px; 
                           font-weight: bold; 
                           color: #ffffff; 
                           background: #e67e22; 
                           border: none; 
                           border-radius: 6px; 
                           cursor: pointer; 
                           box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                           transition: all 0.2s ease;">
                Đã Hiểu
            </button>
        </div>`;
        
        return html;
    }
};