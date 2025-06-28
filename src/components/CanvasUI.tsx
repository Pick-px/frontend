import React, { useState } from 'react';

type HoverPos = { x: number; y: number } | null;

type CanvasUIProps = {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  hoverPos: HoverPos;
  colors: string[];
  onSelectColor: (color: string) => void;
  onConfirm: () => void;
};

export default function CanvasUI({
  color,
  setColor,
  hoverPos,
  colors,
  onConfirm,
  onSelectColor,
}: CanvasUIProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <>
      {/* 컬러 피커 */}
      <div className='pointer-events-auto fixed top-[10px] left-[10px] z-[9999]'>
        <input
          type='color'
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className='h-[40px] w-[40px] cursor-pointer rounded-[4px] border-2 border-solid border-white p-0'
        />
      </div>

      {/* 좌표 표시창 */}
      <div className='pointer-events-none fixed top-[50px] right-[20px] z-[9999] rounded-[8px] bg-[rgba(0,0,0,0.8)] p-[10px] text-white'>
        {hoverPos ? `(${hoverPos.x}, ${hoverPos.y})` : 'Canvas outside'}
      </div>

      {/* 팔레트 */}
      <div className='pointer-events-auto fixed top-[100px] right-[20px] z-[9999] flex flex-col gap-[8px] rounded-[8px] bg-[rgba(0,0,0,0.8)] p-[10px]'>
        {colors.map((c, index) => (
          <button
            key={index}
            onClick={() => {
              setColor(c); // 기존 색상 업데이트
              onSelectColor(c); // 선택된 색상으로 즉시 preview 칠하기
            }}
            style={{ backgroundColor: c }}
            className={`h-[40px] w-[40px] cursor-pointer rounded-[4px] ${
              color === c
                ? 'border-[3px] border-solid border-white'
                : 'border border-solid border-[#666]'
            }`}
          />
        ))}

        {/*확정 버튼 */}
        <button
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => {
            setIsPressed(false);
            onConfirm();
          }}
          onMouseLeave={() => setIsPressed(false)}
          className={`mt-[8px] h-[40px] w-full cursor-pointer rounded-[4px] bg-white font-medium text-black transition-transform duration-100 ${
            isPressed ? 'scale-95' : 'scale-100'
          }`}
        >
          확정
        </button>
      </div>
    </>
  );
}
