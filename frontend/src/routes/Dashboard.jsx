import { useEffect, useState } from 'react';
import { Empty } from 'antd';
import SummaryCards from '../components/analytics/SummaryCards.jsx';
import { getSummary } from '../api/analytics.api';
import { useWsStore } from '../store/ws.store';

export default function Dashboard() {
    const ws = useWsStore(s => s.current);
    const [data, setData] = useState({});
    useEffect(() => {
        if (ws?.id) getSummary(ws.id).then(setData);
    }, [ws]);
    if (!ws?.id) return <Empty description="Select a workspace to see analytics" />;
    return <SummaryCards data={data} />;
}
