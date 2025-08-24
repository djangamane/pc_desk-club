import React, { useState, useMemo, useCallback } from 'react';
import { Row, Col, Card, Typography, Button, Space, Divider } from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  SecurityScanOutlined,
  ExperimentOutlined,
  DeleteOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store';
import { customStyles } from '../styles/antdTheme';

const { Title, Text } = Typography;

interface UserSettingsState {
  // Display Settings
  theme: 'dark' | 'light';
  boardTheme: 'classic' | 'modern' | 'wood';
  pieceSet: 'classic' | 'modern' | 'symbols';
  
  // Game Settings
  showLegalMoves: boolean;
  enableSoundEffects: boolean;
  animationSpeed: 'slow' | 'medium' | 'fast';
  
  // Notification Settings
  enableNotifications: boolean;
  dailyPuzzleReminder: boolean;
  achievementNotifications: boolean;
  
  // Privacy Settings
  showProfile: boolean;
  shareStatistics: boolean;
  
  // Performance Settings
  enablePerformanceMonitoring: boolean;
  maxFPS: 30 | 60 | 120;
}

const defaultSettings: UserSettingsState = {
  theme: 'dark',
  boardTheme: 'classic',
  pieceSet: 'classic',
  showLegalMoves: true,
  enableSoundEffects: true,
  animationSpeed: 'medium',
  enableNotifications: true,
  dailyPuzzleReminder: true,
  achievementNotifications: true,
  showProfile: true,
  shareStatistics: false,
  enablePerformanceMonitoring: false,
  maxFPS: 60,
};

