import PageLogin from '@/app/(auth)/login/page';
import AuthModal from '@/components/AuthModal';

export default function InterceptedLoginPage() {
  return (
    <AuthModal>
      <PageLogin />
    </AuthModal>
  );
}