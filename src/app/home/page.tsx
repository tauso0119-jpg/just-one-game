'use client';

import { useState } from 'react';

interface Member {
  name: string;
  isParticipating: boolean;
  role?: 'answerer' | 'player';
}

interface WaitingMember {
  name: string;
  timestamp: number;
  sessionId: string; // セッションIDを追加
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1); // 1: 名前入力, 2: 人数確認, 3: 役割決め
  const [userName, setUserName] = useState('');
  const [userSessionId, setUserSessionId] = useState(''); // 現在ユーザーのセッションID
  const [waitingMembers, setWaitingMembers] = useState<WaitingMember[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentAnswerer, setCurrentAnswerer] = useState('');
  const [currentPlayers, setCurrentPlayers] = useState<string[]>([]);

  // セッションIDを生成
  const generateSessionId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // 名前入力してスタート
  const handleNameSubmit = () => {
    if (!userName.trim()) {
      alert('名前を入力してください！');
      return;
    }

    // 名前のバリデーション（空文字のみチェック）
    if (userName.trim().length < 1) {
      alert('有効な名前を入力してください！');
      return;
    }

    // 既に参加済みかチェック
    if (waitingMembers.find(m => m.name === userName.trim())) {
      alert('既に参加済みです！');
      return;
    }

    // セッションIDを生成して参加者リストに追加
    const sessionId = generateSessionId();
    setWaitingMembers(prev => [...prev, { 
      name: userName.trim(), 
      timestamp: Date.now(),
      sessionId
    }]);
    
    // 現在ユーザーのセッションIDを保存
    setUserSessionId(sessionId);
    
    setCurrentStep(2);
  };

  // テスト用に自動で参加者を追加
  const addTestMembers = () => {
    const testNames = ['テスト1', 'テスト2', 'テスト3', 'テスト4', 'テスト5'];
    const newMembers = testNames.map(name => ({
      name,
      timestamp: Date.now() + Math.random() * 1000, // 少し時間差をつける
      sessionId: generateSessionId()
    }));
    
    setWaitingMembers(newMembers);
    setCurrentStep(2);
  };

  // 人数確認画面で追加のテストメンバーを追加
  const addMoreTestMembers = () => {
    const additionalNames = ['テスト6', 'テスト7', 'テスト8'];
    const newMembers = additionalNames.map(name => ({
      name,
      timestamp: Date.now() + Math.random() * 1000,
      sessionId: generateSessionId()
    }));
    
    setWaitingMembers(prev => [...prev, ...newMembers]);
  };

  // 役割決め
  const assignRoles = () => {
    if (waitingMembers.length < 2) {
      alert('最低2人必要です！');
      return;
    }

    // ランダムに回答者を選択
    const randomIndex = Math.floor(Math.random() * waitingMembers.length);
    const answerer = waitingMembers[randomIndex].name;
    const players = waitingMembers
      .filter(m => m.name !== answerer)
      .map(m => m.name);

    setCurrentAnswerer(answerer);
    setCurrentPlayers(players);
    setCurrentStep(3);
  };

  // ゲーム開始
  const startGame = (memberName: string) => {
    if (memberName === currentAnswerer) {
      // 回答者の場合
      window.location.href = `/answerer?answerer=${currentAnswerer}&player=${memberName}`;
    } else {
      // プレイヤーの場合
      window.location.href = `/player?answerer=${currentAnswerer}&player=${memberName}`;
    }
  };

  // 現在のユーザーが誰かを特定
  const getCurrentUserRole = () => {
    const currentUser = waitingMembers.find(m => m.sessionId === userSessionId);
    if (!currentUser) return null;
    
    return {
      name: currentUser.name,
      isAnswerer: currentUser.name === currentAnswerer,
      isPlayer: currentPlayers.includes(currentUser.name)
    };
  };

  // あなたの画面へボタン
  const goToYourScreen = () => {
    const userRole = getCurrentUserRole();
    if (!userRole) {
      alert('セッション情報が見つかりません。最初からやり直してください。');
      return;
    }
    
    startGame(userRole.name);
  };

  // リセット
  const resetGame = () => {
    setCurrentStep(1);
    setUserName('');
    setUserSessionId(''); // セッションIDもクリア
    setWaitingMembers([]);
    setGameStarted(false);
    setCurrentAnswerer('');
    setCurrentPlayers([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 p-3 sm:p-4">
      <div className="max-w-md mx-auto sm:max-w-4xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
            Just One
          </h1>
          <p className="text-white/90 text-sm sm:text-xl">協力型ボードゲーム</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6">
          {/* ステップ1: 名前入力 */}
          {currentStep === 1 && (
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                あなたの名前を入力してください
              </h2>
              
              <div className="max-w-md mx-auto mb-4 sm:mb-6">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="例: 田中"
                  className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-300 focus:border-purple-400 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleNameSubmit}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all transform hover:scale-105"
                >
                  スタート →
                </button>

                <button
                  onClick={addTestMembers}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-bold transition-colors"
                >
                  🧪 テスト用に5人追加
                </button>
              </div>

              <div className="mt-4 sm:mt-6 text-gray-600">
                <p className="text-xs sm:text-sm">自由にあなたの名前を入力してください！</p>
                <p className="text-xs text-gray-500 mt-1">例: 田中、山田、佐藤、鈴木、高橋など</p>
              </div>
            </div>
          )}

          {/* ステップ2: 人数確認 */}
          {currentStep === 2 && (
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                参加者確認
              </h2>
              
              <div className="mb-4 sm:mb-6">
                <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
                  現在の参加者: <span className="text-xl sm:text-2xl text-blue-600 font-bold">{waitingMembers.length}</span>人
                </p>
                
                <div className="max-w-md mx-auto">
                  <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                    {waitingMembers.map((member, index) => (
                      <div key={member.name} className="bg-blue-50 px-3 py-2 sm:px-4 sm:py-2 rounded-lg flex justify-between items-center">
                        <span className="font-semibold text-blue-700 text-sm sm:text-base">{index + 1}. {member.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(member.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {waitingMembers.length < 2 && (
                <p className="text-red-500 text-sm mb-4">
                  最低2人必要です。もう少し待ってください...
                </p>
              )}

              <div className="space-y-3">
                <button
                  onClick={assignRoles}
                  disabled={waitingMembers.length < 2}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 sm:px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  役割決め →
                </button>
                
                {waitingMembers.length < 5 && (
                  <button
                    onClick={addMoreTestMembers}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-xl font-bold transition-colors"
                  >
                    🧪 テストメンバー追加 (+3人)
                  </button>
                )}
                
                <button
                  onClick={resetGame}
                  className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-xl font-bold transition-colors"
                >
                  やり直し
                </button>
              </div>
            </div>
          )}

          {/* ステップ3: 役割決め */}
          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                役割決定！
              </h2>
              
              <div className="mb-6 sm:mb-8">
                <div className="inline-block bg-purple-100 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl mb-4">
                  <p className="text-purple-700 font-bold text-base sm:text-xl mb-2">👤 回答者</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-800">{currentAnswerer}</p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-3 sm:mb-4">🎯 ヒント提供者</h3>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    {currentPlayers.map((player) => (
                      <div
                        key={player}
                        className="bg-blue-100 px-3 py-2 sm:px-4 sm:py-2 rounded-xl"
                      >
                        <p className="text-blue-700 font-semibold text-sm sm:text-base">{player}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 現在のユーザーの役割表示 */}
              {(() => {
                const userRole = getCurrentUserRole();
                if (userRole) {
                  return (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 rounded-xl">
                      <p className="text-green-700 font-bold text-base sm:text-lg mb-2">
                        あなたの役割: {userRole.isAnswerer ? '👤 回答者' : '🎯 ヒント提供者'}
                      </p>
                      <p className="text-green-600 text-sm sm:text-base">
                        あなたの名前: {userRole.name}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="mb-4 sm:mb-6">
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  {getCurrentUserRole() ? '下のボタンであなたの専用画面へ進んでください' : '自分の名前をタップしてゲーム開始'}
                </p>
              </div>

              <div className="space-y-3">
                {/* あなたの画面へボタン */}
                {getCurrentUserRole() && (
                  <div className="flex justify-center">
                    <button
                      onClick={goToYourScreen}
                      className="w-full sm:w-auto bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all transform hover:scale-105"
                    >
                      🚀 あなたの画面へ →
                    </button>
                  </div>
                )}

                {/* 従来の選択肢（セッションがない場合用） */}
                {!getCurrentUserRole() && (
                  <>
                    {/* 回答者 */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => startGame(currentAnswerer)}
                        className="w-full sm:w-auto bg-purple-100 hover:bg-purple-200 px-4 sm:px-6 py-3 rounded-xl transition-colors"
                      >
                        <p className="text-purple-700 font-bold text-base sm:text-lg mb-1">👤 回答者</p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-800">{currentAnswerer}</p>
                        <p className="text-xs sm:text-sm text-purple-600 mt-1">タップして回答画面へ</p>
                      </button>
                    </div>

                    {/* プレイヤー一覧 */}
                    <div>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {currentPlayers.map((player) => (
                          <button
                            key={player}
                            onClick={() => startGame(player)}
                            className="w-full sm:w-auto bg-blue-100 hover:bg-blue-200 px-3 sm:px-4 py-2 rounded-xl transition-colors"
                          >
                            <p className="text-blue-700 font-semibold text-sm sm:text-base">{player}</p>
                            <p className="text-xs text-blue-600 mt-1">タップして入力画面へ</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={resetGame}
                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold transition-colors"
                  >
                    🔄 やり直し
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-white/80 text-xs sm:text-sm">
          <p className="text-xs sm:text-sm">ジャストワンは、1人の回答者と他のプレイヤーが協力してお題を当てるゲームです</p>
        </div>
      </div>
    </div>
  );
}
