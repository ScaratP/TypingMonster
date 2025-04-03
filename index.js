// 定義全域變數來保存最後一次顯示的目標怪物索引
let lastDisplayedTargetIndex = -1;// 確保在載入此檔案前已載入themes.js
// index.js - 遊戲主程式碼

let array = [];
let y = -10, k = 0;
let scr = 0;
let isPaused = false;
let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
c.height = window.innerHeight * 0.98;
c.width = window.innerWidth * 0.996;

// 從主題配置中獲取當前主題
let theme = ThemeConfig.getCurrentTextTheme();
let monsterColor = ThemeConfig.getMonsterColor();

// 清理定時器
let cleanupInterval = null;

// 圖片緩存物件
let imageCache = {};

// 目標怪物指針
let targetBalloonIndex = -1;

// 從ThemeConfig獲取輸入映射
let problematicChars = ThemeConfig.inputMapping || {};

// 預載入怪物圖片
function preloadImages() {
  const imageTheme = ThemeConfig.getCurrentImageTheme();
  
  // 清空之前的圖片緩存
  imageCache = {};
  
  // 預載入每個圖片
  imageTheme.forEach(imageName => {
    const img = new Image();
    img.src = imageName; // 假設圖片在同一目錄下
    
    // 添加錯誤處理
    img.onerror = function() {
      console.error(`無法載入圖片: ${imageName}`);
      // 設置一個默認圖片
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJKu3tMzQAAAABJRU5ErkJggg==';
    };
    
    imageCache[imageName] = img;
  });
  
  // 嘗試載入上傳的像素風格怪物圖片
  if (imageTheme.length === 0) {
    // 如果沒有主題圖片，使用默認圖示
    const defaultImage = new Image();
    defaultImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH5gQFAQoLNx6cNwAABLdJREFUWMPtl1tsVGUUhb99zplOZ3o/tLQWSimFltsACoKIGhOUqPGCPhhCCPKgidGIJj74ZHzQxMQH44MaMcbEBxJivFFMlIuRiwoIiFBKaQstbWmn7XTunZnz+zBQi9BBaGPigy/55+TMnJO1/v3v9e+9Rf6HJf4NEQR6gbVAJ7AUaALCQBJIA1NEYpg9m1jwwS5CXZ2zJl/6wRekXw/eBJ4DlgEvAh1AM+ADVGAJ0AXcBH4CjgDfA6rQlQpWgEYsRvzYO2ir2iRZXr5Qgla8QIwGHgCeBVYUS1QCFcD9wOPAK8Ax4GvgIFBQwZ1ZsdtsKLvjnlOgQbSGeAGxTOBFYPNsGnRnghb4C/gS2DWjwj0FmADC4cB0OCDDuKNrAbSGvB8yhbUB8MwV7C4B0sCvwA6gD1D3bEEiQTg6SlVVNSU9PUjDuOVaa9B6RmmyORDqtsDOowPtQgNBtxvXZx+jtCYfjxOoqkKG7VrldJKNXqO1qQmlNRFvgMzQEHq+5DkQT4Nw7JNChFaXLaPu4CGiPWvRlkVk6zZstTXYa2vJxmJI00nJ4kUM7OojumTJrEUTF65QHbRD1mLs0giBJR3UfXUAKQSZn34mWVVFZOtWANI5i9Eb6QUkkMAjQFkxkRm1nKaJ0vD75+9T39xEvLGRRM8aaq9cxV5bS3rrE5SPxTCkJNTVRW5ggOH9X+NsaiRUX1+0BgSPAnXMTJTbRCmFVorSwRvkfn2N0TPnKG9vxzCdxBsb0U5J0zffImyS8txV4r/8QmrdOuqeegZnczO5/j+QXu8sAbDEZkNKiZnNIrVm8vh3TMfjVLdEmYrFsAJBbDU1qNQUJfE4ykzDcIS0vYFsx3LKNzyEd2Un0jQxsllkmQ8p77r3NighdN6Ps7IC9+Ag+UiErNfLktGrjJw5i9/txjZwEi1N/KubCTXVUl3poqlMMdpYQ9rtxl4eJjs2hmEYd7SABgHmzXM4/KKLyUOHcLW2kCkvp27fPkYuDpE5fQbhdOJ7Yjv5qgpqvvgE4XajYjEm9+9n3G5Hn/4BX2Ul+bExXD4fhmncJUADRj4xkQq43bi6uxHpNFMXL5Lt7SV58iSmlNTu3YO7pgbD6UQrxfixY0zu/Qq/380fZ86Rd7txtrSTGx5G5PNFDTC39E6HnZzfR/bKMMmRUczVq7FVVZEbHmbs0CEcd91F+qefiOzciU5PQHsLuVSC0a/3YwXD2GvrSCfiGE7H3AKUVLT6nSTO9SMchYtJpbA1NpLs70caBqWbNpEbHiYJhNavx9XeRvrUKXAYCK+f7OAg5uxNSOBySiRFXs3+ikr8jQ0IKfEl4iglcHu9GOUS28BVhJT4V65k8sgR9MgI3sceo3TDBjL9Z0ilJEZJKehZAiigL2NhTLuL9PkKX8GfQOsC52B7G77HtyOFID+ZRA8NEeroIDsygtfpxLVuHdb5QcbPjRJZjABA37jS3ykRrQUVZhVn2Hw8QfqzQ+TffJNcfz+Zzk7KNm/GMXGDeN85RmIppieEFkLOr9VfKfLHZDp9YkpCB1BRuOHSyQlKVq7ENzxMf99J5Ag52PsvsG/CAaZV6NQAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjItMDQtMDVUMDE6MTA6MTErMDA6MDBKdPXhAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIyLTA0LTA1VDAxOjEwOjExKzAwOjAwOylNXQAAAABJRU5ErkJggg==';
    imageCache["defaultMonster"] = defaultImage;
    
    // 更新主題
    ThemeConfig.imageThemes.monsters = ["defaultMonster"];
  }
}

