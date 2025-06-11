import React from 'react';

const Dashboard: React.FC = () => {
  console.log('Dashboard component is rendering');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '20px' }}>
        Dashboard Test - This should be visible
      </h1>
      <p style={{ color: 'black', fontSize: '16px' }}>
        If you can see this text, the Dashboard component is working.
      </p>
      <div style={{ 
        backgroundColor: 'blue', 
        color: 'white', 
        padding: '10px', 
        marginTop: '20px',
        borderRadius: '5px'
      }}>
        This is a test box with inline styles
      </div>
    </div>
  );
};

export default Dashboard;