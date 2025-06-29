import React from 'react';

type CanvasModalContentProps = {
  onClose?: () => void;
};

const CanvasModalContent = ({ onClose }: CanvasModalContentProps) => {
  return (
    <>
      <h2 className='text-xl font-bold'>이벤트 캔버스 이동 버튼</h2>
    </>
  );
};

export default CanvasModalContent;