// 咖啡色框框中的文字
let bottomText = "";

function Balloon(x, y, r, dy, text) { 
  this.x = x;
  this.y = y;
  this.r = r;
  this.dy = dy;
  this.text = text;
  this.typedText = ""; // 已輸入的部分
  this.imageName = ThemeConfig.getCurrentImageTheme()[0]; // 只使用第一個圖片
  this.active = true; // 用於標記氣球是否活躍
  
  this.draw = function() {
    // 如果氣球不活躍或半徑為0，則不繪製
    if (!this.active || this.r <= 0) {
      return;
    }
    
    // 繪製怪物圖片而不是圓形
    const imgSize = this.r * 2; // 圖片大小基於原來的圓形半徑
    
    // 確保圖片已載入
    if (imageCache[this.imageName] && imageCache[this.imageName].complete) {
      ctx.drawImage(imageCache[this.imageName], this.x - imgSize/2, this.y - imgSize/2, imgSize, imgSize);
    } else {
      // 圖片未載入完成時顯示占位圓形
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      ctx.fillStyle = monsterColor;
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.font = "15px Arial";
    // 繪製文字背景
    const textWidth = ctx.measureText(this.text).width + ctx.measureText(this.typedText).width;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(this.x - textWidth/2 - 5, this.y + this.r/2, textWidth + 10, 20);
    
    // 繪製已輸入的部分（灰色）
    ctx.fillStyle = "gray";
    const typedTextWidth = ctx.measureText(this.typedText).width;
    ctx.fillText(this.typedText, this.x - textWidth/2, this.y + this.r/2 + 15);
    
    // 繪製未輸入的部分（黑色）
    ctx.fillStyle = "black";
    ctx.fillText(this.text, this.x - textWidth/2 + typedTextWidth, this.y + this.r/2 + 15);
  };
  
  this.update = function() {
    // 如果氣球不活躍，則不更新
    if (!this.active) {
      return;
    }
    
    this.y += this.dy;
  };
  
  // 消滅氣球
  this.destroy = function() {
    this.active = false;
    this.r = 0;
  };
  
  // 重置氣球
  this.reset = function(newY) {
    this.y = newY;
    this.active = true;
    this.text = theme[Math.floor(Math.random() * theme.length)];
    this.typedText = "";
    this.r = 30; // 恢復原始半徑
    this.imageName = ThemeConfig.getCurrentImageTheme()[0]; // 只使用第一個圖片
    
    // 設置怪獸的x座標，確保不會超出邊界
    const safeMargin = this.r * 2; // 安全邊距為怪獸直徑
    const minX = safeMargin;
    const maxX = c.width - safeMargin;
    this.x = Math.random() * (maxX - minX) + minX;
  };
}

// 繪製指向目標怪物的箭頭
function drawArrow(x, y) {
  // 箭頭從輸入框上方指向目標怪物
  const inputField = document.getElementById('typing-input');
  const rect = inputField.getBoundingClientRect();
  const startX = c.width / 2; // 輸入框中心位置
  const startY = c.height - 70; // 輸入框上方
  
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(x, y + 30); // 指向怪物下方
  
  // 設置箭頭線條樣式
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 3]); // 虛線效果
  ctx.stroke();
  
  // 繪製箭頭頭部
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x - 10, y + 20);
  ctx.lineTo(x + 10, y + 20);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
  ctx.fill();
  
  // 恢復線條設置
  ctx.setLineDash([]);
  ctx.lineWidth = 1;
}

