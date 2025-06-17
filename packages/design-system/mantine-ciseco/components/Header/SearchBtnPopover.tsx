'use client';

import { Cancel01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { redirect } from 'next/navigation';

import { useLocalizeHref } from '../../hooks/useLocale';
import { Divider } from '../Divider';
import { Link } from '../Link';

interface SearchBtnPopoverProps extends Record<string, any> {
  'data-testid'?: string;
}

const SearchBtnPopover = ({
  'data-testid': testId = 'search-popover',
}: SearchBtnPopoverProps = {}) => {
  const localizeHref = useLocalizeHref();
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <>
      <button
        className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800"
        data-testid={testId}
        onClick={open}
      >
        <HugeiconsIcon color="currentColor" icon={Search01Icon} size={24} strokeWidth={1.5} />
      </button>

      <Modal
        classNames={{
          body: 'p-0',
          content: 'bg-white dark:bg-neutral-900',
        }}
        data-testid="search-modal"
        fullScreen
        opened={opened}
        padding={0}
        styles={{
          content: {
            borderRadius: 0,
          },
        }}
        transitionProps={{
          duration: 200,
          transition: 'slide-down',
        }}
        withCloseButton={false}
        onClose={close}
      >
        <div className="bg-white pt-20 text-neutral-950 shadow-xl dark:border-b dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100">
          <div className="container">
            <div className="mx-auto flex w-full max-w-xl flex-col py-4">
              <form
                action="#"
                className="flex w-full items-center"
                data-testid="search-form"
                onSubmit={(e: any) => {
                  e.preventDefault();
                  close();
                  redirect(localizeHref('/search'));
                }}
              >
                <HugeiconsIcon color="currentColor" icon={Search01Icon} size={26} strokeWidth={1} />
                <input
                  aria-autocomplete="list"
                  aria-label="Search for products"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  autoFocus
                  className="w-full !border-none px-4 py-2 text-sm/6 uppercase !ring-0 focus-visible:outline-none bg-transparent"
                  data-autofocus
                  data-testid="search-input"
                  name="q"
                  spellCheck="false"
                  type="text"
                />
                <button
                  className="-m-2.5 inline-flex cursor-pointer items-center justify-center rounded-md p-2.5 transition-transform duration-300 hover:rotate-90"
                  data-testid="search-close-button"
                  type="button"
                  onClick={close}
                >
                  <HugeiconsIcon
                    color="currentColor"
                    icon={Cancel01Icon}
                    size={24}
                    strokeWidth={1}
                  />
                </button>

                <input hidden type="submit" value="" />
              </form>
              <Divider className="my-4 block md:hidden" />
              <div className="block text-xs/6 text-neutral-500 uppercase md:hidden">
                Press{' '}
                <Link
                  className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-900"
                  href={localizeHref('/search')}
                >
                  <kbd className="text-xs font-medium">Enter</kbd>
                </Link>{' '}
                to search or{' '}
                <kbd className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-900">
                  <span className="text-xs font-medium">Esc</span>
                </kbd>{' '}
                to cancel
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SearchBtnPopover;
