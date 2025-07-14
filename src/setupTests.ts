import '@testing-library/jest-dom'; // 이 줄을 추가합니다.

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;