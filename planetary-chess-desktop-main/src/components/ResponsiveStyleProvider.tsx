import React, { useEffect, ReactNode } from 'react';
import { useResponsive } from '../contexts/ResponsiveContext';
import { 
  createResponsiveStyles, 
  generateResponsiveAnimationCSS,
  FUTURISTIC_THEME 
} from '../styles/responsiveStyles';

/**
 * Props for ResponsiveStyleProvider component
 */
export interface ResponsiveStyleProviderProps {
  children: ReactNode;
  /** Whether to inject global CSS animations */
  includeAnimations?: boolean;
  /** Additional CSS to inject */
  additionalCSS?: string;
}

/**
 * ResponsiveStyleProvider component
 * Injects responsive CSS custom properties and animations into the document
 */
export const ResponsiveStyleProvider: React.FC<ResponsiveStyleProviderProps> = ({
  children,
  includeAnimations = true,
  additionalCSS = '',
}) => {
  const { layoutMode, viewportInfo } = useResponsive();

  useEffect(() => {
    // Generate responsive CSS custom properties
    const responsiveProperties = createResponsiveStyles(layoutMode, viewportInfo);
    
    // Apply CSS custom properties to document root
    const root = document.documentElement;
    Object.entries(responsiveProperties).forEach(([property, value]) => {
      root.style.setProperty(property, String(value));
    });

    // Inject global CSS if it doesn't exist
    const existingStyle = document.getElementById('responsive-global-styles');
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = 'responsive-global-styles';
      
      let cssContent = `
        /* Responsive Global Styles */
        :root {
          --futuristic-primary: ${FUTURISTIC_THEME.colors.primary};
          --futuristic-primary-dark: ${FUTURISTIC_THEME.colors.primaryDark};
          --futuristic-primary-light: ${FUTURISTIC_THEME.colors.primaryLight};
          --futuristic-secondary: ${FUTURISTIC_THEME.colors.secondary};
          --futuristic-bg-primary: ${FUTURISTIC_THEME.colors.background.primary};
          --futuristic-bg-secondary: ${FUTURISTIC_THEME.colors.background.secondary};
          --futuristic-bg-tertiary: ${FUTURISTIC_THEME.colors.background.tertiary};
          --futuristic-bg-overlay: ${FUTURISTIC_THEME.colors.background.overlay};
          --futuristic-text-primary: ${FUTURISTIC_THEME.colors.text.primary};
          --futuristic-text-secondary: ${FUTURISTIC_THEME.colors.text.secondary};
          --futuristic-text-accent: ${FUTURISTIC_THEME.colors.text.accent};
          --futuristic-border: ${FUTURISTIC_THEME.colors.border};
          --futuristic-shadow: ${FUTURISTIC_THEME.colors.shadow};
          --futuristic-glow: ${FUTURISTIC_THEME.colors.glow};
        }

        /* Base responsive utilities */
        .responsive-container {
          width: 100%;
          max-width: var(--chessboard-max-width, 100%);
          margin: 0 auto;
          padding: var(--layout-padding, 1rem);
        }

        .responsive-flex {
          display: flex;
          flex-direction: var(--layout-direction, column);
          gap: var(--layout-gap, 1rem);
        }

        .responsive-text-heading {
          font-family: "Orbitron", sans-serif;
          font-weight: 800;
          background: ${FUTURISTIC_THEME.gradients.text};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: ${FUTURISTIC_THEME.effects.textShadow};
          letter-spacing: 2px;
        }

        .responsive-text-body {
          color: var(--futuristic-text-primary);
          text-shadow: ${FUTURISTIC_THEME.effects.textShadow};
          line-height: 1.4;
        }

        .responsive-text-caption {
          font-family: "Orbitron", sans-serif;
          font-weight: 600;
          color: var(--futuristic-text-secondary);
          letter-spacing: 1px;
        }

        .responsive-panel {
          background: var(--futuristic-bg-overlay);
          border: 1px solid var(--futuristic-border);
          border-radius: 12px;
          backdrop-filter: blur(5px);
          box-shadow: ${FUTURISTIC_THEME.effects.boxShadow.moderate}, ${FUTURISTIC_THEME.effects.boxShadow.inset};
        }

        .responsive-button {
          font-family: "Orbitron", sans-serif;
          font-weight: bold;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--futuristic-border);
        }

        .responsive-button-primary {
          background: ${FUTURISTIC_THEME.gradients.button};
          color: var(--futuristic-text-primary);
          box-shadow: ${FUTURISTIC_THEME.effects.boxShadow.moderate}, ${FUTURISTIC_THEME.effects.boxShadow.inset};
        }

        .responsive-button-secondary {
          background: linear-gradient(135deg, var(--futuristic-bg-tertiary) 0%, #2b4f8a 100%);
          color: var(--futuristic-text-primary);
          box-shadow: ${FUTURISTIC_THEME.effects.boxShadow.subtle};
        }

        .responsive-avatar {
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--futuristic-border);
          background: radial-gradient(circle at center, var(--futuristic-bg-primary) 0%, var(--futuristic-bg-secondary) 90%);
          position: relative;
        }

        .responsive-glow {
          box-shadow: ${FUTURISTIC_THEME.effects.glow.moderate}, ${FUTURISTIC_THEME.effects.boxShadow.inset};
        }

        .responsive-glow-strong {
          box-shadow: ${FUTURISTIC_THEME.effects.glow.strong}, ${FUTURISTIC_THEME.effects.boxShadow.inset};
        }

        /* Responsive breakpoint utilities */
        @media (max-width: 767px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .hide-tablet { display: none !important; }
          .show-tablet { display: block !important; }
        }

        @media (min-width: 1024px) {
          .hide-desktop { display: none !important; }
          .show-desktop { display: block !important; }
        }

        @media (min-width: 1440px) {
          .hide-large-desktop { display: none !important; }
          .show-large-desktop { display: block !important; }
        }

        /* Hover effects for desktop */
        @media (min-width: 1024px) {
          .responsive-button:hover {
            transform: translateY(-2px);
            box-shadow: ${FUTURISTIC_THEME.effects.glow.moderate}, ${FUTURISTIC_THEME.effects.boxShadow.inset};
          }

          .responsive-panel:hover {
            box-shadow: ${FUTURISTIC_THEME.effects.glow.strong}, ${FUTURISTIC_THEME.effects.boxShadow.inset};
          }
        }
      `;

      // Add animations if requested
      if (includeAnimations) {
        cssContent += '\n' + generateResponsiveAnimationCSS();
      }

      // Add additional CSS if provided
      if (additionalCSS) {
        cssContent += '\n' + additionalCSS;
      }

      styleElement.textContent = cssContent;
      document.head.appendChild(styleElement);
    }

    // Cleanup function
    return () => {
      // Remove CSS custom properties on unmount
      const root = document.documentElement;
      Object.keys(responsiveProperties).forEach((property) => {
        root.style.removeProperty(property);
      });
    };
  }, [layoutMode, viewportInfo, includeAnimations, additionalCSS]);

  return <>{children}</>;
};