// 繪製底部咖啡色框框和文字
function drawBottomBar() {
  const barTheme = ThemeConfig.getCurrentBottomBarTheme();
  const barHeight = 50;
  
  ctx.fillStyle = barTheme.color;
  ctx.fillRect(0, c.height - barHeight, c.width, barHeight);
  
  // 繪製文字
  ctx.font = `${barTheme.fontSize} ${barTheme.fontFamily}`;
  ctx.fillStyle = barTheme.textColor;
  ctx.textAlign = "center";
  ctx.fillText(bottomText, c.width / 2, c.height - barHeight/2 + 8);
  ctx.textAlign = "start"; // 重置文字對齊
}

// 更新底部文字
function updateBottomText(text) {
  bottomText = text;
}

// 新增遊戲狀態控制
let gameStarted = false; // 遊戲是否已經開始

// 尋找最優先需要輸入的怪物
function findTargetBalloon() {
  let targetIndex = -1;
  let maxY = -1;
  
  // 先找最靠近底部的活躍怪物
  for (let i = 0; i < array.length; i++) {
    if (array[i].active && array[i].r > 0 && array[i].y > maxY && array[i].text.length > 0) {
      maxY = array[i].y;
      targetIndex = i;
    }
  }
  
  // 如果找到一個新的目標，更新最後一次顯示的目標
  if (targetIndex !== -1) {
    lastDisplayedTargetIndex = targetIndex;
  }
  
  return targetIndex;
}

