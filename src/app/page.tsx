'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // トップページにアクセスしたらホーム画面にリダイレクト
    router.push('/home');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Just One</h1>
        <p className="text-xl">リダイレクト中...</p>
      </div>
    </div>
  );
}
