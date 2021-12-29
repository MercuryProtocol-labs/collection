import { useEffect } from 'react';
import { useCollectionsCount, useCollections, useTreasuryBalance } from '@/hooks';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import CollectionItem from './Item';
import classnames from 'classnames';
import styles from './index.less';

export const GUTTER = [16, { xs: 8, sm: 16, md: 16, lg: 16 }] as any;

export default () => {
  const count = useCollectionsCount();
  const { collections, isLoading } = useCollections();
  const balance = useTreasuryBalance();

  return (
    <div className={styles.home}>
      <Row gutter={GUTTER} className="home-info-row">
        <Col xs={24} xl={6}>
          <Card>
            <Statistic title="Current collections size" value={count?.collections} />
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card>
            <Statistic title="Total supply" value={count?.supply} />
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card>
            <Statistic title="Total stars" value={count?.stars} />
          </Card>
        </Col>
        <Col xs={24} xl={6}>
          <Card>
            <Statistic
              title="Treasury Balance"
              value={balance.uiAmount}
              suffix="SOL"
              valueStyle={{ color: 'rgb(171 102 255)' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: '24px' }}>
        <div className={classnames(styles.homeItem, styles.homeItemHeader)}>
          <div>#</div>
          <div>Collection</div>
          <div>Tags</div>
          <div>Items</div>
          <div>Stars</div>
        </div>

        {collections?.map((col, index) => (
          <CollectionItem key={col.pubkey.toString()} index={index + 1} data={col} />
        ))}

        {isLoading && (
          <div style={{ height: '80px', marginTop: '120px' }}>
            <Spin />
          </div>
        )}
      </Card>
    </div>
  );
};
