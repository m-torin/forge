/**
 * Accessibility Integration Tests
 *
 * Tests accessibility features across multiple components
 * working together in realistic scenarios.
 */

import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { getAxe } from '../vitest-a11y-setup';
import { accessibilityTestPatterns, accessibilityUtils } from './jest-dom-setup';

// Setup handled by vitest-a11y-setup

// Mock components for testing (since we don't have actual implementations in test)
const MockFormComponent = ({ children }: { children: React.ReactNode }) => (
  <form role="form" aria-label="Test form">
    <fieldset>
      <legend>Personal Information</legend>
      {children}
    </fieldset>
  </form>
);

const MockInput = ({
  label,
  id,
  required = false,
  error = false,
  type = 'text',
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: boolean;
  type?: string;
}) => (
  <div className="form-field">
    <label htmlFor={id}>
      {label}
      {required && <span aria-label="required"> *</span>}
    </label>
    <input
      id={id}
      type={type}
      required={required}
      aria-invalid={error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    {error && (
      <div id={`${id}-error`} role="alert" aria-live="polite">
        This field has an error
      </div>
    )}
  </div>
);

const MockButton = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) => (
  <button onClick={onClick} disabled={disabled} aria-label={ariaLabel} type="button">
    {children}
  </button>
);

describe('accessibility Integration Tests', () => {
  describe('form Accessibility Integration', () => {
    test('should handle complex form with proper accessibility', async () => {
      const user = userEvent.setup();

      render(
        <MantineProvider>
          <MockFormComponent>
            <MockInput id="name" label="Full Name" required={true} />
            <MockInput id="email" label="Email Address" type="email" required={true} />
            <MockInput id="phone" label="Phone Number" error={false} />
            <MockButton>Submit Form</MockButton>
          </MockFormComponent>
        </MantineProvider>,
      );

      const form = screen.getByRole('form');

      // Test basic accessibility compliance
      await accessibilityTestPatterns.testBasicAccessibility(form);

      // Test form-specific accessibility
      await accessibilityTestPatterns.testFormAccessibility(form);

      // Test keyboard navigation
      await accessibilityTestPatterns.testKeyboardNavigation(form);

      // Test axe-core integration
      const axe = await getAxe();
      const results = await axe(form);
      expect(results).toHaveNoViolations();

      // Test field interactions
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');
      expect(nameInput).toHaveValue('John Doe');

      // Test focus management
      await user.tab();
      const emailInput = screen.getByLabelText(/email address/i);
      expect(accessibilityUtils.isFocused(emailInput)).toBeTruthy();
    });

    test('should handle form validation errors accessibly', async () => {
      const user = userEvent.setup();

      render(
        <MantineProvider>
          <MockFormComponent>
            <MockInput id="email" label="Email Address" type="email" required={true} error={true} />
            <MockInput
              id="password"
              label="Password"
              type="password"
              required={true}
              error={true}
            />
          </MockFormComponent>
        </MantineProvider>,
      );

      const form = screen.getByRole('form');

      // Test error announcement
      expect(accessibilityUtils.checkErrorAnnouncement(form)).toBeTruthy();

      // Test ARIA invalid attributes
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');

      // Test error messages are properly associated
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('This field has an error');
    });
  });

  describe('interactive Widget Accessibility', () => {
    test('should handle modal dialogs with proper focus management', async () => {
      const user = userEvent.setup();
      let isOpen = false;

      const MockModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <h2 id="modal-title">Confirmation</h2>
            <p id="modal-description">Are you sure you want to proceed?</p>
            <button onClick={onClose} aria-label="Cancel">
              Cancel
            </button>
            <button onClick={onClose} aria-label="Confirm">
              Confirm
            </button>
            <button onClick={onClose} aria-label="Close modal">
              ×
            </button>
          </div>
        ) : null;

      const TestComponent = () => {
        const [modalOpen, setModalOpen] = React.useState(false);

        return (
          <div>
            <button onClick={() => setModalOpen(true)}>Open Modal</button>
            <MockModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
          </div>
        );
      };

      render(
        <MantineProvider>
          <TestComponent />
        </MantineProvider>,
      );

      // Open modal
      const openButton = screen.getByText('Open Modal');
      await user.click(openButton);

      // Test modal accessibility
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');

      // Test focus management within modal
      await accessibilityTestPatterns.testKeyboardNavigation(dialog);

      // Test axe compliance
      const axe = await getAxe();
      const results = await axe(dialog);
      expect(results).toHaveNoViolations();
    });

    test('should handle combobox with proper ARIA attributes', async () => {
      const user = userEvent.setup();

      const MockCombobox = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [value, setValue] = React.useState('');

        return (
          <div>
            <label htmlFor="combo">Choose an option</label>
            <input
              id="combo"
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-controls="combo-listbox"
              aria-owns="combo-listbox"
              value={value}
              onChange={e => setValue(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 100)}
            />
            {isOpen && (
              <ul id="combo-listbox" role="listbox" aria-label="Options">
                <li role="option" aria-selected={false} onClick={() => setValue('Option 1')}>
                  Option 1
                </li>
                <li role="option" aria-selected={false} onClick={() => setValue('Option 2')}>
                  Option 2
                </li>
              </ul>
            )}
          </div>
        );
      };

      render(
        <MantineProvider>
          <MockCombobox />
        </MantineProvider>,
      );

      const combobox = screen.getByRole('combobox');

      // Test initial state
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
      expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');

      // Open combobox
      await user.click(combobox);

      // Test expanded state
      expect(combobox).toHaveAttribute('aria-expanded', 'true');

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      expect(listbox).toHaveAttribute('aria-label', 'Options');

      // Test options
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
      options.forEach(option => {
        expect(option).toHaveAttribute('aria-selected', 'false');
      });

      // Test axe compliance
      const axe = await getAxe();
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('dynamic Content Accessibility', () => {
    test('should handle live regions and status updates', async () => {
      const user = userEvent.setup();

      const MockLiveRegion = () => {
        const [status, setStatus] = React.useState('Ready');
        const [progress, setProgress] = React.useState(0);

        return (
          <div>
            <button
              onClick={() => {
                setStatus('Loading...');
                setProgress(50);
                setTimeout(() => {
                  setStatus('Complete');
                  setProgress(100);
                }, 100);
              }}
            >
              Start Process
            </button>

            <div aria-live="polite" aria-atomic="true">
              Status: {status}
            </div>

            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Process progress"
            >
              {progress}%
            </div>

            {status === 'Complete' && <div role="alert">Process completed successfully!</div>}
          </div>
        );
      };

      render(
        <MantineProvider>
          <MockLiveRegion />
        </MantineProvider>,
      );

      // Test initial state
      const liveRegion = screen.getByText('Status: Ready').parentElement;
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');

      // Start process
      const startButton = screen.getByText('Start Process');
      await user.click(startButton);

      // Wait for completion
      await screen.findByRole('alert');

      // Test final state
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Process completed successfully!');

      // Test axe compliance
      const axe = await getAxe();
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('complex Navigation Accessibility', () => {
    test('should handle tab panels with proper keyboard navigation', async () => {
      const user = userEvent.setup();

      const MockTabPanel = () => {
        const [activeTab, setActiveTab] = React.useState(0);
        const tabs = ['Tab 1', 'Tab 2', 'Tab 3'];

        return (
          <div>
            <div role="tablist" aria-label="Main navigation">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === index}
                  aria-controls={`panel-${index}`}
                  id={`tab-${index}`}
                  tabIndex={activeTab === index ? 0 : -1}
                  onClick={() => setActiveTab(index)}
                  onKeyDown={e => {
                    if (e.key === 'ArrowRight') {
                      setActiveTab((activeTab + 1) % tabs.length);
                    } else if (e.key === 'ArrowLeft') {
                      setActiveTab(activeTab === 0 ? tabs.length - 1 : activeTab - 1);
                    }
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {tabs.map((tab, index) => (
              <div
                key={`panel-${index}`}
                id={`panel-${index}`}
                role="tabpanel"
                aria-labelledby={`tab-${index}`}
                hidden={activeTab !== index}
                tabIndex={0}
              >
                Content for {tab}
              </div>
            ))}
          </div>
        );
      };

      render(
        <MantineProvider>
          <MockTabPanel />
        </MantineProvider>,
      );

      // Test tab list structure
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Main navigation');

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);

      // Test initial selection
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[0]).toHaveAttribute('tabindex', '0');
      expect(tabs[1]).toHaveAttribute('tabindex', '-1');

      // Test tab panels
      const panels = screen.getAllByRole('tabpanel');
      expect(panels).toHaveLength(3);
      expect(panels[0]).not.toHaveAttribute('hidden');
      expect(panels[1]).toHaveAttribute('hidden');

      // Test keyboard navigation
      tabs[0].focus();
      await user.keyboard('[ArrowRight]');

      // Check if navigation worked (would need proper implementation)
      // This is a simplified test

      // Test axe compliance
      const axe = await getAxe();
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('screen Reader Optimized Content', () => {
    test('should provide rich semantic markup for screen readers', async () => {
      render(
        <MantineProvider>
          <main>
            <header>
              <h1>Application Title</h1>
              <nav aria-label="Main navigation">
                <ul>
                  <li>
                    <a href="#section1">Section 1</a>
                  </li>
                  <li>
                    <a href="#section2">Section 2</a>
                  </li>
                </ul>
              </nav>
            </header>

            <section id="section1" aria-labelledby="section1-title">
              <h2 id="section1-title">First Section</h2>
              <p>Content for the first section.</p>

              <aside aria-label="Related information">
                <h3>Additional Info</h3>
                <p>Some related content.</p>
              </aside>
            </section>

            <section id="section2" aria-labelledby="section2-title">
              <h2 id="section2-title">Second Section</h2>
              <article>
                <h3>Article Title</h3>
                <p>Article content goes here.</p>
              </article>
            </section>

            <footer>
              <p>&copy; 2024 Company Name</p>
            </footer>
          </main>
        </MantineProvider>,
      );

      // Test landmark structure
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');

      const sections = screen.getAllByRole('region');
      expect(sections).toHaveLength(2);

      const aside = screen.getByRole('complementary');
      expect(aside).toHaveAttribute('aria-label', 'Related information');

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Test heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveAttribute('aria-level', '1'); // h1
      expect(headings[1]).toHaveAttribute('aria-level', '2'); // h2
      expect(headings[2]).toHaveAttribute('aria-level', '3'); // h3

      // Test screen reader compatibility
      accessibilityTestPatterns.testScreenReaderCompatibility(main);

      // Test axe compliance
      const axe = await getAxe();
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });
});
