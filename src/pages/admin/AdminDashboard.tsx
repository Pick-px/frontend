import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStrore';
import { AdminAPI } from '../../api/AdminAPI';

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCanvases: 0,
    totalPixelsPlaced: 0,
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

    // 대시보드 데이터 로드
    const fetchDashboardData = async () => {
      try {
        const response = await AdminAPI.getCanvases();

        setStats(response);
      } catch (error) {
        console.error('대시보드 데이터 로드 오류:', error);
        toast.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, isLoggedIn, user]);

  const handleLogout = () => {
    toast.success('관리자 페이지에서 나가십니다.');
    navigate('/');
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
          <h1 className='text-3xl font-bold'>관리자 대시보드</h1>
          <button
            onClick={handleLogout}
            className='rounded bg-red-600 px-4 py-2 transition duration-300 hover:bg-red-700'
          >
            로그아웃
          </button>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='rounded-lg bg-gray-800 p-6 shadow'>
            <h2 className='mb-2 text-xl font-semibold'>총 사용자</h2>
            <p className='text-3xl font-bold'>{stats.totalUsers}</p>
          </div>
          <div className='rounded-lg bg-gray-800 p-6 shadow'>
            <h2 className='mb-2 text-xl font-semibold'>활성 캔버스</h2>
            <p className='text-3xl font-bold'>{stats.activeCanvases}</p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='rounded-lg bg-gray-800 p-6 shadow'>
            <h2 className='mb-4 text-xl font-semibold'>관리 메뉴</h2>
            <div className='space-y-2'>
              <button
                onClick={() => navigate('/admin/canvases')}
                className='w-full rounded bg-blue-600 px-4 py-2 transition duration-300 hover:bg-blue-700'
              >
                캔버스 관리
              </button>
              <button className='w-full rounded bg-blue-600 px-4 py-2 transition duration-300 hover:bg-blue-700'>
                사용자 관리
              </button>
            </div>
          </div>

          <div className='rounded-lg bg-gray-800 p-6 shadow'>
            <h2 className='mb-4 text-xl font-semibold'>최근 활동</h2>
            <div className='space-y-2'>
              <p className='text-gray-400'>아직 활동 내역이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
