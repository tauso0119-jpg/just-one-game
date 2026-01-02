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

export default function GatherHints() {
  // プレイヤー入力画面から受け取ったヒント（実際にはlocalStorageやAPIで受け渡す）
  const [topic, setTopic] = useState('東京タワー');
  const [answerer, setAnswerer] = useState(''); // 回答者
  const [participants, setParticipants] = useState<string[]>([]); // 参加者リスト
  const [hints, setHints] = useState<Hint[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // ホーム画面から情報を受け取る
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const answererName = urlParams.get('answerer');
      const participantsParam = urlParams.get('participants');
      
      if (answererName) {
        setAnswerer(answererName);
      }
      if (participantsParam) {
        const participantsList = participantsParam.split(',');
        setParticipants(participantsList);
        
        // プレイヤーのヒントを初期化
        const playerHints = participantsList.filter(name => name !== answererName).map((name, index) => ({
          id: index + 1,
          text: '',
          player: name,
          isDuplicate: false,
          isRemoved: false,
          manuallyRemoved: false
        }));
        setHints(playerHints);
      }
    }
  }, []);

  // ひらがなをカタカナに、カタカナをひらがなに変換する関数
  const toHiragana = (str: string): string => {
    return str.replace(/[\u30A1-\u30F6]/g, (match) => {
      const chr = match.charCodeAt(0) - 0x30A1 + 0x3041;
      return String.fromCharCode(chr);
    });
  };

  // テキストを正規化する関数（ひらがな・カタカナを統一）
  const normalizeText = (text: string): string => {
    return toHiragana(text.trim().toLowerCase());
  };

  const handleManualRemove = (id: number) => {
    setHints(prev => prev.map(hint => 
      hint.id === id ? { ...hint, manuallyRemoved: !hint.manuallyRemoved } : hint
    ));
  };

  const checkDuplicates = () => {
    const textCounts = new Map<string, number>();
    
    hints.forEach(hint => {
      if (hint.text.trim() && !hint.manuallyRemoved) {
        const normalized = normalizeText(hint.text);
        const count = textCounts.get(normalized) || 0;
        textCounts.set(normalized, count + 1);
      }
    });

    const updatedHints = hints.map(hint => {
      if (hint.text.trim() && !hint.manuallyRemoved) {
        const normalized = normalizeText(hint.text);
        const count = textCounts.get(normalized) || 0;
        const isDuplicate = count > 1;
        return { ...hint, isDuplicate, isRemoved: isDuplicate };
      }
      return { ...hint, isDuplicate: false, isRemoved: false };
    });

    setHints(updatedHints);
    setHasChecked(true);
  };

  const publishToAnswerer = () => {
    // 実際にはAPIやlocalStorageで回答者画面にデータを渡す
    setIsPublished(true);
  };

  const resetGame = () => {
    setHints(hints.map(hint => ({ 
      ...hint, 
      isDuplicate: false, 
      isRemoved: false,
      manuallyRemoved: false
    })));
    setHasChecked(false);
    setIsPublished(false);
  };

  const validHintsCount = hints.filter(h => h.text.trim() && !h.isRemoved && !h.manuallyRemoved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            ジャストワン
          </h1>
          <p className="text-white/90 text-lg">ヒント集合・重複削除</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          {/* お題表示 */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl">
              <p className="text-sm font-medium mb-1">お題</p>
              <p className="text-3xl font-bold">{topic}</p>
            </div>
            <div className="mt-4 inline-block bg-purple-100 px-6 py-3 rounded-xl">
              <p className="text-purple-700 font-bold text-lg">👤 回答者: {answerer}</p>
            </div>
          </div>

          {/* 全プレイヤーのヒント一覧 */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">集まったヒント：</h2>
            {hints.map((hint) => (
              <div
                key={hint.id}
                className={`transition-all duration-300 ${
                  hint.isRemoved || hint.manuallyRemoved ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-xs ${
                    hint.isRemoved || hint.manuallyRemoved ? 'bg-red-400' : 'bg-gradient-to-br from-blue-400 to-purple-400'
                  }`}>
                    <div className="text-center leading-tight">
                      {hint.player}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hint.manuallyRemoved}
                    onChange={() => handleManualRemove(hint.id)}
                    disabled={isPublished}
                    className={`w-5 h-5 rounded border-2 transition-colors ${
                      isPublished ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    } ${hint.manuallyRemoved ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}
                  />
                  <div className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                    hint.isRemoved || hint.manuallyRemoved
                      ? 'bg-red-50 border-red-300 text-red-500 line-through' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <p className="text-gray-800">{hint.text}</p>
                  </div>
                  {hint.isDuplicate && (
                    <span className="text-red-500 font-bold animate-pulse">
                      重複！
                    </span>
                  )}
                  {hint.manuallyRemoved && !hint.isDuplicate && (
                    <span className="text-orange-500 font-bold">
                      手動削除
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={resetGame}
              disabled={isPublished}
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              🔄 リセット
            </button>
          </div>

          {/* ヒント数表示 */}
          <div className="text-center mb-6">
            <div className="inline-block bg-gray-100 px-6 py-3 rounded-xl">
              <p className="text-lg font-semibold text-gray-700">
                残ったヒント: <span className="text-2xl text-blue-600">{validHintsCount}</span>個
              </p>
              <p className="text-sm text-gray-500 mt-1">
                （{participants.length}人中 {validHintsCount}人からヒントを取得）
              </p>
            </div>
          </div>

          {/* 回答者に公開ボタン */}
          <div className="flex justify-center">
            <button
              onClick={publishToAnswerer}
              disabled={isPublished}
              className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed ${
                isPublished ? 'animate-pulse' : ''
              }`}
            >
              {isPublished ? '✅ 公開済み' : '📤 回答者にヒントを公開する'}
            </button>
          </div>

          {validHintsCount === 0 && !isPublished && (
            <div className="mt-4 text-center">
              <p className="text-orange-600 font-semibold">
                ⚠️ ヒントがありませんが、公開は可能です
              </p>
              <p className="text-sm text-gray-500 mt-1">
                回答者はヒントなしで回答することになります
              </p>
            </div>
          )}

          {validHintsCount > 0 && validHintsCount < 7 && !isPublished && (
            <div className="mt-4 text-center">
              <p className="text-blue-600 font-semibold">
                ℹ️ 7人中 {validHintsCount}人からヒントを取得
              </p>
            </div>
          )}

          {isPublished && (
            <div className="mt-6 text-center">
              <p className="text-green-600 font-bold text-lg">
                ✓ 回答者にヒントが公開されました！
              </p>
              <p className="text-sm text-gray-500 mt-2">
                回答者は別のタブまたはデバイスで回答してください
              </p>
            </div>
          )}
        </div>

        <div className="text-center space-y-3">
          <a 
            href="/player" 
            className="inline-block bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-colors backdrop-blur-sm"
          >
            ✏️ プレイヤー入力画面へ
          </a>
        </div>
      </div>
    </div>
  );
}
