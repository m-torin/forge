'use client';

import { useState } from 'react';

import ContactInfo from './ContactInfo';
import PaymentMethod from './PaymentMethod';
import ShippingAddress from './ShippingAddress';

interface Props {}

const LeftSide = ({}: Props) => {
  const [tabActive, setTabActive] = useState<'ContactInfo' | 'ShippingAddress' | 'PaymentMethod'>(
    'ShippingAddress',
  );

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id);
    setTimeout(() => {
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <div className="space-y-8">
      <div id="ContactInfo" className="scroll-mt-24">
        <ContactInfo
          onCloseActive={() => {
            setTabActive('ShippingAddress');
            handleScrollToEl('ShippingAddress');
          }}
          onOpenActive={() => {
            setTabActive('ContactInfo');
            handleScrollToEl('ContactInfo');
          }}
          isActive={tabActive === 'ContactInfo'}
        />
      </div>

      <div id="ShippingAddress" className="scroll-mt-24">
        <ShippingAddress
          onCloseActive={() => {
            setTabActive('PaymentMethod');
            handleScrollToEl('PaymentMethod');
          }}
          onOpenActive={() => {
            setTabActive('ShippingAddress');
            handleScrollToEl('ShippingAddress');
          }}
          isActive={tabActive === 'ShippingAddress'}
        />
      </div>

      <div id="PaymentMethod" className="scroll-mt-24">
        <PaymentMethod
          onCloseActive={() => setTabActive('PaymentMethod')}
          onOpenActive={() => {
            setTabActive('PaymentMethod');
            handleScrollToEl('PaymentMethod');
          }}
          isActive={tabActive === 'PaymentMethod'}
        />
      </div>
    </div>
  );
};

export default LeftSide;
