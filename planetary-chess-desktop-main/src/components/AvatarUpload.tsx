import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Button } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange?: (avatarData: string) => void;
  size?: number;
  editable?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = React.memo(({
  currentAvatar,
  onAvatarChange,
  size = 120,
  editable = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPreviewAvatar(result);
        onAvatarChange?.(result);
      }
      setUploading(false);
    };
    
    reader.readAsDataURL(file);
  }, [onAvatarChange]);

  const handleUploadClick = useCallback(() => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [editable]);

  const avatarStyle = useMemo(() => ({
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: previewAvatar ? 'transparent' : '#1890ff',
    backgroundImage: previewAvatar ? `url(${previewAvatar})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.4,
    color: '#ffffff',
    cursor: editable ? 'pointer' : 'default',
    border: '3px solid rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  }), [size, previewAvatar, editable]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={avatarStyle}
        onClick={handleUploadClick}
      >
        {!previewAvatar && <UserOutlined />}
      </div>

      {editable && (
        <Button
          type="primary"
          shape="circle"
          icon={<UploadOutlined />}
          size="small"
          loading={uploading}
          onClick={handleUploadClick}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 32,
            height: 32,
          }}
          title="Upload Avatar"
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
});

export default AvatarUpload;