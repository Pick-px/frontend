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
    <div className='space-y-3'>
      {myGroups.length === 0 ? (
        <div className='py-8 text-center text-gray-400'>
          참여한 그룹이 없습니다.
        </div>
      ) : (
        myGroups.slice(0, 3).map((group) => (
          <div
            key={group.id}
            className='rounded border border-white/20 bg-white/5 p-4 hover:bg-white/10 transition-colors'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h3 className='font-semibold text-white'>
                  {group.name}
                </h3>
                <p className='mt-1 text-sm text-gray-300'>
                  생성일: {group.createdAt.split('T')[0]}
                </p>
                <p className='mt-2 text-xs text-gray-400'>
                  멤버 {group.currentParticipantsCount}/{group.maxParticipants}명
                </p>
              </div>
              <button
                onClick={() => onLeaveGroup(group.id)}
                className='rounded bg-red-500 px-3 py-1 text-sm text-white shadow-md transition-colors hover:bg-red-600'
              >
                {group.madeBy === userId ? '삭제' : '탈퇴'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
