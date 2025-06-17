import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import AccordionInfo from '../../../mantine-ciseco/components/AccordionInfo';

describe('AccordionInfo', (_: any) => {
  const customData = [
    {
      name: 'Custom Section 1',
      content: 'Custom content for section 1',
    },
    {
      name: 'Custom Section 2',
      content: 'Custom content for section 2',
    },
  ];

  it('renders with default data', (_: any) => {
    render(<AccordionInfo />);
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Fabric + Care')).toBeInTheDocument();
    expect(screen.getByText('How it Fits')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders with custom data', (_: any) => {
    render(<AccordionInfo data={customData} />);
    expect(screen.getByText('Custom Section 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Section 2')).toBeInTheDocument();
  });

  it('expands first two sections by default', (_: any) => {
    render(<AccordionInfo />);
    const descriptionContent = screen.getByText(/Fashion is a form of self-expression/);
    const fabricContent = screen.getByText(/Made from a sheer Belgian power micromesh/);
    expect(descriptionContent).toBeVisible();
    expect(fabricContent).toBeVisible();
  });

  it('toggles section visibility on click', async () => {
    render(<AccordionInfo />);
    const howItFitsButton = screen.getByText('How it Fits');

    // Initially closed
    expect(screen.queryByText(/Use this as a guide/)).not.toBeVisible();

    // Click to open
    fireEvent.click(howItFitsButton);
    await waitFor(() => {
      expect(screen.getByText(/Use this as a guide/)).toBeVisible();
    });

    // Click to close
    fireEvent.click(howItFitsButton);
    await waitFor(() => {
      expect(screen.queryByText(/Use this as a guide/)).not.toBeVisible();
    });
  });

  it('renders HTML content safely', (_: any) => {
    render(<AccordionInfo />);
    const fabricButton = screen.getByText('Fabric + Care');
    fireEvent.click(fabricButton);

    const content = screen.getByText(/Made from a sheer Belgian power micromesh/);
    expect(content.parentElement).toHaveClass('list-disc', 'list-inside', 'leading-7');
  });

  it('renders with custom panel className', (_: any) => {
    render(<AccordionInfo panelClassName="custom-panel" />);
    const descriptionButton = screen.getByText('Description');
    fireEvent.click(descriptionButton);

    const panel = screen.getByText(/Fashion is a form of self-expression/).parentElement;
    expect(panel).toHaveClass('custom-panel');
  });

  it('allows multiple sections to be open simultaneously', async () => {
    render(<AccordionInfo />);
    const howItFitsButton = screen.getByText('How it Fits');
    const faqButton = screen.getByText('FAQ');

    // Open both sections
    fireEvent.click(howItFitsButton);
    fireEvent.click(faqButton);

    await waitFor(() => {
      expect(screen.getByText(/Use this as a guide/)).toBeVisible();
      expect(screen.getByText(/All full-priced, unworn items/)).toBeVisible();
    });
  });
});
