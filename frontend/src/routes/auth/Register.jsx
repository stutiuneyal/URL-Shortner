import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { register as apiRegister } from '../../api/auth.api';
import { Button, Card, Form, Input, Typography } from "antd";

export default function Register() {
    const nav = useNavigate();
    const authLogin = useAuthStore(s => s.login);

    const onFinish = async (values) => {
        const res = await apiRegister(values);
        authLogin(res);
        nav('/dashboard', { replace: true });
    };

    return (
        <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
            <Card title="Create account" style={{ width: 360 }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="Name"><Input /></Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}><Input.Password /></Form.Item>
                    <Button type="primary" htmlType="submit" block>Register</Button>
                    <Typography.Paragraph style={{ marginTop: 12 }}>
                        Already have an account? <Link to="/login">Sign in</Link>
                    </Typography.Paragraph>
                </Form>
            </Card>
        </div>
    );
}