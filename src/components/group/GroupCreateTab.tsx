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
          onChange={(e) => setMaxMembers(e.target.value)}
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
  );
}
