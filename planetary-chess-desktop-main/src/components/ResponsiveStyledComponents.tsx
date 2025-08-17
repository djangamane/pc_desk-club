import React, { ReactNode, CSSProperties } from 'react';
import { useResponsive } from '../contexts/ResponsiveContext';
import { 
  createResponsiveButtonStyles,
  createResponsivePanelStyles,
  createResponsiveTextStyles,
  createResponsiveAvatarStyles,
  createResponsiveChessboardStyles,
  createResponsiveLayoutStyles,
  getResponsiveFontSize,
  getResponsiveSpacing,
} from '../styles/responsiveStyles';

/**
 * Responsive styled components that automatically adapt to layout mode
 * These components replace inline styles with responsive alternatives
 */

/**
 * ResponsiveButton component props
 */
export interface ResponsiveButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'subtle';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * ResponsiveButton component with automatic styling based on layout mode
 */
export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'base',
  disabled = false,
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const { layoutMode } = useResponsive();
  const buttonStyles = createResponsiveButtonStyles(layoutMode, variant, size);
  
  const combinedStyles: CSSProperties = {
    ...buttonStyles,
    ...style,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      style={combinedStyles}
      data-testid={testId}
    >
      {children}
    </button>
  );
};

/**
 * ResponsivePanel component props
 */
export interface ResponsivePanelProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'overlay';
  withGlow?: boolean;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * ResponsivePanel component with automatic styling based on layout mode
 */
export const ResponsivePanel: React.FC<ResponsivePanelProps> = ({
  children,
  variant = 'primary',
  withGlow = true,
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const { layoutMode } = useResponsive();
  const panelStyles = createResponsivePanelStyles(layoutMode, variant, withGlow);
  
  const combinedStyles: CSSProperties = {
    ...panelStyles,
    ...style,
  };

  return (
    <div
      className={className}
      style={combinedStyles}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveText component props
 */
export interface ResponsiveTextProps {
  children: ReactNode;
  variant?: 'heading' | 'body' | 'caption' | 'accent';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * ResponsiveText component with automatic styling based on layout mode
 */
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  size = 'base',
  as: Component = 'div',
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const { layoutMode } = useResponsive();
  const textStyles = createResponsiveTextStyles(layoutMode, variant, size);
  
  const combinedStyles: CSSProperties = {
    ...textStyles,
    ...style,
  };

  return (
    <Component
      className={className}
      style={combinedStyles}
      data-testid={testId}
    >
      {children}
    </Component>
  );
};

/**
 * ResponsiveAvatar component props
 */
export interface ResponsiveAvatarProps {
  children: ReactNode;
  size: number;
  withGlow?: boolean;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * ResponsiveAvatar component with automatic styling based on layout mode
 */
export const ResponsiveAvatar: React.FC<ResponsiveAvatarProps> = ({
  children,
  size,
  withGlow = true,
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const { layoutMode } = useResponsive();
  const avatarStyles = createResponsiveAvatarStyles(layoutMode, size, withGlow);
  
  const combinedStyles: CSSProperties = {
    ...avatarStyles,
    ...style,
  };

  return (
    <div
      className={className}
      style={combinedStyles}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveContainer component props
 */
export interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * ResponsiveContainer component with automatic layout based on layout mode
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth,
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const { layoutMode, viewportInfo } = useResponsive();
  const layoutStyles = createResponsiveLayoutStyles(layoutMode, viewportInfo);
  
  const combinedStyles: CSSProperties = {
    ...layoutStyles,
    ...style,
    ...(maxWidth && { maxWidth }),
  };

  return (
    <div
      className={className}
      style={combinedStyles}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveSpacing component props
 */
export interface ResponsiveSpacingProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  direction?: 'horizontal' | 'vertical' | 'both';
  className?: string;
  style?: CSSProperties;
}

/**
 * ResponsiveSpacing component for consistent spacing across layout modes
 */
export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  size = 'base',
  direction = 'both',
  className = '',
  style = {},
}) => {
  const { layoutMode } = useResponsive();
  const spacing = getResponsiveSpacing(size, layoutMode);
  
  const spacingStyles: CSSProperties = {
    ...(direction === 'horizontal' || direction === 'both' ? { marginLeft: `${spacing}px`, marginRight: `${spacing}px` } : {}),
    ...(direction === 'vertical' || direction === 'both' ? { marginTop: `${spacing}px`, marginBottom: `${spacing}px` } : {}),
    ...style,
  };

  return <div className={className} style={spacingStyles} />;
};

/**
 * ResponsiveGrid component props
 */
export interface ResponsiveGridProps {
  children: ReactNode;
  columns?: { mobile: number; tablet: number; desktop: number; 'large-desktop': number };
  gap?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * ResponsiveGrid component with automatic column adjustment based on layout mode
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3, 'large-desktop': 4 },
  gap = 'base',
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const { layoutMode } = useResponsive();
  const gridGap = getResponsiveSpacing(gap, layoutMode);
  const columnCount = columns[layoutMode];
  
  const gridStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
    gap: `${gridGap}px`,
    ...style,
  };

  return (
    <div
      className={className}
      style={gridStyles}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveFlex component props
 */
export interface ResponsiveFlexProps {
  children: ReactNode;
  direction?: { mobile: 'row' | 'column'; tablet: 'row' | 'column'; desktop: 'row' | 'column'; 'large-desktop': 'row' | 'column' };
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  wrap?: boolean;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * ResponsiveFlex component with automatic flex direction based on layout mode
 */
export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  direction = { mobile: 'column', tablet: 'column', desktop: 'row', 'large-desktop': 'row' },
  align = 'stretch',
  justify = 'flex-start',
  gap = 'base',
  wrap = false,
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const { layoutMode } = useResponsive();
  const flexGap = getResponsiveSpacing(gap, layoutMode);
  const flexDirection = direction[layoutMode];
  
  const flexStyles: CSSProperties = {
    display: 'flex',
    flexDirection,
    alignItems: align,
    justifyContent: justify,
    gap: `${flexGap}px`,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  };

  return (
    <div
      className={className}
      style={flexStyles}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveImage component props
 */
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: { mobile: number; tablet: number; desktop: number; 'large-desktop': number };
  aspectRatio?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * ResponsiveImage component with automatic sizing based on layout mode
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes = { mobile: 100, tablet: 120, desktop: 150, 'large-desktop': 180 },
  aspectRatio = 1,
  objectFit = 'cover',
  className = '',
  style = {},
  'data-testid': testId,
}) => {
  const { layoutMode } = useResponsive();
  const imageSize = sizes[layoutMode];
  
  const imageStyles: CSSProperties = {
    width: `${imageSize}px`,
    height: `${imageSize / aspectRatio}px`,
    objectFit,
    ...style,
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={imageStyles}
      data-testid={testId}
    />
  );
};

