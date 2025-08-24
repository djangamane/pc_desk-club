import React from 'react';

const WelcomeScreen: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      padding: '20px',
      background: 'url("/pchess1.png") no-repeat center center',
      backgroundSize: 'cover',
      color: '#ffffff',
      textAlign: 'center',
      position: 'relative',
    }}>
      {/* Overlay to make text more readable over background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1,
      }} />

      {/* Main Welcome Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Research Paper Information */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '25px',
          marginBottom: '30px',
          color: '#ffffff',
          fontSize: '16px',
          lineHeight: '1.6',
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#1890ff' }}>
            GAME THEORY IN ACTION: EXPLORING<br />PLANETARY CHESS AS A TOOL<br />FOR SOCIAL CHANGE
          </h2>
          
          <p style={{ margin: '20px 0', color: '#d0d0d0' }}>
            International Journal of Game Theory and Technology (IJGTT)<br />
            Vol.10, No.2, June 2024<br />
            DOI: 10.5121/ijgtt.2024.10201
          </p>
          
          <p style={{ marginBottom: '20px' }}>
            Our published research validates how chess mechanics can be used as a metaphor to combat systemic racism.
            Click the logo below to read the full paper.
          </p>
          
          <p style={{ fontWeight: 'bold', color: '#1890ff' }}>
            Join the revolution. Knowledge is power. Checkmate systemic racism!
          </p>
        </div>
        
        {/* Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px',
        }}>
          <a 
            href="https://aircconline.com/ijgtt/V10N2/10224ijgtt01.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            title="View published research paper"
          >
            <img 
              src="/avatar.png" 
              alt="Planetary Chess Logo" 
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 0 20px rgba(0, 195, 255, 0.5)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 195, 255, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 195, 255, 0.5)';
              }}
            />
          </a>
        </div>

        {/* Action Button */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <p style={{ 
            color: '#ffffff', 
            fontSize: '14px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            Revolutionary Chess Experience • Based on Peer-Reviewed Research
          </p>
          
          <button
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 40px',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(24, 144, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.3)';
            }}
            onClick={() => {
              window.location.href = '/game';
            }}
          >
            Join the Revolution
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;