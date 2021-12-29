import { useState } from 'react';
import { Typography, Input, Space, Select, Button, message } from 'antd';
import { useHistory } from 'umi';
import { createCollection, CreateCollectionArgs } from '@mercury-protocol/collection-js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import styles from './index.less';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const children = [
  <Option key="Digital" value="Digital">
    Digital
  </Option>,
  <Option key="Physical" value="Physical">
    Physical
  </Option>,
  <Option key="Metaverse" value="Metaverse">
    Metaverse
  </Option>,
  <Option key="Art" value="Art">
    Art
  </Option>,
  <Option key="Image" value="Image">
    Image
  </Option>,
];

export default () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CreateCollectionArgs>({
    type: 0,
    title: '',
    symbol: '',
    description: '',
    icon_image: '',
    header_image: '',
    short_description: '',
    banaer: '',
    tags: [],
  });

  async function handleCreate() {
    if (!data.title || !data.symbol || !data.description || !data.icon_image) {
      return message.error('Check Form data');
    }

    if (!wallet?.publicKey) return message.error('wallet not connected');
    if (!wallet?.signTransaction) return message.error('wallet not connected');

    setLoading(true);
    const { hash, pubkey } = await createCollection(
      connection,
      wallet.publicKey,
      new CreateCollectionArgs(data),
      wallet.signTransaction,
    );
    setLoading(false);
    console.log('hash: ', hash);

    message.success(hash);
    history.push(`/collection/${pubkey.toString()}`);
  }

  return (
    <div className={styles.createPage}>
      <div style={{ width: '732px', margin: '0 auto' }}>
        <div className={styles.block}>
          <Space direction="vertical" size={48} style={{ width: '100%' }}>
            <div>
              <Title level={3}>
                <Text type="danger">*</Text>
                Title
              </Title>
              <Input
                size="large"
                placeholder="e.g. 'My first collection'"
                onChange={(e) => setData({ ...data, title: e.target.value })}
              />
            </div>

            <div>
              <Title level={3}>
                <Text type="danger">*</Text>
                Description
              </Title>
              <TextArea
                size="large"
                rows={3}
                placeholder="e.g. 'Life is beautiful when you mint NFTs'"
                onChange={(e) => setData({ ...data, description: e.target.value })}
              />
            </div>

            <div>
              <Title level={3}>Short description</Title>
              <TextArea
                size="large"
                rows={3}
                placeholder="e.g. 'Life is beautiful when you mint NFTs'"
                onChange={(e) => setData({ ...data, short_description: e.target.value })}
              />
            </div>
          </Space>
        </div>

        <div className={styles.block}>
          <Space direction="vertical" size={48} style={{ width: '100%' }}>
            <div>
              <Title level={3}>
                <Text type="danger">*</Text>
                Your Icon Image
              </Title>
              <Input
                size="large"
                placeholder="e.g. 'https://arweave.net/xxx'"
                onChange={(e) => setData({ ...data, icon_image: e.target.value })}
              />
            </div>

            <div>
              <Title level={3}>Your header Image</Title>
              <Input
                size="large"
                placeholder="e.g. 'https://arweave.net/xxx'"
                onChange={(e) => setData({ ...data, header_image: e.target.value })}
              />
            </div>

            <div>
              <Title level={3}>Your Promotional Banner</Title>
              <Input
                size="large"
                placeholder="e.g. 'https://arweave.net/xxx'"
                onChange={(e) => setData({ ...data, banaer: e.target.value })}
              />
            </div>
          </Space>
        </div>

        <div className={styles.block}>
          <Space direction="vertical" size={48} style={{ width: '100%' }}>
            <div>
              <Title level={3}>
                <Text type="danger">*</Text>
                Collection Symbol
              </Title>
              <Input
                size="large"
                placeholder="e.g. 'TheStars'"
                onChange={(e) => setData({ ...data, symbol: e.target.value })}
              />
            </div>

            <div>
              <Title level={3}>Tags</Title>
              <Select
                size="large"
                mode="tags"
                style={{ width: '100%' }}
                placeholder="Tags Mode"
                onChange={(value: string[]) => setData({ ...data, tags: value })}
              >
                {children}
              </Select>
            </div>
          </Space>
        </div>

        <Button
          style={{ marginTop: '48px', marginBottom: '48px' }}
          size="large"
          type="primary"
          block
          onClick={handleCreate}
          loading={loading}
        >
          Create Collection
        </Button>
      </div>
    </div>
  );
};
