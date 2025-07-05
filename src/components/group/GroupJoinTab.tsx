import type { GroupResponseDto } from '../modal/GroupModalContent';

interface GroupJoinTabProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchedGroup: GroupResponseDto[];
  handleSearch: () => Promise<void>;
  handleJoinGroup: (groupId: string) => Promise<void>;
  myGroups: GroupResponseDto[];
}

export default function GroupJoinTab({
  searchQuery,
  setSearchQuery,
  searchedGroup,
  handleSearch,
  handleJoinGroup,
  myGroups,
}: GroupJoinTabProps) {
  const isAlreadyJoined = (groupId: string) => {
    return myGroups.some(myGroup => myGroup.id === groupId);
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* 그룹 검색 */}
      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>
          그룹 검색
        </label>
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='그룹 이름으로 검색하세요'
            className='flex-1 rounded-none border-b border-white/20 bg-white/10 p-2 text-sm text-white placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-blue-500 transition-all duration-300'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className='rounded bg-blue-500 px-4 py-2 text-sm text-white shadow-md transition-all duration-300 hover:bg-blue-600 transform hover:scale-105'
          >
            검색
          </button>
        </div>
      </div>

      {/* 전체 그룹 목록 - 최대 3개까지 표시, 스크롤 가능 */}
      <div 
        className='max-h-[240px] overflow-y-auto pr-1'
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
        }}
      >
        <div className='space-y-2 transition-all duration-500 ease-out'>
          {searchedGroup.length === 0 ? (
            <div className='py-4 text-center text-gray-400 animate-in fade-in duration-300'>
              {searchQuery
                ? '검색 결과가 없습니다.'
                : '참여 가능한 그룹이 없습니다.'}
            </div>
          ) : (
            searchedGroup.map((group, index) => {
              const alreadyJoined = isAlreadyJoined(group.id);
              const isFull = group.currentParticipantsCount >= group.maxParticipants;
              
              return (
                <div
                  key={group.id}
                  className='flex items-center justify-between rounded border border-white/20 bg-white/5 p-3 hover:bg-white/10 transition-all duration-300 ease-out animate-in slide-in-from-top-2 fade-in'
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-medium text-white truncate pr-2' title={group.name}>
                      {group.name}
                    </h4>
                    <p className='text-xs text-gray-400'>
                      멤버 {group.currentParticipantsCount}/{group.maxParticipants}명
                    </p>
                    {isFull && (
                      <p className='text-xs text-red-400 mt-1 animate-in fade-in duration-500'>
                        정원이 가득 찼습니다
                      </p>
                    )}
                    {alreadyJoined && (
                      <p className='text-xs text-green-400 mt-1 animate-in fade-in duration-500'>
                        이미 참여 중인 그룹입니다
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => !alreadyJoined && !isFull && handleJoinGroup(group.id)}
                    disabled={alreadyJoined || isFull}
                    className={`flex-shrink-0 rounded px-3 py-1 text-sm shadow-md transition-all duration-300 transform hover:scale-105 ${
                      alreadyJoined
                        ? 'bg-green-500 text-white cursor-default'
                        : isFull
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
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
