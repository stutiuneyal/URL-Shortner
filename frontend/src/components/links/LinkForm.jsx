import { DatePicker, Form, Input, InputNumber, Modal, Select, Space, Switch } from "antd";
import dayjs from "dayjs";

export default function LinkForm({ open, onCancel, onSubmit, initialValues, workspaceId, domains }) {

    const [form] = Form.useForm()

    const initialValue = initialValues ? {
        ...initialValues, expiresAt: initialValues.expiresAt ? dayjs(initialValues.expiresAt) : null
    } : { utmStrip: false, tags: [] };

    return (
        <Modal
            title={initialValues ? 'Edit Link' : 'Create Link'}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText={initialValues ? 'Save' : 'Create'}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" initialValues={initialValue} onFinish={(values) => {
                const payload = {
                    workspaceId,
                    domainId: values.domainId || undefined,
                    slug: values.slug || undefined,
                    target: values.target,
                    password: values.password || undefined,
                    expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined,
                    clickLimit: values.clickLimit || undefined,
                    utmStrip: values.utmStrip || undefined,
                    tags: values.tags || []
                };
                onSubmit(payload)
            }}>

                <Form.Item name="target" label="Target URL" rules={[{ required: true, type: 'url', message: 'Enter a valid URL' }]}>
                    <Input placeholder="https://example.com/landing" />
                </Form.Item>
                <Form.Item name="slug" label="Custom Slug (optional)">
                    <Input placeholder="my-campaign" />
                </Form.Item>
                <Form.Item name="domainId" label="Domain (optional)">
                    <Select allowClear options={domains.map(d => ({ value: d.id, label: d.hostname }))} />
                </Form.Item>
                <Space size="large">
                    <Form.Item name="expiresAt" label="Expires At">
                        <DatePicker showTime />
                    </Form.Item>
                    <Form.Item name="clickLimit" label="Click Limit">
                        <InputNumber min={1} placeholder="e.g., 1000" />
                    </Form.Item>
                </Space>
                <Form.Item name="password" label="Password (optional)">
                    <Input.Password placeholder="Protect link with password" />
                </Form.Item>
                <Form.Item name="utmStrip" label="Strip UTM">
                    <Switch />
                </Form.Item>
                <Form.Item name="tags" label="Tags">
                    <Select mode="tags" placeholder="press Enter to add tags" />
                </Form.Item>

            </Form>

        </Modal>
    )

}