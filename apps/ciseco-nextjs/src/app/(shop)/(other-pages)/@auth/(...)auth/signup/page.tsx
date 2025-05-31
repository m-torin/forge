import PageSignUp from '@/app/(auth)/signup/page';
import AuthModal from '@/components/AuthModal';

export default function InterceptedSignupPage() {
  return (
    <AuthModal>
      <PageSignUp />
    </AuthModal>
  );
}