import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Typography, Space, Progress } from 'antd';
import { 
  TrophyOutlined,
  BulbOutlined,
  CalendarOutlined,
  FireOutlined,
  StarOutlined,
  CrownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'puzzles' | 'scores' | 'streaks' | 'time' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  points: number; // Achievement points earned
}

interface AchievementSystemProps {
  userId: number;
  userStats: {
    totalSolved: number;
    totalAttempts: number;
    totalScore: number;
    avgScore: number;
  };
  onAchievementEarned?: (achievement: Achievement) => void;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = React.memo(({
  userId,
  userStats,
  onAchievementEarned,
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  // Memoize achievement calculations to prevent unnecessary recalculations
  const allAchievements: Achievement[] = useMemo(() => [
    // Puzzle Achievements
    {
      id: 'first_puzzle',
      title: 'First Steps',
      description: 'Solve your first puzzle',
      icon: <BulbOutlined style={{ color: '#52c41a' }} />,
      category: 'puzzles',
      rarity: 'common',
      earned: userStats.totalSolved > 0,
      earnedDate: userStats.totalSolved > 0 ? '2024-01-15' : undefined,
      points: 10,
    },
    {
      id: 'puzzle_apprentice',
      title: 'Puzzle Apprentice',
      description: 'Solve 10 puzzles',
      icon: <BulbOutlined style={{ color: '#1890ff' }} />,
      category: 'puzzles',
      rarity: 'common',
      earned: userStats.totalSolved >= 10,
      progress: Math.min(userStats.totalSolved, 10),
      maxProgress: 10,
      points: 25,
    },
    {
      id: 'puzzle_adept',
      title: 'Puzzle Adept',
      description: 'Solve 50 puzzles',
      icon: <BulbOutlined style={{ color: '#faad14' }} />,
      category: 'puzzles',
      rarity: 'uncommon',
      earned: userStats.totalSolved >= 50,
      progress: Math.min(userStats.totalSolved, 50),
      maxProgress: 50,
      points: 75,
    },
    {
      id: 'puzzle_master',
      title: 'Puzzle Master',
      description: 'Solve 100 puzzles',
      icon: <TrophyOutlined style={{ color: '#722ed1' }} />,
      category: 'puzzles',
      rarity: 'rare',
      earned: userStats.totalSolved >= 100,
      progress: Math.min(userStats.totalSolved, 100),
      maxProgress: 100,
      points: 150,
    },
    {
      id: 'puzzle_grandmaster',
      title: 'Puzzle Grandmaster',
      description: 'Solve 500 puzzles',
      icon: <CrownOutlined style={{ color: '#f5222d' }} />,
      category: 'puzzles',
      rarity: 'legendary',
      earned: userStats.totalSolved >= 500,
      progress: Math.min(userStats.totalSolved, 500),
      maxProgress: 500,
      points: 500,
    },

    // Score Achievements
    {
      id: 'score_hunter',
      title: 'Score Hunter',
      description: 'Achieve a total score of 1000 points',
      icon: <StarOutlined style={{ color: '#1890ff' }} />,
      category: 'scores',
      rarity: 'common',
      earned: userStats.totalScore >= 1000,
      progress: Math.min(userStats.totalScore, 1000),
      maxProgress: 1000,
      points: 50,
    },
    {
      id: 'high_scorer',
      title: 'High Scorer',
      description: 'Achieve a total score of 5000 points',
      icon: <StarOutlined style={{ color: '#faad14' }} />,
      category: 'scores',
      rarity: 'uncommon',
      earned: userStats.totalScore >= 5000,
      progress: Math.min(userStats.totalScore, 5000),
      maxProgress: 5000,
      points: 100,
    },
    {
      id: 'point_master',
      title: 'Point Master',
      description: 'Achieve a total score of 10000 points',
      icon: <StarOutlined style={{ color: '#722ed1' }} />,
      category: 'scores',
      rarity: 'rare',
      earned: userStats.totalScore >= 10000,
      progress: Math.min(userStats.totalScore, 10000),
      maxProgress: 10000,
      points: 200,
    },

    // Accuracy Achievements
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Maintain 90% solve rate with 50+ puzzles',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      category: 'special',
      rarity: 'epic',
      earned: userStats.totalAttempts >= 50 && (userStats.totalSolved / userStats.totalAttempts) >= 0.9,
      progress: userStats.totalAttempts >= 50 ? Math.min((userStats.totalSolved / userStats.totalAttempts) * 100, 90) : 0,
      maxProgress: 90,
      points: 300,
    },

    // Streak Achievements (mock data since we don't track streaks yet)
    {
      id: 'daily_solver',
      title: 'Daily Solver',
      description: 'Solve puzzles for 7 consecutive days',
      icon: <CalendarOutlined style={{ color: '#52c41a' }} />,
      category: 'streaks',
      rarity: 'uncommon',
      earned: false,
      progress: 3, // Mock data
      maxProgress: 7,
      points: 100,
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Solve 20 puzzles in a row without failing',
      icon: <FireOutlined style={{ color: '#fa541c' }} />,
      category: 'streaks',
      rarity: 'rare',
      earned: false,
      progress: 12, // Mock data
      maxProgress: 20,
      points: 250,
    },

    // Time-based Achievements
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Solve a puzzle in under 30 seconds',
      icon: <ClockCircleOutlined style={{ color: '#fa541c' }} />,
      category: 'time',
      rarity: 'uncommon',
      earned: false, // Would need timing data
      points: 75,
    },
  ], [userStats]);

  useEffect(() => {
    // Initialize achievements and check for newly earned ones
    const earnedAchievements = allAchievements.filter(a => a.earned);
    const newlyEarned = earnedAchievements.filter(a => 
      !achievements.find(existing => existing.id === a.id && existing.earned)
    );

    // Notify about newly earned achievements
    newlyEarned.forEach(achievement => {
      onAchievementEarned?.(achievement);
    });

    setAchievements(allAchievements);
    setTotalPoints(earnedAchievements.reduce((sum, a) => sum + a.points, 0));
  }, [userStats, onAchievementEarned]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return '#52c41a';
      case 'uncommon': return '#1890ff';
      case 'rare': return '#722ed1';
      case 'epic': return '#fa541c';
      case 'legendary': return '#f5222d';
      default: return '#666';
    }
  };

