import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input.jsx';

describe('Input Component', () => {
  it('should render label text when provided', () => {
    render(<Input label="Email Address" placeholder="you@example.com" />);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('should display error message and apply error styles when error prop is set', () => {
    render(<Input label="Password" error="Password is required" />);
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
