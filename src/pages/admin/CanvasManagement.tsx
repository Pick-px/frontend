import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminAPI } from '../../api/AdminAPI';
import { useAuthStore } from '../../store/authStrore';

interface Canvas {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  ended_at?: string;
  width: number;
  height: number;
  user_count?: number;
}

const CanvasManagement: React.FC = () => {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCanvas, setNewCanvas] = useState({
    title: '',
    type: 'normal',
    width: 100,
    height: 100,
    duration: 24, // 시간 단위
  });
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();

  useEffect(() => {
    // 관리자 권한 확인
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
      setCanvases(data.canvases || []);
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

    try {
      await AdminAPI.createCanvas(newCanvas);
      toast.success('캔버스가 성공적으로 생성되었습니다.');

      // 폼 초기화
      setNewCanvas({
        title: '',
        type: 'normal',
        width: 100,
        height: 100,
        duration: 24,
      });

      // 캔버스 목록 새로고침
      fetchCanvases();
    } catch (error) {
      console.error('캔버스 생성 오류:', error);
      toast.error('캔버스 생성에 실패했습니다.');
    }
  };

  const handleDeleteCanvas = async (canvasId: string) => {
    if (!window.confirm('정말로 이 캔버스를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await AdminAPI.deleteCanvas(canvasId);
      toast.success('캔버스가 성공적으로 삭제되었습니다.');
      fetchCanvases(); // 캔버스 목록 새로고침
    } catch (error) {
      console.error('캔버스 삭제 오류:', error);
      toast.error('캔버스 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewCanvas((prev) => ({
      ...prev,
      [name]:
        name === 'width' || name === 'height' || name === 'duration'
          ? Number(value)
          : value,
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
    <div className='min-h-screen bg-gray-900 text-white'>
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
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
                  <option value='event'>이벤트</option>
                  <option value='game_calculation'>게임</option>
                </select>
              </div>
              <div>
                <label className='mb-2 block text-gray-300'>너비 (픽셀)</label>
                <input
                  type='number'
                  name='width'
                  value={newCanvas.width}
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
                  name='height'
                  value={newCanvas.height}
                  onChange={handleInputChange}
                  min='10'
                  max='1000'
                  className='w-full rounded border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none'
                  required
                />
              </div>
              <div>
                <label className='mb-2 block text-gray-300'>
                  지속 시간 (시간)
                </label>
                <input
                  type='number'
                  name='duration'
                  value={newCanvas.duration}
                  onChange={handleInputChange}
                  min='1'
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
          <h2 className='mb-4 text-xl font-semibold'>캔버스 목록</h2>
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
                    <th className='px-4 py-3'>생성일</th>
                    <th className='px-4 py-3'>종료일</th>
                    <th className='px-4 py-3'>사용자 수</th>
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
                      <td className='px-4 py-3'>
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            canvas.status === 'active'
                              ? 'bg-green-600'
                              : 'bg-red-600'
                          }`}
                        >
                          {canvas.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        {canvas.width}x{canvas.height}
                      </td>
                      <td className='px-4 py-3'>
                        {formatDate(canvas.created_at)}
                      </td>
                      <td className='px-4 py-3'>
                        {canvas.ended_at ? formatDate(canvas.ended_at) : '-'}
                      </td>
                      <td className='px-4 py-3'>{canvas.user_count || 0}</td>
                      <td className='px-4 py-3'>
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