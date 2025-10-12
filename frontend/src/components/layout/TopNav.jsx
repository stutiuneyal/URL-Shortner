import { Button, Dropdown, Layout, Space, Typography } from "antd";
import { useAuthStore } from "../../store/auth.store";
import { useUiStore } from "../../store/ui.store";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons'
import WorkspacePicker from "../common/WorkspacePicker";

export default function TopNav() {

    const collapsed = useUiStore(s => s.siderCollapsed)
    const toggle = useUiStore(s => s.toggleSider)
    const user = useAuthStore(s => s.user)
    const logout = useAuthStore(s => s.logout)

    const items = [{ key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: logout }];

    return (
        <Layout.Header style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid #f0f0f0' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                    <Button type="text" onClick={toggle} icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} />
                    <WorkspacePicker />
                </Space>
                <Dropdown menu={{ items }} trigger={['click']}>
                    <Typography.Link>{user?.email}</Typography.Link>
                </Dropdown>
            </Space>
        </Layout.Header>
    )

}