/**
 * monsters.js - 怪獸相關類和功能
 * 處理怪獸的創建、更新和渲染
 */

// 全局圖片緩存
let monsterImageCache = {};

// 定義全域變數來保存最後一次顯示的目標怪物索引
let lastDisplayedTargetIndex = -1;

// 添加一個輸入映射表，處理常見的問題字符
const inputMapping = {
  '3': 'ˇ',  // 數字3對應第三聲
  '4': 'ˋ',  // 數字4對應第四聲
  '6': 'ˊ',  // 數字6對應第二聲
  '7': '˙',
  '1': 'ㄅ',
  'q': 'ㄆ',
  'a': 'ㄇ',
  'z': 'ㄈ',
  '2': 'ㄉ',
  'w': 'ㄊ',
  's': 'ㄋ',
  'x': 'ㄌ',
  'e': 'ㄍ',
  'd': 'ㄎ',
  'c': 'ㄏ',
  'r': 'ㄐ',
  'f': 'ㄑ',
  'v': 'ㄒ',
  '5': 'ㄓ',  
  't': 'ㄔ',
  'g': 'ㄕ',
  'b': 'ㄖ',
  'y': 'ㄗ',
  'h': 'ㄘ',
  'n': 'ㄙ',
  'u': 'ㄧ',
  'j': 'ㄨ',
  'm': 'ㄩ',
  '8': 'ㄚ',
  'i': 'ㄛ',
  'k': 'ㄜ',
  ',': 'ㄝ',
  '9': 'ㄞ',
  'o': 'ㄟ',
  'l': 'ㄠ',
  '.': 'ㄡ',
  '0': 'ㄢ',
  'p': 'ㄣ',
  ';': 'ㄤ',
  '/': 'ㄥ',
  '-': 'ㄦ',

  'Q': 'ㄆ',
  'A': 'ㄇ',
  'Z': 'ㄈ',
  'W': 'ㄊ',
  'S': 'ㄋ',
  'X': 'ㄌ',
  'E': 'ㄍ',
  'D': 'ㄎ',
  'C': 'ㄏ',
  'R': 'ㄐ',
  'F': 'ㄑ',
  'V': 'ㄒ',
  'T': 'ㄔ',
  'G': 'ㄕ',
  'B': 'ㄖ',
  'Y': 'ㄗ',
  'H': 'ㄘ',
  'N': 'ㄙ',
  'U': 'ㄧ',
  'J': 'ㄨ',
  'M': 'ㄩ',
  'I': 'ㄛ',
  'K': 'ㄜ',
  'O': 'ㄟ',
  'L': 'ㄠ',
  'P': 'ㄣ'
  
};


/**
 * 預載入怪獸圖片
 */
