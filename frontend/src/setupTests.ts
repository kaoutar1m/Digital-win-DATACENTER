import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(public callback?: IntersectionObserverCallback, public options?: IntersectionObserverInit) {}
  
  observe(): void {
    // Implementation
  }
  
  disconnect(): void {
    // Implementation
  }
  
  unobserve(): void {
    // Implementation
  }
  
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  
  observe(): void {
    // Implementation
  }
  
  disconnect(): void {
    // Implementation
  }
  
  unobserve(): void {
    // Implementation
  }
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock WebGL context for Three.js
const createMockWebGLContext = () => ({
  getParameter: jest.fn(() => 1),
  getExtension: jest.fn(() => ({})),
  createShader: jest.fn(() => ({})),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn(() => ({})),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  getProgramParameter: jest.fn(() => true),
  getShaderParameter: jest.fn(() => true),
  getShaderInfoLog: jest.fn(() => ''),
  getProgramInfoLog: jest.fn(() => ''),
  createBuffer: jest.fn(() => ({})),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  createTexture: jest.fn(() => ({})),
  bindTexture: jest.fn(),
  texParameteri: jest.fn(),
  texImage2D: jest.fn(),
  activeTexture: jest.fn(),
  uniform1i: jest.fn(),
  uniform1f: jest.fn(),
  uniform2f: jest.fn(),
  uniform3f: jest.fn(),
  uniform4f: jest.fn(),
  uniformMatrix4fv: jest.fn(),
  getUniformLocation: jest.fn(() => ({})),
  getAttribLocation: jest.fn(() => 0),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  drawArrays: jest.fn(),
  drawElements: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),
  clear: jest.fn(),
  clearColor: jest.fn(),
  viewport: jest.fn(),
  scissor: jest.fn(),
  blendFunc: jest.fn(),
  cullFace: jest.fn(),
  frontFace: jest.fn(),
  depthFunc: jest.fn(),
  depthMask: jest.fn(),
  colorMask: jest.fn(),
  stencilFunc: jest.fn(),
  stencilOp: jest.fn(),
  stencilMask: jest.fn(),
  polygonOffset: jest.fn(),
  lineWidth: jest.fn(),
  pixelStorei: jest.fn(),
  readPixels: jest.fn(),
  generateMipmap: jest.fn(),
  compressedTexImage2D: jest.fn(),
  compressedTexSubImage2D: jest.fn(),
  deleteTexture: jest.fn(),
  deleteBuffer: jest.fn(),
  deleteProgram: jest.fn(),
  deleteShader: jest.fn(),
  canvas: document.createElement('canvas'),
  isContextLost: jest.fn(() => false),
} as unknown as WebGLRenderingContext);

// Override document.createElement to mock canvas WebGL context
const originalCreateElement = document.createElement.bind(document);
document.createElement = function <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions
): HTMLElementTagNameMap[K] {
  const element = originalCreateElement(tagName, options);
  
  if (tagName === 'canvas') {
    const originalGetContext = element.getContext.bind(element);
    
    (element as HTMLCanvasElement).getContext = function (
      contextId: string,
      options?: any
    ) {
      if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
        return createMockWebGLContext() as any;
      }
      if (contextId === '2d') {
        return originalGetContext(contextId, options);
      }
      return originalGetContext(contextId, options);
    } as any;
  }
  
  return element;
} as typeof document.createElement;

// Mock requestAnimationFrame if needed
global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  return setTimeout(callback, 0) as any;
});

global.cancelAnimationFrame = jest.fn((id: number) => {
  clearTimeout(id);
});