export const UserSettings: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated } = useAppSelector(state => state.user);
  
  const [settings, setSettings] = useState<UserSettingsState>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = useCallback(<K extends keyof UserSettingsState>(
    key: K,
    value: UserSettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSaveSettings = useCallback(async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      console.log('Saving user settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentUser, settings]);

  const handleResetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setHasChanges(true);
  }, []);

  const handleDeleteAccount = useCallback(() => {
    console.log('Delete account requested - would show confirmation dialog');
  }, []);

  const unauthenticatedView = useMemo(() => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      flexDirection: 'column',
    }}>
      <SettingOutlined style={{ fontSize: 64, color: '#666', marginBottom: 16 }} />
      <Title level={3} style={{ color: '#666' }}>Please sign in to access settings</Title>
    </div>
  ), []);

  // Memoized sub-components
  const SettingRow: React.FC<{
    title: string;
    description?: string;
    children: React.ReactNode;
  }> = React.memo(({ title, description, children }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid rgba(64, 64, 64, 0.2)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#ffffff', fontWeight: '500', marginBottom: description ? 4 : 0 }}>
          {title}
        </div>
        {description && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {description}
          </Text>
        )}
      </div>
      <div style={{ marginLeft: 16 }}>
        {children}
      </div>
    </div>
  ));

  const ToggleButton: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }> = React.memo(({ checked, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        background: checked ? '#1890ff' : 'rgba(64, 64, 64, 0.5)',
        border: 'none',
        borderRadius: '12px',
        width: '48px',
        height: '24px',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          position: 'absolute',
          top: '2px',
          left: checked ? '26px' : '2px',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  ));

  const SelectButton: React.FC<{
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }> = React.memo(({ options, value, onChange }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'rgba(31, 31, 31, 0.8)',
        border: '1px solid rgba(64, 64, 64, 0.5)',
        borderRadius: '6px',
        color: '#ffffff',
        padding: '6px 12px',
        fontSize: '14px',
        cursor: 'pointer',
        minWidth: '120px',
      }}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ));

  if (!isAuthenticated || !currentUser) {
    return unauthenticatedView;
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Header */}
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
                User Settings
              </Title>
              <Text type="secondary">
                Customize your chess experience and account preferences
              </Text>
            </div>
            
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetSettings}
                disabled={!hasChanges}
              >
                Reset to Defaults
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveSettings}
                loading={isSaving}
                disabled={!hasChanges}
              >
                Save Changes
              </Button>
            </Space>
          </div>
          
          {hasChanges && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(250, 173, 20, 0.1)',
              border: '1px solid rgba(250, 173, 20, 0.3)',
              borderRadius: '8px',
              marginBottom: 24,
            }}>
              <Text style={{ color: '#faad14' }}>
                ⚠️ You have unsaved changes. Click "Save Changes" to apply them.
              </Text>
            </div>
          )}
        </Col>

        {/* Display Settings */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ color: '#ffffff' }}>
                <ExperimentOutlined style={{ marginRight: 8 }} />
                Display Settings
              </span>
            }
            style={customStyles.glassCard}
            bodyStyle={{ padding: '24px' }}
          >
            <SettingRow
              title="Theme"
              description="Choose your preferred color scheme"
            >
              <SelectButton
                options={[
                  { value: 'dark', label: 'Dark' },
                  { value: 'light', label: 'Light' },
                ]}
                value={settings.theme}
                onChange={(value) => updateSetting('theme', value as 'dark' | 'light')}
              />
            </SettingRow>

            <SettingRow
              title="Board Theme"
              description="Select the chess board appearance"
            >
              <SelectButton
                options={[
                  { value: 'classic', label: 'Classic' },
                  { value: 'modern', label: 'Modern' },
                  { value: 'wood', label: 'Wood' },
                ]}
                value={settings.boardTheme}
                onChange={(value) => updateSetting('boardTheme', value as any)}
              />
            </SettingRow>

            <SettingRow
              title="Piece Set"
              description="Choose your chess piece style"
            >
              <SelectButton
                options={[
                  { value: 'classic', label: 'Classic' },
                  { value: 'modern', label: 'Modern' },
                  { value: 'symbols', label: 'Symbols' },
                ]}
                value={settings.pieceSet}
                onChange={(value) => updateSetting('pieceSet', value as any)}
              />
            </SettingRow>
          </Card>
        </Col>

        {/* Game Settings */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ color: '#ffffff' }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Game Settings
              </span>
            }
            style={customStyles.glassCard}
            bodyStyle={{ padding: '24px' }}
          >
            <SettingRow
              title="Show Legal Moves"
              description="Highlight available moves when a piece is selected"
            >
              <ToggleButton
                checked={settings.showLegalMoves}
                onChange={(checked) => updateSetting('showLegalMoves', checked)}
              />
            </SettingRow>

            <SettingRow
              title="Sound Effects"
              description="Play sounds for moves and game events"
            >
              <ToggleButton
                checked={settings.enableSoundEffects}
                onChange={(checked) => updateSetting('enableSoundEffects', checked)}
              />
            </SettingRow>

            <SettingRow
              title="Animation Speed"
              description="Speed of piece movement animations"
            >
              <SelectButton
                options={[
                  { value: 'slow', label: 'Slow' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'fast', label: 'Fast' },
                ]}
                value={settings.animationSpeed}
                onChange={(value) => updateSetting('animationSpeed', value as any)}
              />
            </SettingRow>
          </Card>
        </Col>

        {/* Notification Settings */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ color: '#ffffff' }}>
                <BellOutlined style={{ marginRight: 8 }} />
                Notifications
              </span>
            }
            style={customStyles.glassCard}
            bodyStyle={{ padding: '24px' }}
          >
            <SettingRow
              title="Enable Notifications"
              description="Allow the app to send desktop notifications"
            >
              <ToggleButton
                checked={settings.enableNotifications}
                onChange={(checked) => updateSetting('enableNotifications', checked)}
              />
            </SettingRow>

            <SettingRow
              title="Daily Puzzle Reminder"
              description="Get reminded to solve your daily puzzle"
            >
              <ToggleButton
                checked={settings.dailyPuzzleReminder}
                onChange={(checked) => updateSetting('dailyPuzzleReminder', checked)}
                disabled={!settings.enableNotifications}
              />
            </SettingRow>

            <SettingRow
              title="Achievement Notifications"
              description="Get notified when you earn new achievements"
            >
              <ToggleButton
                checked={settings.achievementNotifications}
                onChange={(checked) => updateSetting('achievementNotifications', checked)}
                disabled={!settings.enableNotifications}
              />
            </SettingRow>
          </Card>
        </Col>

        {/* Privacy & Security */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ color: '#ffffff' }}>
                <SecurityScanOutlined style={{ marginRight: 8 }} />
                Privacy & Security
              </span>
            }
            style={customStyles.glassCard}
            bodyStyle={{ padding: '24px' }}
          >
            <SettingRow
              title="Public Profile"
              description="Allow others to view your profile and statistics"
            >
              <ToggleButton
                checked={settings.showProfile}
                onChange={(checked) => updateSetting('showProfile', checked)}
              />
            </SettingRow>

            <SettingRow
              title="Share Statistics"
              description="Include your stats in leaderboards and comparisons"
            >
              <ToggleButton
                checked={settings.shareStatistics}
                onChange={(checked) => updateSetting('shareStatistics', checked)}
              />
            </SettingRow>

            <Divider />

            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteAccount}
                style={{ marginBottom: 8 }}
              >
                Delete Account
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default UserSettings;
