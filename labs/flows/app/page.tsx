import { Metadata } from 'next';
import { InstanceHomeUI } from './UI';

export const metadata: Metadata = {
  title: 'Say hi to Flowbuilder',
};

const HomePage = async () => {
  return (
    <InstanceHomeUI />
  );
};

export default HomePage;
