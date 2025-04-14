/**
 * main.js - 遊戲主邏輯入口點
 * 初始化遊戲並處理全局事件
 */

// 遊戲狀態
let gameState = {
    started: false,       // 遊戲是否已開始
    paused: false,        // 遊戲是否暫停
    score: 0,             // 當前分數
    monsters: [],         // 怪獸陣列
    targetMonsterIndex: -1, // 目標怪獸索引
    canvas: null,         // 畫布
    ctx: null,            // 繪圖上下文
    animationId: null,    // 動畫框架ID
    difficulty: 1.0,      // 當前難度係數
    lastDifficultyIncrease: 0, // 上次增加難度的時間
    lastCleanup: 0        // 上次清理的時間
  };
  
  /**
   * 初始化遊戲
   */
  function initGame() {
    // 獲取畫布和繪圖上下文
    gameState.canvas = document.getElementById('canvas');
    gameState.ctx = gameState.canvas.getContext('2d');
    
    // 設置畫布大小
    resizeCanvas();
    
    // 預載入怪獸圖片
    preloadMonsterImages();
    
    // 初始化UI元素
    initUI();
    
    // 綁定事件監聽器
    bindEventListeners();
    
    // 開始遊戲循環
    gameLoop();
  }
  
  /**
   * 調整畫布大小
   */
  function resizeCanvas() {
    const container = document.querySelector('.game-container');
    gameState.canvas.width = container.clientWidth;
    gameState.canvas.height = container.clientHeight;
  }
  
  /**
   * 初始化UI元素
   */
  function initUI() {
    // 初始化文字主題選擇
    const themeSelect = document.getElementById('theme-select');
    for (const theme in GameConfig.textThemes) {
      const option = document.createElement('option');
      option.value = theme;
      option.textContent = getThemeDisplayName(theme);
      themeSelect.appendChild(option);
    }
    
    // 初始化關卡選擇
    const levelSelect = document.getElementById('level-select');
    for (const level in GameConfig.monsters.levels) {
      const option = document.createElement('option');
      option.value = level;
      option.textContent = `關卡 ${level} - ${getLevelDisplayName(level)}`;
      levelSelect.appendChild(option);
    }
    
    // 顯示設定面板和開始按鈕
    showGameSettings();
    showStartButton();
    hideInputContainer();
  }
  
  /**
   * 綁定事件監聽器
   */
  function bindEventListeners() {
    // 開始按鈕點擊事件
    document.getElementById('start-btn').addEventListener('click', startGame);
    
    // 暫停按鈕點擊事件
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    
    // 重新開始按鈕點擊事件
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    
    // 主題選擇變更事件
    document.getElementById('theme-select').addEventListener('change', function(e) {
        const newTheme = e.target.value;
        GameConfig.setTextTheme(newTheme);
        
        // 記錄使用過的主題
        if (typeof AchievementSystem !== 'undefined') {
          AchievementSystem.onThemeChange(gameState.stats, newTheme);
        }
    });
    
    // 關卡選擇變更事件
    document.getElementById('level-select').addEventListener('change', function(e) {
      GameConfig.setLevel(e.target.value);
    });
    
    // 輸入框輸入事件
    document.getElementById('typing-input').addEventListener('input', function(e) {
      const input = e.target.value;
      if (input.length > 0) {
        handleUserInput(input.charAt(input.length - 1));
        e.target.value = ''; // 清空輸入框
        
        // 更新打字統計
        GameConfig.stats.totalCharsTyped++;
        
        // 每隔一段時間更新打字速度
        const now = Date.now();
        if (now - GameConfig.stats.lastUpdateTime >= GameConfig.stats.updateInterval) {
          GameConfig.updateTypingSpeed();
        }
      }
    });
    
    // 視窗大小改變事件
    window.addEventListener('resize', function() {
      resizeCanvas();
    });
    
    // 鍵盤事件 - 切換暫停
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && gameState.started) {
        togglePause();
      }
    });
    
    // 防止失去焦點 - 保持輸入框焦點
    window.addEventListener('click', function() {
      if (gameState.started && !gameState.paused) {
        document.getElementById('typing-input').focus();
      }
    });
  }
  
  /**
   * 開始遊戲
   */
  function startGame() {
    if (gameState.started) return;
    
    // 初始化遊戲狀態
    gameState.started = true;
    gameState.paused = false;
    gameState.score = 0;
    gameState.lastDifficultyIncrease = Date.now();
    gameState.lastCleanup = Date.now();

    // 如果有虛擬鍵盤按鈕，顯示它
    const toggleKeyboardBtn = document.querySelector('.toggle-keyboard-btn');
    if (toggleKeyboardBtn) {
        toggleKeyboardBtn.style.display = 'block';
    }
    
    // 創建/重置統計資料
    if (typeof AchievementSystem !== 'undefined') {
        gameState.stats = AchievementSystem.createStats();
    }

    // 重置打字統計
    GameConfig.resetTypingStats();
    
    // 創建初始怪獸
    gameState.monsters = createInitialMonsters(gameState.canvas.width, gameState.canvas.height);
    
    // 隱藏設定面板和開始按鈕
    hideGameSettings();
    hideStartButton();
    showInputContainer();
    
    // 聚焦到輸入框
    document.getElementById('typing-input').focus();
    
    // 更新底部文字
    updateBottomText('遊戲開始！');
  }
  
  /**
   * 切換暫停狀態
   */
  function togglePause() {
    if (!gameState.started) return;
    
    gameState.paused = !gameState.paused;
    
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.textContent = gameState.paused ? '繼續' : '暫停';
    
    if (gameState.paused) {
      updateBottomText('遊戲暫停');
    } else {
      updateBottomText('遊戲繼續');
      document.getElementById('typing-input').focus();
    }
  }
  
  /**
 * 結束遊戲
 */
