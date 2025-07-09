import { render } from '@testing-library/react';
import PixelCanvas from './PixelCanvas';

describe('PixelCanvas', () => {
  it('should measure rendering time', () => {
    const startTime = performance.now();
    render(<PixelCanvas />);
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    console.log(`PixelCanvas rendering time: ${renderTime} ms`);
    // You can add an assertion here if you have a specific performance target
    // expect(renderTime).toBeLessThan(100); // Example: expect rendering to be less than 100ms
  });
});
