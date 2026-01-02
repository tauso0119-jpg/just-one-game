'use client';

import { useState, useEffect } from 'react';

interface Hint {
  id: number;
  text: string;
  player: string;
  isDuplicate: boolean;
  isRemoved: boolean;
  manuallyRemoved: boolean;
}

export default function PlayerInput() {
  const [topic, setTopic] = useState('東京タワー');
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [answerer, setAnswerer] = useState(''); // 回答者
  const [gameCount, setGameCount] = useState(0); // ゲーム回数
  const [hints, setHints] = useState<Hint[]>([]);
  const [timeLeft, setTimeLeft] = useState(60); // 1分タイマー
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // ホーム画面から回答者・プレイヤー情報を受け取る（実際にはlocalStorageやAPIで）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const answererName = urlParams.get('answerer');
      const playerName = urlParams.get('player');
      
      if (answererName) {
        setAnswerer(answererName);
      }
      if (playerName) {
        // プレイヤー情報を保存
        console.log(`現在のプレイヤー: ${playerName}, 回答者: ${answererName}`);
        // プレイヤー選択を自動設定
        setCurrentPlayer(playerName);
      }
    }
  }, []);

  // 初回ゲームでヒントを初期化
  useEffect(() => {
    if (gameCount === 0 && hints.length === 0 && currentPlayer && typeof window !== 'undefined') {
      // 実際にはホーム画面から参加者情報を受け取る
      const urlParams = new URLSearchParams(window.location.search);
      const answererName = urlParams.get('answerer');
      const participants = urlParams.get('participants')?.split(',') || [];
      
      const playerHints = participants.filter(name => name !== answererName).map((name, index) => ({
        id: index + 1,
        text: '',
        player: name,
        isDuplicate: false,
        isRemoved: false,
        manuallyRemoved: false
      }));
      
      setHints(playerHints);
    }
  }, [gameCount, currentPlayer]);

  const resetGame = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const answererName = urlParams.get('answerer');
      const participants = urlParams.get('participants')?.split(',') || [];
      
      const playerHints = participants.filter(name => name !== answererName).map((name, index) => ({
        id: index + 1,
        text: '',
        player: name,
        isDuplicate: false,
        isRemoved: false,
        manuallyRemoved: false
      }));
      
      setHints(playerHints);
      setTimeLeft(60);
      setIsTimerActive(false);
      setIsTimeUp(false);
      setGameCount(prev => prev + 1);
    }
  };

  // 次の回答者を決定（現在の回答者を除いてランダム）
  const selectNextAnswerer = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const participants = urlParams.get('participants')?.split(',') || [];
      const availablePlayers = participants.filter(name => name !== answerer);
      
      if (availablePlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        return availablePlayers[randomIndex];
      }
    }
    return '';
  };

  // タイマー処理
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimeUp(true);
      setIsTimerActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft]);

  const handleHintChange = (text: string) => {
    if (!isTimeUp) {
      setHints(prev => prev.map(hint => 
        hint.player === currentPlayer ? { ...hint, text } : hint
      ));
    }
  };

  const forceTimeUp = () => {
    setTimeLeft(0);
    setIsTimeUp(true);
    setIsTimerActive(false);
  };

  const startTimer = () => {
    setIsTimerActive(true);
  };

  const pauseTimer = () => {
    setIsTimerActive(false);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(60);
    setIsTimeUp(false);
  };

  const topics = ['東京タワー', '富士山', '寿司', '桜', '新幹線', 'ラーメン', '温泉', 'アニメ'];
  const getRandomTopic = () => {
    const newTopic = topics[Math.floor(Math.random() * topics.length)];
    setTopic(newTopic);
    resetGame();
  };

  const getCurrentPlayerHint = () => {
    return hints.find(h => h.player === currentPlayer);
  };

  const nextPlayer = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const participants = urlParams.get('participants')?.split(',') || [];
      const currentIndex = participants.indexOf(currentPlayer);
      
      if (currentIndex < participants.length - 1 && currentIndex < 7) {
        setCurrentPlayer(participants[currentIndex + 1]);
      }
    }
  };

  const previousPlayer = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const participants = urlParams.get('participants')?.split(',') || [];
      const currentIndex = participants.indexOf(currentPlayer);
      
      if (currentIndex > 0) {
        setCurrentPlayer(participants[currentIndex - 1]);
      }
    }
  };

  const allPlayersEntered = () => {
    const playerHints = hints.filter(h => h.player !== answerer);
    // 締切時またはタイムアップ時は未入力も含めて完了とみなす
    if (isTimeUp) {
      return true;
    }
    return playerHints.every(h => h.text.trim() !== '');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-400 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            ジャストワン
          </h1>
          <p className="text-white/90 text-lg">プレイヤー用ヒント入力</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {/* お題表示 */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl">
              <p className="text-sm font-medium mb-1">お題</p>
              <p className="text-3xl font-bold">{topic}</p>
            </div>
            <button
              onClick={getRandomTopic}
              disabled={isTimerActive}
              className="ml-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-800 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
            >
              🎲 お題を変える
            </button>
          </div>

          {/* タイマー表示 */}
          <div className="text-center mb-8">
            <div className={`inline-block px-8 py-4 rounded-2xl text-3xl font-bold ${
              timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-white'
            }`}>
              ⏰ {formatTime(timeLeft)}
            </div>
            <div className="mt-4 space-x-2">
              {!isTimerActive && !isTimeUp && (
                <button
                  onClick={startTimer}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
                >
                  ▶️ スタート
                </button>
              )}
              {isTimerActive && (
                <>
                  <button
                    onClick={pauseTimer}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
                  >
                    ⏸️ 一時停止
                  </button>
                  <button
                    onClick={forceTimeUp}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
                  >
                    ⏹️ 締切
                  </button>
                </>
              )}
              {(isTimerActive || isTimeUp || timeLeft < 60) && (
                <button
                  onClick={resetTimer}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
                >
                  🔄 リセット
                </button>
              )}
            </div>
          </div>

          {/* プレイヤー選択 */}
          <div className="flex justify-center items-center mb-8">
            <div className="text-center">
              <select
                value={currentPlayer}
                onChange={(e) => setCurrentPlayer(e.target.value)}
                disabled={isTimerActive}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-purple-400 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-lg font-semibold"
              >
                {currentPlayer || 'プレイヤーを選択'}
              </select>
            </div>
          </div>

          {/* 現在のプレイヤーの入力欄 */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              あなたのヒント：
            </label>
            <input
              type="text"
              value={getCurrentPlayerHint()?.text || ''}
              onChange={(e) => handleHintChange(e.target.value)}
              placeholder={`${currentPlayer}のヒントを入力してください`}
              disabled={!isTimerActive || isTimeUp}
              className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {isTimeUp && (
              <p className="text-red-500 font-bold mt-2">⏰ 時間切れ！入力できません。</p>
            )}
          </div>

          {/* 入力状況確認 */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">入力状況：</h3>
            <div className="flex justify-center space-x-2">
              {hints.map((hint) => (
                <div
                  key={hint.id}
                  className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-xs ${
                    hint.player === answerer
                      ? 'bg-purple-500' // 回答者は紫
                      : hint.text.trim() 
                        ? 'bg-green-500' // 入力済みは緑
                        : 'bg-gray-400' // 未入力は灰
                  }`}
                >
                  <div className="text-center leading-tight">
                    {hint.player}
                    {hint.player === answerer && (
                      <div className="text-xs mt-1">👤</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-2">
              <p className="text-gray-600">
                {hints.filter(h => h.text.trim()).length}/{hints.length} 人が入力完了
              </p>
              <p className="text-purple-600 font-semibold mt-1">
                回答者: {answerer}
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <a
              href="/gather"
              className={`bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 ${
                !allPlayersEntered() || isTimerActive ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={(e) => {
                if (!allPlayersEntered() || isTimerActive) {
                  e.preventDefault();
                }
              }}
            >
              📋 ヒントを集合させる
            </a>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              🔄 リセット
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/80 text-sm">
            ヒント入力完了後、ヒント集合画面へ進んでください
          </p>
        </div>
      </div>
    </div>
  );
}
