/**
 * ui.js - 用戶界面元素
 * 處理界面元素的繪製與互動
 */

// 底部文字訊息
let bottomBarText = "";

/**
 * 繪製底部訊息欄和文字
 * @param {CanvasRenderingContext2D} ctx - Canvas的2D渲染上下文
 * @param {number} canvasWidth - 畫布寬度
 * @param {number} canvasHeight - 畫布高度
 */
function drawBottomBar(ctx, canvasWidth, canvasHeight) {
  const barTheme = GameConfig.bottomBar;
  const barHeight = 50;
  
  ctx.fillStyle = barTheme.color;
  ctx.fillRect(0, canvasHeight - barHeight, canvasWidth, barHeight);
  
  // 繪製文字
  ctx.font = `${barTheme.fontSize} ${barTheme.fontFamily}`;
  ctx.fillStyle = barTheme.textColor;
  ctx.textAlign = "center";
  ctx.fillText(bottomBarText, canvasWidth / 2, canvasHeight - barHeight/2 + 8);
  ctx.textAlign = "start"; // 重置文字對齊
}

/**
 * 更新底部文字
 * @param {string} text - 要顯示的文字
 */
function updateBottomText(text) {
  bottomBarText = text;
}

/**
 * 繪製遊戲開始畫面
 * @param {CanvasRenderingContext2D} ctx - Canvas的2D渲染上下文
 * @param {number} canvasWidth - 畫布寬度
 * @param {number} canvasHeight - 畫布高度
 */
function drawStartScreen(ctx, canvasWidth, canvasHeight) {
  // 繪製標題
  ctx.font = "40px Arial";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.fillText("ㄉㄚˇㄗˋ遊戲", canvasWidth / 2, canvasHeight / 3);
  
  // 繪製說明
  ctx.font = "20px Arial";
  ctx.fillStyle = "#555";
  ctx.fillText("請在左側選擇設定，然後點擊開始按鈕", canvasWidth / 2, canvasHeight / 3 + 40);
  
  // 繪製底部訊息欄
  drawBottomBar(ctx, canvasWidth, canvasHeight);
  
  // 重置文字對齊
  ctx.textAlign = "start";
}

/**
 * 繪製遊戲中的狀態資訊
 * @param {CanvasRenderingContext2D} ctx - Canvas的2D渲染上下文
 * @param {number} score - 當前分數
 * @param {string} themeName - 當前主題名稱
 * @param {string} difficultyName - 當前難度名稱
 * @param {number} levelNumber - 當前關卡
 */
function drawGameStats(ctx, score, themeName, difficultyName, levelNumber) {
  // 分數顯示
  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("分數:", 50, 30);
  ctx.fillText(score, 120, 30);
  
  // 當前設定顯示
  ctx.font = "16px Arial";
  ctx.fillText(`主題: ${getThemeDisplayName(themeName)}`, 50, 60);
  ctx.fillText(`難度: ${getDifficultyDisplayName(difficultyName)}`, 50, 85);
  ctx.fillText(`關卡: ${levelNumber}`, 50, 110);
  
  // 遊戲標題
  ctx.font = "40px Arial";
  ctx.strokeStyle = "lightgrey";
  ctx.strokeText("ㄉㄚˇㄗˋ", 10, 40);
}

/**
 * 獲取主題顯示名稱
 * @param {string} themeName - 主題名稱
 * @returns {string} - 顯示名稱
 */
function getThemeDisplayName(themeName) {
  const displayNames = {
    'default': '注音符號',
    'numbers': '數字',
    'english': '英文字母',
    'mixed': '混合'
  };
  return displayNames[themeName] || themeName;
}

/**
 * 獲取難度顯示名稱
 * @param {string} difficultyName - 難度名稱
 * @returns {string} - 顯示名稱
 */
function getDifficultyDisplayName(difficultyName) {
  const displayNames = {
    'easy': '簡單',
    'normal': '一般',
    'hard': '困難'
  };
  return displayNames[difficultyName] || difficultyName;
}

/**
 * 顯示遊戲設定面板
 */
function showGameSettings() {
  const settingsPanel = document.getElementById('game-settings');
  if (settingsPanel) {
    settingsPanel.style.display = 'block';
  }
}

/**
 * 隱藏遊戲設定面板
 */
function hideGameSettings() {
  const settingsPanel = document.getElementById('game-settings');
  if (settingsPanel) {
    settingsPanel.style.display = 'none';
  }
}

/**
 * 顯示開始按鈕
 */
function showStartButton() {
  const startButton = document.getElementById('start-btn');
  if (startButton) {
    startButton.style.display = 'block';
  }
}

/**
 * 隱藏開始按鈕
 */
function hideStartButton() {
  const startButton = document.getElementById('start-btn');
  if (startButton) {
    startButton.style.display = 'none';
  }
}

/**
 * 顯示輸入框
 */
function showInputContainer() {
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

/**
 * 隱藏輸入框
 */
function hideInputContainer() {
  const inputContainer = document.getElementById('input-container');
  if (inputContainer) {
    inputContainer.style.display = 'none';
  }
}

/**
 * 顯示遊戲結束提示
 * @param {number} finalScore - 最終分數
 */
function showGameOver(finalScore) {
  updateBottomText(`遊戲結束！最終分數: ${finalScore}`);
  setTimeout(() => {
    alert(`遊戲結束！\n您的最終分數是: ${finalScore}`);
  }, 100);
}