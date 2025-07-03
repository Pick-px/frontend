import type { GroupResponseDto } from '../modal/GroupModalContent';

interface GroupJoinTabProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchedGroup: GroupResponseDto[];
  handleSearch: () => Promise<void>;
  handleJoinGroup: (groupId: string) => Promise<void>;
  myGroups: GroupResponseDto[]; // 내가 참여한 그룹 목록 추가
}

export default function GroupJoinTab({
  searchQuery,
  setSearchQuery,
  searchedGroup,
  handleSearch,
  handleJoinGroup,
  myGroups,
}: GroupJoinTabProps) {
  // 이미 참여한 그룹인지 확인하는 함수
  const isAlreadyJoined = (groupId: string) => {
    return myGroups.some(myGroup => myGroup.id === groupId);
  };

  return (
    <div className='flex flex-col gap-4 h-full'>
      {/* 그룹 검색 */}
      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>
          그룹 검색
        </label>
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='그룹 이름으로 검색하세요'
            className='flex-1 rounded-none border-b border-white/20 bg-white/10 p-2 text-sm text-white placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-blue-500'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className='rounded bg-blue-500 px-4 py-2 text-sm text-white shadow-md transition-colors hover:bg-blue-600'
          >
            검색
          </button>
        </div>
      </div>

      {/* 전체 그룹 목록 */}
      <div className='flex-1 overflow-y-auto'>
        <div className='space-y-2'>
          {searchedGroup.length === 0 ? (
            <div className='py-8 text-center text-gray-400'>
              {searchQuery
                ? '검색 결과가 없습니다.'
                : '참여 가능한 그룹이 없습니다.'}
            </div>
          ) : (
            searchedGroup.map((group) => {
              const alreadyJoined = isAlreadyJoined(group.id);
              const isFull = group.currentParticipantsCount >= group.maxParticipants;
              
              return (
                <div
                  key={group.id}
                  className='flex items-center justify-between rounded border border-white/20 bg-white/5 p-3 hover:bg-white/10 transition-colors'
                >
                  <div className='flex-1'>
                    <h4 className='font-medium text-white'>{group.name}</h4>
                    <p className='text-xs text-gray-400'>
                      멤버 {group.currentParticipantsCount}/{group.maxParticipants}명
                    </p>
                  </div>
                  <button
                    onClick={() => !alreadyJoined && handleJoinGroup(group.id)}
                    disabled={alreadyJoined || isFull}
                    className={`rounded px-3 py-1 text-sm shadow-md transition-colors ${
                      alreadyJoined
                        ? 'bg-green-500 text-white cursor-default'
                        : isFull
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {alreadyJoined
                      ? '참여중'
                      : isFull
                      ? '정원초과'
                      : '참여'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
