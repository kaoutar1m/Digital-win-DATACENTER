import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from '../ui/StatCard';

describe('StatCard', () => {
  const defaultProps = {
    title: 'Test Title',
    value: '42',
    icon: '📊',
  };

  it('renders correctly with all props', () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('renders without value', () => {
    const propsWithoutValue = {
      title: 'Test Title',
      icon: '📊',
    };

    render(<StatCard {...propsWithoutValue} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('renders without icon', () => {
    const propsWithoutIcon = {
      title: 'Test Title',
      value: '42',
    };

    render(<StatCard {...propsWithoutIcon} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.queryByText('📊')).not.toBeInTheDocument();
  });

  it('handles large numbers correctly', () => {
    const propsWithLargeNumber = {
      title: 'Large Number',
      value: '1,234,567',
      icon: '💰',
    };

    render(<StatCard {...propsWithLargeNumber} />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('renders with children', () => {
    render(
      <StatCard title="Test Title" value="42">
        <div>Additional content</div>
      </StatCard>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Additional content')).toBeInTheDocument();
  });

  it('renders with numeric value', () => {
    render(<StatCard title="Test Title" value={123} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders minimal props', () => {
    render(<StatCard title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
