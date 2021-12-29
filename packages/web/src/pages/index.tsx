import { useState, useEffect } from 'react';
import { Transaction } from '@solana/web3.js';
import { Space, Button } from 'antd';

export default () => {
  async function setup() {
    console.log('setup');
  }

  return (
    <div>
      <h1>Index Page</h1>

      <Space>
        <Button onClick={setup}>setup</Button>
      </Space>
    </div>
  );
};
