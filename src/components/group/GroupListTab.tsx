import type { GroupResponseDto } from '../modal/GroupModalContent';

interface GroupListTabProps {
  myGroups: GroupResponseDto[];
  onLeaveGroup: (groupId: string) => Promise<void>;
  userId?: string;
}

export default function GroupListTab({
  myGroups,
  onLeaveGroup,
  userId,
}: GroupListTabProps) {
  return (
    <div className='transition-all duration-500 ease-out'>
      {myGroups.length === 0 ? (
        <div className='py-4 text-center text-gray-400 animate-in fade-in duration-300'>
          참여한 그룹이 없습니다.
        </div>
      ) : (
        <div className='space-y-3 transition-all duration-500 ease-out'>
          {myGroups.slice(0, 3).map((group, index) => (
            <div
              key={group.id}
              className='rounded border border-white/20 bg-white/5 p-4 hover:bg-white/10 transition-all duration-300 ease-out animate-in slide-in-from-top-2 fade-in'
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <h3 className='font-semibold text-white truncate pr-2' title={group.name}>
                    {group.name}
                  </h3>
                  <p className='mt-1 text-sm text-gray-300'>
                    생성일: {group.createdAt.split('T')[0]}
                  </p>
                  <p className='mt-2 text-xs text-gray-400'>
                    멤버 {group.currentParticipantsCount}/{group.maxParticipants}명
                  </p>
                  {group.madeBy === userId && (
                    <p className='text-xs text-blue-400 font-medium mt-1 animate-in fade-in duration-500'>
                      👑 그룹 리더
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onLeaveGroup(group.id)}
                  className={`flex-shrink-0 rounded px-3 py-1 text-sm text-white shadow-md transition-all duration-300 transform hover:scale-105 ${
                    group.madeBy === userId
                      ? 'bg-red-500 hover:bg-red-600 hover:shadow-lg'
                      : 'bg-gray-600 hover:bg-gray-700 hover:shadow-lg'
                  }`}
                >
                  {group.madeBy === userId ? '삭제' : '탈퇴'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
