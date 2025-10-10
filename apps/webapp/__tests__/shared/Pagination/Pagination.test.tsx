import Pagination from '@/shared/Pagination/Pagination';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

describe('pagination', () => {
  test('should render pagination component', () => {
    render(<Pagination currentPage={1} totalPages={10} />);

    const pagination = screen.getByRole('navigation');
    expect(pagination).toBeInTheDocument();
  });

  test('should render current page number', () => {
    render(<Pagination currentPage={3} totalPages={10} />);

    const currentPage = screen.getByText('3');
    expect(currentPage).toBeInTheDocument();
    // The current page has aria-current="page" attribute
    const currentPageLink = screen.getByLabelText('Page 3');
    expect(currentPageLink).toHaveAttribute('aria-current', 'page');
  });

  test('should render previous button', () => {
    render(<Pagination currentPage={3} totalPages={10} />);

    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeInTheDocument();
  });

  test('should render next button', () => {
    render(<Pagination currentPage={3} totalPages={10} />);

    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeInTheDocument();
  });

  test('should disable previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={10} />);

    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  test('should disable next button on last page', () => {
    render(<Pagination currentPage={10} totalPages={10} />);

    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  test('should handle page number clicks', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />);

    const pageButton = screen.getByText('5');
    fireEvent.click(pageButton);

    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  test('should handle previous button click', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />);

    const prevButton = screen.getByLabelText('Previous page');
    fireEvent.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('should handle next button click', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />);

    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  test('should show ellipsis for large page ranges', () => {
    render(<Pagination currentPage={5} totalPages={20} showFirstLast />);

    // The component might render ellipsis as HTML entity or as actual character
    const ellipses = screen.queryAllByText('…');
    // Should have at least one ellipsis with large page ranges
    expect(ellipses.length).toBeGreaterThan(0);
  });

  test('should render first and last page links', () => {
    render(<Pagination currentPage={10} totalPages={20} showFirstLast />);

    const firstPage = screen.getByText('1');
    const lastPage = screen.getByText('20');

    expect(firstPage).toBeInTheDocument();
    expect(lastPage).toBeInTheDocument();
  });

  test('should apply custom className', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={5} className="custom-pagination" />,
    );

    const pagination = container.firstChild as HTMLElement;
    expect(pagination).toHaveClass('custom-pagination');
  });

  test('should be accessible with proper ARIA labels', () => {
    render(<Pagination currentPage={3} totalPages={10} />);

    const pagination = screen.getByRole('navigation');
    expect(pagination).toHaveAttribute('aria-label', 'Page navigation');
  });

  test('should render page info text', () => {
    render(<Pagination currentPage={3} totalPages={10} showInfo />);

    const pageInfo = screen.queryByText(/page 3 of 10/i) || screen.queryByText(/3.*10/);
    expect(pageInfo).toBeInTheDocument();
  });

  test('should handle single page scenario', () => {
    render(<Pagination currentPage={1} totalPages={1} />);

    const currentPage = screen.getByText('1');
    expect(currentPage).toBeInTheDocument();

    // Previous and next buttons should be disabled
    const prevButton = screen.getByLabelText('Previous page');
    const nextButton = screen.getByLabelText('Next page');

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  test('should render without errors', () => {
    expect(() => {
      render(<Pagination currentPage={1} totalPages={5} />);
    }).not.toThrow();
  });
});
