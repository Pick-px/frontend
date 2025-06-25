import PixelCanvas from './components/PixelCanvas';

function App() {
  return (
    // 전체 페이지를 어두운 배경과 중앙 정렬로 설정
    <main className='flex h-screen w-screen items-center justify-center bg-slate-800'>
      <PixelCanvas />
    </main>
  );
}

export default App;
