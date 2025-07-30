import { Metadata } from 'next';
import { NewFlowForm } from './FlowForm';

export const metadata: Metadata = {
  title: 'Create a new Flow | Flowbuilder',
};

const NewFlowPage = async () => {
  return (
    <NewFlowForm />
  );
};

export default NewFlowPage;
