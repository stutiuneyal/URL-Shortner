import { BarChartOutlined, LinkOutlined, ClusterOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons';
import { useUiStore } from '../../store/ui.store';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';

const items = [
    { key: '/dashboard', icon: <BarChartOutlined />, label: 'Dashboard' },
    { key: '/links', icon: <LinkOutlined />, label: 'Links' },
    { key: '/domains', icon: <ClusterOutlined />, label: 'Domains' },
    { key: '/workspaces', icon: <TeamOutlined />, label: 'Workspaces' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
];

export default function SideNav() {

    const collapsed = useUiStore(s => s.siderCollapsed);
    const nav = useNavigate();
    const loc = useLocation();
    return (
        <Layout.Sider collapsible collapsed={collapsed} width={220} trigger={null}>
            <div style={{ color: '#fff', padding: 16, fontWeight: 700 }}>
                <>
                {collapsed? 'URL' : 'URL Shortener'}
                </>
            </div>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[loc.pathname]}
                items={items}
                onClick={({ key }) => nav(key)}
            />
        </Layout.Sider>
    );
}