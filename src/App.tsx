// App.tsx

import PixelCanvas from './components/PixelCanvas';
import CanvasUI from './components/CanvasUI'; // UI 컴포넌트 import
import { useState } from 'react'; // UI 상태 관리를 위해 import

type HoverPos = { x: number; y: number } | null;

function App() {
  // UI와 캔버스가 공유해야 할 상태들을 App에서 관리 => 색상 정보 및 cursor 가 가리키는 픽셀 정보
  const [color, setColor] = useState('#ffffff');
  const [hoverPos, setHoverPos] = useState<HoverPos>(null);
  const colors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff']; // 예시 색상
  return (
    <main className='flex h-screen w-screen items-center justify-center bg-[#2d3748]'>
      <PixelCanvas
        color={color}
        setColor={setColor}
        hoverPos={hoverPos}
        setHoverPos={setHoverPos}
        colors={colors}
      />
    </main>
  );
}

export default App;
