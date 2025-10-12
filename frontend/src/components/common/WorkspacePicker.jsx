import { useEffect } from "react";
import { useWsStore } from "../../store/ws.store";
import { listWorkspaces, createWorkspace } from '../../api/workspaces.api';
import { Button, Select, Space, App as AntdApp } from "antd";
import { PlusOutlined } from '@ant-design/icons';

export default function WorkspacePicker() {

    const {message} = AntdApp.useApp()

    const { list, current, setList, setCurrent } = useWsStore()

    useEffect(() => {
        listWorkspaces().then(setList).catch(console.error)
    }, [])

    const onCreate = async () => {
        const name = prompt("Workspace Name")
        if (!name) {
            return
        }

        const ws = await createWorkspace(name)
        message.success("Workspace Created")
        const updated = [...list, ws]
        setList(updated)
        setCurrent(ws)
    }

    return (
        <Space>
            <Select
                placeholder="Select workspace"
                style={{ minWidth: 220 }}
                options={list.map(w => ({ value: w.id, label: w.name }))}
                value={current?.id}
                onChange={(id) => setCurrent(list.find(w => w.id === id))}
            />
            <Button icon={<PlusOutlined />} onClick={onCreate}>New</Button>
        </Space>
    );

}