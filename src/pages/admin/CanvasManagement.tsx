import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminAPI } from '../../api/AdminAPI';
import { useAuthStore } from '../../store/authStrore';

// Canvas 인터페이스에 id 추가
interface Canvas {
  id: number;
  title: string;
  type: string;
  // created_at: string;
  started_at: string;
  ended_at: string | null;
  size_x: number;
  size_y: number;
}

const CanvasManagement: React.FC = () => {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCanvas, setNewCanvas] = useState({
    title: '새 캔버스',
    type: 'public',
    size_x: 100,
    size_y: 100,
    start_delay: 0, // 시작 지연 시간 (초)
    game_duration: 60, // 게임 진행 시간 (초)
  });
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();

  useEffect(() => {
    // Mock API 테스트 시 아래 인증 로직을 주석 처리하면 편합니다.
    if (!isLoggedIn || (user?.role !== 'admin' && user?.role !== 'ADMIN')) {
      toast.error('관리자 권한이 필요합니다.');
      navigate('/');
      return;
    }
    fetchCanvases();
  }, [navigate, isLoggedIn, user]);

  const fetchCanvases = async () => {
    setIsLoading(true);
    try {
      const data = await AdminAPI.getCanvases();
      const now = new Date();
      const activeCanvases = (data || []).filter((canvas: Canvas) => {
        if (!canvas.ended_at) {
          return true; // ended_at이 null이면 활성 캔버스
        }
        const endedAt = new Date(canvas.ended_at);
        return endedAt > now; // ended_at이 현재 시간보다 미래이면 활성 캔버스
      });
      setCanvases(activeCanvases);
    } catch (error) {
      console.error('캔버스 데이터 로드 오류:', error);
      toast.error('캔버스 데이터를 불러오는데 실패했습니다.');
      setCanvases([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCanvas = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const startedAt = new Date(now.getTime() + newCanvas.start_delay * 1000);
    const endedAt = new Date(
      startedAt.getTime() + newCanvas.game_duration * 1000
    );

    const canvasData = {
      // Mock API는 id가 필요하므로 임시로 생성합니다.
      // 실제 백엔드에서 id를 자동 생성한다면 이 부분은 제외해야 합니다.
      title: newCanvas.title,
      type: newCanvas.type,
      size_x: newCanvas.size_x,
      size_y: newCanvas.size_y,
      started_at: startedAt.toISOString().slice(0, -5) + 'Z',
      ended_at: endedAt.toISOString().slice(0, -5) + 'Z',
    };

    try {
      const createdCanvas = await AdminAPI.createCanvas(canvasData);
      toast.success('캔버스가 성공적으로 생성되었습니다.');
      setNewCanvas({
        title: '새 캔버스',
        type: 'public',
        size_x: 100,
        size_y: 100,
        start_delay: 0,
        game_duration: 60,
      });
      // fetchCanvases() 대신, 생성된 캔버스를 직접 목록에 추가합니다.
      setCanvases((prevCanvases) => [...prevCanvases, createdCanvas]);
    } catch (error) {
      console.error('캔버스 생성 오류:', error);
      toast.error('캔버스 생성에 실패했습니다.');
    }
  };

  const handleDeleteCanvas = async (canvasId: number) => {
    if (!window.confirm(`ID:${canvasId} 캔버스를 정말로 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await AdminAPI.deleteCanvas(canvasId);
      toast.success('캔버스가 성공적으로 삭제되었습니다.');
      fetchCanvases();
    } catch (error) {
      console.error('캔버스 삭제 오류:', error);
      toast.error('캔버스 삭제에 실패했습니다.');
    }
  };

  // 강제 종료 핸들러 추가
  const handleForceEnd = async (canvasId: number) => {
    if (!window.confirm(`ID:${canvasId} 게임을 강제 종료하시겠습니까?`)) {
      return;
    }
    try {
      await AdminAPI.forceEnd(canvasId);
      toast.info('게임이 강제 종료되었습니다.');
      fetchCanvases();
    } catch (error) {
      console.error('강제 종료 오류:', error);
      toast.error('강제 종료에 실패했습니다.');
    }
  };

  // UTC 날짜를 한국 시간(KST)으로 변환하는 함수
  // 추후 연결시 KST 함수 제외
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  // 캔버스 상태 계산 함수
  const getCanvasStatus = (canvas: Canvas) => {
    const now = new Date();
    const startTime = new Date(canvas.started_at);

    if (canvas.ended_at && new Date(canvas.ended_at) < now) {
      return <span className='font-bold text-gray-500'>종료</span>;
    }
    if (startTime > now) {
      return <span className='font-bold text-blue-400'>예정</span>;
    }
    return <span className='font-bold text-green-400'>진행중</span>;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isNumberInput = type === 'number';

    setNewCanvas((prev) => ({
      ...prev,
      [name]: isNumberInput ? Number(value) : value,
    }));
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-900'>
        <div className='text-xl text-white'>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen overflow-y-auto bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>캔버스 관리</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className='rounded bg-blue-600 px-4 py-2 transition duration-300 hover:bg-blue-700'
          >
            대시보드로 돌아가기
          </button>
        </div>

        {/* 새 캔버스 생성 폼 */}
        <div className='mb-8 rounded-lg bg-gray-800 p-6 shadow'>
          <h2 className='mb-4 text-xl font-semibold'>새 캔버스 생성</h2>
          <form onSubmit={handleCreateCanvas} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <div>
                <label className='mb-2 block text-gray-300'>제목</label>
                <input
                  type='text'
                  name='title'
                  value={newCanvas.title}
                  onChange={handleInputChange}
                  className='w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none'
                  required
                />
              </div>
              <div>
                <label className='mb-2 block text-gray-300'>타입</label>
                <select
                  name='type'
                  value={newCanvas.type}
                  onChange={handleInputChange}
                  className='w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none'
                >
                  <option value='public'>상시</option>
                  <option value='event_common'>일반 이벤트</option>
                  <option value='event_colorlimit'>색상 제한 이벤트</option>
                  <option value='game_calculation'>게임</option>
                </select>
              </div>
              <div>
                <label className='mb-2 block text-gray-300'>
                  시작 지연 시간 (초)
                </label>
                <input
                  name='start_delay'
                  value={newCanvas.start_delay}
                  onChange={handleInputChange}
                  min='0'
                  className='w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none'
                  required
                />
              </div>
              <div>
                <label className='mb-2 block text-gray-300'>
                  게임 진행 시간 (초)
                </label>
                <input
                  name='game_duration'
                  value={newCanvas.game_duration}
                  onChange={handleInputChange}
                  min='1'
                  className='w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none'
                  required
                />
              </div>
              <div>
                <label className='mb-2 block text-gray-300'>너비 (픽셀)</label>
                <input
                  name='size_x'
                  value={newCanvas.size_x}
                  onChange={handleInputChange}
                  min='10'
                  max='1000'
                  className='w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none'
                  required
                />
              </div>
              <div>
                <label className='mb-2 block text-gray-300'>높이 (픽셀)</label>
                <input
                  type='number'
                  name='size_y'
                  value={newCanvas.size_y}
                  onChange={handleInputChange}
                  min='10'
                  max='1000'
                  className='w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none'
                  required
                />
              </div>
            </div>
            <button
              type='submit'
              className='focus:shadow-outline rounded bg-green-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-green-700 focus:outline-none'
            >
              캔버스 생성
            </button>
          </form>
        </div>

        {/* 캔버스 목록 */}
        <div className='rounded-lg bg-gray-800 p-6 shadow'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>캔버스 목록</h2>
            <button
              onClick={fetchCanvases}
              className='rounded bg-blue-600 px-3 py-1 text-sm text-white transition duration-300 hover:bg-blue-700'
            >
              새로고침
            </button>
          </div>
          {canvases.length === 0 ? (
            <p className='text-gray-400'>등록된 캔버스가 없습니다.</p>
          ) : (
            <div className='max-h-[500px] overflow-x-auto overflow-y-auto'>
              <table className='w-full text-left'>
                <thead>
                  <tr className='border-b border-gray-700'>
                    <th className='px-4 py-3'>ID</th>
                    <th className='px-4 py-3'>제목</th>
                    <th className='px-4 py-3'>타입</th>
                    <th className='px-4 py-3'>상태</th>
                    <th className='px-4 py-3'>크기</th>
                    <th className='px-4 py-3'>시작일 (KST)</th>
                    <th className='px-4 py-3'>종료일 (KST)</th>
                    <th className='px-4 py-3'>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {canvases.map((canvas) => (
                    <tr
                      key={canvas.id}
                      className='border-b border-gray-700 hover:bg-gray-700'
                    >
                      <td className='px-4 py-3'>{canvas.id}</td>
                      <td className='px-4 py-3'>{canvas.title}</td>
                      <td className='px-4 py-3'>{canvas.type}</td>
                      <td className='px-4 py-3'>{getCanvasStatus(canvas)}</td>
                      <td className='px-4 py-3'>
                        {canvas.size_x} x {canvas.size_y}
                      </td>
                      <td className='px-4 py-3'>
                        {formatDate(canvas.started_at)}
                      </td>
                      <td className='px-4 py-3'>
                        {formatDate(canvas.ended_at)}
                      </td>
                      <td className='flex items-center space-x-2 px-4 py-3'>
                        <button
                          onClick={() => handleForceEnd(canvas.id)}
                          className='rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-gray-600'
                          disabled={
                            !!(
                              canvas.ended_at &&
                              new Date(canvas.ended_at) < new Date()
                            )
                          }
                        >
                          강제종료
                        </button>
                        <button
                          onClick={() => handleDeleteCanvas(canvas.id)}
                          className='rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700'
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasManagement;
