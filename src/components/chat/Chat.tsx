import React, { useEffect, useMemo, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Message } from './MessageItem';
import { chatService } from './ChatAPI';
import { useCanvasStore } from '../../store/canvasStore';
import { useChatSocket } from '../SocketIntegration';
import { useAuthStore } from '../../store/authStrore';
import { useModalStore } from '../../store/modalStore';
import { useCanvasUiStore } from '../../store/canvasUiStore';
import { useChatStore } from '../../store/chatStore';
import { toast } from 'react-toastify';
import socketService from '../../services/socketService';

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
  const canvas_id = useCanvasStore((state) => state.canvas_id);
  const { leader, setLeader, isSyncEnabled, setIsSyncEnabled } = useChatStore();
  const { user, isLoggedIn } = useAuthStore();
  const { openLoginModal, isGroupModalOpen, openChat, closeChat } =
    useModalStore();

  // 채팅 소켓 연결 - 유효한 group_id가 있을 때만
  const {
    sendMessage: sendChatMessage,
    sendImageMessage,
    leaveChat,
  } = useChatSocket({
    // 일반 채팅 메시지 수신
    onMessageReceived: (message) => {
      console.log('채팅 메시지 수신:', message);

      // 일반 메시지 처리
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

    // 이미지 업로드 알림 수신
    onImageReceived: (message) => {
      console.log('이미지 업로드 알림 수신:', message);
      // 이미지 정보 추출
      const { url, x, y, width, height } = message;
      const syncState = useChatStore.getState().isSyncEnabled;
      console.log('현재 동기화 상태:', syncState);

      // 새로운 메시지 추가 - 방장이 이미지를 업로드했음을 알리는 메시지
      const newMessage: Message = {
        messageId: Date.now().toString(),
        user: {
          userId: '',
          name: '공지',
        },
        content: syncState
          ? ` 📣 방장이 새로운 이미지를 업로드했습니다. 화면에 표시됩니다.`
          : ` 📣 방장이 새로운 이미지를 업로드했습니다. 동기화 버튼을 클릭하여 화면에 표시하세요.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);

      // 동기화 상태일 때만 이미지 반영
      if (syncState) {
        // 이미지 반영
        document.dispatchEvent(
          new CustomEvent('group-image-received', {
            detail: { url, x, y, width, height },
          })
        );
      }
    },

    group_id: currentGroupId || '0', // 유효하지 않은 group_id 사용
    user_id: user?.userId || '',
  });

  // 그룹 변경 핸들러 함수
  const handleGroupChange = async (groupId: string) => {
    if (groupId === currentGroupId) return;

    try {
      setCurrentGroupId(groupId);
      setIsLoading(true); // 로딩 시작
      // 그룹 변경 시 동기화 상태 비활성화
      setIsSyncEnabled(false);
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
      sendChatMessage(text);
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

  // 채팅창 외부 클릭 시 닫기 (모바일용)
  useEffect(() => {
    if (!isOpen) return;

    // 모바일 디바이스인지 확인
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (!isMobile) return; // PC에서는 이벤트 리스너를 추가하지 않음

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      const chatContainer = document.querySelector('.chat-container');

      // 채팅창 내부 클릭이 아닌 경우에만 닫기
      if (chatContainer && !chatContainer.contains(target)) {
        setIsOpen(false);
        closeChat();
      }
    };

    // 모바일에서만 touchstart 이벤트 추가
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, closeChat]);

  // 컴포넌트 최상단
  useEffect(() => {
    if (isSyncEnabled && currentGroupId) {
      console.log('동기화 시작됨: ', isSyncEnabled);
      socketService.joinImg({ group_id: currentGroupId });
    }
  }, [isSyncEnabled, currentGroupId]);

  // isOpen True 시, canvasId 변경시
  useEffect(() => {
    if (isOpen && canvas_id) {
      const fetchInitialData = async () => {
        console.log(`start fetch, ${canvas_id}`);
        setIsLoading(true); // 로딩 시작
        // 채팅창 열 때 동기화 상태 초기화
        setIsSyncEnabled(false);
        setLeader('');
        try {
          const {
            defaultGroupId,
            groups: fetchedGroups,
            messages: initialMessages,
          } = await chatService.getChatInitMessages(canvas_id);
          // defaultGroupId 저장
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
        className={`chat-container mb-2 flex w-80 flex-col rounded-xl border border-white/30 bg-black/30 shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
        style={{
          touchAction: 'manipulation',
          height: '500px',
          maxHeight: '500px',
          position: 'relative',
          zIndex: 50,
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className='flex h-full flex-col'>
          {/* 헤더: 동적 제목 표시 */}
          <div className='flex flex-shrink-0 items-center justify-between border-b border-white/30 p-3'>
            <h3 className='text-md font-semibold text-ellipsis text-white'>
              {chatTitle}
            </h3>

            <div className='flex space-x-2'>
              {leader === user?.userId && (
                <label
                  className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 transition-all duration-300 hover:bg-white/20 hover:text-white'
                  title='이미지 업로드'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  <input
                    type='file'
                    accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // 이미지 첨부 처리
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            // 이미지 로드 완료 후 처리
                            useCanvasUiStore.getState().setShowPalette(false);

                            // 이미지 첨부 이벤트 발생 - 메인 화면과 동일한 기능
                            document.dispatchEvent(
                              new CustomEvent('canvas-image-attach', {
                                detail: {
                                  file,
                                  // 그룹 이미지 업로드를 위한 추가 정보
                                  groupUpload: true,
                                  groupId: currentGroupId,
                                  onConfirm: async (imageData: {
                                    x: number;
                                    y: number;
                                    width: number;
                                    height: number;
                                  }) => {
                                    if (!currentGroupId) return;

                                    try {
                                      // 1. 업로드 URL 요청
                                      const uploadUrl =
                                        await chatService.getGroupImageUploadUrl(
                                          currentGroupId,
                                          file.type
                                        );

                                      // 2. 해당 URL에 이미지 업로드
                                      await fetch(uploadUrl, {
                                        method: 'PUT',
                                        body: file,
                                        headers: {
                                          'Content-Type': file.type,
                                        },
                                      });

                                      // 3. 소켓으로 이미지 정보 전송
                                      const imageUrl = uploadUrl.split('?')[0]; // URL에서 쿼리 파라미터 제거

                                      // 소켓으로 이미지 정보 전송
                                      sendImageMessage({
                                        url: imageUrl,
                                        group_id: currentGroupId,
                                        x: imageData.x,
                                        y: imageData.y,
                                        width: imageData.width,
                                        height: imageData.height,
                                      });
                                    } catch (error) {
                                      console.error(
                                        '그룹 이미지 업로드 실패:',
                                        error
                                      );
                                    }
                                  },
                                },
                              })
                            );
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                    className='hidden'
                  />
                </label>
              )}
              <button
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${isSyncEnabled ? 'scale-110 animate-pulse bg-green-500 text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
                title='이미지 동기화'
                onClick={() => {
                  toast.info('이미지 동기화 중...');
                  // 동기화 상태 활성화
                  setIsSyncEnabled(true);
                }}
              >
                {isSyncEnabled ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                    />
                  </svg>
                )}
              </button>
            </div>
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
                  ? group.group_title.length > 5
                    ? `👑 ${group.group_title.substring(0, 5)}...`
                    : `👑 ${group.group_title}`
                  : group.group_title.length > 5
                    ? `${group.group_title.substring(0, 5)}...`
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
            setIsOpen(false);
            closeChat(); // Synchronize with modal store
          } else {
            setIsOpen(true);
            openChat(); // Synchronize with modal store
          }
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className='pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-xl transition-transform hover:bg-blue-600 active:scale-90'
        style={{ touchAction: 'manipulation' }}
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
