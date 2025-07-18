import React from 'react';

type ImageEditorUIProps = {
  imageMode: boolean;
  setImageMode: (mode: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const ImageEditorUI = ({
  imageMode,
  setImageMode,
  onConfirm,
  onCancel,
}: ImageEditorUIProps) => {
  return (
    <div className='pointer-events-auto fixed top-1/2 right-5 z-[10000] -translate-y-1/2'>
      <div className='max-w-xs rounded-xl border border-gray-700/50 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-sm'>
        <div className='mb-4 flex items-center gap-2'>
          <div className='h-3 w-3 animate-pulse rounded-full bg-blue-500'></div>
          <h3 className='text-sm font-semibold text-white'>이미지 편집 모드</h3>
        </div>

        <div className='mb-4'>
          <div className='flex gap-1 rounded-lg bg-gray-800 p-1'>
            <button
              onClick={() => setImageMode(true)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                imageMode
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              🖼️ 이미지
            </button>
            <button
              onClick={() => setImageMode(false)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                !imageMode
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              🎨 캔버스
            </button>
          </div>
        </div>

        <div className='mb-4 space-y-2 text-xs text-gray-300'>
          {imageMode ? (
            <div className='rounded-lg border border-blue-500/20 bg-blue-500/10 p-3'>
              <div className='mb-2 font-medium text-blue-300'>
                🖼️ 이미지 모드
              </div>
              <div className='space-y-1'>
                <div>• 좌클릭 드래그: 이미지 이동</div>
                <div>• 마우스 휠: 이미지 크기 조절</div>
                <div>• 핸들 드래그: 정밀 크기 조절</div>
              </div>
            </div>
          ) : (
            <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-3'>
              <div className='mb-2 font-medium text-purple-300'>
                🎨 캔버스 모드
              </div>
              <div className='space-y-1'>
                <div>• 좌클릭 드래그: 캔버스 이동</div>
                <div>• 마우스 휠: 캔버스 확대/축소</div>
                <div>• 이미지는 고정된 상태</div>
              </div>
            </div>
          )}
        </div>

        <div className='flex gap-2'>
          <button
            onClick={onConfirm}
            className='flex-1 transform rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:from-green-600 hover:to-emerald-600 active:scale-95'
          >
            ✓ 확정
          </button>
          <button
            onClick={onCancel}
            className='flex-1 transform rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:from-red-600 hover:to-rose-600 active:scale-95'
          >
            ✕ 취소
          </button>
        </div>
        <div className='mt-3 border-t border-gray-700/50 pt-3 text-center text-xs text-gray-400'>
          확정하면 픽셀 그리기가 가능합니다
        </div>
      </div>
    </div>
  );
};

export default ImageEditorUI;
