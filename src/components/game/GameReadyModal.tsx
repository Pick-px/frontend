import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameAPI, type WaitingRoomData } from '../../api/GameAPI';
import { useToastStore } from '../../store/toastStore';
import { useTimeSyncStore } from '../../store/timeSyncStore'; // 추가

interface GameReadyModalProps {
  isOpen: boolean;
  onClose: (data?: WaitingRoomData) => void;
  canvasId: string;
}

const GameReadyModal = ({ isOpen, onClose, canvasId }: GameReadyModalProps) => {
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const { getSynchronizedServerTime } = useTimeSyncStore(); // 추가
  const [waitingRoomData, setWaitingRoomData] =
    useState<WaitingRoomData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilStart, setTimeUntilStart] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !canvasId) {
      return;
    }

    const fetchWaitingRoomInfo = async () => {
      console.log('게임정보 fetch 시작');
      setLoading(true);
      setError(null);
      try {
        const data = await GameAPI.getWaitingRoomInfo(canvasId);
        console.log(data);

        setWaitingRoomData(data);

        // timeSyncStore에서 동기화된 시간을 사용
        const startTime = new Date(data.startedAt).getTime();
        const now = getSynchronizedServerTime();
        const initialTimeLeft = Math.max(0, Math.ceil((startTime - now) / 1000));

        setTimeUntilStart(initialTimeLeft);

        if (initialTimeLeft <= 0) {
          // 이미 시작되었거나 시간이 다 된 경우
          setTimeout(() => onClose(data), 1000); // 1초 후 모달 닫기
        }
      } catch (err) {
        setError('게임 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitingRoomInfo();
  }, [isOpen, canvasId, getSynchronizedServerTime, onClose]);

  useEffect(() => {
    if (timeUntilStart === null || !waitingRoomData) {
      return;
    }

    const timer = setInterval(() => {
      const startTime = new Date(waitingRoomData.startedAt).getTime();
      const now = getSynchronizedServerTime();
      const newTimeLeft = Math.max(0, Math.ceil((startTime - now) / 1000));

      setTimeUntilStart(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onClose(waitingRoomData);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeUntilStart, waitingRoomData, getSynchronizedServerTime, onClose]);

  const handleExit = () => {
    onClose();
    navigate('/');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-mono backdrop-blur-sm'>
      <div
        className='w-full max-w-md rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-gray-900 to-black p-6 shadow-2xl shadow-cyan-500/20'
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        <div className='mb-6 flex items-center justify-between'>
          <h3
            className='text-2xl font-bold text-cyan-300'
            style={{ textShadow: '0 0 8px rgba(56, 189, 248, 0.5)' }}
          >
            게임 준비
          </h3>
          <button
            onClick={handleExit}
            className='rounded-lg border border-red-500/50 bg-transparent px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:border-red-500 hover:bg-red-500/20 hover:text-red-300 active:scale-95'
          >
            나가기
          </button>
        </div>

        <div className='space-y-4'>
          {loading && (
            <div className='flex justify-start'>
              <div className='max-w-[80%] rounded-lg bg-black/20 p-3'>
                <div className='flex items-center'>
                  <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-cyan-400'></div>
                  <p className='ml-3 text-sm text-gray-400'>
                    게임 정보를 불러오는 중...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className='flex justify-start'>
              <div className='max-w-[80%] rounded-lg bg-red-900/20 p-3'>
                <p className='text-sm text-red-400'>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && waitingRoomData && (
            <>
              <div className='flex justify-start'>
                <div className='max-w-[80%] rounded-lg bg-black/20 p-3'>
                  <p className='text-sm text-gray-300'>
                    서버와 동기화 중... 곧 게임이 시작됩니다.
                  </p>
                </div>
              </div>

              <div className='flex justify-start'>
                <div className='max-w-[80%] rounded-lg bg-black/20 p-3'>
                  <p className='text-sm text-gray-300'>
                    캔버스 제목: {waitingRoomData.title}
                  </p>
                  <p className='text-sm text-gray-300'>
                    캔버스 크기: {waitingRoomData.canvasSize.width}x
                    {waitingRoomData.canvasSize.height}
                  </p>
                  <p className='text-sm text-gray-300'>
                    시작 시간:{' '}
                    {new Date(waitingRoomData.startedAt).toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-300'>
                    종료 시간:{' '}
                    {new Date(waitingRoomData.endedAt).toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-300'>
                    할당된 색상: {waitingRoomData.color}
                  </p>
                </div>
              </div>

              <div className='flex justify-start'>
                <div
                  className='flex w-full flex-col items-center rounded-lg border border-purple-400/30 bg-black/20 p-4'
                  style={{ animation: 'slideIn 0.5s ease-out' }}
                >
                  <p className='text-sm text-purple-300'>색상 할당 완료!</p>
                  <div
                    className='my-4 h-16 w-16 rounded-full border-2 border-white/50'
                    style={{
                      backgroundColor: waitingRoomData.color,
                      boxShadow: `0 0 20px ${waitingRoomData.color}, 0 0 8px white`,
                    }}
                  ></div>
                  <div className='relative mt-4'>
                    <div
                      className='h-20 w-20 animate-spin rounded-full border-4 border-green-500/60'
                      style={{ animationDuration: '2s' }}
                    ></div>
                    <div
                      className='absolute inset-1 animate-spin rounded-full border-2 border-yellow-400/50'
                      style={{
                        animationDuration: '1.5s',
                        animationDirection: 'reverse',
                      }}
                    ></div>
                    <div className='absolute inset-3 flex animate-pulse items-center justify-center rounded-full border border-green-400/60 bg-gradient-to-br from-green-900/80 to-black/70 shadow-2xl backdrop-blur-xl'>
                      <span className='animate-pulse font-mono text-3xl font-bold tracking-wider text-green-300'>
                        {timeUntilStart !== null && timeUntilStart > 0
                          ? `${timeUntilStart}`
                          : '시작!'}
                      </span>
                    </div>
                    <div className='absolute inset-0 animate-ping rounded-full bg-green-500/15'></div>
                    <div
                      className='absolute inset-0 animate-ping rounded-full bg-yellow-400/10'
                      style={{ animationDelay: '1s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GameReadyModal;
