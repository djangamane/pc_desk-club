import { RESPONSIVE_CONFIG, getLayoutMode, calculateChessboardSize } from '../responsive';

describe('RESPONSIVE_CONFIG', () => {
  it('should have correct breakpoint values', () => {
    expect(RESPONSIVE_CONFIG.breakpoints.mobile).toBe(768);
    expect(RESPONSIVE_CONFIG.breakpoints.tablet).toBe(1024);
    expect(RESPONSIVE_CONFIG.breakpoints.desktop).toBe(1440);
  });

  it('should have chessboard size configurations for all layout modes', () => {
    expect(RESPONSIVE_CONFIG.chessboard.mobile).toEqual({ min: 320, max: 380 });
    expect(RESPONSIVE_CONFIG.chessboard.tablet).toEqual({ min: 450, max: 550 });
    expect(RESPONSIVE_CONFIG.chessboard.desktop).toEqual({ min: 600, max: 800 });
    expect(RESPONSIVE_CONFIG.chessboard.largeDesktop).toEqual({ min: 700, max: 900 });
  });

  it('should have layout configurations for all modes', () => {
    expect(RESPONSIVE_CONFIG.layout.mobile.direction).toBe('column');
    expect(RESPONSIVE_CONFIG.layout.tablet.direction).toBe('column');
    expect(RESPONSIVE_CONFIG.layout.desktop.direction).toBe('row');
    expect(RESPONSIVE_CONFIG.layout.largeDesktop.direction).toBe('row');
  });

  it('should have proper sidebar positioning for each layout', () => {
    expect(RESPONSIVE_CONFIG.layout.mobile.sidebar.position).toBe('bottom');
    expect(RESPONSIVE_CONFIG.layout.tablet.sidebar.position).toBe('bottom');
    expect(RESPONSIVE_CONFIG.layout.desktop.sidebar.position).toBe('right');
    expect(RESPONSIVE_CONFIG.layout.largeDesktop.sidebar.position).toBe('right');
  });
});

describe('getLayoutMode', () => {
  it('should return mobile for widths below mobile breakpoint', () => {
    expect(getLayoutMode(500)).toBe('mobile');
    expect(getLayoutMode(767)).toBe('mobile');
  });

  it('should return tablet for widths between mobile and tablet breakpoints', () => {
    expect(getLayoutMode(768)).toBe('tablet');
    expect(getLayoutMode(900)).toBe('tablet');
    expect(getLayoutMode(1023)).toBe('tablet');
  });

  it('should return desktop for widths between tablet and desktop breakpoints', () => {
    expect(getLayoutMode(1024)).toBe('desktop');
    expect(getLayoutMode(1200)).toBe('desktop');
    expect(getLayoutMode(1439)).toBe('desktop');
  });

  it('should return large-desktop for widths above desktop breakpoint', () => {
    expect(getLayoutMode(1440)).toBe('large-desktop');
    expect(getLayoutMode(1920)).toBe('large-desktop');
    expect(getLayoutMode(2560)).toBe('large-desktop');
  });

  it('should handle edge cases', () => {
    expect(getLayoutMode(0)).toBe('mobile');
    expect(getLayoutMode(10000)).toBe('large-desktop');
  });
});

describe('calculateChessboardSize', () => {
  describe('mobile layout', () => {
    it('should calculate size based on 90% of viewport width', () => {
      const viewportWidth = 400;
      const expectedSize = viewportWidth * 0.9; // 360
      const result = calculateChessboardSize(viewportWidth, 'mobile');
      expect(result).toBe(Math.min(380, Math.max(320, expectedSize)));
    });

    it('should respect minimum size constraint', () => {
      const viewportWidth = 300; // Would calculate to 270, below min of 320
      const result = calculateChessboardSize(viewportWidth, 'mobile');
      expect(result).toBe(320);
    });

    it('should respect maximum size constraint', () => {
      const viewportWidth = 500; // Would calculate to 450, above max of 380
      const result = calculateChessboardSize(viewportWidth, 'mobile');
      expect(result).toBe(380);
    });
  });

  describe('tablet layout', () => {
    it('should calculate size based on 90% of viewport width', () => {
      const viewportWidth = 600;
      const expectedSize = viewportWidth * 0.9; // 540
      const result = calculateChessboardSize(viewportWidth, 'tablet');
      expect(result).toBe(Math.min(550, Math.max(450, expectedSize)));
    });

    it('should respect minimum size constraint', () => {
      const viewportWidth = 400; // Would calculate to 360, below min of 450
      const result = calculateChessboardSize(viewportWidth, 'tablet');
      expect(result).toBe(450);
    });

    it('should respect maximum size constraint', () => {
      const viewportWidth = 700; // Would calculate to 630, above max of 550
      const result = calculateChessboardSize(viewportWidth, 'tablet');
      expect(result).toBe(550);
    });
  });

  describe('desktop layout', () => {
    it('should calculate size based on 40% of viewport width', () => {
      const viewportWidth = 1200;
      const expectedSize = viewportWidth * 0.4; // 480, but min is 600
      const result = calculateChessboardSize(viewportWidth, 'desktop');
      expect(result).toBe(600); // Should use minimum
    });

    it('should respect minimum size constraint', () => {
      const viewportWidth = 1000; // Would calculate to 400, below min of 600
      const result = calculateChessboardSize(viewportWidth, 'desktop');
      expect(result).toBe(600);
    });

    it('should respect maximum size constraint', () => {
      const viewportWidth = 2500; // Would calculate to 1000, above max of 800
      const result = calculateChessboardSize(viewportWidth, 'desktop');
      expect(result).toBe(800);
    });

    it('should calculate correctly within range', () => {
      const viewportWidth = 1800; // Would calculate to 720, within range
      const result = calculateChessboardSize(viewportWidth, 'desktop');
      expect(result).toBe(720);
    });
  });

  describe('large-desktop layout', () => {
    it('should calculate size based on 40% of viewport width', () => {
      const viewportWidth = 2000;
      const expectedSize = viewportWidth * 0.4; // 800
      const result = calculateChessboardSize(viewportWidth, 'large-desktop');
      expect(result).toBe(800);
    });

    it('should respect minimum size constraint', () => {
      const viewportWidth = 1500; // Would calculate to 600, below min of 700
      const result = calculateChessboardSize(viewportWidth, 'large-desktop');
      expect(result).toBe(700);
    });

    it('should respect maximum size constraint', () => {
      const viewportWidth = 3000; // Would calculate to 1200, above max of 900
      const result = calculateChessboardSize(viewportWidth, 'large-desktop');
      expect(result).toBe(900);
    });
  });
});