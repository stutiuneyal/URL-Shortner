import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { login as apiLogin } from '../../api/auth.api';
import { Button, Card, Form, Input, Typography } from "antd";

export default function Login() {

    const nav = useNavigate()
    const location = useLocation();
    const authLogin = useAuthStore(s => s.login)

    const onFinish = async (values) => {
        const res = await apiLogin(values)
        authLogin(res)

        const to = location?.state?.from?.pathname || '/dashboard';
        nav(to, { replace: true })
    };

    return (
        <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
            <Card title="Sign in" style={{ width: 360 }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true, type: 'password' }]}><Input.Password /></Form.Item>
                    <Button type="primary" htmlType="submit" block>Login</Button>
                    <Typography.Paragraph style={{ marginTop: 12 }}>
                        No account? <Link to="/register">Create one</Link>
                    </Typography.Paragraph>
                </Form>
            </Card>
        </div>
    )

}