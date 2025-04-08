/**
 * game.js - 遊戲主邏輯
 * 負責遊戲初始化、循環和遊戲邏輯
 */

// 遊戲全局變數
let canvas;
let ctx;
let monsters = [];
let score = 0;
let isPaused = false;
let gameStarted = false;
let targetMonsterIndex = -1;
let difficultyIncreaseInterval = null;
let cleanupInterval = null;

/**
 * 初始化遊戲
 */
function initGame() {
  // 獲取Canvas元素
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  
  // 調整Canvas大小
  canvas.height = window.innerHeight * 0.98;
  canvas.width = window.innerWidth * 0.996;
  
  // 預載入怪獸圖片
  preloadMonsterImages();
  
  // 初始化事件監聽器
  initEventListeners();
  
  // 更新底部文字
  updateBottomText("選擇設定並點擊開始按鈕開始遊戲");
  
  // 顯示設定面板
  showGameSettings();
  
  // 隱藏輸入框
  hideInputContainer();
  
  // 創建初始怪獸(但還沒開始遊戲)
  monsters = createInitialMonsters(canvas.width, canvas.height);
  
  // 開始遊戲循環
  requestAnimationFrame(gameLoop);
}

// 啟動遊戲
window.onload = initGame;

/**
 * 遊戲主循環
 */
