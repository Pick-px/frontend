interface GroupCreateTabProps {
  groupName: string;
  setGroupName: React.Dispatch<React.SetStateAction<string>>;
  maxMembers: string;
  setMaxMembers: React.Dispatch<React.SetStateAction<string>>;
  handleCreateGroup: () => Promise<void>;
  errorMessage: string;
}

export default function GroupCreateTab({
  groupName,
  setGroupName,
  maxMembers,
  setMaxMembers,
  handleCreateGroup,
  errorMessage,
}: GroupCreateTabProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>
          그룹 이름
        </label>
        <input
          type='text'
          placeholder='그룹 이름을 입력해주세요'
          className='w-full rounded-none border-b border-white/20 bg-white/10 p-2 text-sm text-white placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-blue-500'
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>
      <div>
        <label className='block text-sm font-medium text-gray-300 mb-2'>
          최대 인원수
        </label>
        <input
          type='number'
          placeholder='최대 인원 수를 입력하세요'
          className='w-full rounded-none border-b border-white/20 bg-white/10 p-2 text-sm text-white placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-blue-500'
          value={maxMembers}
          onChange={(e) => setMaxMembers(e.target.value)}
        />
        {errorMessage && (
          <div className='mt-2 text-sm text-red-400'>{errorMessage}</div>
        )}
      </div>
      <div className='flex justify-center'>
        <div className='w-[180px]'>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim()}
            className='w-full rounded bg-blue-500 py-2 text-white shadow-md transition-colors hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed'
          >
            그룹 생성하기
          </button>
        </div>
      </div>
    </div>
  );
}
