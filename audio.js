/**
 * audio.js - 遊戲音效模組
 * 處理遊戲音效和背景音樂
 */

// 音效配置
const AudioConfig = {
    // 音效文件路徑
    sounds: {
      start: 'sounds/start.mp3',
      correct: 'sounds/correct.mp3',
      wrong: 'sounds/wrong.mp3',
      complete: 'sounds/complete.mp3',
      gameOver: 'sounds/gameover.mp3',
      bgm: 'sounds/bgm.mp3'
    },
    
    // 音效緩存對象
    cache: {},
    
    // 背景音樂對象
    bgm: null,
    
    // 音效音量 (0.0 到 1.0)
    volume: 0.5,
    
    // 是否開啟音效
    enabled: true,
    
    // 是否開啟背景音樂
    bgmEnabled: true
  };
  
  /**
   * 初始化音效系統
   */
  function initAudio() {
    // 檢查瀏覽器是否支援 Web Audio API
    if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
      console.warn('瀏覽器不支援 Web Audio API，音效將被禁用');
      AudioConfig.enabled = false;
      return;
    }
    
    // 預加載所有音效
    preloadSounds();
    
    // 創建音效切換按鈕
    createAudioControls();
  }
  
  /**
   * 預加載所有音效
   */
  function preloadSounds() {
    for (const [key, path] of Object.entries(AudioConfig.sounds)) {
      // 跳過背景音樂，它將在遊戲開始時加載
      if (key === 'bgm') continue;
      
      const audio = new Audio();
      audio.src = path;
      audio.preload = 'auto';
      
      // 處理加載錯誤
      audio.onerror = function() {
        console.error(`無法加載音效: ${path}`);
      };
      
      // 緩存音效
      AudioConfig.cache[key] = audio;
    }
  }
  
  /**
   * 播放指定音效
   * @param {string} soundName - 音效名稱
   */
  function playSound(soundName) {
    if (!AudioConfig.enabled) return;
    
    // 檢查音效是否存在
    if (!AudioConfig.cache[soundName]) {
      console.error(`音效 "${soundName}" 不存在`);
      return;
    }
    
    // 克隆音效節點以便同時播放多個相同音效
    const sound = AudioConfig.cache[soundName].cloneNode();
    sound.volume = AudioConfig.volume;
    
    // 播放音效
    sound.play().catch(error => {
      console.error(`播放音效時出錯: ${error.message}`);
    });
  }
  
  /**
   * 播放背景音樂
   */
  function playBackgroundMusic() {
    if (!AudioConfig.bgmEnabled) return;
    
    // 如果背景音樂已經在播放，則不做任何事
    if (AudioConfig.bgm && !AudioConfig.bgm.paused) return;
    
    // 創建背景音樂對象
    if (!AudioConfig.bgm) {
      AudioConfig.bgm = new Audio(AudioConfig.sounds.bgm);
      AudioConfig.bgm.loop = true;
      AudioConfig.bgm.volume = AudioConfig.volume * 0.5; // 背景音樂音量稍低
    }
    
    // 播放背景音樂
    AudioConfig.bgm.play().catch(error => {
      console.error(`播放背景音樂時出錯: ${error.message}`);
    });
  }
  
  /**
   * 暫停背景音樂
   */
  function pauseBackgroundMusic() {
    if (AudioConfig.bgm) {
      AudioConfig.bgm.pause();
    }
  }
  
  /**
   * 恢復背景音樂
   */
  function resumeBackgroundMusic() {
    if (AudioConfig.bgm && AudioConfig.bgmEnabled) {
      AudioConfig.bgm.play().catch(error => {
        console.error(`恢復背景音樂時出錯: ${error.message}`);
      });
    }
  }
  
  /**
   * 停止背景音樂
   */
  function stopBackgroundMusic() {
    if (AudioConfig.bgm) {
      AudioConfig.bgm.pause();
      AudioConfig.bgm.currentTime = 0;
    }
  }
  
  /**
   * 設置音效音量
   * @param {number} volume - 音量 (0.0 到 1.0)
   */
  function setVolume(volume) {
    AudioConfig.volume = Math.max(0, Math.min(1, volume));
    
    // 更新背景音樂音量
    if (AudioConfig.bgm) {
      AudioConfig.bgm.volume = AudioConfig.volume * 0.5;
    }
  }
  
  /**
   * 切換音效開關
   */
  function toggleAudio() {
    AudioConfig.enabled = !AudioConfig.enabled;
    
    // 更新音效按鈕狀態
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
      soundBtn.textContent = AudioConfig.enabled ? '音效: 開' : '音效: 關';
    }
  }
  
  /**
   * 切換背景音樂開關
   */
  function toggleBackgroundMusic() {
    AudioConfig.bgmEnabled = !AudioConfig.bgmEnabled;
    
    // 更新背景音樂按鈕狀態
    const musicBtn = document.getElementById('music-btn');
    if (musicBtn) {
      musicBtn.textContent = AudioConfig.bgmEnabled ? '音樂: 開' : '音樂: 關';
    }
    
    // 根據狀態播放或停止背景音樂
    if (AudioConfig.bgmEnabled) {
      resumeBackgroundMusic();
    } else {
      pauseBackgroundMusic();
    }
  }
  
  /**
   * 創建音效控制按鈕
   */
  function createAudioControls() {
    const controlPanel = document.querySelector('.control-panel');
    
    if (controlPanel) {
      // 創建音效按鈕
      const soundBtn = document.createElement('button');
      soundBtn.id = 'sound-btn';
      soundBtn.textContent = AudioConfig.enabled ? '音效: 開' : '音效: 關';
      soundBtn.addEventListener('click', toggleAudio);
      
      // 創建背景音樂按鈕
      const musicBtn = document.createElement('button');
      musicBtn.id = 'music-btn';
      musicBtn.textContent = AudioConfig.bgmEnabled ? '音樂: 開' : '音樂: 關';
      musicBtn.addEventListener('click', toggleBackgroundMusic);
      
      // 添加到控制面板
      controlPanel.appendChild(soundBtn);
      controlPanel.appendChild(musicBtn);
    }
  }
  
  // 遊戲音效接口
  const GameAudio = {
    init: initAudio,
    play: playSound,
    playBGM: playBackgroundMusic,
    pauseBGM: pauseBackgroundMusic,
    resumeBGM: resumeBackgroundMusic,
    stopBGM: stopBackgroundMusic,
    setVolume: setVolume,
    toggleSound: toggleAudio,
    toggleMusic: toggleBackgroundMusic
  };