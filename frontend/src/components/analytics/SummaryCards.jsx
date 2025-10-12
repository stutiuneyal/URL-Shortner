import { Card, Col, Row, Statistic } from 'antd';

export default function SummaryCards({ data }) {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={6}><Card><Statistic title="Total Links" value={data.total || 0} /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="Active" value={data.active || 0} /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="Clicks" value={data.clicks || 0} /></Card></Col>
            <Col xs={24} md={6}><Card><Statistic title="Expiring (7d)" value={data.expiringSoon || 0} /></Card></Col>
        </Row>
    );
}
