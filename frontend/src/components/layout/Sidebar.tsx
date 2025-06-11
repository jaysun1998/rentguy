import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const location = useLocation();
  const selectedKey = location.pathname.split('/')[1] || 'dashboard';

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} className="site-layout-background">
      <div className="logo" style={{
        height: '64px',
        margin: '16px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
      }}>
        {collapsed ? 'RG' : 'RentGuy'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[selectedKey]}
        selectedKeys={[selectedKey]}
        items={[
          {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/">Dashboard</Link>,
          },
          {
            key: 'properties',
            icon: <HomeOutlined />,
            label: <Link to="/properties">Properties</Link>,
          },
          {
            key: 'tenants',
            icon: <UserOutlined />,
            label: <Link to="/tenants">Tenants</Link>,
          },
          {
            key: 'documents',
            icon: <FileTextOutlined />,
            label: <Link to="/documents">Documents</Link>,
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: <Link to="/settings">Settings</Link>,
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
