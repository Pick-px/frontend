import type { GroupResponseDto } from '../modal/GroupModalContent';

interface GroupJoinTabProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchedGroup: GroupResponseDto[];
  handleSearch: () => Promise<void>;
  handleJoinGroup: (groupId: string) => Promise<void>;
}

export default function GroupJoinTab({
  searchQuery,
  setSearchQuery,
  searchedGroup,
  handleSearch,
  handleJoinGroup,
}: GroupJoinTabProps) {
  return (
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
                <h4 className='font-medium text-gray-900'>{group.name}</h4>

                <p className='text-xs text-gray-500'>
                  멤버 {group.currentParticipantsCount}/{group.maxParticipants}
                  명
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
  );
}