function endGame() {
    if (!gameState.started) return;
    
    // 停止遊戲循環
    if (gameState.animationId) {
      cancelAnimationFrame(gameState.animationId);
      gameState.animationId = null;
    }
    
    // 停止所有計時器
    clearAllTimers();
    
    // 停止背景音樂
    if (typeof GameAudio !== 'undefined') {
      GameAudio.stopBGM();
    }
    
    // 播放遊戲結束音效
    if (typeof GameAudio !== 'undefined') {
      GameAudio.play('gameOver');
    }
    
    // 更新遊戲狀態
    gameState.started = false;
    gameState.paused = false;
    
    // 顯示遊戲結束提示
    showGameOver(gameState.score);
    
    // 重置暫停按鈕文字
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.textContent = '暫停';
    }
    
    // 隱藏虛擬鍵盤和相關按鈕
    const keyboardContainer = document.querySelector('.virtual-keyboard');
    const toggleKeyboardBtn = document.querySelector('.toggle-keyboard-btn');
    if (keyboardContainer) {
      keyboardContainer.style.display = 'none';
    }
    if (toggleKeyboardBtn) {
      toggleKeyboardBtn.style.display = 'none';
    }
    
    // 隱藏輸入區域
    hideInputContainer();
    
    // 延遲顯示開始按鈕和設定面板，避免與結束提示衝突
    setTimeout(() => {
      showStartButton();
      showGameSettings();
    }, 1000);
  }
  
  /**
   * 重新開始遊戲
   */
  function restartGame() {
    // 結束當前遊戲
    endGame();
    
    // 清除畫布
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // 完全重置遊戲狀態
    gameState.started = false;
    gameState.paused = false;
    gameState.score = 0;
    gameState.monsters = [];
    gameState.targetMonsterIndex = -1;
    gameState.difficulty = 1.0;
    gameState.lastDifficultyIncrease = 0;
    gameState.lastCleanup = 0;
    
    // 重置打字統計
    GameConfig.resetTypingStats();
    
    // 重置UI文字
    updateBottomText('');
    
    // 更新數值顯示
    updateStatsDisplay();
    
    // 顯示開始按鈕和設定面板
    showStartButton();
    showGameSettings();
    hideInputContainer();
    
    // 在沒有遊戲循環的情況下繪製初始畫面
    drawStartScreen(ctx, canvas.width, canvas.height);
  }
  
  /**
   * 清除所有計時器
   */
  function clearAllTimers() {
    // 清除所有可能存在的setTimeout和setInterval
    const highestTimeoutId = setTimeout(";");
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
  }
  
  /**
   * 更新統計資訊顯示
   */
  function updateStatsDisplay() {
    document.getElementById('score-value').textContent = gameState.score || 0;
    document.getElementById('speed-value').textContent = `${GameConfig.stats.typingSpeed || 0} 字/分鐘`;
    document.getElementById('theme-value').textContent = getThemeDisplayName(GameConfig.current.textTheme);
    document.getElementById('level-value').textContent = `${GameConfig.current.level} - ${getLevelDisplayName(GameConfig.current.level)}`;
    document.getElementById('combo-value').textContent = gameState.combo || 0;
  }
  
  /**
   * 更新怪獸難度
   */
  function updateDifficulty() {
    const now = Date.now();
    
    // 檢查是否應該增加難度
    if (now - gameState.lastDifficultyIncrease >= GameConfig.game.difficultyIncreaseTime) {
      const difficultyIncrease = GameConfig.getDifficultyIncreaseFactor();
      gameState.difficulty += difficultyIncrease;
      
      // 更新怪獸速度
      for (let monster of gameState.monsters) {
        if (monster.active) {
          monster.dy *= (1 + difficultyIncrease * 0.2);
        }
      }
      
      updateBottomText(`難度提升！速度增加了 ${Math.round(difficultyIncrease * 100)}%`);
      gameState.lastDifficultyIncrease = now;
      
      // 在較高難度時可能需要增加怪獸數量
      if (gameState.difficulty > 2.0 && gameState.monsters.length < 30) {
        addNewMonster();
      }
    }
  }
  
  /**
   * 新增一個怪獸
   */
  function addNewMonster() {
    const canvas = gameState.canvas;
    const currentTextTheme = GameConfig.getCurrentTextTheme();
    const currentLevel = GameConfig.getCurrentLevel();
    
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = -50 - Math.random() * 100;
    const r = currentLevel.size;
    const speed = currentLevel.speed * gameState.difficulty;
    const text = currentTextTheme[Math.floor(Math.random() * currentTextTheme.length)];
    
    gameState.monsters.push(new Monster(x, y, r, speed, text));
  }
  
  /**
   * 清理無效怪獸
   */
  function cleanupMonsters() {
    const now = Date.now();
    
    // 每隔一段時間清理無效怪獸
    if (now - gameState.lastCleanup >= GameConfig.game.cleanupInterval) {
      let activeCount = 0;
      
      // 計算活躍怪獸數量
      for (let monster of gameState.monsters) {
        if (monster.active) {
          activeCount++;
        }
      }
      
      // 如果活躍怪獸數量不足，添加新怪獸
      const currentLevel = GameConfig.getCurrentLevel();
      const targetCount = Math.min(currentLevel.count + Math.floor(gameState.difficulty - 1) * 2, 30);
      
      while (activeCount < targetCount) {
        addNewMonster();
        activeCount++;
      }
      
      gameState.lastCleanup = now;
    }
  }
  
  /**
   * 遊戲主循環
   */
  function gameLoop() {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;
    const now = Date.now();
    if (now - lastStatsUpdate > 1000) { // 每秒更新一次
        updateGameStats();
        lastStatsUpdate = now;
    }
    
    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 檢查遊戲是否已開始
    if (!gameState.started) {
      // 繪製開始畫面
      drawStartScreen(ctx, canvas.width, canvas.height);
      
      // 繼續下一幀
      gameState.animationId = requestAnimationFrame(gameLoop);
      return;
    }
    
    // 如果遊戲暫停，只繪製當前狀態不更新
    if (gameState.paused) {
      // 繪製遊戲中的狀態資訊
      drawGameStats(ctx, gameState.score, GameConfig.current.textTheme, GameConfig.current.level);
      
      // 繪製底部訊息欄
      drawBottomBar(ctx, canvas.width, canvas.height);
      
      // 繪製所有怪獸
      for (let monster of gameState.monsters) {
        if (monster.active && monster.r > 0) {
          monster.draw(ctx);
        }
      }
      
      // 在中間顯示"遊戲暫停"
      ctx.font = "30px Arial";
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.textAlign = "center";
      ctx.fillText("遊戲暫停", canvas.width / 2, canvas.height / 2);
      ctx.fillText("按 ESC 或點擊繼續按鈕恢復", canvas.width / 2, canvas.height / 2 + 40);
      ctx.textAlign = "start";
      
      // 繼續下一幀
      gameState.animationId = requestAnimationFrame(gameLoop);
      return;
    }
    
    // 繪製遊戲中的狀態資訊
    drawGameStats(ctx, gameState.score, GameConfig.current.textTheme, GameConfig.current.level);
    
    // 繪製底部訊息欄
    drawBottomBar(ctx, canvas.width, canvas.height);
    
    // 更新難度
    updateDifficulty();
    
    // 清理無效怪獸
    cleanupMonsters();
    
    // 更新目標怪獸指針
    gameState.targetMonsterIndex = findTargetMonster(gameState.monsters);
    
    // 先繪製所有活躍的怪獸
    for (let monster of gameState.monsters) {
      if (monster.active && monster.r > 0) {
        monster.draw(ctx);
      }
    }
    
    // 如果有目標怪獸，繪製指向箭頭
    if (gameState.targetMonsterIndex !== -1 && gameState.monsters[gameState.targetMonsterIndex].active) {
      const targetMonster = gameState.monsters[gameState.targetMonsterIndex];
      
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
    for (let monster of gameState.monsters) {
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
    
    // 繼續下一幀
    gameState.animationId = requestAnimationFrame(gameLoop);
  }

  function updateGameStats() {
    // 更新遊戲統計數據
    gameState.stats.playTime = Math.floor((Date.now() - gameState.stats.startTime) / 1000);
    
    // 檢查成就
    if (typeof AchievementSystem !== 'undefined') {
      AchievementSystem.updateStats(gameState.stats, {});
    }
}
  
  /**
   * 處理使用者輸入
   * @param {string} userInput - 使用者輸入
   */
  function handleUserInput(userInput) {
    // 如果遊戲未開始或已暫停，不處理輸入
    if (!gameState.started || gameState.paused) return;
    
    // 更新目標怪獸
    gameState.targetMonsterIndex = findTargetMonster(gameState.monsters);
    
    // 優先檢查目標怪獸
    if (gameState.targetMonsterIndex !== -1 && gameState.monsters[gameState.targetMonsterIndex].active) {
      const targetMonster = gameState.monsters[gameState.targetMonsterIndex];
      
      // 檢查目標怪獸是否匹配輸入
      if (targetMonster.matchesInput(userInput)) {
        // 處理成功輸入
        const isCompleted = targetMonster.handleInput();
        
        if (isCompleted) {
          // 完成整個單詞，增加分數
          gameState.score += Math.ceil(1 * GameConfig.getScoreFactor() * gameState.difficulty);
          
          // 銷毀怪獸
          targetMonster.destroy();
          
          // 將怪獸重置到頂部（重複利用物件）
          setTimeout(() => {
            const newText = GameConfig.getCurrentTextTheme()[Math.floor(Math.random() * GameConfig.getCurrentTextTheme().length)];
            targetMonster.reset(-10 - Math.random() * 50, newText);
          }, 1000);
          
          // 更新底部文字顯示當前得分
          updateBottomText(`得分: ${gameState.score}`);
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
  
  // 當頁面載入完成後初始化遊戲
  window.addEventListener('DOMContentLoaded', initGame);