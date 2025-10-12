import { useEffect } from 'react';
import { Table, Tag } from 'antd';
import { listWorkspaces } from '../api/workspaces.api';
import { useWsStore } from '../store/ws.store';
import dayjs from 'dayjs';

export default function Workspaces() {
    const { list, setList, current } = useWsStore();
    useEffect(() => { listWorkspaces().then(setList); }, [setList]);

    return (
        <Table rowKey="id" dataSource={list} columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Current', render: (_, row) => row.id === current?.id ? <Tag color="blue">Selected</Tag> : null },
            { title: 'Created At', dataIndex: 'createdAt', render: (value) => dayjs(value).format("Do MMM YYYY, h:mm A") }
        ]} />
    );
}
