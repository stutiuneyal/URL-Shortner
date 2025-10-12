import { useEffect, useState } from "react";
import { useWsStore } from "../store/ws.store";
import { listLinks, createLink, updateLink, deleteLink } from '../api/links.api';
import { App as AntdApp } from "antd";
import LinkTable from "../components/links/LinkTable";
import LinkForm from "../components/links/LinkForm";

export default function Links() {

    const {message} = AntdApp.useApp()

    const ws = useWsStore(s => s.current)
    const [items, setItems] = useState([])
    const [domains, setDomains] = useState([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8091';

    const load = async () => {
        if (!ws?.id) {
            return
        }

        // TODO: implement domains
        const [links, domains] = await Promise.all([listLinks(ws.id), []]);
        setItems(links);
        setDomains([]);
    }

    useEffect(() => {
        load()
    }, [ws?.id])

    const onCreate = () => { setEditing(null); setOpen(true) }
    const onEdit = (row) => { setEditing(row); setOpen(true) }

    const handleSubmit = async (payload) => {
        if (editing) {
            const updated = await updateLink(editing.id, payload)
            message.success('Link Updated')
        } else {
            await createLink(payload)
            message.success('Link Created')
        }
        setOpen(false)
        load()
    }

    const onDelete = async (row) => {
        await deleteLink(row.id)
        message.success('Link Deleted')
        load()
    }

    if (!ws?.id) {
        return <div>Please select a workspace to view links.</div>
    }

    return (
        <>
            <LinkTable
                data={items}
                baseUrl={baseUrl}
                onCreate={onCreate}
                onEdit={onEdit}
                onDelete={onDelete}
            />

            <LinkForm
                open={open}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
                initialValues={editing}
                workspaceId={ws?.id}
                domains={domains}
            />
        </>
    )

}