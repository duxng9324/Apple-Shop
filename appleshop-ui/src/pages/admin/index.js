import { Row, Col, Card } from 'antd';
import CategoryAd from '../categoryad';
import ProductAd from '../productad';
import MemoryAd from '../memoryad';
import ColorAd from '../colorAd';

function Admin() {
    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Card bordered={false}>
                        <CategoryAd />
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card  bordered={false}>
                        <MemoryAd />
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card bordered={false}>
                        <ColorAd />
                    </Card>
                </Col>

                <Col span={24}>
                    <Card bordered={false}>
                        <ProductAd />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Admin;