import { Divider } from '@/components/Divider';
import SectionPromo1 from '@/components/SectionPromo1';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import SocialsList from '@/shared/SocialsList/SocialsList';
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset';
import { Input } from '@/shared/input';
import { Textarea } from '@/shared/textarea';
import { Metadata } from 'next';
import Form from 'next/form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact us for any inquiries or support',
};

const info = [
  {
    title: '🗺 ADDRESS',
    desc: 'Photo booth tattooed prism, portland taiyaki hoodie neutra typewriter',
  },
  {
    title: '💌 EMAIL',
    desc: 'nc.example@example.com',
  },
  {
    title: '☎ PHONE',
    desc: '000-123-456-7890',
  },
];

const PageContact = async () => {
  const handleSubmit = async (formData: FormData) => {
    'use server';
    const _formObject = Object.fromEntries(formData.entries());
    // TODO: Implement the logic to handle the form submission, e.g., send an email or save to a database
  };

  return (
    <div className="pb-16 pt-12 sm:py-16 lg:py-24">
      <div className="container mx-auto flex max-w-6xl flex-col gap-y-16 lg:gap-y-28">
        <div className="grid shrink-0 grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-neutral-900 md:text-5xl dark:text-neutral-100">
              Contact
            </h1>
            <div className="mt-10 flex max-w-sm flex-col gap-y-8 sm:mt-14">
              {info.map(item => (
                <div key={`contact-info-${item.title}`}>
                  <p className="text-sm font-semibold uppercase tracking-wider dark:text-neutral-200">
                    {item.title}
                  </p>
                  <span className="mt-4 block text-neutral-500 dark:text-neutral-400">
                    {item.desc}
                  </span>
                </div>
              ))}
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider dark:text-neutral-200">
                  🌏 SOCIALS
                </p>
                <SocialsList className="mt-4" />
              </div>
            </div>
          </div>

          <div>
            <Form action={handleSubmit}>
              <Fieldset>
                <FieldGroup>
                  <Field>
                    <Label>Full name</Label>
                    <Input name="name" placeholder="Example Doe" type="text" />
                  </Field>
                  <Field>
                    <Label>Email address</Label>
                    <Input name="email" type="email" placeholder="example@example.com" />
                  </Field>
                  <Field>
                    <Label>Message</Label>
                    <Textarea name="message" rows={6} />
                  </Field>
                  <ButtonPrimary type="submit">Send Message</ButtonPrimary>
                </FieldGroup>
              </Fieldset>
            </Form>
          </div>
        </div>

        <Divider />
      </div>

      <div className="container pt-16 lg:pt-28">
        <SectionPromo1 />
      </div>
    </div>
  );
};

export default PageContact;
