import React, { useEffect, useMemo, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Message } from './MessageItem';
import { chatService } from './ChatAPI';
import { useCanvasStore } from '../../store/canvasStore';
import { useChatSocket } from '../SocketIntegration';
import { useAuthStore } from '../../store/authStrore';
import { useModalStore } from '../../store/modalStore';

// 임시로 사용할 가짜 메시지 데이터

export type Group = {
  group_id: string;
  group_title: string;
  made_by: string;
};

function Chat() {
  console.log('Chat 컴포넌트 시작');

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [leader, setLeader] = useState<string | null>(null); // 그룹 리더 아이디
  const canvas_id = useCanvasStore((state) => state.canvas_id);
  const { user, isLoggedIn } = useAuthStore();
  const { openLoginModal, isGroupModalOpen, openChat, closeChat } =
    useModalStore();

  // 채팅 소켓 연결 - 유효한 group_id가 있을 때만
  const { sendMessage: sendSocketMessage, leaveChat } = useChatSocket({
    onMessageReceived: (message) => {
      console.log('메시지 수신:', message);
      const newMessage: Message = {
        messageId: message.id.toString(),
        user: {
          userId: message.user.id.toString(),
          name: message.user.user_name,
        },
        content: message.message,
        timestamp: message.created_at,
      };
      setMessages((prev) => [...prev, newMessage]);
    },

    group_id: currentGroupId || '0', // 유효하지 않은 group_id 사용
    user_id: user?.userId || '',
  });

  // const {getChatMessages} = chatService();

  // 그룹 변경 핸들러 함수
  const handleGroupChange = async (groupId: string) => {
    if (groupId === currentGroupId) return;

    try {
      setCurrentGroupId(groupId);
      setIsLoading(true); // 로딩 시작
      const { newMessages, madeBy } =
        await chatService.getChatMessages(groupId);
      setLeader(madeBy);
      setMessages(newMessages); // 메시지 상태 업데이트
    } catch (error) {
      console.error(
        `${groupId} 그룹의 메시지를 불러오는 데 실패했습니다.`,
        error
      );
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // Title은 거의 동일 => useMemo로 기억
  const chatTitle = useMemo(() => {
    const currentGroup = groups.find((g) => g.group_id === currentGroupId);
    const title = currentGroup ? currentGroup.group_title : '채팅';
    return title.length > 15 ? `${title.substring(0, 15)}...` : title;
  }, [groups, currentGroupId]);

  // 메시지 보내는 로직
  const handleSendMessage = (text: string) => {
    console.log('메시지 전송 시도:', {
      text,
      currentGroupId,
      userId: user?.userId,
    });
    if (currentGroupId && user?.userId) {
      sendSocketMessage(text);
    }
  };

  const requestAdditionalMsg = () => {
    console.log('요청 보내기');
  };

  // 모달 열림 또는 로그아웃 시 채팅창 닫기
  useEffect(() => {
    if (isOpen && (isGroupModalOpen || !isLoggedIn)) {
      setIsOpen(false);
      closeChat();
    }
  }, [isGroupModalOpen, isLoggedIn, isOpen, closeChat]);

  // isOpen True 시, canvasId 변경시
  useEffect(() => {
    console.log(`modal open, ${canvas_id}`);
    if (isOpen && canvas_id) {
      const fetchInitialData = async () => {
        console.log(`start fetch, ${canvas_id}`);
        setIsLoading(true); // 로딩 시작
        try {
          const {
            defaultGroupId,
            groups: fetchedGroups,
            messages: initialMessages,
          } = await chatService.getChatInitMessages(canvas_id);
          setGroups(fetchedGroups);
          setCurrentGroupId(defaultGroupId);
          setMessages(initialMessages);
        } catch (error) {
          console.error('초기 채팅 데이터를 불러오는 데 실패했습니다.', error);
        } finally {
          setIsLoading(false); // 로딩 종료
        }
      };

      fetchInitialData();
    }
  }, [isOpen, canvas_id]);

  return (
    <div
      className={`fixed bottom-4 left-2 z-50 flex flex-col items-start ${!isOpen ? 'pointer-events-none' : ''}`}
    >
      {/* 채팅창 UI */}
      <div
        className={`mb-2 flex h-[500px] w-80 flex-col rounded-xl border border-white/30 bg-black/30 shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      >
        <div className='flex h-full flex-col'>
          {/* 헤더: 동적 제목 표시 */}
          <div className='flex-shrink-0 border-b border-white/30 p-3'>
            <h3 className='text-md font-semibold text-ellipsis text-white'>
              {chatTitle}
            </h3>
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
                {group.made_by === user?.userId
                  ? group.group_title.length > 10
                    ? `👑 ${group.group_title.substring(0, 10)}...`
                    : group.group_title
                  : group.group_title.length > 10
                    ? `${group.group_title.substring(0, 10)}...`
                    : group.group_title}
              </button>
            ))}
          </div>

          {/* 메시지 목록 또는 스피너 */}
          {isLoading ? (
            <div className='flex flex-grow items-center justify-center'>
              <div
                className='h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-500 motion-reduce:animate-[spin_1.5s_linear_infinite]'
                role='status'
              />
            </div>
          ) : (
            <MessageList messages={messages} />
          )}

          {/* 메시지 입력창 */}
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      {/* 채팅창 여닫기 버튼 */}
      <button
        onClick={() => {
          // 로그인 상태 확인
          if (!isLoggedIn) {
            openLoginModal();
            return;
          }

          if (isOpen) {
            leaveChat();
            setIsOpen(false);
            closeChat(); // Synchronize with modal store
          } else {
            setIsOpen(true);
            openChat(); // Synchronize with modal store
          }
        }}
        className='pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-xl transition-transform hover:bg-blue-600 active:scale-90'
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

export default React.memo(Chat);
