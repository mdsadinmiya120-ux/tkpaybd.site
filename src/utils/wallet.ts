import { Transaction } from '../types';

export const getValidRandomWalletNumber = (method: string): string => {
  try {
    const savedNums = localStorage.getItem('chaopaopay_deposit_numbers_list');
    const savedTx = localStorage.getItem('chaopaopay_transactions');
    const allTx: Transaction[] = savedTx ? JSON.parse(savedTx) : [];

    if (savedNums) {
      const list = JSON.parse(savedNums);
      const methodList = list.filter((item: any) => item.method.toLowerCase() === method.toLowerCase());
      
      const validList = methodList.filter((item: any) => {
        const limit = item.limit !== undefined ? Number(item.limit) : 50000;
        const used = allTx
          .filter(t => t.walletNumber === item.number && (t.status === 'Success' || t.status === 'Pending'))
          .reduce((sum, t) => sum + t.amount, 0);
        return used < limit;
      });

      if (validList.length > 0) {
        const randomIndex = Math.floor(Math.random() * validList.length);
        return validList[randomIndex].number;
      }
      if (methodList.length > 0) {
        return methodList[0].number;
      }
    }
  } catch (e) {}
  return '12345678';
};