function animate() {
  requestAnimationFrame(animate);
  
  // 檢查遊戲是否已開始
  if (!gameStarted) {
    // 只繪製靜態背景和開始按鈕
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    
    // 繪製遊戲標題
    ctx.font = "40px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText("ㄉㄚˇㄗˋ遊戲", c.width / 2, c.height / 3);
    
    // 繪製底部咖啡色框框和文字
    drawBottomBar();
    
    // 重置文字對齊
    ctx.textAlign = "start";
    return;
  }
  
  if (isPaused) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("分數:", c.width - 200, 50);
  ctx.fillText(scr, c.width - 100, 50);
  
  ctx.font = "40px Arial";
  ctx.strokeStyle = "lightgrey";
  ctx.strokeText("ㄉㄚˇㄗˋ", 10, 40);
  
  // 繪製底部咖啡色框框和文字
  drawBottomBar();
  
  // 更新目標怪物指針 - 這裡重要：確保每幀都更新目標
  targetBalloonIndex = findTargetBalloon();
  
  // 先繪製所有活躍的怪物
  for (let m = 0; m < array.length; m++) {
    if (array[m].active && array[m].r > 0) {
      array[m].draw();
    }
  }
  
  // 如果有目標怪物，繪製指向箭頭
  if (targetBalloonIndex !== -1 && array[targetBalloonIndex].active) {
    // 確保這個怪物是真的有效的目標（有文字需要輸入）
    if (array[targetBalloonIndex].text.length > 0) {
      drawArrow(array[targetBalloonIndex].x, array[targetBalloonIndex].y);
      
      // 高亮顯示目標怪物（繪製一個輪廓）
      const targetBalloon = array[targetBalloonIndex];
      ctx.beginPath();
      ctx.arc(targetBalloon.x, targetBalloon.y, targetBalloon.r + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
      
      // 在目標怪物上顯示下一個要輸入的字符提示
      if (targetBalloon.text.length > 0) {
        const nextChar = targetBalloon.text.charAt(0);
        
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText(nextChar, targetBalloon.x, targetBalloon.y - targetBalloon.r - 10);
        ctx.textAlign = "start"; // 重置文字對齊
      }
    }
  }
  
  for (let p = 0; p < array.length; p++) {
    if (array[p].active) {
      array[p].update();
      if (array[p].y >= c.height - 50 && array[p].r > 0) { // 修改碰撞檢測考慮底部欄高度
        updateBottomText("遊戲結束！");
        setTimeout(() => {
          alert("遊戲結束！！");
          // 遊戲結束，重置狀態
          gameStarted = false;
          scr = 0;
          initializeGameElements();
          updateBottomText("點擊開始按鈕重新開始遊戲");
          
          // 顯示開始按鈕
          const startButton = document.getElementById('start-btn');
          if (startButton) {
            startButton.style.display = 'block';
          }
          
          // 隱藏輸入框
          const inputContainer = document.getElementById('input-container');
          if (inputContainer) {
            inputContainer.style.display = 'none';
          }
        }, 100);
      }
    }
  }
}

function checkInput(userInput) {
  // 更新當前主題和目標（確保在檢查輸入前是最新的）
  theme = ThemeConfig.getCurrentTextTheme();
  targetBalloonIndex = findTargetBalloon();
  
  // 優先檢查目標怪物
  if (targetBalloonIndex !== -1 && array[targetBalloonIndex].active) {
    const targetBalloon = array[targetBalloonIndex];
    
    // 檢查目標怪物是否匹配輸入
    if (checkBalloonMatch(targetBalloon, userInput)) {
      targetBalloon.typedText += targetBalloon.text.charAt(0);
      targetBalloon.text = targetBalloon.text.substring(1);
      
      if (targetBalloon.text.length === 0) {
        scr++; // 增加分數
        
        // 使用新方法消滅怪物
        targetBalloon.destroy();
        
        // 將怪物重置到頂部（重複利用物件）
        setTimeout(() => {
          targetBalloon.reset(-10);
        }, 1000);
        
        // 更新底部文字顯示當前得分
        updateBottomText("得分: " + scr);
      } else {
        // 提示成功輸入
        updateBottomText("正確輸入！繼續...");
      }
      return;
    } else {
      // 如果輸入不匹配目標怪物，直接提示
      updateBottomText("提示：請輸入紅色箭頭指向的怪物字符");
      return;
    }
  }
  
  // 如果沒有找到目標怪物，或輸入不匹配，則提示用戶
  updateBottomText("提示：請輸入紅色箭頭指向的怪物字符");
}

// 檢查氣球是否匹配輸入
function checkBalloonMatch(balloon, userInput) {
  if (balloon.text.length === 0) return false;
  
  const firstChar = balloon.text.charAt(0);
  
  // 直接匹配
  if (firstChar === userInput) return true;
  
  // 取得當前主題名稱
  const currentThemeName = ThemeConfig.current.textTheme;
  
  // 特殊處理：如果是英文主題，允許大小寫不敏感匹配
  if (currentThemeName === "english") {
    if (firstChar.toLowerCase() === userInput.toLowerCase()) {
      return true;
    }
  }
  
  // 特殊處理：如果是混合主題，允許只輸入第一個字符
  if (currentThemeName === "mixed" && firstChar.length > 1) {
    if (firstChar.charAt(0) === userInput) {
      return true;
    }
  }
  
  return false;
}

// 主題切換函數
function changeTextTheme(themeName) {
  // 检查主题是否存在
  if (!ThemeConfig.textThemes[themeName]) {
    console.error(`文字主題 ${themeName} 不存在`);
    return; // 如果主题不存在，提前退出函数
  }

  try {
    // 设置主题
    ThemeConfig.setTextTheme(themeName);
    
    // 更新当前主题
    theme = ThemeConfig.getCurrentTextTheme();
    
    // 更新所有现有气球的文字内容（不重新初始化）
    for (let i = 0; i < array.length; i++) {
      if (array[i].active) {
        // 确保主题数组不为空
        if (theme && theme.length > 0) {
          array[i].text = theme[Math.floor(Math.random() * theme.length)];
          array[i].typedText = "";
        }
      }
    }
    
    // 更新底部文字通知主题更改
    updateBottomText(`已切換文字主題為: ${themeName}`);
    
    // 短暂暂停游戏让玩家适应新主题
    const wasPaused = isPaused;
    isPaused = true;
    setTimeout(() => {
      // 如果之前没有暂停，则恢复游戏
      if (!wasPaused) {
        isPaused = false;
      }
    }, 1000);
    
    console.log(`成功切換至主題: ${themeName}`);
  } catch (error) {
    console.error(`切換主題時發生錯誤: ${error.message}`);
    updateBottomText(`切換主題失敗，請稍後再試`);
  }
}

// 增加遊戲難度
function increaseDifficulty() {
  // 增加所有活躍怪物的速度
  for (let i = 0; i < array.length; i++) {
    if (array[i].active) {
      array[i].dy *= 1.2; // 增加20%的速度
    }
  }
  
  updateBottomText("難度增加！怪物速度提升");
}

// 初始化遊戲元素
function initializeGameElements() {
  // 重置數組和變數
  array = [];
  y = -10;
  k = 0;
  
  // 重新獲取當前主題
  theme = ThemeConfig.getCurrentTextTheme();
  
  // 預載入圖片
  preloadImages();
  
  // 設定怪獸安全區域
  const monsterSize = 60; // 怪獸的大約尺寸
  const safeMargin = monsterSize;
  const minX = safeMargin;
  const maxX = c.width - safeMargin;
  const xPositions = [];
  
  // 預先計算怪獸的X座標位置，確保不會重疊
  const numberOfMonsters = 12;
  const sectionWidth = (maxX - minX) / numberOfMonsters;
  
  for (let i = 0; i < numberOfMonsters; i++) {
    // 在每個區段中生成一個隨機位置
    const sectionStart = minX + i * sectionWidth;
    const sectionEnd = sectionStart + sectionWidth;
    const x = Math.random() * (sectionEnd - sectionStart - monsterSize) + sectionStart + monsterSize/2;
    xPositions.push(x);
  }
  
  // 創建氣球
  for (let i = 0; i < numberOfMonsters; i++) {
    y -= 60;
    let r = 30;
    let dy = 0.5;
    
    // 使用預先計算的X座標
    let x = xPositions[i];
    
    // 循環使用主題文字
    let text = theme[k % theme.length];
    k++;
    
    array.push(new Balloon(x, y, r, dy, text));
  }
  
  // 每5秒檢查一次是否需要清理無效怪物
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupInactiveBalloons, 5000);
  }
  
  // 定期增加難度（每30秒）
  setTimeout(function() {
    // 每30秒增加一次難度
    const difficultyInterval = setInterval(function() {
      // 只有在遊戲未暫停時增加難度
      if (!isPaused) {
        increaseDifficulty();
      }
    }, 30000);
  }, 60000); // 從遊戲開始60秒後開始增加難度
}

