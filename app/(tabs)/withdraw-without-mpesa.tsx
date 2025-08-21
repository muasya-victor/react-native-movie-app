import { useEffect } from 'react';
import WithdrawWithoutMPesaComponent from '@/components/WithdrawWithoutMPesa/WithdrawWithoutMPesa';

export default function WithdrawWithoutMPesa() {
  useEffect(() => {
    // Page-level effects (analytics, logging, etc.)
    console.log('WithdrawWithoutMPesa page loaded');
  }, []);

  return <WithdrawWithoutMPesaComponent />;
}
