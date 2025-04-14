/**
 * achievements.js - 成就系統模組
 * 處理遊戲成就的解鎖和顯示
 */

// 成就配置
const AchievementSystem = {
    // 已解鎖的成就
    unlockedAchievements: [],
    
    // 成就定義
    achievements: [
      {
        id: 'first_monster',
        title: '初次擊退',
        description: '成功擊退第一個怪獸',
        condition: (stats) => stats.totalDefeated >= 1,
        unlocked: false
      },
      {
        id: 'speed_10',
        title: '初級打字員',
        description: '達到每分鐘10字的打字速度',
        condition: (stats) => stats.typingSpeed >= 10,
        unlocked: false
      },
      {
        id: 'speed_30',
        title: '中級打字員',
        description: '達到每分鐘30字的打字速度',
        condition: (stats) => stats.typingSpeed >= 30,
        unlocked: false
      },
      {
        id: 'speed_50',
        title: '高級打字員',
        description: '達到每分鐘50字的打字速度',
        condition: (stats) => stats.typingSpeed >= 50,
        unlocked: false
      },
      {
        id: 'speed_100',
        title: '專業打字員',
        description: '達到每分鐘100字的打字速度',
        condition: (stats) => stats.typingSpeed >= 100,
        unlocked: false
      },
      {
        id: 'defeated_10',
        title: '消滅初階',
        description: '成功擊退10個怪獸',
        condition: (stats) => stats.totalDefeated >= 10,
        unlocked: false
      },
      {
        id: 'defeated_50',
        title: '消滅專家',
        description: '成功擊退50個怪獸',
        condition: (stats) => stats.totalDefeated >= 50,
        unlocked: false
      },
      {
        id: 'defeated_100',
        title: '消滅大師',
        description: '成功擊退100個怪獸',
        condition: (stats) => stats.totalDefeated >= 100,
        unlocked: false
      },
      {
        id: 'no_miss_10',
        title: '零失誤 I',
        description: '連續擊退10個怪獸沒有輸入錯誤',
        condition: (stats) => stats.noMissStreak >= 10,
        unlocked: false
      },
      {
        id: 'no_miss_20',
        title: '零失誤 II',
        description: '連續擊退20個怪獸沒有輸入錯誤',
        condition: (stats) => stats.noMissStreak >= 20,
        unlocked: false
      },
      {
        id: 'score_100',
        title: '破百分',
        description: '獲得100分',
        condition: (stats) => stats.score >= 100,
        unlocked: false
      },
      {
        id: 'score_500',
        title: '高分玩家',
        description: '獲得500分',
        condition: (stats) => stats.score >= 500,
        unlocked: false
      },
      {
        id: 'score_1000',
        title: '分數王者',
        description: '獲得1000分',
        condition: (stats) => stats.score >= 1000,
        unlocked: false
      },
      {
        id: 'time_1min',
        title: '堅持1分鐘',
        description: '遊戲時間達到1分鐘',
        condition: (stats) => stats.playTime >= 60,
        unlocked: false
      },
      {
        id: 'time_3min',
        title: '堅持3分鐘',
        description: '遊戲時間達到3分鐘',
        condition: (stats) => stats.playTime >= 180,
        unlocked: false
      },
      {
        id: 'time_5min',
        title: '堅持5分鐘',
        description: '遊戲時間達到5分鐘',
        condition: (stats) => stats.playTime >= 300,
        unlocked: false
      },
      {
        id: 'level_3',
        title: '進階挑戰',
        description: '通關第3級難度',
        condition: (stats) => stats.maxLevel >= 3,
        unlocked: false
      },
      {
        id: 'level_5',
        title: '大師級挑戰',
        description: '通關第5級難度',
        condition: (stats) => stats.maxLevel >= 5,
        unlocked: false
      },
      {
        id: 'all_themes',
        title: '主題收集者',
        description: '使用過所有文字主題',
        condition: (stats) => stats.usedThemes.size >= 5, // 總共有5個主題
        unlocked: false
      },
      {
        id: 'combo_5',
        title: '連擊大師 I',
        description: '達成5連擊',
        condition: (stats) => stats.maxCombo >= 5,
        unlocked: false
      },
      {
        id: 'combo_10',
        title: '連擊大師 II',
        description: '達成10連擊',
        condition: (stats) => stats.maxCombo >= 10,
        unlocked: false
      }
    ],
    
    /**
     * 初始化成就系統
     */
    init() {
      // 從本地儲存讀取已解鎖的成就
      this.loadAchievements();
    },
    
    /**
     * 創建新的遊戲統計資料
     * @returns {Object} 遊戲統計資料物件
     */
    createStats() {
      return {
        score: 0,              // 當前分數
        totalDefeated: 0,      // 總共擊敗的怪獸數
        typingSpeed: 0,        // 打字速度
        noMissStreak: 0,       // 無錯誤連擊
        maxNoMissStreak: 0,    // 最大無錯誤連擊
        playTime: 0,           // 遊戲時間（秒）
        startTime: Date.now(), // 遊戲開始時間
        maxLevel: 1,           // 最高達到的關卡
        usedThemes: new Set(), // 使用過的主題
        currentCombo: 0,       // 當前連擊數
        maxCombo: 0            // 最大連擊數
      };
    },
    
    /**
     * 更新遊戲統計資料
     * @param {Object} stats - 遊戲統計資料
     * @param {Object} updates - 需要更新的欄位
     */
    updateStats(stats, updates) {
      // 更新統計資料
      Object.assign(stats, updates);
      
      // 更新遊戲時間
      stats.playTime = Math.floor((Date.now() - stats.startTime) / 1000);
      
      // 檢查是否需要更新最大連擊數
      if (stats.currentCombo > stats.maxCombo) {
        stats.maxCombo = stats.currentCombo;
      }
      
      // 檢查是否需要更新最大無錯誤連擊
      if (stats.noMissStreak > stats.maxNoMissStreak) {
        stats.maxNoMissStreak = stats.noMissStreak;
      }
      
      // 檢查解鎖的成就
      this.checkAchievements(stats);
    },
    
    /**
     * 處理怪獸擊敗
     * @param {Object} stats - 遊戲統計資料
     * @param {boolean} isMiss - 是否有輸入錯誤
     */
    onMonsterDefeated(stats, isMiss = false) {
      // 更新擊敗數
      stats.totalDefeated++;
      
      // 增加連擊數
      stats.currentCombo++;
      
      // 處理無錯誤連擊
      if (isMiss) {
        stats.noMissStreak = 0;
      } else {
        stats.noMissStreak++;
      }
      
      // 更新統計資料
      this.updateStats(stats, {});
    },
    
    /**
     * 處理輸入錯誤
     * @param {Object} stats - 遊戲統計資料
     */
    onInputMiss(stats) {
      // 重置連擊數
      stats.currentCombo = 0;
      
      // 重置無錯誤連擊
      stats.noMissStreak = 0;
      
      // 更新統計資料
      this.updateStats(stats, {});
    },
    
    /**
     * 處理主題變更
     * @param {Object} stats - 遊戲統計資料
     * @param {string} theme - 主題名稱
     */
    onThemeChange(stats, theme) {
      // 添加到已使用主題集合
      stats.usedThemes.add(theme);
      
      // 更新統計資料
      this.updateStats(stats, {});
    },
    
    /**
     * 檢查成就解鎖
     * @param {Object} stats - 遊戲統計資料
     */
    checkAchievements(stats) {
      let newlyUnlocked = false;
      
      // 檢查每個成就
      this.achievements.forEach(achievement => {
        // 如果成就尚未解鎖且條件滿足
        if (!achievement.unlocked && achievement.condition(stats)) {
          // 標記為已解鎖
          achievement.unlocked = true;
          this.unlockedAchievements.push(achievement.id);
          
          // 顯示成就通知
          this.showAchievementNotification(achievement);
          
          // 播放成就解鎖音效
          if (typeof GameAudio !== 'undefined') {
            GameAudio.play('complete');
          }
          
          // 標記有新解鎖的成就
          newlyUnlocked = true;
        }
      });
      
      // 如果有新解鎖的成就，保存到本地儲存
      if (newlyUnlocked) {
        this.saveAchievements();
      }
    },
    
    /**
     * 顯示成就通知
     * @param {Object} achievement - 成就物件
     */
    showAchievementNotification(achievement) {
      // 創建成就通知元素
      const notification = document.createElement('div');
      notification.className = 'achievement';
      
      // 設置成就內容
      notification.innerHTML = `
        <div class="achievement-title">成就解鎖：${achievement.title}</div>
        <div class="achievement-desc">${achievement.description}</div>
      `;
      
      // 添加到頁面
      document.querySelector('.game-container').appendChild(notification);
      
      // 3秒後移除通知
      setTimeout(() => {
        notification.remove();
      }, 3000);
    },
    
    /**
     * 保存已解鎖的成就到本地儲存
     */
    saveAchievements() {
      try {
        localStorage.setItem('typing_game_achievements', JSON.stringify(this.unlockedAchievements));
      } catch (error) {
        console.error('保存成就時出錯:', error);
      }
    },
    
    /**
     * 從本地儲存讀取已解鎖的成就
     */
    loadAchievements() {
      try {
        const savedAchievements = localStorage.getItem('typing_game_achievements');
        if (savedAchievements) {
          this.unlockedAchievements = JSON.parse(savedAchievements);
          
          // 更新成就解鎖狀態
          this.achievements.forEach(achievement => {
            if (this.unlockedAchievements.includes(achievement.id)) {
              achievement.unlocked = true;
            }
          });
        }
      } catch (error) {
        console.error('讀取成就時出錯:', error);
      }
    },
    
    /**
     * 重置所有成就
     */
    resetAchievements() {
      // 重置所有成就的解鎖狀態
      this.achievements.forEach(achievement => {
        achievement.unlocked = false;
      });
      
      // 清空已解鎖的成就列表
      this.unlockedAchievements = [];
      
      // 保存到本地儲存
      this.saveAchievements();
    },
    
    /**
     * 獲取已解鎖的成就數量
     * @returns {number} 已解鎖的成就數量
     */
    getUnlockedCount() {
      return this.unlockedAchievements.length;
    },
    
    /**
     * 獲取成就總數
     * @returns {number} 成就總數
     */
    getTotalCount() {
      return this.achievements.length;
    },
    
    /**
     * 獲取已解鎖的成就列表
     * @returns {Array} 已解鎖的成就列表
     */
    getUnlockedAchievements() {
      return this.achievements.filter(achievement => achievement.unlocked);
    },
    
    /**
     * 獲取未解鎖的成就列表
     * @returns {Array} 未解鎖的成就列表
     */
    getLockedAchievements() {
      return this.achievements.filter(achievement => !achievement.unlocked);
    },
    
    /**
     * 創建成就面板
     * @returns {HTMLElement} 成就面板元素
     */
    createAchievementPanel() {
      // 創建成就面板容器
      const panel = document.createElement('div');
      panel.className = 'achievements-panel';
      panel.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        max-width: 600px;
        max-height: 80vh;
        background: white;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        padding: 20px;
        z-index: 100;
        overflow-y: auto;
        display: none;
      `;
      
      // 創建標題
      const title = document.createElement('h2');
      title.textContent = '成就';
      title.style.cssText = `
        text-align: center;
        margin-top: 0;
        margin-bottom: 20px;
        color: #333;
        border-bottom: 2px solid #ccc;
        padding-bottom: 10px;
      `;
      panel.appendChild(title);
      
      // 創建進度指示器
      const progress = document.createElement('div');
      progress.className = 'achievement-progress';
      progress.style.cssText = `
        margin-bottom: 20px;
        text-align: center;
        font-size: 16px;
        color: #555;
      `;
      progress.textContent = `進度: ${this.getUnlockedCount()}/${this.getTotalCount()}`;
      panel.appendChild(progress);
      
      // 創建已解鎖成就區域
      const unlockedTitle = document.createElement('h3');
      unlockedTitle.textContent = '已解鎖的成就';
      unlockedTitle.style.cssText = `
        margin-top: 20px;
        margin-bottom: 10px;
        color: #4CAF50;
      `;
      panel.appendChild(unlockedTitle);
      
      const unlockedList = document.createElement('div');
      unlockedList.className = 'achievement-list unlocked';
      panel.appendChild(unlockedList);
      
      // 添加已解鎖的成就
      const unlockedAchievements = this.getUnlockedAchievements();
      if (unlockedAchievements.length > 0) {
        unlockedAchievements.forEach(achievement => {
          const item = this.createAchievementItem(achievement, true);
          unlockedList.appendChild(item);
        });
      } else {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = '尚未解鎖任何成就';
        emptyMessage.style.cssText = `
          padding: 10px;
          color: #777;
          font-style: italic;
          text-align: center;
        `;
        unlockedList.appendChild(emptyMessage);
      }
      
      // 創建未解鎖成就區域
      const lockedTitle = document.createElement('h3');
      lockedTitle.textContent = '未解鎖的成就';
      lockedTitle.style.cssText = `
        margin-top: 20px;
        margin-bottom: 10px;
        color: #777;
      `;
      panel.appendChild(lockedTitle);
      
      const lockedList = document.createElement('div');
      lockedList.className = 'achievement-list locked';
      panel.appendChild(lockedList);
      
      // 添加未解鎖的成就
      const lockedAchievements = this.getLockedAchievements();
      lockedAchievements.forEach(achievement => {
        const item = this.createAchievementItem(achievement, false);
        lockedList.appendChild(item);
      });
      
      // 創建關閉按鈕
      const closeButton = document.createElement('button');
      closeButton.textContent = '關閉';
      closeButton.style.cssText = `
        display: block;
        margin: 20px auto 0;
        padding: 10px 20px;
        background-color: #4e7ddb;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      `;
      closeButton.onclick = () => {
        panel.style.display = 'none';
      };
      panel.appendChild(closeButton);
      
      return panel;
    },
    
    /**
     * 創建成就項目
     * @param {Object} achievement - 成就物件
     * @param {boolean} unlocked - 是否已解鎖
     * @returns {HTMLElement} 成就項目元素
     */
    createAchievementItem(achievement, unlocked) {
      const item = document.createElement('div');
      item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
      item.style.cssText = `
        padding: 10px;
        background-color: ${unlocked ? 'rgba(76, 175, 80, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        border-radius: 5px;
        margin-bottom: 10px;
        border-left: 4px solid ${unlocked ? '#4CAF50' : '#ccc'};
      `;
      
      // 標題
      const title = document.createElement('div');
      title.className = 'achievement-item-title';
      title.textContent = achievement.title;
      title.style.cssText = `
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 5px;
        color: ${unlocked ? '#333' : '#777'};
      `;
      item.appendChild(title);
      
      // 描述
      const description = document.createElement('div');
      description.className = 'achievement-item-desc';
      description.textContent = achievement.description;
      description.style.cssText = `
        font-size: 14px;
        color: ${unlocked ? '#555' : '#999'};
      `;
      item.appendChild(description);
      
      return item;
    },
    
    /**
     * 顯示成就面板
     */
    showAchievementPanel() {
      // 檢查面板是否已經存在
      let panel = document.querySelector('.achievements-panel');
      
      // 如果面板不存在，創建它
      if (!panel) {
        panel = this.createAchievementPanel();
        document.querySelector('.game-container').appendChild(panel);
      }
      
      // 顯示面板
      panel.style.display = 'block';
    }
  };