// 清理不活躍的怪物
function cleanupInactiveBalloons() {
  // 計算當前活躍怪物的數量
  let activeCount = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i].active) {
      activeCount++;
    }
  }
  
  // 確保總是有足夠的怪物
  const minActiveMonsters = 5; // 最少應該有的怪物數量
  
  // 重置不活躍的怪物
  for (let i = 0; i < array.length; i++) {
    if (!array[i].active) {
      // 如果活躍怪物數量不足，立即重置
      if (activeCount < minActiveMonsters) {
        array[i].reset(-10 - Math.random() * 50); // 添加隨機偏移以避免同時出現
        activeCount++;
      } 
      // 否則隨機決定是否重置
      else if (Math.random() < 0.3) { // 30%的機率重置
        array[i].reset(-10 - Math.random() * 50);
      }
    }
  }
}

// 初始化事件監聽器
function initEventListeners() {
  const inputField = document.getElementById('typing-input');
  if (inputField) {
    inputField.addEventListener('input', function(event) {
      const userInput = event.target.value;
      checkInput(userInput);
      event.target.value = ''; // 清空輸入框
    });
  } else {
    console.error('找不到輸入框元素');
  }

  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function() {
      // 只在遊戲已開始時才允許暫停
      if (gameStarted) {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '繼續' : '暫停';
        // 更新底部文字
        updateBottomText(isPaused ? "遊戲暫停" : "遊戲繼續");
      }
    });
  } else {
    console.error('找不到暫停按鈕元素');
  }
  
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function() {
      // 只在遊戲已開始時才允許重新開始
      if (gameStarted) {
        scr = 0; // 重置分數
        initializeGameElements();
        isPaused = false;
        if (pauseBtn) {
          pauseBtn.textContent = '暫停';
        }
        updateBottomText("遊戲重新開始！");
      }
    });
  } else {
    console.error('找不到重新開始按鈕元素');
  }
  
  // 為文字主題選擇器添加事件監聽器（如果存在）
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', function(event) {
      event.preventDefault(); // 防止默認行為
      try {
        const selectedTheme = this.value;
        console.log(`選擇了主題: ${selectedTheme}`);
        changeTextTheme(selectedTheme);
      } catch (error) {
        console.error(`主題選擇器事件發生錯誤: ${error.message}`);
      }
    });
  } else {
    console.error('找不到主題選擇器元素');
  }
  
  // 為開始按鈕添加事件監聽器
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      startGame();
    });
  } else {
    console.error('找不到開始按鈕元素');
  }
  
  // 添加按鍵事件，讓空格鍵可以暫停/繼續遊戲
  document.addEventListener('keydown', function(event) {
    // 空格鍵 (keyCode 32)
    if (event.keyCode === 32 && document.activeElement !== inputField && gameStarted) {
      event.preventDefault(); // 防止空格鍵滾動頁面
      isPaused = !isPaused;
      if (pauseBtn) {
        pauseBtn.textContent = isPaused ? '繼續' : '暫停';
      }
      updateBottomText(isPaused ? "遊戲暫停" : "遊戲繼續");
    }
    
    // 回車鍵 (keyCode 13)，如果遊戲尚未開始，則開始遊戲
    if (event.keyCode === 13 && !gameStarted) {
      startGame();
    }
  });
  
  // 確保輸入框始終聚焦
  document.addEventListener('click', function() {
    // 如果點擊了頁面其他區域，重新聚焦到輸入框
    if (inputField && document.activeElement !== inputField && gameStarted) {
      inputField.focus();
    }
  });
}

