// components/CanvasUI.tsx (새 파일)
type HoverPos = { x: number; y: number } | null;

type CanvasUIProps = {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  hoverPos: HoverPos;
  colors: string[];
};
export default function CanvasUI({
  color,
  setColor,
  hoverPos,
  colors,
}: CanvasUIProps) {
  return (
    <>
      {/* 컬러 피커 */}
      <div className='pointer-events-auto fixed left-[10px] top-[10px] z-[9999]'>
        <input
          type='color'
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className='h-[40px] w-[40px] cursor-pointer rounded-[4px] border-2 border-solid border-white p-0'
        />
      </div>
      {/* 좌표 표시창 */}
      <div className='pointer-events-none fixed right-[20px] top-[50px] z-[9999] rounded-[8px] bg-[rgba(0,0,0,0.8)] p-[10px] text-white'>
        {hoverPos ? `(${hoverPos.x}, ${hoverPos.y})` : 'Canvas outside'}
      </div>
      {/* 팔레트 위치 */}
      <div className='pointer-events-auto fixed right-[20px] top-[100px] z-[9999] flex flex-col gap-[8px] rounded-[8px] bg-[rgba(0,0,0,0.8)] p-[10px]'>
        {colors.map((c, index) => (
          <button
            key={index}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`h-[40px] w-[40px] cursor-pointer rounded-[4px] ${
              color === c
                ? 'border-[3px] border-solid border-white'
                : 'border border-solid border-[#666]'
            }`}
          />
        ))}
      </div>
    </>
  );
}