function preloadMonsterImages() {
  // 清空之前的圖片緩存
  monsterImageCache = {};
  
  // 預載入遊戲配置中的怪獸圖片
  GameConfig.monsters.images.forEach(imageName => {
    const img = new Image();
    img.src = imageName;
    
    // 添加錯誤處理
    img.onerror = function() {
      console.error(`無法載入圖片: ${imageName}`);
      // 設置一個默認圖片
      img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJKu3tMzQAAAABJRU5ErkJggg==';
    }
    
    monsterImageCache[imageName] = img;
  });
  
  // 如果沒有配置圖片，加載默認圖片
  if (GameConfig.monsters.images.length === 0) {
    const defaultImage = new Image();
    defaultImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH5gQFAQoLNx6cNwAABLdJREFUWMPtl1tsVGUUhb99zplOZ3o/tLQWSimFltsACoKIGhOUqPGCPhhCCPKgidGIJj74ZHzQxMQH44MaMcbEBxJivFFMlIuRiwoIiFBKaQstbWmn7XTunZnz+zBQi9BBaGPigy/55+TMnJO1/v3v9e+9Rf6HJf4NEQR6gbVAJ7AUaALCQBJIA1NEYpg9m1jwwS5CXZ2zJl/6wRekXw/eBJ4DlgEvAh1AM+ADVGAJ0AXcBH4CjgDfA6rQlQpWgEYsRvzYO2ir2iRZXr5Qgla8QIwGHgCeBVYUS1QCFcD9wOPAK8Ax4GvgIFBQwZ1ZsdtsKLvjnlOgQbSGeAGxTOBFYPNsGnRnghb4C/gS2DWjwj0FmADC4cB0OCDDuKNrAbSGvB8yhbUB8MwV7C4B0sCvwA6gD1D3bEEiQTg6SlVVNSU9PUjDuOVaa9B6RmmyORDqtsDOowPtQgNBtxvXZx+jtCYfjxOoqkKG7VrldJKNXqO1qQmlNRFvgMzQEHq+5DkQT4Nw7JNChFaXLaPu4CGiPWvRlkVk6zZstTXYa2vJxmJI00nJ4kUM7OojumTJrEUTF65QHbRD1mLs0giBJR3UfXUAKQSZn34mWVVFZOtWANI5i9Eb6QUkkMAjQFkxkRm1nKaJ0vD75+9T39xEvLGRRM8aaq9cxV5bS3rrE5SPxTCkJNTVRW5ggOH9X+NsaiRUX1+0BgSPAnXMTJTbRCmFVorSwRvkfn2N0TPnKG9vxzCdxBsb0U5J0zffImyS8txV4r/8QmrdOuqeegZnczO5/j+QXu8sAbDEZkNKiZnNIrVm8vh3TMfjVLdEmYrFsAJBbDU1qNQUJfE4ykzDcIS0vYFsx3LKNzyEd2Un0jQxsllkmQ8p77r3NighdN6Ps7IC9+Ag+UiErNfLktGrjJw5i9/txjZwEi1N/KubCTXVUl3poqlMMdpYQ9rtxl4eJjs2hmEYd7SABgHmzXM4/KKLyUOHcLW2kCkvp27fPkYuDpE5fQbhdOJ7Yjv5qgpqvvgE4XajYjEm9+9n3G5Hn/4BX2Ul+bExXD4fhmncJUADRj4xkQq43bi6uxHpNFMXL5Lt7SV58iSmlNTu3YO7pgbD6UQrxfixY0zu/Qq/380fZ86Rd7txtrSTGx5G5PNFDTC39E6HnZzfR/bKMMmRUczVq7FVVZEbHmbs0CEcd91F+qefiOzciU5PQHsLuVSC0a/3YwXD2GvrSCfiGE7H3AKUVLT6nSTO9SMchYtJpbA1NpLs70caBqWbNpEbHiYJhNavx9XeRvrUKXAYCK+f7OAg5uxNSOBySiRFXs3+ikr8jQ0IKfEl4iglcHu9GOUS28BVhJT4V65k8sgR9MgI3sceo3TDBjL9Z0ilJEZJKehZAiigL2NhTLuL9PkKX8GfQOsC52B7G77HtyOFID+ZRA8NIToKqmQmU7i7u1BGDpdXkzs3RGQxAgB9477+nU3RWmBdVhMNNiA2byYxNsZkfz+Zs2dxtbeTbGtDDA0yeryfSxMZFiQAZiLojYv5E36EG7C1tjKlFOnhYVI3buCdiDOB4kJ8khsLFpjN+NXglDJKBOaEwt3SwuRff3Nt5CZSaaTQ94wvcWkiw2BskpxSfwOzlqLRb+p5zgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0wNC0wNVQwMToxMDoxMSswMDowMEp09eEAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMDQtMDVUMDE6MTA6MTErMDA6MDA7KU1dAAAAAElFTkSuQmCC';
    monsterImageCache["defaultMonster"] = defaultImage;
    
    // 更新配置
    GameConfig.monsters.images = ["defaultMonster"];
  }
}

/**
 * 尋找最優先需要輸入的怪獸
 * @param {Array<Monster>} monsters - 怪獸陣列
 * @returns {number} - 目標怪獸索引，如果沒有找到則返回-1
 */
function findTargetMonster(monsters) {
  let targetIndex = -1;
  let maxY = -1;
  
  // 先找最靠近底部的活躍怪物
  for (let i = 0; i < monsters.length; i++) {
    if (monsters[i].active && monsters[i].r > 0 && monsters[i].y > maxY && monsters[i].text.length > 0) {
      maxY = monsters[i].y;
      targetIndex = i;
    }
  }
  
  // 如果找到一個新的目標，更新最後一次顯示的目標
  if (targetIndex !== -1) {
    lastDisplayedTargetIndex = targetIndex;
  }
  
  return targetIndex;
}

/**
 * 創建初始怪獸
 * @param {number} canvasWidth - 畫布寬度
 * @param {number} canvasHeight - 畫布高度
 * @returns {Array<Monster>} - 創建的怪獸陣列
 */
