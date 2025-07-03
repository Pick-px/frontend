import { useEffect, useState } from 'react';
import { useModalStore } from '../../store/modalStore';
import { groupServices } from '../../api/GroupAPI';
import { useCanvasStore } from '../../store/canvasStore';
import { useAuthStore } from '../../store/authStrore';

type GroupModalContentProps = {
  onClose?: () => void;
};

type GroupResponseDto = {
  id: string;
  name: string;
  maxParticipants: number;
  currentParticipantsCount: number;
  createdAt: string;
  madeBy: string;
};

export default function GroupModalContent({ onClose }: GroupModalContentProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'list'>(
    'list'
  );
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxMembers, setMaxMembers] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const { isGroupModalOpen } = useModalStore();
  const { user } = useAuthStore();
  const { canvas_id } = useCanvasStore();
  // 예시 내 그룹 데이터 (최대 3개)
  const [myGroups, setMyGroups] = useState<GroupResponseDto[]>([]);

  // 예시 전체 그룹 데이터
  const [allGroups, setAllGroups] = useState<GroupResponseDto[]>([]);

  // 검색된 그룹 데이터
  const [searchedGroup, setSearchedGroup] = useState<GroupResponseDto[]>([]);

  useEffect(() => {
    if (isGroupModalOpen) {
      fetchGroupLists();
    }
  }, [isGroupModalOpen]);

  const fetchGroupLists = async () => {
    try {
      const data = await groupServices.getGroupList(canvas_id);
      console.log(data);
      if (data.isSuccess) {
        setMyGroups(data.userGroup);
        setAllGroups(data.allGroup);
        setSearchedGroup(data.allGroup);
      } else {
        console.error('그룹 목록을 불러오는데 실패했습니다.');
      }
    } catch (e) {
      console.error('그룹 목록을 불러오는데 실패했습니다');
    }
  };

  const handleCreateGroup = async () => {
    if (maxMembers < 2 || maxMembers > 100) {
      setErrorMessage('최대 인원수는 2명 이상 100명 이하여야 합니다');
      return;
    }
    // 그룹 생성 로직
    console.log('그룹 생성:', { groupName, maxMembers, canvas_id });
    // API 호출 후 성공하면 모달 닫기
    try {
      const result = await groupServices.createGroup(
        groupName,
        maxMembers.toString(),
        canvas_id
      );
      console.log('result : ', result);
      if (result.isSuccess) {
        setActiveTab('list');
        await fetchGroupLists();
        onClose?.();
      } else {
        setErrorMessage(result.message);
      }
    } catch (e) {
      setErrorMessage('서버 오류로 그룹 생성에 실패했습니다');
      // 필요하다면 에러 메시지 처리
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    // 그룹 목록에서 그룹 참여 로직
    console.log('그룹 참여:', groupId);
    try {
      const result = await groupServices.joinGroup(groupId);
      if (result.isSuccess) {
        setActiveTab('list');
      }
    } catch (error) {
      console.error(`${groupId} 그룹의 참여 신청에 실패하였습니다.`, error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    // 그룹 탈퇴 로직
    console.log('그룹 탈퇴:', groupId);
    try {
      const result = await groupServices.deleteGroup(groupId);
      if (result.isSuccess) {
        onClose?.();
      }
    } catch (error) {
      console.error(`${groupId} 그룹 탈퇴에 실패하였습니다.`, error);
    }
  };

  const handleSearch = async () => {
    // 예시: groupServices.searchGroups는 검색 API라고 가정
    try {
      const result = await groupServices.searchGroups(searchQuery);
      if (result.isSuccess) {
        setSearchedGroup(result.allGroupList);
      } else {
        setSearchedGroup([]);
        // 필요하다면 에러 메시지 처리
        console.log(result.message);
      }
    } catch (e) {
      setSearchedGroup([]);
      // 필요하다면 에러 메시지 처리
      console.error('그룹 검색 도중 서버 오류 발생', e);
    }
  };

  return (
    <>
      <h2 className='text-xl font-bold'>그룹 관리</h2>
      <p className='mt-2 text-gray-600'>
        그룹을 생성하거나 참여하여 함께 픽셀 아트를 만들어보세요.
      </p>

      {/* 탭 네비게이션 */}
      <div className='mt-4 flex border-b'>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'list'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          내 그룹
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'create'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          그룹 생성
        </button>
        <button
          onClick={() => setActiveTab('join')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'join'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          그룹 참여
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className='mt-4'>
        {/* 내 그룹 리스트 (최대 3개) */}
        {activeTab === 'list' && (
          <div className='space-y-3'>
            {myGroups.length === 0 ? (
              <div className='py-8 text-center text-gray-500'>
                참여한 그룹이 없습니다.
              </div>
            ) : (
              myGroups.slice(0, 3).map((group) => (
                <div
                  key={group.id}
                  className='rounded-lg border p-4 hover:bg-gray-50'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900'>
                        {group.name}
                      </h3>
                      <p className='mt-1 text-sm text-gray-600'>
                        생성일 : {group.createdAt.split('T')[0]}
                      </p>
                      <p className='mt-2 text-xs text-gray-500'>
                        멤버 {group.currentParticipantsCount}/
                        {group.maxParticipants}명
                      </p>
                    </div>
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className='rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600'
                    >
                      {group.madeBy === user?.userId ? '삭제' : '탈퇴'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 그룹 생성 */}
        {activeTab === 'create' && (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                그룹 이름
              </label>
              <input
                type='text'
                placeholder='그룹 이름을 입력해주세요'
                className='mt-1 w-full rounded border p-2'
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                최대 인원수
              </label>
              <input
                type='number'
                placeholder='최대 인원 수를 입력하세요'
                className='mt-1 w-full rounded border p-2'
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
              />
              {errorMessage && (
                <div className='mt-1 text-sm text-red-500'>{errorMessage}</div>
              )}
            </div>
            <div className='flex justify-center'>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className='h-10 w-[180px] rounded bg-blue-500 py-2 text-white transition-transform hover:bg-blue-600 active:scale-95 disabled:bg-gray-300'
              >
                그룹 생성하기
              </button>
            </div>
          </div>
        )}

        {/* 그룹 참여 */}
        {activeTab === 'join' && (
          <div className='space-y-4'>
            {/* 그룹 검색 */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                그룹 검색
              </label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  placeholder='그룹 이름이나 설명으로 검색하세요'
                  className='mt-1 w-full rounded border p-2'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  onClick={handleSearch}
                  className='bg-white-500 w-28 rounded px-1 py-1 text-black hover:bg-gray-500 disabled:bg-gray-300'
                >
                  검색
                </button>
              </div>
            </div>

            {/* 전체 그룹 목록 */}
            <div className='max-h-64 space-y-2 overflow-y-auto'>
              {searchedGroup.length === 0 ? (
                <div className='py-4 text-center text-gray-500'>
                  {searchQuery
                    ? '검색 결과가 없습니다.'
                    : '참여 가능한 그룹이 없습니다.'}
                </div>
              ) : (
                searchedGroup.map((group) => (
                  <div
                    key={group.id}
                    className='flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50'
                  >
                    <div className='flex-1'>
                      <h4 className='font-medium text-gray-900'>
                        {group.name}
                      </h4>

                      <p className='text-xs text-gray-500'>
                        멤버 {group.currentParticipantsCount}/
                        {group.maxParticipants}명
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={
                        group.currentParticipantsCount >= group.maxParticipants
                      }
                      className='min-w-[70px] flex-shrink-0 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:hover:scale-100'
                    >
                      {group.currentParticipantsCount >= group.maxParticipants
                        ? '정원초과'
                        : '참여'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
