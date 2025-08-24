import React from 'react';
import { Button, Card, Layout, Typography, Avatar, Badge, Progress, Statistic, Tooltip } from 'antd';
import { 
  TrophyOutlined, 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { customStyles } from '../../styles/antdTheme';

const { Text, Title } = Typography;

// User Profile Card Component
interface UserProfileCardProps {
  user: {
    username: string;
    email: string;
    avatar?: string;
  };
  stats: {
    totalScore: number;
    totalSolved: number;
    totalAttempts: number;
    avgScore: number;
  };
  onLogout?: () => void;
  onSettings?: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  stats,
  onLogout,
  onSettings,
}) => {
  return (
    <Card
      style={{
        ...customStyles.glassCard,
        marginBottom: 16,
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Avatar
          size={48}
          src={user.avatar}
          icon={<UserOutlined />}
          style={{ marginRight: 12 }}
        />
        <div style={{ flex: 1 }}>
          <Title level={5} style={{ margin: 0, color: '#ffffff' }}>
            {user.username}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user.email}
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Settings">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={onSettings}
              style={{ color: '#a0a0a0' }}
            />
          </Tooltip>
          <Tooltip title="Logout">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={onLogout}
              style={{ color: '#a0a0a0' }}
            />
          </Tooltip>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Statistic
          title="Total Score"
          value={stats.totalScore}
          prefix={<TrophyOutlined />}
          valueStyle={{ color: '#1890ff', fontSize: 18 }}
        />
        <Statistic
          title="Solved"
          value={stats.totalSolved}
          prefix={<CheckCircleOutlined />}
          valueStyle={{ color: '#52c41a', fontSize: 18 }}
        />
        <Statistic
          title="Attempts"
          value={stats.totalAttempts}
          prefix={<ClockCircleOutlined />}
          valueStyle={{ color: '#faad14', fontSize: 18 }}
        />
        <Statistic
          title="Avg Score"
          value={stats.avgScore}
          precision={1}
          prefix={<StarOutlined />}
          valueStyle={{ color: '#13c2c2', fontSize: 18 }}
        />
      </div>
    </Card>
  );
};

// Game Status Card Component
interface GameStatusCardProps {
  gameMode: 'chess' | 'puzzle';
  status: 'idle' | 'playing' | 'thinking' | 'completed' | 'paused';
  currentScore?: number;
  timeElapsed?: number;
  movesPlayed?: number;
  difficulty?: number;
  onPause?: () => void;
  onReset?: () => void;
}

export const GameStatusCard: React.FC<GameStatusCardProps> = ({
  gameMode,
  status,
  currentScore = 0,
  timeElapsed = 0,
  movesPlayed = 0,
  difficulty,
  onPause,
  onReset,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'playing': return '#52c41a';
      case 'thinking': return '#faad14';
      case 'completed': return '#1890ff';
      case 'paused': return '#ff4d4f';
      default: return '#a0a0a0';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'playing': return `${gameMode === 'chess' ? 'Game' : 'Puzzle'} Active`;
      case 'thinking': return 'AI Thinking...';
      case 'completed': return `${gameMode === 'chess' ? 'Game' : 'Puzzle'} Complete`;
      case 'paused': return 'Paused';
      default: return 'Ready';
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#ffffff' }}>
            {gameMode === 'chess' ? 'Chess Game' : 'Puzzle Mode'}
          </span>
          <Badge
            color={getStatusColor()}
            text={getStatusText()}
            style={{ color: getStatusColor() }}
          />
        </div>
      }
      style={{
        ...customStyles.glassCard,
        marginBottom: 16,
      }}
      bodyStyle={{ padding: 16 }}
      actions={[
        onPause && (
          <Button
            key="pause"
            type="text"
            icon={status === 'paused' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            onClick={onPause}
            style={{ color: '#a0a0a0' }}
          >
            {status === 'paused' ? 'Resume' : 'Pause'}
          </Button>
        ),
        onReset && (
          <Button
            key="reset"
            type="text"
            icon={<CloseCircleOutlined />}
            onClick={onReset}
            style={{ color: '#a0a0a0' }}
          >
            Reset
          </Button>
        ),
      ].filter(Boolean)}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
            Current Score
          </Text>
          <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
            {currentScore}
          </Text>
        </div>
        
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
            Time Elapsed
          </Text>
          <Text strong style={{ fontSize: 20, color: '#52c41a' }}>
            {formatTime(timeElapsed)}
          </Text>
        </div>
        
        <div>
          <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
            Moves Played
          </Text>
          <Text strong style={{ fontSize: 20, color: '#faad14' }}>
            {movesPlayed}
          </Text>
        </div>
        
        {difficulty && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
              Difficulty
            </Text>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[...Array(5)].map((_, i) => (
                <StarOutlined
                  key={i}
                  style={{
                    color: i < difficulty ? '#faad14' : '#404040',
                    fontSize: 16,
                    marginRight: 2,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Quick Action Buttons Component
interface QuickActionsProps {
  onNewGame?: () => void;
  onLoadGame?: () => void;
  onSaveGame?: () => void;
  onShowHint?: () => void;
  onShowSolution?: () => void;
  isGameActive?: boolean;
  isPuzzleMode?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onNewGame,
  onLoadGame,
  onSaveGame,
  onShowHint,
  onShowSolution,
  isGameActive = false,
  isPuzzleMode = false,
}) => {
  return (
    <Card
      title={<span style={{ color: '#ffffff' }}>Quick Actions</span>}
      style={{
        ...customStyles.glassCard,
        marginBottom: 16,
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {onNewGame && (
          <Button
            type="primary"
            block
            onClick={onNewGame}
            style={customStyles.primaryButton}
          >
            New {isPuzzleMode ? 'Puzzle' : 'Game'}
          </Button>
        )}
        
        {onLoadGame && (
          <Button
            block
            onClick={onLoadGame}
            disabled={!isGameActive}
          >
            Load Game
          </Button>
        )}
        
        {onSaveGame && (
          <Button
            block
            onClick={onSaveGame}
            disabled={!isGameActive}
          >
            Save Game
          </Button>
        )}
        
        {isPuzzleMode && onShowHint && (
          <Button
            block
            onClick={onShowHint}
            disabled={!isGameActive}
            icon={<QuestionCircleOutlined />}
          >
            Show Hint
          </Button>
        )}
        
        {isPuzzleMode && onShowSolution && (
          <Button
            block
            onClick={onShowSolution}
            disabled={!isGameActive}
            icon={<CheckCircleOutlined />}
            style={{
              ...customStyles.successButton,
              marginTop: 8,
            }}
          >
            Show Solution
          </Button>
        )}
      </div>
    </Card>
  );
};

// Progress Indicator Component
interface ProgressIndicatorProps {
  title: string;
  current: number;
  total: number;
  showPercent?: boolean;
  status?: 'normal' | 'exception' | 'active' | 'success';
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  title,
  current,
  total,
  showPercent = true,
  status = 'normal',
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <Card
      size="small"
      style={{
        ...customStyles.glassCard,
        marginBottom: 12,
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        {title}
      </Text>
      <Progress
        percent={percentage}
        showInfo={showPercent}
        status={status}
        strokeColor="#1890ff"
      />
      <Text type="secondary" style={{ fontSize: 12 }}>
        {current} / {total}
      </Text>
    </Card>
  );
};