function createInitialMonsters(canvasWidth, canvasHeight) {
  const monsters = [];
  const currentTextTheme = GameConfig.getCurrentTextTheme();
  const currentLevel = GameConfig.getCurrentLevel();
  
  const monsterSize = currentLevel.size; // 從關卡設定獲取大小
  const monsterCount = currentLevel.count; // 從關卡設定獲取數量
  const baseSpeed = currentLevel.speed; // 直接使用關卡設定的速度
  
  // 設定怪獸安全區域
  const safeMargin = monsterSize * 2; // 安全邊距為怪獸直徑
  const minX = safeMargin;
  const maxX = canvasWidth - safeMargin;
  
  // 預先計算怪獸的X座標位置，確保不會重疊
  const sectionWidth = (maxX - minX) / monsterCount;
  const xPositions = [];
  
  for (let i = 0; i < monsterCount; i++) {
    // 在每個區段中生成一個隨機位置
    const sectionStart = minX + i * sectionWidth;
    const sectionEnd = sectionStart + sectionWidth;
    const x = Math.random() * (sectionEnd - sectionStart - monsterSize) + sectionStart + monsterSize/2;
    xPositions.push(x);
  }
  
  // 創建怪獸物件
  let y = -20; // 起始Y位置
  let k = 0;   // 文字主題索引計數器
  
  for (let i = 0; i < monsterCount; i++) {
    y -= 60; // 錯開怪獸的Y座標
    
    // 從文字主題中循環選擇文字
    const text = currentTextTheme[k % currentTextTheme.length];
    k++;
    
    // 創建怪獸並加入陣列
    monsters.push(new Monster(xPositions[i], y, monsterSize, baseSpeed, text));
  }
  
  return monsters;
}

/**
 * 繪製指向目標怪獸的箭頭
 * @param {CanvasRenderingContext2D} ctx - Canvas的2D渲染上下文
 * @param {number} targetX - 目標怪獸X座標
 * @param {number} targetY - 目標怪獸Y座標
 * @param {number} canvasWidth - 畫布寬度
 * @param {number} canvasHeight - 畫布高度
 */
function drawTargetArrow(ctx, targetX, targetY, canvasWidth, canvasHeight) {
  // 箭頭從輸入框上方指向目標怪獸
  const startX = canvasWidth / 2; // 輸入框中心位置
  const startY = canvasHeight - 70; // 輸入框上方
  
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(targetX, targetY + 30); // 指向怪獸下方
  
  // 設置箭頭線條樣式
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 3]); // 虛線效果
  ctx.stroke();
  
  // 繪製箭頭頭部
  ctx.beginPath();
  ctx.moveTo(targetX, targetY + 30);
  ctx.lineTo(targetX - 10, targetY + 20);
  ctx.lineTo(targetX + 10, targetY + 20);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
  ctx.fill();
  
  // 恢復線條設置
  ctx.setLineDash([]);
  ctx.lineWidth = 1;
}

/**
 * 怪獸類別定義
 */
