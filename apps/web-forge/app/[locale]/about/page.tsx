import { getDictionary } from '@repo/internationalization';

interface AboutProps {
  params: Promise<{
    locale: string;
  }>;
}

const AboutPage = async ({ params }: AboutProps) => {
  const { locale } = await params;
  const _dictionary = await getDictionary(locale);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>
      <p className="text-lg mb-4">Current locale: {locale}</p>
      <p className="text-lg">
        This is the about page. The internationalization middleware should handle URL rewriting so
        that /about shows the English version and /es/about shows the Spanish version.
      </p>
    </div>
  );
};

export default AboutPage;
