import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loading from './Loading';

describe('Loading', () => {
  it('renders loading container with spinner and text', () => {
    const { container } = render(<Loading />);

    const loadingContainer = container.querySelector('.loading-container');
    expect(loadingContainer).toBeInTheDocument();

    const loadingSpinner = container.querySelector('.loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();

    const loadingText = container.querySelector('.loading-text');
    expect(loadingText).toBeInTheDocument();
  });

  it('has correct CSS classes for styling', () => {
    const { container } = render(<Loading />);

    const containerElement = container.querySelector('.loading-container');
    expect(containerElement).toBeInTheDocument();

    const spinnerElement = container.querySelector('.loading-spinner');
    expect(spinnerElement).toBeInTheDocument();

    const textElement = container.querySelector('.loading-text');
    expect(textElement).toBeInTheDocument();
  });

  it('renders as a simple loading indicator without text content', () => {
    const { container } = render(<Loading />);

    const loadingText = container.querySelector('.loading-text');
    expect(loadingText).toHaveTextContent('');
  });
});
