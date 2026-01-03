'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Hint {
  id: number;
  text: string;
  player: string;
  isDuplicate: boolean;
  isRemoved: boolean;
  manuallyRemoved: boolean;
}

export default function JustOneGame() {
  const router = useRouter();
  const [topic, setTopic] = useState('東京タワー');
  const [answerer, setAnswerer] = useState('ほし'); // 回答者
  const [previousAnswerer, setPreviousAnswerer] = useState(''); // 前の回答者
  const [hints, setHints] = useState<Hint[]>([
    { id: 1, text: '高い建物', player: 'だいち', isDuplicate: false, isRemoved: false, manuallyRemoved: false },
    { id: 2, text: '観光スポット', player: 'ゆーへー', isDuplicate: false, isRemoved: false, manuallyRemoved: false },
    { id: 3, text: '赤い色', player: 'まな', isDuplicate: false, isRemoved: false, manuallyRemoved: false },
    { id: 4, text: '333m', player: 'あすか', isDuplicate: false, isRemoved: false, manuallyRemoved: false },
    { id: 5, text: '東京', player: 'まちこ', isDuplicate: false, isRemoved: false, manuallyRemoved: false },
    { id: 6, text: '鉄塔', player: 'ちゃんなつ', isDuplicate: false, isRemoved: false, manuallyRemoved: false },
    { id: 7, text: 'ランドマーク', player: 'ゆか', isDuplicate: false, isRemoved: false, manuallyRemoved: false },
  ]);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintsPublished, setHintsPublished] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // トップページにアクセスしたらホーム画面にリダイレクト
  useEffect(() => {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const answererName = urlParams.get('answerer');
    const playerName = urlParams.get('player');
    
    // URLパラメータがない場合はホーム画面へ
    if (!answererName && !playerName && typeof window !== 'undefined') {
      router.push('/home');
      return;
    }
    
    if (answererName) {
      setAnswerer(answererName);
    }
    if (playerName) {
      // プレイヤー情報を保存（実際にはゲーム状態管理に使用）
      console.log(`現在のプレイヤー: ${playerName}, 回答者: ${answererName}`);
    }
  }, [router]);

  const getCurrentPlayer = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('player') || '';
    }
    return '';
  };

  // 次の回答者を決定（前の回答者と2回連続しないように）
  const selectNextAnswerer = () => {
    // 現在の参加者リストから次の回答者を選択
    const currentParticipants = hints.map(h => h.player).filter((name, index, arr) => arr.indexOf(name) === index);
    const availablePlayers = currentParticipants.filter(name => name !== answerer && name !== previousAnswerer);
    
    if (availablePlayers.length === 0) {
      // 利用可能なプレイヤーがいない場合は、前の回答者以外から選択
      const allPlayers = currentParticipants.filter(name => name !== previousAnswerer);
      const randomIndex = Math.floor(Math.random() * allPlayers.length);
      return allPlayers[randomIndex];
    }
    
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    return availablePlayers[randomIndex];
  };

  // 次のゲームへ
  const nextGame = () => {
    const nextAnswererName = selectNextAnswerer();
    setPreviousAnswerer(answerer);
    setAnswerer(nextAnswererName);
    
    // 現在の参加者リストでヒントをリセット
    const currentParticipants = hints.map(h => h.player).filter((name, index, arr) => arr.indexOf(name) === index);
    setHints(currentParticipants.map((name, index) => ({ 
      id: index + 1, 
      text: '', 
      player: name, 
      isDuplicate: false, 
      isRemoved: false, 
      manuallyRemoved: false 
    })));
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setHintsPublished(false);
    setGameEnded(false);
  };

  const topics = ['東京タワー', '富士山', '寿司', '桜', '新幹線', 'ラーメン', '温泉', 'アニメ'];
  const getRandomTopic = () => {
    const newTopic = topics[Math.floor(Math.random() * topics.length)];
    setTopic(newTopic);
    // 現在の参加者リストでヒントをリセット
    const currentParticipants = hints.map(h => h.player).filter((name, index, arr) => arr.indexOf(name) === index);
    setHints(currentParticipants.map((name, index) => ({ 
      id: index + 1, 
      text: '', 
      player: name, 
      isDuplicate: false, 
      isRemoved: false, 
      manuallyRemoved: false 
    })));
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setHintsPublished(false);
  };

  const checkAnswer = () => {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedTopic = topic.toLowerCase();
    
    // 完全一致または部分一致で判定
    const correct = normalizedUserAnswer === normalizedTopic || 
                   normalizedUserAnswer.includes(normalizedTopic) || 
                   normalizedTopic.includes(normalizedUserAnswer);
    
    setIsCorrect(correct);
    setShowResult(true);
    setGameEnded(true); // ゲーム終了
  };

  const simulateHintsPublished = () => {
    // 実際には集合画面からデータを受け取る
    setHintsPublished(true);
  };

  const validHints = hints.filter(h => h.text.trim() && !h.isRemoved && !h.manuallyRemoved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-3 sm:p-4">
      <div className="max-w-md mx-auto sm:max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
            ジャストワン
          </h1>
          <p className="text-white/90 text-sm sm:text-lg">回答者画面</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6">
          {/* 回答者表示 */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block bg-purple-100 px-4 sm:px-6 py-2 sm:py-3 rounded-xl">
              <p className="text-purple-700 font-bold text-sm sm:text-lg">👤 回答者: {answerer}</p>
            </div>
            {getCurrentPlayer() && (
              <div className="mt-2 inline-block bg-blue-100 px-3 sm:px-4 py-1 sm:py-2 rounded-lg">
                <p className="text-blue-700 text-xs sm:text-sm">あなた: {getCurrentPlayer()}</p>
              </div>
            )}
          </div>

          {/* ヒント表示エリア */}
          <div className="mb-6 sm:mb-8">
            <div className="text-center mb-4 sm:mb-6">
              {!hintsPublished ? (
                <button
                  onClick={simulateHintsPublished}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 sm:px-12 py-3 sm:py-6 rounded-2xl font-bold text-base sm:text-xl shadow-lg transition-all transform hover:scale-105"
                >
                  📥 ヒントを受け取る
                </button>
              ) : (
                <div className="text-green-600 font-bold text-base sm:text-lg">
                  ✓ ヒントを受信しました
                </div>
              )}
            </div>

            {hintsPublished && validHints.length > 0 && (
              <div>
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">お題</h2>
                  <div className="inline-block bg-yellow-100 px-4 sm:px-6 py-2 sm:py-3 rounded-xl">
                    <p className="text-xl sm:text-2xl font-bold text-yellow-800">{topic}</p>
                  </div>
                </div>

                <div className="text-center mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">ヒント一覧</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                    {validHints.map((hint) => (
                      <div
                        key={hint.id}
                        className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 sm:p-4 rounded-xl shadow-md"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-2 sm:mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-xs sm:text-sm font-bold text-blue-600 text-center leading-tight">
                            {hint.player}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-gray-700 text-center">
                          {hint.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {hintsPublished && validHints.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">ヒントがありません</p>
              </div>
            )}

            {!hintsPublished && (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-gray-500 text-lg">まだヒントが公開されていません</p>
                <p className="text-gray-400 text-sm mt-2">プレイヤーがヒントを入力・集合するのを待っています...</p>
              </div>
            )}
          </div>

          {/* 回答入力エリア */}
          {hintsPublished && validHints.length > 0 && (
            <div className="mb-8">
              <label className="block text-lg font-bold text-gray-800 mb-3">
                あなたの回答：
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="ヒントを見てお題を予想してください..."
                  disabled={showResult}
                  className="flex-1 px-6 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim() || showResult}
                  className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  🎯 回答する
                </button>
              </div>
            </div>
          )}

          {/* 結果表示 */}
          {showResult && (
            <div className="text-center mb-8">
              <div className={`inline-block px-8 py-4 rounded-2xl text-2xl font-bold ${
                isCorrect 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {isCorrect ? '🎉 正解！' : '❌ 不正解...'}
              </div>
              {!isCorrect && (
                <div className="mt-4">
                  <p className="text-gray-600 text-lg">正解は：</p>
                  <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-xl mt-2">
                    {topic}
                  </div>
                </div>
              )}
              
              {gameEnded && (
                <div className="mt-6">
                  <button
                    onClick={nextGame}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                  >
                    次へ →
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    次の回答者: {selectNextAnswerer()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">
              ヒント数: {validHints.length}個
            </p>
            <p className="text-sm text-gray-500 mt-1">
              （7人中 {validHints.length}人からヒントを取得）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
