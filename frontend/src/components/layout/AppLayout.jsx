import { Layout } from "antd";
import { useUiStore } from "../../store/ui.store";
import SideNav from "./SideNav";
import TopNav from "./TopNav";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
    const collapsed = useUiStore(s => s.siderCollapsed);
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideNav />
            <Layout>
                <TopNav />
                <Layout.Content style={{ margin: 16 }}>
                    <div style={{ background: '#fff', padding: 16, minHeight: 360, borderRadius: 8 }}>
                        {/*
            Should be present in all the child routes hence using <Outlet />
             */}
                        <Outlet />
                    </div>
                </Layout.Content>
            </Layout>
        </Layout>
    );
}