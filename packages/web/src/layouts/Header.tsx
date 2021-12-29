import { NavLink } from 'umi';
import { Menu } from 'antd';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styles from './index.less';

export default () => {
  return (
    <div className={styles.header}>
      <div className={styles.menus}>
        <NavLink to="/collections" activeClassName={styles.active}>
          Collections
        </NavLink>
        <NavLink to="/create" activeClassName={styles.active}>
          Create
        </NavLink>
      </div>

      <div className={styles.walletBtns}>
        <WalletMultiButton />
      </div>
    </div>
  );
};
