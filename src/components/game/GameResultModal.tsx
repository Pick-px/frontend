import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GameResultProps {
  isOpen: boolean;
  isWaiting: boolean;
  results: Array<{
    username: string;
    rank: number;
    own_count: number;
    try_count: number;
    dead: boolean;
  }> | null;
  currentUsername?: string;
}

const GameResultModal: React.FC<GameResultProps> = ({
  isOpen,
  isWaiting,
  results,
  currentUsername,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
      {isWaiting ? (
        // 결과 대기 화면
        <div className='w-full max-w-md rounded-xl border-2 border-blue-500 bg-gradient-to-b from-blue-900/90 to-black/90 p-8 text-center shadow-2xl'>
          <div className='mb-6 flex justify-center'>
            <div className='h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'></div>
          </div>
          <h2 className='mb-4 text-3xl font-bold text-white'>게임 종료!</h2>
          <p className='mb-6 text-xl text-blue-300'>결과를 계산하고 있습니다...</p>
          <p className='text-lg text-gray-300'>잠시만 기다려주세요.</p>
        </div>
      ) : (
        // 결과 화면
        <div className='w-full max-w-2xl rounded-xl border-2 border-purple-500 bg-gradient-to-b from-purple-900/90 to-black/90 p-8 shadow-2xl'>
          <div className='mb-6 flex items-center justify-between'>
            <h2 className='text-3xl font-bold text-white'>게임 결과</h2>
            <div className='rounded-full bg-purple-500 px-3 py-1 text-sm font-bold text-white'>
              전장 종료
            </div>
          </div>

          <div className='mb-6 overflow-hidden rounded-lg border border-purple-500/30'>
            <div className='max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-900/20'>
              <table className='w-full text-white'>
                <thead className='sticky top-0 z-10 bg-purple-900/80 backdrop-blur-sm'>
                  <tr>
                    <th className='p-3 text-left'>순위</th>
                    <th className='p-3 text-left'>유저명</th>
                    <th className='p-3 text-center'>점유 픽셀</th>
                    <th className='p-3 text-center'>시도 횟수</th>
                    <th className='p-3 text-center'>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {results?.map((result, index) => {
                    // 현재 유저 확인
                    const isCurrentUser = result.username === currentUsername;

                    return (
                      <tr
                        key={index}
                        className={`border-t border-purple-500/20 ${
                          isCurrentUser
                            ? 'bg-purple-500/20'
                            : index % 2 === 0
                            ? 'bg-purple-900/20'
                            : 'bg-purple-900/10'
                        }`}
                      >
                        <td className='p-3'>
                          {result.rank === 1 && '🥇'}
                          {result.rank === 2 && '🥈'}
                          {result.rank === 3 && '🥉'}
                          {result.rank > 3 && result.rank}
                        </td>
                        <td className='p-3 font-medium'>
                          {isCurrentUser ? (
                            <span className='text-yellow-300'>
                              {result.username} (나)
                            </span>
                          ) : (
                            result.username
                          )}
                        </td>
                        <td className='p-3 text-center'>{result.own_count}</td>
                        <td className='p-3 text-center'>{result.try_count}</td>
                        <td className='p-3 text-center'>
                          {result.dead ? (
                            <span className='inline-block rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-400'>
                              탈락
                            </span>
                          ) : (
                            <span className='inline-block rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400'>
                              생존
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className='flex justify-center'>
            <button
              className='rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-purple-600 hover:to-blue-600 active:scale-95'
              onClick={() => navigate('/canvas/pixels')}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameResultModal;