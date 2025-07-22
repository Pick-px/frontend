import { create } from 'zustand';

interface TimeSyncState {
  serverTimeOffset: number;
  lastSyncTime: number;
  getSynchronizedServerTime: () => number;

  /**
   * @param eventTimestampString 이벤트가 발생할 예정인 서버의 UTC 타임스탬프 문자열 (예: "2024-07-15T00:00:00Z")
   * @param remainingTime 이벤트까지 남은 시간 (초 단위, 서버가 메시지를 보낼 때 기준)
   * @param clientReceiveTimestamp 클라이언트가 해당 메시지를 수신했을 때의 로컬 타임스탬프 (Date.now())
   */
  updateServerTimeOffset: (
    eventTimestampString: string,
    remain_time: number,
    clientReceiveTimestamp: number
  ) => void;
}

export const useTimeSyncStore = create<TimeSyncState>((set, get) => ({
  serverTimeOffset: 0,
  lastSyncTime: 0,

  getSynchronizedServerTime: () => {
    return Date.now() + get().serverTimeOffset;
  },

  updateServerTimeOffset: (
    eventTimestampString,
    remain_time,
    clientReceiveTimestamp
  ) => {
    const eventTimeMs = new Date(eventTimestampString).getTime();

    const serverTimeAtSend = eventTimeMs - remain_time * 1000;
    const newOffset = serverTimeAtSend - clientReceiveTimestamp;

    set({
      serverTimeOffset: newOffset,
      lastSyncTime: Date.now(), // 마지막 동기화 시간 기록
    });
  },
}));