  const getRarityLabel = (rarity: Achievement['rarity']) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const inProgressAchievements = achievements.filter(a => !a.earned && a.progress !== undefined);
  const lockedAchievements = achievements.filter(a => !a.earned && a.progress === undefined);

  const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div
      style={{
        padding: '16px',
        backgroundColor: achievement.earned 
          ? `rgba(${getRarityColor(achievement.rarity).replace('#', '')}, 0.1)` 
          : 'rgba(31, 31, 31, 0.5)',
        border: `1px solid ${achievement.earned 
          ? getRarityColor(achievement.rarity) 
          : 'rgba(64, 64, 64, 0.3)'}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity: achievement.earned ? 1 : 0.7,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Achievement Icon */}
      <div style={{ fontSize: 32, opacity: achievement.earned ? 1 : 0.6 }}>
        {achievement.icon}
      </div>

      {/* Achievement Details */}
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 4 
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            color: achievement.earned ? getRarityColor(achievement.rarity) : '#ffffff' 
          }}>
            {achievement.title}
          </div>
          <div
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: getRarityColor(achievement.rarity),
              color: '#ffffff',
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}
          >
            {getRarityLabel(achievement.rarity)}
          </div>
        </div>
        
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
          {achievement.description}
        </Text>

        {/* Progress bar for in-progress achievements */}
        {achievement.progress !== undefined && achievement.maxProgress && !achievement.earned && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 11 }}>Progress</Text>
              <Text style={{ fontSize: 11 }}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
            </div>
            <Progress
              percent={(achievement.progress / achievement.maxProgress) * 100}
              showInfo={false}
              strokeColor={getRarityColor(achievement.rarity)}
              size="small"
            />
          </div>
        )}

        {/* Earned date */}
        {achievement.earned && achievement.earnedDate && (
          <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
            Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Points */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: 14, 
          fontWeight: 'bold', 
          color: achievement.earned ? getRarityColor(achievement.rarity) : '#666' 
        }}>
          {achievement.points}
        </div>
        <Text type="secondary" style={{ fontSize: 10 }}>
          pts
        </Text>
      </div>

      {/* Earned indicator */}
      {achievement.earned && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderTop: `20px solid ${getRarityColor(achievement.rarity)}`,
        }} />
      )}
    </div>
  );

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* Achievement Summary */}
      <div style={{
        padding: '16px',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        border: '1px solid rgba(24, 144, 255, 0.3)',
        borderRadius: 8,
        marginBottom: 24,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff', marginBottom: 8 }}>
          {totalPoints} Achievement Points
        </div>
        <Text type="secondary">
          {earnedAchievements.length} of {achievements.length} achievements earned
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Earned Achievements */}
        {earnedAchievements.length > 0 && (
          <div>
            <h3 style={{ color: '#52c41a', marginBottom: 16 }}>
              🏆 Earned ({earnedAchievements.length})
            </h3>
            {earnedAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}

        {/* In Progress Achievements */}
        {inProgressAchievements.length > 0 && (
          <div>
            <h3 style={{ color: '#faad14', marginBottom: 16 }}>
              ⏳ In Progress ({inProgressAchievements.length})
            </h3>
            {inProgressAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div>
            <h3 style={{ color: '#666', marginBottom: 16 }}>
              🔒 Locked ({lockedAchievements.length})
            </h3>
            {lockedAchievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}
      </Space>
    </div>
  );
});

export default AchievementSystem;