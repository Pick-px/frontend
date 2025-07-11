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
    return myGroups.some((myGroup) => myGroup.id === groupId);
  };

  return (
    <div className='flex flex-col gap-4'>
      {/* 그룹 검색 */}
      <div>
        <label className='mb-2 block text-sm font-medium text-gray-300'>
          그룹 검색
        </label>
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='그룹 이름으로 검색하세요'
            className='flex-1 rounded-none border-b border-white/20 bg-white/10 p-2 text-sm text-white placeholder-gray-300 transition-all duration-300 outline-none focus:border-blue-500 focus:ring-blue-500'
            value={searchQuery}
            maxLength={20}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className='transform rounded bg-blue-500 px-4 py-2 text-sm text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-blue-600'
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
            <div className='animate-in fade-in py-4 text-center text-gray-400 duration-300'>
              {searchQuery
                ? '검색 결과가 없습니다.'
                : '참여 가능한 그룹이 없습니다.'}
            </div>
          ) : (
            searchedGroup.map((group, index) => {
              const alreadyJoined = isAlreadyJoined(group.id);
              const isFull =
                group.currentParticipantsCount >= group.maxParticipants;

              return (
                <div
                  key={group.id}
                  className='animate-in slide-in-from-top-2 fade-in flex items-center justify-between rounded border border-white/20 bg-white/5 p-3 transition-all duration-300 ease-out hover:bg-white/10'
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <div className='min-w-0 flex-1'>
                    <h4
                      className='truncate pr-2 font-medium text-white'
                      title={group.name}
                    >
                      {group.name}
                    </h4>
                    <p className='text-xs text-gray-400'>
                      멤버 {group.currentParticipantsCount}/
                      {group.maxParticipants}명
                    </p>
                    {isFull && (
                      <p className='animate-in fade-in mt-1 text-xs text-red-400 duration-500'>
                        정원이 가득 찼습니다
                      </p>
                    )}
                    {alreadyJoined && (
                      <p className='animate-in fade-in mt-1 text-xs text-green-400 duration-500'>
                        이미 참여 중인 그룹입니다
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      !alreadyJoined && !isFull && handleJoinGroup(group.id)
                    }
                    disabled={alreadyJoined || isFull}
                    className={`flex-shrink-0 transform rounded px-3 py-1 text-sm shadow-md transition-all duration-300 hover:scale-105 ${
                      alreadyJoined
                        ? 'cursor-default bg-green-500 text-white'
                        : isFull
                          ? 'cursor-not-allowed bg-gray-600 text-gray-300'
                          : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg'
                    }`}
                  >
                    {alreadyJoined ? '참여중' : isFull ? '정원초과' : '참여'}
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
