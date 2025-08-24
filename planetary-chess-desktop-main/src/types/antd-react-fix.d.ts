// Type compatibility fixes for Ant Design with React 19
declare module 'react' {
  // Extend React.ReactNode to include bigint for Ant Design compatibility
  namespace React {
    type ReactNode = 
      | ReactElement
      | string
      | number
      | bigint  // Add bigint support
      | Iterable<ReactNode>
      | ReactPortal
      | boolean
      | null
      | undefined
      | Promise<ReactNode>;  // Add Promise support for React 19
  }
}

// Ant Design component type fixes
declare module '@ant-design/icons' {
  import { ComponentType } from 'react';
  
  interface AntdIconProps {
    className?: string;
    style?: React.CSSProperties;
    spin?: boolean;
    rotate?: number;
    twoToneColor?: string;
    onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  }

  // Export all icons as valid JSX components
  export const HomeOutlined: ComponentType<AntdIconProps>;
  export const GamepadOutlined: ComponentType<AntdIconProps>;
  export const ControlOutlined: ComponentType<AntdIconProps>;
  export const TrophyOutlined: ComponentType<AntdIconProps>;
  export const UserOutlined: ComponentType<AntdIconProps>;
  export const SettingOutlined: ComponentType<AntdIconProps>;
  export const MenuOutlined: ComponentType<AntdIconProps>;
  export const CloseOutlined: ComponentType<AntdIconProps>;
  export const BulbOutlined: ComponentType<AntdIconProps>;
  export const PlayCircleOutlined: ComponentType<AntdIconProps>;
  export const PauseCircleOutlined: ComponentType<AntdIconProps>;
  export const ReloadOutlined: ComponentType<AntdIconProps>;
  export const BellOutlined: ComponentType<AntdIconProps>;
  export const SecurityScanOutlined: ComponentType<AntdIconProps>;
  export const ExperimentOutlined: ComponentType<AntdIconProps>;
  export const DeleteOutlined: ComponentType<AntdIconProps>;
  export const SaveOutlined: ComponentType<AntdIconProps>;
  export const EditOutlined: ComponentType<AntdIconProps>;
  export const UploadOutlined: ComponentType<AntdIconProps>;
  export const CalendarOutlined: ComponentType<AntdIconProps>;
  export const FireOutlined: ComponentType<AntdIconProps>;
  export const StarOutlined: ComponentType<AntdIconProps>;
  export const CrownOutlined: ComponentType<AntdIconProps>;
  export const FilterOutlined: ComponentType<AntdIconProps>;
}

declare module 'antd' {
  import { ComponentType, PropsWithChildren } from 'react';

  // Layout components
  export const Layout: ComponentType<PropsWithChildren<{
    style?: React.CSSProperties;
    className?: string;
  }>> & {
    Header: ComponentType<PropsWithChildren<{
      style?: React.CSSProperties;
      className?: string;
    }>>;
    Content: ComponentType<PropsWithChildren<{
      style?: React.CSSProperties;
      className?: string;
    }>>;
    Sider: ComponentType<PropsWithChildren<{
      style?: React.CSSProperties;
      className?: string;
      width?: number | string;
      collapsedWidth?: number | string;
      collapsed?: boolean;
      collapsible?: boolean;
      onCollapse?: (collapsed: boolean) => void;
      trigger?: React.ReactNode;
    }>>;
  };

  // Grid components
  export const Row: ComponentType<PropsWithChildren<{
    gutter?: number | [number, number];
    style?: React.CSSProperties;
    className?: string;
    align?: 'top' | 'middle' | 'bottom';
    justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
  }>>;

  export const Col: ComponentType<PropsWithChildren<{
    span?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
    style?: React.CSSProperties;
    className?: string;
    flex?: string | number;
    offset?: number;
    order?: number;
    pull?: number;
    push?: number;
  }>>;

  // Menu component
  export const Menu: ComponentType<{
    mode?: 'horizontal' | 'vertical' | 'inline';
    theme?: 'light' | 'dark';
    selectedKeys?: string[];
    items?: Array<{
      key: string;
      icon?: React.ReactNode;
      label: string;
      disabled?: boolean;
    }>;
    onClick?: (info: { key: string }) => void;
    style?: React.CSSProperties;
    className?: string;
  }>;

  // Button component
  export const Button: ComponentType<PropsWithChildren<{
    type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
    size?: 'large' | 'middle' | 'small';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    style?: React.CSSProperties;
    className?: string;
    block?: boolean;
    danger?: boolean;
    ghost?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    shape?: 'default' | 'circle' | 'round';
    title?: string;
  }>>;

  // Card component
  export const Card: ComponentType<PropsWithChildren<{
    title?: React.ReactNode;
    size?: 'default' | 'small';
    style?: React.CSSProperties;
    className?: string;
    bodyStyle?: React.CSSProperties;
    bordered?: boolean;
    hoverable?: boolean;
    loading?: boolean;
    actions?: React.ReactNode[];
  }>>;

  // Typography components
  namespace Typography {
    export const Title: ComponentType<PropsWithChildren<{
      level?: 1 | 2 | 3 | 4 | 5;
      style?: React.CSSProperties;
      className?: string;
    }>>;

    export const Text: ComponentType<PropsWithChildren<{
      type?: 'secondary' | 'success' | 'warning' | 'danger';
      strong?: boolean;
      italic?: boolean;
      underline?: boolean;
      delete?: boolean;
      code?: boolean;
      mark?: boolean;
      keyboard?: boolean;
      style?: React.CSSProperties;
      className?: string;
    }>>;
  }

  export const Typography: {
    Title: typeof Typography.Title;
    Text: typeof Typography.Text;
  };

  // Space component
  export const Space: ComponentType<PropsWithChildren<{
    direction?: 'horizontal' | 'vertical';
    size?: 'small' | 'middle' | 'large' | number;
    wrap?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }>>;

  // Divider component
  export const Divider: ComponentType<{
    style?: React.CSSProperties;
    className?: string;
    type?: 'horizontal' | 'vertical';
    orientation?: 'left' | 'right' | 'center';
    plain?: boolean;
  }>;

  // Statistic component
  export const Statistic: ComponentType<{
    title?: React.ReactNode;
    value?: string | number;
    precision?: number;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    valueStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    className?: string;
  }>;

  // Progress component
  export const Progress: ComponentType<{
    percent?: number;
    showInfo?: boolean;
    strokeColor?: string;
    size?: 'default' | 'small';
    status?: 'success' | 'exception' | 'normal' | 'active';
    style?: React.CSSProperties;
    className?: string;
  }>;

  // ... existing code ...
  export const Drawer: ComponentType<PropsWithChildren<{
    title?: React.ReactNode;
    placement?: 'top' | 'right' | 'bottom' | 'left';
    width?: number | string;
    height?: number | string;
    open?: boolean;
    onClose?: () => void;
    bodyStyle?: React.CSSProperties;
    headerStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    className?: string;
  }>>;

  // ConfigProvider component
  export const ConfigProvider: ComponentType<PropsWithChildren<{
    theme?: any;
    locale?: any;
    direction?: 'ltr' | 'rtl';
  }>>;
}

// Global module augmentation to suppress strict type checking for Ant Design
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      key?: React.Key | null | undefined;
    }
  }
  
  interface Window {
    electronAPI?: {
      onMenuAction: (callback: (action: string) => void) => void;
      getVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      database: any;
    };
  }
}

export {};