/**
 * Hook to get responsive CSS class names based on current layout mode
 */
export const useResponsiveClasses = () => {
  const { layoutMode } = useResponsive();
  
  return {
    container: 'responsive-container',
    flex: 'responsive-flex',
    panel: 'responsive-panel',
    button: 'responsive-button',
    buttonPrimary: 'responsive-button responsive-button-primary',
    buttonSecondary: 'responsive-button responsive-button-secondary',
    textHeading: 'responsive-text-heading',
    textBody: 'responsive-text-body',
    textCaption: 'responsive-text-caption',
    avatar: 'responsive-avatar',
    glow: 'responsive-glow',
    glowStrong: 'responsive-glow-strong',
    hideMobile: 'hide-mobile',
    showMobile: 'show-mobile',
    hideTablet: 'hide-tablet',
    showTablet: 'show-tablet',
    hideDesktop: 'hide-desktop',
    showDesktop: 'show-desktop',
    hideLargeDesktop: 'hide-large-desktop',
    showLargeDesktop: 'show-large-desktop',
    layoutMode: `layout-${layoutMode}`,
  };
};

/**
 * Hook to get responsive inline styles for specific components
 */
export const useResponsiveStyles = () => {
  const { layoutMode, viewportInfo, calculateDynamicSize } = useResponsive();
  
  return {
    layoutMode,
    viewportInfo,
    calculateDynamicSize,
    
    // Style generators
    getButtonStyles: (variant: 'primary' | 'secondary' | 'subtle' = 'primary', size: 'sm' | 'base' | 'lg' = 'base') => 
      import('../styles/responsiveStyles').then(module => 
        module.createResponsiveButtonStyles(layoutMode, variant, size)
      ),
    
    getPanelStyles: (variant: 'primary' | 'secondary' | 'overlay' = 'primary', withGlow: boolean = true) =>
      import('../styles/responsiveStyles').then(module => 
        module.createResponsivePanelStyles(layoutMode, variant, withGlow)
      ),
    
    getTextStyles: (variant: 'heading' | 'body' | 'caption' | 'accent' = 'body', size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' = 'base') =>
      import('../styles/responsiveStyles').then(module => 
        module.createResponsiveTextStyles(layoutMode, variant, size)
      ),
    
    getAvatarStyles: (size: number, withGlow: boolean = true) =>
      import('../styles/responsiveStyles').then(module => 
        module.createResponsiveAvatarStyles(layoutMode, size, withGlow)
      ),
    
    getChessboardStyles: (size: number) =>
      import('../styles/responsiveStyles').then(module => 
        module.createResponsiveChessboardStyles(layoutMode, size)
      ),
    
    getLayoutStyles: () =>
      import('../styles/responsiveStyles').then(module => 
        module.createResponsiveLayoutStyles(layoutMode, viewportInfo)
      ),
  };
};

export default ResponsiveStyleProvider;