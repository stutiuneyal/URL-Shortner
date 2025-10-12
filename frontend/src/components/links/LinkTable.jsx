import { Button, Input, Space, Table, Tag, Tooltip, App as AntdApp, QRCode } from "antd";
import { useMemo, useState } from "react";
import { PlusOutlined, DeleteOutlined, EditOutlined, QrcodeOutlined } from '@ant-design/icons';
import Copy from "../common/Copy";
import { confirm } from '../common/Confirm.jsx';

export default function LinkTable({ data, baseUrl, onCreate, onEdit, onDelete }) {

    const { modal, message } = AntdApp.useApp();

    const [query, setQuery] = useState('')
    const [selected, useSelected] = useState(null)

    const filtered = useMemo(() => {
        const q = (query || '').toLowerCase()
        return data.filter(l =>
            l.slug?.toLowerCase().includes(q) ||
            l.target?.toLowerCase().includes(q) ||
            (l.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }, [data, query]);

    const columns = [
        { title: 'Slug', dataIndex: 'slug', render: (v, row) => <Copy text={`${baseUrl}/r/${v}`}>{v}</Copy> },
        { title: 'Target', dataIndex: 'target', ellipsis: true },
        { title: 'Clicks', dataIndex: 'clicks', width: 90 },
        { title: 'ClickLimit', dataIndex: 'clickLimit', width: 100 },
        { title: 'Tags', dataIndex: 'tags', render: (tags = []) => tags.map(t => <Tag key={t}>{t}</Tag>) },
        { title: 'Status', dataIndex: 'active', width: 100, render: v => v ? <Tag color="green">Active</Tag> : <Tag>Paused</Tag> },
        {
            title: 'Action', key: 'actions', width: 180,
            render: (_, row) => (
                <Space>
                    <Tooltip title="Edit"><Button icon={<EditOutlined />} size="small" onClick={() => onEdit(row)} /></Tooltip>
                    <Tooltip title="QR"><Button icon={<QrcodeOutlined />} size="small" onClick={() => {
                        const url = `${baseUrl}/r/${row.slug}`;
                        modal.info({
                            title: 'Scan this QR',
                            icon: null,
                            centered: true,
                            width: 320,
                            content: (
                                <div style={{ textAlign: "center", marginTop: 12 }}>
                                    <QRCode value={url} size={200} />
                                    <div style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
                                        {url}
                                    </div>
                                </div>
                            ),
                            okText: "Close",
                        })
                    }} /></Tooltip>
                    <Tooltip title="Delete">
                        <Button danger icon={<DeleteOutlined />} size="small" onClick={async () => {
                            if (await confirm(modal, { title: 'Delete link?', content: `This will remove ${row.slug}` })) onDelete(row);
                        }} />
                    </Tooltip>
                </Space>
            )
        }
    ]

    return (
        <>
            <Space style={{ marginBottom: 12 }}>
                <Input.Search placeholder="Search by slug, target, tags" onSearch={setQuery} allowClear />
                <Button type="primary" icon={<PlusOutlined />} onClick={() => onCreate()}>Create</Button>
            </Space>
            <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 10 }} />
        </>
    );


}