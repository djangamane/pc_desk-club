import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Space, Button, Statistic, Divider } from 'antd';
import { 
  UserOutlined, 
  TrophyOutlined, 
  BulbOutlined,
  SettingOutlined,
  EditOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUserStats } from '../store/slices/userSlice';
import AvatarUpload from '../components/AvatarUpload';
import AchievementSystem from '../components/AchievementSystem';
import { customStyles } from '../styles/antdTheme';

const { Title, Text } = Typography;

export const UserProfilePage: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const { currentUser, stats, isAuthenticated } = useAppSelector(state => state.user);
  
  const [editMode, setEditMode] = useState(false);

  // Load user stats when component mounts
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      dispatch(fetchUserStats(currentUser.id));
    }
  }, [dispatch, currentUser, isAuthenticated]);

  if (!isAuthenticated || !currentUser) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        flexDirection: 'column',
      }}>
        <UserOutlined style={{ fontSize: 64, color: '#666', marginBottom: 16 }} />
        <Title level={3} style={{ color: '#666' }}>Please sign in to view your profile</Title>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAccuracy = () => {
    if (!stats || stats.totalAttempts === 0) return 0;
    return Math.round((stats.totalSolved / stats.totalAttempts) * 100);
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* User Info Section */}
        <Col span={24}>
          <Card
            style={customStyles.glassCard}
            bodyStyle={{ padding: '32px' }}
          >
            <Row gutter={[32, 24]} align="middle">
              {/* Profile Picture */}
              <Col flex="none">
                <AvatarUpload
                  currentAvatar={currentUser.avatar || undefined}
                  onAvatarChange={(avatarData) => {
                    console.log('Avatar changed:', avatarData);
                    // In a real app, save to database via IPC
                    // dispatch(updateUserAvatar({ userId: currentUser.id, avatar: avatarData }));
                  }}
                  size={120}
                  editable={true}
                />
              </Col>

              {/* User Details */}
              <Col flex="auto">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                      <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
                        {currentUser.username}
                      </Title>
                      <Button
                        icon={<EditOutlined />}
                        type="text"
                        onClick={() => setEditMode(!editMode)}
                      >
                        Edit Profile
                      </Button>
                    </div>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      {currentUser.email}
                    </Text>
                    <br />
                    <Text type="secondary">
                      Member since {formatDate(currentUser.created_at)}
                    </Text>
                  </div>

                  {/* Quick Stats */}
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic
                        title="Puzzles Solved"
                        value={stats?.totalSolved || 0}
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<TrophyOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Total Score"
                        value={stats?.totalScore || 0}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<StarOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Average Score"
                        value={stats?.avgScore || 0}
                        precision={1}
                        valueStyle={{ color: '#faad14' }}
                        prefix={<BulbOutlined />}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic
                        title="Accuracy"
                        value={calculateAccuracy()}
                        suffix="%"
                        valueStyle={{ 
                          color: calculateAccuracy() >= 80 ? '#52c41a' : 
                                calculateAccuracy() >= 60 ? '#faad14' : '#ff4d4f' 
                        }}
                      />
                    </Col>
                  </Row>
                </Space>
              </Col>

              {/* Actions */}
              <Col flex="none">
                <Space direction="vertical">
                  <Button
                    type="primary"
                    icon={<SettingOutlined />}
                    size="large"
                    onClick={() => {/* Navigate to settings */}}
                  >
                    Settings
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Detailed Statistics */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#ffffff' }}>Statistics Overview</span>}
            style={customStyles.glassCard}
            bodyStyle={{ padding: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Performance Chart Placeholder */}
              <div style={{
                height: 200,
                backgroundColor: 'rgba(31, 31, 31, 0.5)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(64, 64, 64, 0.5)',
              }}>
                <Text type="secondary">Performance Chart Coming Soon</Text>
              </div>

              <Divider />

              {/* Detailed Stats */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                      {stats?.totalAttempts || 0}
                    </div>
                    <Text type="secondary">Total Attempts</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                      {(stats?.totalAttempts || 0) - (stats?.totalSolved || 0)}
                    </div>
                    <Text type="secondary">Failed Attempts</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                      {stats?.totalScore || 0}
                    </div>
                    <Text type="secondary">Total Score</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                      {stats?.totalSolved || 0}
                    </div>
                    <Text type="secondary">Puzzles Solved</Text>
                  </div>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        {/* Achievements */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: '#ffffff' }}>Achievements</span>}
            style={customStyles.glassCard}
            bodyStyle={{ padding: '16px', maxHeight: '500px', overflow: 'hidden' }}
          >
            <AchievementSystem
              userId={currentUser.id}
              userStats={{
                totalSolved: stats?.totalSolved || 0,
                totalAttempts: stats?.totalAttempts || 0,
                totalScore: stats?.totalScore || 0,
                avgScore: stats?.avgScore || 0,
              }}
              onAchievementEarned={(achievement) => {
                console.log('New achievement earned:', achievement.title);
                // In a real app, you could show a notification here
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default UserProfilePage;