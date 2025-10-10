'use client';

import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import ButtonThird from '@/shared/Button/ButtonThird';
import { Checkbox, CheckboxField } from '@/shared/checkbox';
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list';
import { Field, FieldGroup, Fieldset, Label, Legend } from '@/shared/fieldset';
import { Subheading } from '@/shared/heading';
import { Input } from '@/shared/input';
import { Radio, RadioField, RadioGroup } from '@/shared/radio';
import { Select } from '@/shared/select';
import {
  CreditCardIcon,
  CreditCardPosIcon,
  InternetIcon,
  Route02Icon,
  Tick02Icon,
  UserCircle02Icon,
  Wallet03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import clsx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';

type Tab = 'ContactInfo' | 'ShippingAddress' | 'PaymentMethod';

const Information = () => {
  const [tabActive, setTabActive] = useState<Tab>('ShippingAddress');

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id);
    setTimeout(() => {
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <div className="space-y-6 sm:space-y-8" data-testid="checkout-information">
      <div id="ContactInfo" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Contact information"
          icon={UserCircle02Icon}
          value="Enrico Smith / +855-666-7744"
          onClickChange={() => {
            setTabActive('ContactInfo');
            handleScrollToEl('ContactInfo');
          }}
        />
        <div
          className={clsx(
            'border-t px-4 py-7 sm:px-6',
            tabActive !== 'ContactInfo' && 'invisible hidden',
          )}
        >
          <ContactInfo
            onClose={() => {
              setTabActive('ShippingAddress');
              handleScrollToEl('ShippingAddress');
            }}
          />
        </div>
      </div>

      <div id="ShippingAddress" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Shipping address"
          icon={Route02Icon}
          value="St. Paul's Road, Norris, SD 57560, Dakota, USA"
          onClickChange={() => {
            setTabActive('ShippingAddress');
            handleScrollToEl('ShippingAddress');
          }}
        />
        <div
          className={clsx(
            'border-t px-4 py-7 sm:px-6',
            tabActive !== 'ShippingAddress' && 'invisible hidden',
          )}
        >
          <ShippingAddress
            onClose={() => {
              setTabActive('PaymentMethod');
              handleScrollToEl('PaymentMethod');
            }}
          />
        </div>
      </div>

      <div id="PaymentMethod" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Payment method"
          icon={CreditCardPosIcon}
          value="Credit Card / xxx-xxx-xx55"
          onClickChange={() => {
            setTabActive('PaymentMethod');
            handleScrollToEl('PaymentMethod');
          }}
        />
        <div
          className={clsx(
            'border-t px-4 py-7 sm:px-6',
            tabActive !== 'PaymentMethod' && 'invisible hidden',
          )}
        >
          <PaymentMethod
            onClose={() => {
              setTabActive('ShippingAddress');
              handleScrollToEl('ShippingAddress');
            }}
          />
        </div>
      </div>
    </div>
  );
};

const TabHeader = ({
  title,
  icon,
  value,
  onClickChange,
}: {
  title: string;
  icon: IconSvgElement;
  value: string;
  onClickChange: () => void;
}) => {
  return (
    <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
      <HugeiconsIcon icon={icon} size={24} className="sm:mt-1.5" />
      <div className="sm:pl-3">
        <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
          <span className="uppercase tracking-tight">{title}</span>
          <HugeiconsIcon icon={Tick02Icon} size={24} className="text-primary-500 mb-1" />
        </h3>
        <div className="mt-1 text-sm font-semibold">{value}</div>
      </div>
      <button
        className="rounded-lg bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700"
        onClick={onClickChange}
        type="button"
      >
        Change
      </button>
    </div>
  );
};

const ContactInfo = ({ onClose }: { onClose: () => void }) => {
  return (
    <form
      action="#"
      method="POST"
      onSubmit={e => {
        e.preventDefault();
        const _formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement));
        // Form values processed
        onClose();
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold">Contact infomation</h3>
            <p className="text-sm">
              Do not have an account?{` `}
              <Link href="/login" className="font-medium underline">
                Log in
              </Link>
            </p>
          </div>
          <Field className="max-w-lg">
            <Label>Your phone number</Label>
            <Input defaultValue="+808 xxx" type="tel" name="phone" />
          </Field>
          <Field className="max-w-lg">
            <Label>Email address</Label>
            <Input type="email" name="email" />
          </Field>
          <Field>
            <CheckboxField>
              <Checkbox name="newsletter" defaultChecked />
              <Label>Email me news and offers</Label>
            </CheckboxField>
          </Field>

          {/* ============ */}
          <div className="flex flex-wrap gap-2.5 pt-4">
            <ButtonPrimary type="submit">Next to shipping address</ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              Cancel
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  );
};

const ShippingAddress = ({ onClose }: { onClose: () => void }) => {
  return (
    <form
      action="#"
      method="POST"
      onSubmit={e => {
        e.preventDefault();
        const _formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement));
        // Form values processed
        onClose();
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
            <Field>
              <Label>First name</Label>
              <Input defaultValue="Cole" name="first-name" />
            </Field>
            <Field>
              <Label>Last name</Label>
              <Input defaultValue="Enrico" name="last-name" />
            </Field>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
            <Field className="sm:col-span-2">
              <Label>Address</Label>
              <Input
                placeholder=""
                defaultValue="123, Dream Avenue, USA"
                type="text"
                name="address"
              />
            </Field>
            <Field>
              <Label>Apt, Suite *</Label>
              <Input defaultValue="55U - DD5 " name="apt-suite" />
            </Field>
          </div>

          {/* ============ */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
            <Field>
              <Label>City</Label>
              <Input defaultValue="Norris" name="city" />
            </Field>
            <Field>
              <Label>Country</Label>
              <Select defaultValue="United States " name="country">
                <option value="United States">United States</option>
                <option value="United States">Canada</option>
                <option value="United States">Mexico</option>
                <option value="United States">Israel</option>
                <option value="United States">France</option>
                <option value="United States">England</option>
                <option value="United States">Laos</option>
                <option value="United States">China</option>
              </Select>
            </Field>
            <Field>
              <Label>State/Province</Label>
              <Input defaultValue="Texas" name="state-province" />
            </Field>
            <Field>
              <Label>Postal code</Label>
              <Input defaultValue="2500" name="postal-code" />
            </Field>
          </div>

          <Field className="max-w-lg">
            <Legend>Address type</Legend>
            <RadioGroup
              className="space-y-0! mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3"
              name="address-type"
              defaultValue="at-home"
              aria-label="Address type"
            >
              <RadioField>
                <Label>
                  <span className="text-sm font-medium">
                    Home <span className="font-light">(All Day Delivery)</span>
                  </span>
                </Label>
                <Radio value="at-home" defaultChecked />
              </RadioField>

              <RadioField>
                <Label>
                  <span className="text-sm font-medium">
                    Office{' '}
                    <span className="font-light">
                      (Delivery <span className="font-medium">9 AM - 5 PM</span>)
                    </span>
                  </span>
                </Label>
                <Radio value="at-office" />
              </RadioField>
            </RadioGroup>
          </Field>

          {/* ============ */}
          <div className="flex flex-wrap gap-2.5 pt-6">
            <ButtonPrimary type="submit">Next to payment method</ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              Cancel
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  );
};

const PaymentMethod = ({ onClose }: { onClose: () => void }) => {
  const [mothodActive, setMethodActive] = useState<'Credit-Card' | 'Internet-banking' | 'Wallet'>(
    'Credit-Card',
  );

  const renderDebitCredit = () => {
    const active = mothodActive === 'Credit-Card';
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          onChange={e => setMethodActive(e as any)}
          value={mothodActive}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Credit-Card" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25',
                )}
              >
                <HugeiconsIcon icon={CreditCardIcon} size={24} />
              </div>
              <p className="font-medium sm:text-base">Debit / Credit Card</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('space-y-5 py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <Field className="max-w-lg">
            <Label>Card number</Label>
            <Input autoComplete="off" name="card-number" />
          </Field>
          <Field className="max-w-lg">
            <Label>Name on Card</Label>
            <Input autoComplete="off" name="name-on-card" />
          </Field>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Field className="flex-2/3">
              <Label>Expiration date (MM/YY)</Label>
              <Input autoComplete="off" placeholder="MM/YY" name="expiration-date" />
            </Field>
            <Field className="flex-1/3">
              <Label>CVC</Label>
              <Input autoComplete="off" placeholder="CVC" name="cvc" />
            </Field>
          </div>
        </div>
      </div>
    );
  };

  const renderInterNetBanking = () => {
    const active = mothodActive === 'Internet-banking';
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          onChange={e => setMethodActive(e as any)}
          value={mothodActive}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Internet-banking" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25',
                )}
              >
                <HugeiconsIcon icon={InternetIcon} size={24} />
              </div>
              <p className="font-medium sm:text-base">Internet banking</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <Subheading>Your order will be delivered to you after you transfer to</Subheading>
          <DescriptionList className="mt-3.5">
            <DescriptionTerm>Customer</DescriptionTerm>
            <DescriptionDetails>BooliiTheme</DescriptionDetails>

            <DescriptionTerm>Bank name</DescriptionTerm>
            <DescriptionDetails>Example Bank Name</DescriptionDetails>

            <DescriptionTerm>Account number</DescriptionTerm>
            <DescriptionDetails>555 888 777</DescriptionDetails>

            <DescriptionTerm>Sort code</DescriptionTerm>
            <DescriptionDetails>999</DescriptionDetails>

            <DescriptionTerm>IBAN</DescriptionTerm>
            <DescriptionDetails>IBAN</DescriptionDetails>

            <DescriptionTerm>BIC</DescriptionTerm>
            <DescriptionDetails>BIC/Swift</DescriptionDetails>
          </DescriptionList>
        </div>
      </div>
    );
  };

  const renderWallet = () => {
    const active = mothodActive === 'Wallet';
    return (
      <div>
        <RadioGroup
          name="payment-method"
          aria-label="Payment method"
          value={mothodActive}
          onChange={e => setMethodActive(e as any)}
        >
          <RadioField className="sm:gap-x-6">
            <Radio className="pt-3" value="Wallet" defaultChecked={active} />
            <Label className="flex items-center gap-x-4 sm:gap-x-6">
              <div
                className={clsx(
                  'rounded-xl border-2 border-neutral-600 p-2.5 dark:border-neutral-300',
                  active ? 'opacity-100' : 'opacity-25',
                )}
              >
                <HugeiconsIcon icon={Wallet03Icon} size={24} />
              </div>
              <p className="font-medium sm:text-base">Google / Apple Wallet</p>
            </Label>
          </RadioField>
        </RadioGroup>

        <div className={clsx('py-6 sm:pl-10', active ? 'block' : 'hidden')}>
          <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque dolore quod quas fugit
            perspiciatis architecto, temporibus quos ducimus libero explicabo?
          </p>
        </div>
      </div>
    );
  };

  return (
    <form
      action="#"
      method="POST"
      onSubmit={e => {
        e.preventDefault();
        const _formValues = Object.fromEntries(new FormData(e.target as HTMLFormElement));
        // Form values processed
        onClose();
      }}
    >
      <Fieldset>
        <FieldGroup className="mt-0!">
          {renderDebitCredit()}
          {renderInterNetBanking()}
          {renderWallet()}

          <div className="flex flex-wrap gap-2.5 pt-4">
            <ButtonPrimary className="min-w-56" type="submit">
              Confirm order
            </ButtonPrimary>
            <ButtonThird type="button" onClick={onClose}>
              Back to shipping address
            </ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  );
};

export default Information;