// 遊戲初始化函數
function initGame() {
  // 從ThemeConfig獲取最新的輸入映射
  problematicChars = ThemeConfig.inputMapping || problematicChars;
  
  // 初始化遊戲元素
  initializeGameElements();
  
  // 初始化事件監聽器
  initEventListeners();
  
  // 初始化底部文字
  updateBottomText("點擊開始按鈕開始遊戲");
  
  // 隱藏輸入框，直到遊戲開始
  const inputContainer = document.getElementById('input-container');
  if (inputContainer) {
    inputContainer.style.display = 'none';
  }
  
  // 開始遊戲循環
  animate();
}

// 開始遊戲
function startGame() {
  gameStarted = true;
  isPaused = false;
  scr = 0;
  
  // 重新初始化遊戲元素
  initializeGameElements();
  
  // 更新底部文字
  updateBottomText("遊戲開始！請輸入文字");
  
  // 隱藏開始按鈕
  const startButton = document.getElementById('start-btn');
  if (startButton) {
    startButton.style.display = 'none';
  }
  
  // 顯示輸入框
  const inputContainer = document.getElementById('input-container');
  if (inputContainer) {
    inputContainer.style.display = 'flex';
    
    // 聚焦到輸入框
    const inputField = document.getElementById('typing-input');
    if (inputField) {
      inputField.focus();
    }
  }
}

// 初始化遊戲
initGame();