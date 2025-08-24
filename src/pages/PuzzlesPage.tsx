import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Typography, Space, Select, Statistic, Divider } from 'antd';
import { 
  BulbOutlined, 
  TrophyOutlined, 
  FilterOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  loadPuzzles, 
  setDifficultyFilter, 
  setThemeFilter,
  startQuizSession,
} from '../store/slices/quizSlice';
import QuizContainer from '../components/QuizContainer';
import { UserProfileCard, GameStatusCard, ProgressIndicator } from '../components/ui/DesktopUIComponents';
import { customStyles } from '../styles/antdTheme';

const { Title, Text } = Typography;
const { Option } = Select;

export const PuzzlesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const quizState = useAppSelector(state => state.quiz);
  const userState = useAppSelector(state => state.user);
  
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const {
    currentPuzzle,
    puzzleIndex,
    availablePuzzles,
    puzzleStatus,
    sessionStats,
    selectedDifficulty,
    selectedTheme,
    availableThemes,
    isLoadingPuzzles,
    error,
  } = quizState;

  const { currentUser, stats } = userState;

  // Timer effect for session time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionStats.sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - (sessionStats.sessionStartTime || 0)) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sessionStats.sessionStartTime]);

  // Load puzzles on component mount
  useEffect(() => {
    if (availablePuzzles.length === 0) {
      dispatch(loadPuzzles());
    }
  }, [dispatch, availablePuzzles.length]);

  // Start session on mount
  useEffect(() => {
    if (!sessionStats.sessionStartTime) {
      dispatch(startQuizSession());
      setSessionStartTime(Date.now());
    }
  }, [dispatch, sessionStats.sessionStartTime]);

  // Handle difficulty filter change
  const handleDifficultyChange = (difficulty: number | null) => {
    dispatch(setDifficultyFilter(difficulty));
  };

  // Handle theme filter change
  const handleThemeChange = (theme: string | null) => {
    dispatch(setThemeFilter(theme));
  };

  // Handle refresh puzzles
  const handleRefreshPuzzles = () => {
    const filters: { difficulty?: number; theme?: string } = {};
    if (selectedDifficulty) filters.difficulty = selectedDifficulty;
    if (selectedTheme) filters.theme = selectedTheme;
    dispatch(loadPuzzles(filters));
  };

  // Calculate session progress
  const sessionProgress = sessionStats.totalAttempts > 0 
    ? Math.round((sessionStats.puzzlesSolved / sessionStats.totalAttempts) * 100)
    : 0;

  const getGameStatus = () => {
    switch (puzzleStatus) {
      case 'in-progress': return 'playing';
      case 'solved': return 'completed';
      case 'failed': return 'paused';
      default: return 'idle';
    }
  };

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <Row gutter={[24, 24]} style={{ height: '100%' }}>
        {/* Main Puzzle Area */}
        <Col xs={24} lg={16} xl={18} style={{ height: '100%' }}>
          <Card
            style={{
              ...customStyles.glassCard,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            bodyStyle={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: 24,
            }}
          >
            {/* Puzzle Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <Title level={3} style={{ color: '#ffffff', margin: 0 }}>
                    Chess Puzzles
                  </Title>
                  <Text type="secondary">
                    Solve tactical chess puzzles to improve your skills
                  </Text>
                </div>
                
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshPuzzles}
                  loading={isLoadingPuzzles}
                >
                  Refresh
                </Button>
              </div>

              {/* Filters */}
              <Space wrap>
                <div>
                  <Text type="secondary" style={{ marginRight: 8 }}>Difficulty:</Text>
                  <Select
                    style={{ width: 120 }}
                    placeholder="All"
                    allowClear
                    value={selectedDifficulty}
                    onChange={handleDifficultyChange}
                  >
                    <Option value={1}>⭐ (1)</Option>
                    <Option value={2}>⭐⭐ (2)</Option>
                    <Option value={3}>⭐⭐⭐ (3)</Option>
                    <Option value={4}>⭐⭐⭐⭐ (4)</Option>
                    <Option value={5}>⭐⭐⭐⭐⭐ (5)</Option>
                  </Select>
                </div>

                <div>
                  <Text type="secondary" style={{ marginRight: 8 }}>Theme:</Text>
                  <Select
                    style={{ width: 150 }}
                    placeholder="All themes"
                    allowClear
                    value={selectedTheme}
                    onChange={handleThemeChange}
                  >
                    {availableThemes.map(theme => (
                      <Option key={theme} value={theme}>
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </div>

                {(selectedDifficulty || selectedTheme) && (
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => {
                      handleDifficultyChange(null);
                      handleThemeChange(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </Space>

              {/* Puzzle Info */}
              {currentPuzzle && (
                <div style={{ marginTop: 16, padding: 12, backgroundColor: 'rgba(24, 144, 255, 0.1)', borderRadius: 6 }}>
                  <Space>
                    <Text strong style={{ color: '#1890ff' }}>
                      Puzzle {puzzleIndex + 1} of {availablePuzzles.length}
                    </Text>
                    <Divider type="vertical" />
                    <Text>Difficulty: {'⭐'.repeat(currentPuzzle.difficulty)}</Text>
                    <Divider type="vertical" />
                    <Text>Theme: {currentPuzzle.theme}</Text>
                    {currentPuzzle.title && (
                      <>
                        <Divider type="vertical" />
                        <Text>{currentPuzzle.title}</Text>
                      </>
                    )}
                  </Space>
                </div>
              )}
            </div>

            {/* Quiz Container */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {error ? (
                <Card
                  style={{
                    backgroundColor: 'rgba(255, 77, 79, 0.1)',
                    border: '1px solid rgba(255, 77, 79, 0.3)',
                    textAlign: 'center',
                  }}
                >
                  <Text type="danger">Error loading puzzles: {error}</Text>
                  <br />
                  <Button 
                    type="primary" 
                    onClick={handleRefreshPuzzles}
                    style={{ marginTop: 16 }}
                  >
                    Try Again
                  </Button>
                </Card>
              ) : (
                <QuizContainer
                  puzzleSize={Math.min(500, window.innerWidth * 0.4)}
                  showControls={true}
                  autoAdvance={false}
                />
              )}
            </div>

            {/* Session Stats */}
            <div style={{ marginTop: 24, padding: 16, backgroundColor: 'rgba(31, 31, 31, 0.5)', borderRadius: 8 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Solved"
                    value={sessionStats.puzzlesSolved}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Attempts"
                    value={sessionStats.totalAttempts}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Session Score"
                    value={sessionStats.totalScore}
                    prefix={<BulbOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Success Rate"
                    value={sessionProgress}
                    suffix="%"
                    valueStyle={{ color: sessionProgress >= 70 ? '#52c41a' : sessionProgress >= 50 ? '#faad14' : '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8} xl={6} style={{ height: '100%' }}>
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            gap: 16,
          }}>
            {/* User Profile */}
            {currentUser && stats && (
              <UserProfileCard
                user={currentUser}
                stats={stats}
                onLogout={() => {/* Handle logout */}}
                onSettings={() => {/* Handle settings */}}
              />
            )}

            {/* Game Status */}
            <GameStatusCard
              gameMode="puzzle"
              status={getGameStatus()}
              currentScore={sessionStats.totalScore}
              timeElapsed={elapsedTime}
              movesPlayed={sessionStats.totalAttempts}
              difficulty={currentPuzzle?.difficulty}
              onReset={() => dispatch(startQuizSession())}
            />

            {/* Session Progress */}
            <ProgressIndicator
              title="Session Progress"
              current={sessionStats.puzzlesSolved}
              total={Math.max(sessionStats.totalAttempts, 1)}
              status={sessionProgress >= 70 ? 'success' : sessionProgress >= 50 ? 'active' : 'exception'}
            />

            {/* Puzzle Stats */}
            {currentUser && stats && (
              <Card
                title={<span style={{ color: '#ffffff' }}>Your Puzzle Stats</span>}
                size="small"
                style={customStyles.glassCard}
                bodyStyle={{ padding: 16 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Total Solved:</Text>
                    <Text strong style={{ color: '#52c41a' }}>{stats.totalSolved}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Total Score:</Text>
                    <Text strong style={{ color: '#1890ff' }}>{stats.totalScore}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Average Score:</Text>
                    <Text strong style={{ color: '#faad14' }}>{stats.avgScore.toFixed(1)}</Text>
                  </div>
                </Space>
              </Card>
            )}

            {/* Switch to Game */}
            <Card
              size="small"
              style={customStyles.glassCard}
              bodyStyle={{ padding: 16, textAlign: 'center' }}
            >
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                block
                style={customStyles.primaryButton}
                onClick={() => {/* Navigate to game */}}
              >
                Play Chess Game
              </Button>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                Practice in real games
              </Text>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PuzzlesPage;