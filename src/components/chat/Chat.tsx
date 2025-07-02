import React, { useEffect, useMemo, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Message } from './MessageItem';
import { chatService } from './ChatAPI';
import { useCanvasStore } from '../../store/canvasStore';
import { DUMMY_RESPONSE, type Group } from '../../data/dummyChatData';

// 임시로 사용할 가짜 메시지 데이터

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  const canvas_id = useCanvasStore((state) => state.canvas_id);

  // const {getChatMessages} = chatService();

  // 그룹 변경 핸들러 함수
  const handleGroupChange = async (groupId: string) => {
    if (groupId === currentGroupId) return;

    try {
      setCurrentGroupId(groupId);
      const newMessages = await chatService.getChatMessages(groupId);
      setMessages(newMessages); // 메시지 상태 업데이트
    } catch (error) {
      console.error(
        `${groupId} 그룹의 메시지를 불러오는 데 실패했습니다.`,
        error
      );
    }
  };

  // Title은 거의 동일 => useMemo로 기억
  const chatTitle = useMemo(() => {
    const currentGroup = groups.find((g) => g.group_id === currentGroupId);
    return currentGroup ? currentGroup.group_title : '채팅';
  }, [groups, currentGroupId]);

  // 메시지 보내는 로직(임시함수, 추후 Socket 구현시 로직 들어갈ㄹ 예정)
  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      messageId: Date.now().toString(),
      user: { userId: 'me', name: '나' },
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const requestAdditionalMsg = () => {
    console.log("요청 보내기");
  };

  // isOpen True 시, canvasId 변경시
  // useEffect(() => {
  //   console.log(`modal open, ${canvas_id}`);
  //   if (isOpen && canvas_id) {
  //     const fetchInitialData = async () => {
  //       console.log(`start fetch, ${canvas_id}`);
  //       try {
  //         const response = await chatService.getChatInitMessages(canvas_id);
  //         console.log(response);
  //         const {
  //           defaultGroupId,
  //           groups: fetchedGroups,
  //           messages: initialMessages,
  //         } = response.data;

  //         setGroups(fetchedGroups);
  //         setCurrentGroupId(defaultGroupId);
  //         setMessages(initialMessages);
  //       } catch (error) {
  //         console.error('초기 채팅 데이터를 불러오는 데 실패했습니다.', error);
  //       }
  //     };

  //     fetchInitialData();
  //   }
  // }, [isOpen, canvas_id]);

  useEffect(() => {
    if (isOpen && canvas_id) {
      console.log(`modal open, using dummy data for canvasId: ${canvas_id}`);

      const {
        defaultGroupId,
        groups: fetchedGroups,
        messages: initialMessages,
      } = DUMMY_RESPONSE.data;

      setGroups(fetchedGroups);
      setCurrentGroupId(defaultGroupId);
      setMessages(initialMessages);
    }
  }, [isOpen, canvas_id]);

  return (
    <div className='fixed bottom-5 left-5 z-50 flex flex-col items-start'>
      {/* 채팅창 UI */}
      <div
        className={`mb-2 flex h-[500px] w-80 flex-col rounded-xl border border-white/30 bg-black/30 shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      >
        <div className='flex h-full flex-col'>
          {/* 헤더: 동적 제목 표시 */}
          <div className='flex-shrink-0 border-b border-white/30 p-3'>
            <h3 className='text-md font-semibold text-white'>{chatTitle}</h3>
          </div>

          {/* 그룹 목록 탭 */}
          <div className='flex flex-shrink-0 space-x-2 border-b border-white/30 p-2'>
            {groups.map((group) => (
              <button
                key={group.group_id}
                onClick={() => handleGroupChange(group.group_id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                  currentGroupId === group.group_id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                }`}
              >
                {group.group_title}
              </button>
            ))}
          </div>

          {/* 메시지 목록 */}
          <MessageList messages={messages} />

          {/* 메시지 입력창 */}
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      {/* 채팅창 여닫기 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-xl transition-transform hover:bg-blue-600 active:scale-90'
      >
        {isOpen ? (
          // 닫기 아이콘 (X)
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            className='h-7 w-7'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        ) : (
          // 열기 아이콘 (말풍선)
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-7 w-7'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.794 9 8.25z'
            />
          </svg>
        )}
      </button>
    </div>
  );
}
