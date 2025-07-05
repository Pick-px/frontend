import { useEffect, useState, useRef } from 'react';
import { useModalStore } from '../../store/modalStore';
import { groupServices } from '../../api/GroupAPI';
import { useCanvasStore } from '../../store/canvasStore';
import { useAuthStore } from '../../store/authStrore';
import GroupListTab from '../group/GroupListTab';
import GroupCreateTab from '../group/GroupCreateTab';
import GroupJoinTab from '../group/GroupJoinTab';

type GroupModalContentProps = {
  onClose?: () => void;
};

export type GroupResponseDto = {
  id: string;
  name: string;
  maxParticipants: number;
  currentParticipantsCount: number;
  createdAt: string;
  madeBy: string;
  is_default: boolean;
};

export default function GroupModalContent({ onClose }: GroupModalContentProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'list'>(
    'list'
  );
  const [groupName, setGroupName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxMembers, setMaxMembers] = useState<string>('0');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [contentHeight, setContentHeight] = useState<number>(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const { isGroupModalOpen } = useModalStore();
  const { user } = useAuthStore();
  const { canvas_id } = useCanvasStore();

  const [myGroups, setMyGroups] = useState<GroupResponseDto[]>([]);
  const [searchedGroup, setSearchedGroup] = useState<GroupResponseDto[]>([]);

  // 콘텐츠 높이 측정 및 애니메이션
  useEffect(() => {
    if (contentRef.current) {
      const measureHeight = () => {
        const newHeight = contentRef.current?.scrollHeight || 0;
        if (newHeight !== contentHeight && newHeight > 0) {
          setContentHeight(newHeight);
        }
      };

      // ResizeObserver를 사용하여 콘텐츠 크기 변화 감지
      const resizeObserver = new ResizeObserver(() => {
        measureHeight();
      });

      resizeObserver.observe(contentRef.current);

      // 초기 높이 측정
      measureHeight();

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [activeTab, myGroups, searchedGroup, groupName, maxMembers, errorMessage]);

  useEffect(() => {
    if (isGroupModalOpen) {
      fetchGroupLists();
    }
  }, [isGroupModalOpen]);

  const fetchGroupLists = async () => {
    try {
      const response = await groupServices.getGroupList(canvas_id);
      console.log('성공:', response.isSuccess);
      if (response.isSuccess) {
        const userGroup: GroupResponseDto[] = response.data.userGroup.filter(
          (group: GroupResponseDto) => group.is_default !== true
        );
        const allGroup: GroupResponseDto[] = response.data.allGroup.filter(
          (group: GroupResponseDto) => group.is_default !== true
        );
        setMyGroups(userGroup);
        setSearchedGroup(allGroup);
      } else {
        console.error(response.message);
      }
    } catch (e) {
      console.error('그룹 목록을 불러오는데 실패했습니다');
    }
  };

  const handleCreateGroup = async () => {
    if (maxMembers.trim() === '') {
      setErrorMessage('인원수를 입력하세요.');
      return;
    }

    if (isNaN(Number(maxMembers.trim()))) {
      setErrorMessage('최대 인원수는 숫자여야 합니다.');
      return;
    }

    if (Number(maxMembers) < 2 || Number(maxMembers) > 100) {
      setErrorMessage('최대 인원수는 2명 이상 100명 이하여야 합니다');
      return;
    }

    console.log('그룹 생성:', { groupName, maxMembers, canvas_id });
    try {
      const result = await groupServices.createGroup(
        groupName,
        maxMembers,
        canvas_id
      );
      console.log('result : ', result);
      if (result.isSuccess) {
        await fetchGroupLists();
        handleTabChange('list');
        setErrorMessage('');
        onClose?.();
      } else {
        setErrorMessage(result.message);
      }
    } catch (e) {
      setErrorMessage('서버 오류로 그룹 생성에 실패했습니다');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    console.log('그룹 참여:', groupId);
    try {
      const result = await groupServices.joinGroup(groupId, canvas_id);
      if (result.isSuccess) {
        await fetchGroupLists();
        handleTabChange('list');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(`${groupId} 그룹의 참여 신청에 실패하였습니다.`, error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    console.log('그룹 탈퇴:', groupId);
    const confirmed = window.confirm('정말로 이 그룹에서 탈퇴하시겠습니까?');
    if (!confirmed) return;
    try {
      const result = await groupServices.deleteGroup(groupId);
      if (result.isSuccess) {
        await fetchGroupLists();
        onClose?.();
      }
    } catch (error) {
      console.error(`${groupId} 그룹 탈퇴에 실패하였습니다.`, error);
    }
  };

  const handleSearch = async () => {
    try {
      const result = await groupServices.searchGroups(searchQuery, canvas_id);
      if (result.isSuccess) {
        setSearchedGroup(result.data);
      } else {
        setSearchedGroup([]);
        console.log(result.message);
      }
    } catch (e) {
      setSearchedGroup([]);
      console.error('그룹 검색 도중 서버 오류 발생', e);
    }
  };

  const handleTabChange = (tab: 'create' | 'join' | 'list') => {
    if (tab !== activeTab) {
      setIsTransitioning(true);
      setActiveTab(tab);
      setErrorMessage(''); // 탭 변경 시 에러 메시지 초기화

      // 전환 애니메이션 완료 후 상태 리셋
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }
  };

  return (
    <div className='flex flex-col'>
      {/* 헤더 - 고정 높이 */}
      <div className='flex-shrink-0 border-b border-white/20 p-4'>
        <h2 className='text-lg font-semibold text-white'>그룹 관리</h2>
        <p className='mt-1 text-sm text-gray-300'>
          그룹을 생성하거나 참여하여 함께 픽셀 아트를 만들어보세요.
        </p>
      </div>

      {/* 탭 네비게이션 - 고정 높이 */}
      <div className='flex-shrink-0 px-4 pt-4'>
        <div className='flex border-b border-white/20'>
          <button
            onClick={() => handleTabChange('list')}
            className={`px-4 py-3 text-sm font-medium transition-all duration-300 ${
              activeTab === 'list'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            내 그룹
          </button>
          <button
            onClick={() => handleTabChange('create')}
            className={`px-4 py-3 text-sm font-medium transition-all duration-300 ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            그룹 생성
          </button>
          <button
            onClick={() => handleTabChange('join')}
            className={`px-4 py-3 text-sm font-medium transition-all duration-300 ${
              activeTab === 'join'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            그룹 참여
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 - 높이 애니메이션 적용 */}
      <div
        className='overflow-hidden transition-all duration-400 ease-out'
        style={{
          height: contentHeight > 0 ? `${contentHeight}px` : 'auto',
        }}
      >
        <div
          ref={contentRef}
          className={`p-4 transition-all duration-200 ease-out ${
            isTransitioning ? 'opacity-70' : 'opacity-100'
          }`}
        >
          {/* 내 그룹 리스트 */}
          {activeTab === 'list' && (
            <GroupListTab
              myGroups={myGroups}
              onLeaveGroup={handleLeaveGroup}
              userId={user?.userId}
            />
          )}

          {/* 그룹 생성 */}
          {activeTab === 'create' && (
            <GroupCreateTab
              groupName={groupName}
              setGroupName={setGroupName}
              maxMembers={maxMembers}
              setMaxMembers={setMaxMembers}
              handleCreateGroup={handleCreateGroup}
              errorMessage={errorMessage}
            />
          )}

          {/* 그룹 참여 */}
          {activeTab === 'join' && (
            <GroupJoinTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchedGroup={searchedGroup}
              handleSearch={handleSearch}
              handleJoinGroup={handleJoinGroup}
              myGroups={myGroups}
            />
          )}
        </div>
      </div>
    </div>
  );
}
