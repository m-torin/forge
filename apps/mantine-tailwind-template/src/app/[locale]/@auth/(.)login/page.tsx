import { getDictionary, type Locale } from '#/lib/i18n';
import LoginModalUi from '../LoginModalUi';
import { Modal } from '../Modal';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function LoginModal({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <Modal title={(dict as any).auth?.login || 'Login'}>
      <LoginModalUi locale={locale} dict={dict} />
    </Modal>
  );
}
