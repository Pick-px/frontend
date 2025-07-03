import { useEffect, useState } from 'react';
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
};

export default function GroupModalContent({ onClose }: GroupModalContentProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'list'>(
    'list'
  );
  const [groupName, setGroupName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxMembers, setMaxMembers] = useState<string>('0');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { isGroupModalOpen } = useModalStore();
  const { user } = useAuthStore();
  const { canvas_id } = useCanvasStore();
  // 예시 내 그룹 데이터 (최대 3개)
  const [myGroups, setMyGroups] = useState<GroupResponseDto[]>([]);

  // 검색된 그룹 데이터
  const [searchedGroup, setSearchedGroup] = useState<GroupResponseDto[]>([]);

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
        const userGroup: GroupResponseDto[] = response.data.userGroup;
        const filteredData: GroupResponseDto[] = response.data.allGroup.filter(
          (group: GroupResponseDto) => group.madeBy !== user?.userId
        );
        setMyGroups(userGroup);
        setSearchedGroup(filteredData);
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
    // 그룹 생성 로직
    console.log('그룹 생성:', { groupName, maxMembers, canvas_id });
    // API 호출 후 성공하면 모달 닫기
    try {
      const result = await groupServices.createGroup(
        groupName,
        maxMembers,
        canvas_id
      );
      console.log('result : ', result);
      if (result.isSuccess) {
        await fetchGroupLists();
        setActiveTab('list');
        setErrorMessage('');
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
        await fetchGroupLists();
        setActiveTab('list');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(`${groupId} 그룹의 참여 신청에 실패하였습니다.`, error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    // 그룹 탈퇴 로직
    console.log('그룹 탈퇴:', groupId);
    // Todo : 탈퇴하시겠습니까? 알트 띄움
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
    // 예시: groupServices.searchGroups는 검색 API라고 가정
    try {
      const result = await groupServices.searchGroups(searchQuery, canvas_id);
      if (result.isSuccess) {
        setSearchedGroup(result.data);
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
    <div className='flex h-full flex-col p-3'>
      <h2 className='text-md font-semibold text-white'>그룹 관리</h2>
      <p className='mt-2 text-gray-300'>
        그룹을 생성하거나 참여하여 함께 픽셀 아트를 만들어보세요.
      </p>

      {/* 탭 네비게이션 */}
      <div className='mt-4 flex border-b border-white/20'>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          내 그룹
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          그룹 생성
        </button>
        <button
          onClick={() => setActiveTab('join')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'join'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          그룹 참여
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className='mt-4 flex-1'>
        {/* 내 그룹 리스트 (최대 3개) */}
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
  );
}