class Monster {
  constructor(x, y, r, dy, text) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.dy = dy;
    this.text = text;
    this.typedText = ""; // 已輸入的部分
    this.active = true;
    this.imageName = GameConfig.monsters.images[0]; // 使用第一個可用圖片
  }
  
  /**
   * 繪製怪獸
   * @param {CanvasRenderingContext2D} ctx - Canvas的2D渲染上下文
   */
  draw(ctx) {
    // 如果怪獸不活躍或半徑為0，則不繪製
    if (!this.active || this.r <= 0) {
      return;
    }
    
    // 計算怪獸大小
    const imgSize = this.r * 2;
    
    // 確保圖片已載入
    if (monsterImageCache[this.imageName] && monsterImageCache[this.imageName].complete) {
      ctx.drawImage(monsterImageCache[this.imageName], this.x - imgSize/2, this.y - imgSize/2, imgSize, imgSize);
    } else {
      // 圖片未載入完成時顯示占位圓形
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
      ctx.fillStyle = GameConfig.monsters.defaultColor;
      ctx.fill();
      ctx.stroke();
    }
    
    // 繪製文字
    ctx.font = "15px Arial";
    
    // 計算文字寬度
    const typedTextWidth = ctx.measureText(this.typedText).width;
    const remainingTextWidth = ctx.measureText(this.text).width;
    const totalTextWidth = typedTextWidth + remainingTextWidth;
    
    // 繪製文字背景
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(this.x - totalTextWidth/2 - 5, this.y + this.r/2, totalTextWidth + 10, 20);
    
    // 繪製已輸入的部分（灰色）
    ctx.fillStyle = "gray";
    ctx.fillText(this.typedText, this.x - totalTextWidth/2, this.y + this.r/2 + 15);
    
    // 繪製未輸入的部分（黑色）
    ctx.fillStyle = "black";
    ctx.fillText(this.text, this.x - totalTextWidth/2 + typedTextWidth, this.y + this.r/2 + 15);
  }
  
  /**
   * 更新怪獸位置
   */
  update() {
    // 如果怪獸不活躍，則不更新
    if (!this.active) {
      return;
    }
    
    this.y += this.dy;
  }
  
  /**
   * 銷毀怪獸（標記為不活躍）
   */
  destroy() {
    this.active = false;
    this.r = 0;
  }
  
  /**
   * 重置怪獸
   * @param {number} newY - 新的Y座標
   * @param {string} newText - 新的文字內容
   */
  reset(newY, newText) {
    this.y = newY;
    this.active = true;
    this.text = newText || GameConfig.getCurrentTextTheme()[Math.floor(Math.random() * GameConfig.getCurrentTextTheme().length)];
    this.typedText = "";
    this.r = GameConfig.getCurrentLevel().size; // 從關卡設定獲取大小
    this.imageName = GameConfig.monsters.images[0];
  }
  
  /**
 * 檢查是否匹配輸入
 * @param {string} userInput - 用戶輸入
 * @returns {boolean} - 是否匹配
 */
  matchesInput(userInput) {
    if (this.text.length === 0) return false;
    
    const firstChar = this.text.charAt(0);
    
    // 檢查輸入映射 (先檢查這個)
    if (inputMapping[userInput] === firstChar) {
      return true;
    }
    
    // 直接匹配
    if (firstChar === userInput) return true;
    
    // 取得當前主題名稱
    const currentThemeName = GameConfig.current.textTheme;
    
    // 特殊處理：如果是英文主題，允許大小寫不敏感匹配
    if (currentThemeName === "english") {
      if (firstChar.toLowerCase() === userInput.toLowerCase()) {
        return true;
      }
    }
    
    // 特殊處理：如果是混合主題或複合注音主題，允許只輸入第一個字符
    if ((currentThemeName === "mixed" || currentThemeName === "compound") && firstChar.length > 1) {
      if (firstChar.charAt(0) === userInput) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 處理成功輸入
   * @returns {boolean} - 是否完成輸入整個文字
   */
  handleInput() {
    // 將第一個字符移到已輸入部分
    this.typedText += this.text.charAt(0);
    this.text = this.text.substring(1);
    
    // 返回是否完成全部輸入
    return this.text.length === 0;
  }
}

/**
 * 處理使用者輸入
 * @param {string} userInput - 使用者輸入
 */
function handleUserInput(userInput) {
  // 如果遊戲未開始或已暫停，不處理輸入
  if (!gameStarted || isPaused) return;
  
  // 更新目標怪獸
  targetMonsterIndex = findTargetMonster(monsters);
  
  // 優先檢查目標怪獸
  if (targetMonsterIndex !== -1 && monsters[targetMonsterIndex].active) {
    const targetMonster = monsters[targetMonsterIndex];
    
    // 檢查目標怪獸是否匹配輸入
    if (targetMonster.matchesInput(userInput)) {
      // 處理成功輸入
      const isCompleted = targetMonster.handleInput();
      
      if (isCompleted) {
        // 完成整個單詞，增加分數
        score += Math.ceil(1 * GameConfig.getScoreFactor());
        
        // 銷毀怪獸
        targetMonster.destroy();
        
        // 將怪獸重置到頂部（重複利用物件）
        setTimeout(() => {
          const newText = GameConfig.getCurrentTextTheme()[Math.floor(Math.random() * GameConfig.getCurrentTextTheme().length)];
          targetMonster.reset(-10 - Math.random() * 50, newText);
        }, 1000);
        
        // 更新底部文字顯示當前得分
        updateBottomText(`得分: ${score}`);
      } else {
        // 複合注音特殊處理
        if (GameConfig.current.textTheme === "compound") {
          updateBottomText("正確輸入！繼續輸入剩餘字符...");
        } else {
          updateBottomText("正確輸入！繼續...");
        }
      }
      
      return;
    } else {
      // 如果輸入不匹配目標怪獸，提示
      updateBottomText("提示：請輸入紅色箭頭指向的怪物字符");
      return;
    }
  }
  
  // 如果沒有找到目標怪獸，或輸入不匹配，則提示用戶
  updateBottomText("提示：請輸入紅色箭頭指向的怪物字符");
}