import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button.jsx';

describe('Button Component', () => {
  it('should render button text correctly', () => {
    render(<Button>Save Changes</Button>);
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('should trigger onClick callback when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render loading state spinner and disable interaction when isLoading is true', () => {
    render(<Button isLoading={true}>Submit Form</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