function gameLoop() {
  requestAnimationFrame(gameLoop);
  
  // 清除畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 檢查遊戲是否已開始
  if (!gameStarted) {
    // 繪製開始畫面
    drawStartScreen(ctx, canvas.width, canvas.height);
    return;
  }
  
  // 如果遊戲暫停，只繪製當前狀態不更新
  if (isPaused) {
    // 繪製遊戲中的狀態資訊
    drawGameStats(ctx, score, GameConfig.current.textTheme, GameConfig.current.difficulty, GameConfig.current.level);
    
    // 繪製底部訊息欄
    drawBottomBar(ctx, canvas.width, canvas.height);
    
    // 繪製所有怪獸
    for (let monster of monsters) {
      if (monster.active && monster.r > 0) {
        monster.draw(ctx);
      }
    }
    
    // 在底部顯示"遊戲暫停"
    ctx.font = "30px Arial";
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.textAlign = "center";
    ctx.fillText("遊戲暫停", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "start";
    
    return;
  }
  
  // 繪製遊戲中的狀態資訊
  drawGameStats(ctx, score, GameConfig.current.textTheme, GameConfig.current.difficulty, GameConfig.current.level);
  
  // 繪製底部訊息欄
  drawBottomBar(ctx, canvas.width, canvas.height);
  
  // 更新目標怪獸指針
  targetMonsterIndex = findTargetMonster(monsters);
  
  // 先繪製所有活躍的怪獸
  for (let monster of monsters) {
    if (monster.active && monster.r > 0) {
      monster.draw(ctx);
    }
  }
  
  // 如果有目標怪獸，繪製指向箭頭
  if (targetMonsterIndex !== -1 && monsters[targetMonsterIndex].active) {
    const targetMonster = monsters[targetMonsterIndex];
    
    // 確保這個怪獸是真的有效的目標（有文字需要輸入）
    if (targetMonster.text.length > 0) {
      // 繪製指向箭頭
      drawTargetArrow(ctx, targetMonster.x, targetMonster.y, canvas.width, canvas.height);
      
      // 高亮顯示目標怪獸（繪製一個輪廓）
      ctx.beginPath();
      ctx.arc(targetMonster.x, targetMonster.y, targetMonster.r + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.lineWidth = 1;
      
      // 在目標怪獸上顯示下一個要輸入的字符提示
      if (targetMonster.text.length > 0) {
        const nextChar = targetMonster.text.charAt(0);
        
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText(nextChar, targetMonster.x, targetMonster.y - targetMonster.r - 10);
        ctx.textAlign = "start"; // 重置文字對齊
      }
    }
  }
  
  // 更新所有活躍的怪獸
  for (let monster of monsters) {
    if (monster.active) {
      monster.update();
      
      // 檢查是否碰到底部
      const bottomBarHeight = 50;
      if (monster.y >= canvas.height - bottomBarHeight && monster.r > 0) {
        endGame();
        return;
      }
    }
  }
}

/**
 * 開始遊戲
 */
function startGame() {
  // 標記遊戲已開始
  gameStarted = true;
  isPaused = false;
  score = 0;
  
  // 隱藏設定面板
  hideGameSettings();
  
  // 隱藏開始按鈕
  hideStartButton();
  
  // 顯示輸入框
  showInputContainer();
  
  // 重新初始化怪獸
  monsters = createInitialMonsters(canvas.width, canvas.height);
  
  // 更新底部文字
  updateBottomText("遊戲開始！請輸入文字");
  
  // 啟動定期清理無效怪獸的計時器
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  cleanupInterval = setInterval(cleanupInactiveMonsters, GameConfig.game.cleanupInterval);
  
  // 啟動定期增加難度的計時器
  if (difficultyIncreaseInterval) {
    clearInterval(difficultyIncreaseInterval);
  }
  difficultyIncreaseInterval = setInterval(increaseDifficulty, GameConfig.game.difficultyIncreaseTime);
}

/**
 * 結束遊戲
 */
function endGame() {
  // 顯示遊戲結束提示
  showGameOver(score);
  
  // 清除計時器
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  
  if (difficultyIncreaseInterval) {
    clearInterval(difficultyIncreaseInterval);
    difficultyIncreaseInterval = null;
  }
  
  // 重置遊戲狀態
  gameStarted = false;
  isPaused = false;
  score = 0;
  
  // 顯示設定面板
  showGameSettings();
  
  // 顯示開始按鈕
  showStartButton();
  
  // 隱藏輸入框
  hideInputContainer();
}

/**
 * 暫停/繼續遊戲
 */
function togglePause() {
  if (!gameStarted) return;
  
  isPaused = !isPaused;
  
  // 更新暫停按鈕文字
  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) {
    pauseBtn.textContent = isPaused ? '繼續' : '暫停';
  }
  
  // 更新底部文字
  updateBottomText(isPaused ? "遊戲暫停" : "遊戲繼續");
}

/**
 * 重新開始遊戲
 */
function restartGame() {
  // 只在遊戲已開始時才允許重新開始
  if (!gameStarted) return;
  
  // 重置分數
  score = 0;
  
  // 重置怪獸
  monsters = createInitialMonsters(canvas.width, canvas.height);
  
  // 取消暫停
  isPaused = false;
  
  // 更新暫停按鈕文字
  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) {
    pauseBtn.textContent = '暫停';
  }
  
  // 更新底部文字
  updateBottomText("遊戲重新開始！");
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
        // 提示成功輸入
        updateBottomText("正確輸入！繼續...");
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

/**
 * 清理不活躍的怪獸
 */
function cleanupInactiveMonsters() {
  // 計算當前活躍怪獸的數量
  let activeCount = 0;
  for (let monster of monsters) {
    if (monster.active) {
      activeCount++;
    }
  }
  
  // 確保總是有足夠的怪獸
  const minActiveMonsters = 5; // 最少應該有的怪獸數量
  
  // 重置不活躍的怪獸
  for (let monster of monsters) {
    if (!monster.active) {
      // 如果活躍怪獸數量不足，立即重置
      if (activeCount < minActiveMonsters) {
        const newText = GameConfig.getCurrentTextTheme()[Math.floor(Math.random() * GameConfig.getCurrentTextTheme().length)];
        monster.reset(-10 - Math.random() * 50, newText);
        activeCount++;
      } 
      // 否則隨機決定是否重置
      else if (Math.random() < 0.3) { // 30%的機率重置
        const newText = GameConfig.getCurrentTextTheme()[Math.floor(Math.random() * GameConfig.getCurrentTextTheme().length)];
        monster.reset(-10 - Math.random() * 50, newText);
      }
    }
  }
}

/**
 * 增加遊戲難度
 */
function increaseDifficulty() {
  // 只在遊戲未暫停時增加難度
  if (isPaused || !gameStarted) return;
  
  // 獲取難度增加因子
  const increaseFactor = GameConfig.getDifficultyIncreaseFactor();
  
  // 增加所有活躍怪獸的速度
  for (let monster of monsters) {
    if (monster.active) {
      monster.dy *= (1 + increaseFactor); // 根據難度增加速度
    }
  }
  
  updateBottomText("難度增加！怪物速度提升");
}

/**
 * 初始化事件監聽器
 */
function initEventListeners() {
  // 輸入框輸入事件
  const inputField = document.getElementById('typing-input');
  if (inputField) {
    inputField.addEventListener('input', function(event) {
      const userInput = event.target.value;
      handleUserInput(userInput);
      event.target.value = ''; // 清空輸入框
    });
  }

  // 暫停按鈕事件
  const pauseBtn = document.getElementById('pause-btn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', togglePause);
  }
  
  // 重新開始按鈕事件
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', restartGame);
  }
  
  // 主題選擇下拉框事件
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      // 只有在遊戲尚未開始時，才允許切換主題
      if (!gameStarted) {
        GameConfig.setTextTheme(this.value);
        updateBottomText(`已選擇主題: ${getThemeDisplayName(this.value)}`);
      }
    });
  }
  
  // 難度選擇下拉框事件
  const difficultySelect = document.getElementById('difficulty-select');
  if (difficultySelect) {
    difficultySelect.addEventListener('change', function() {
      // 只有在遊戲尚未開始時，才允許切換難度
      if (!gameStarted) {
        GameConfig.setDifficulty(this.value);
        updateBottomText(`已選擇難度: ${getDifficultyDisplayName(this.value)}`);
      }
    });
  }
  
  // 關卡選擇下拉框事件
  const levelSelect = document.getElementById('level-select');
  if (levelSelect) {
    levelSelect.addEventListener('change', function() {
      // 只有在遊戲尚未開始時，才允許切換關卡
      if (!gameStarted) {
        GameConfig.setLevel(this.value);
        updateBottomText(`已選擇關卡: ${this.value}`);
      }
    });
  }
  
  // 開始按鈕事件
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', startGame);
  }
  
  // 鍵盤事件
  document.addEventListener('keydown', function(event) {
    // 空格鍵 (keyCode 32) - 暫停/繼續遊戲
    if (event.keyCode === 32 && document.activeElement !== inputField && gameStarted) {
      event.preventDefault(); // 防止空格鍵滾動頁面
      togglePause();
    }
    
    // 回車鍵 (keyCode 13) - 開始遊戲
    if (event.keyCode === 13 && !gameStarted) {
      startGame();
    }
    
    // Esc鍵 (keyCode 27) - 暫停遊戲
    if (event.keyCode === 27 && gameStarted) {
      togglePause();
    }
  });
  
  // 確保輸入框始終聚焦
  document.addEventListener('click', function() {
    // 如果點擊了頁面其他區域，重新聚焦到輸入框
    if (inputField && document.activeElement !== inputField && gameStarted && !isPaused) {
      inputField.focus();
    }
  });
  
  // 視窗大小變更事件 - 重新調整Canvas大小
  window.addEventListener('resize', function() {
    canvas.height = window.innerHeight * 0.98;
    canvas.width = window.innerWidth * 0.996;
  });
}