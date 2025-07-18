import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/authStrore';

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
        const accessToken = useAuthStore.getState().accessToken;
        const response = await fetch('https://pick-px.com/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('인증이 만료되었습니다.');
            navigate('/');
            return;
          }
          throw new Error('대시보드 데이터를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setStats(data);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition duration-300"
          >
            로그아웃
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">총 사용자</h2>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">활성 캔버스</h2>
            <p className="text-3xl font-bold">{stats.activeCanvases}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">관리 메뉴</h2>
            <div className="space-y-2">
              <button onClick={() => navigate('/admin/canvases')} className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded transition duration-300">
                캔버스 관리
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded transition duration-300">
                사용자 관리
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
            <div className="space-y-2">
              <p className="text-gray-400">아직 활동 내역이 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;