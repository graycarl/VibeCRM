import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from '../src/layouts/MainLayout';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as metaApi from '../src/services/metaApi';

// Mock dependencies
vi.mock('../src/services/metaApi');

// Mock useMediaQuery to control mobile state
const matchMediaMock = vi.fn();

beforeEach(() => {
  matchMediaMock.mockClear();
  window.matchMedia = matchMediaMock;
  matchMediaMock.mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});


describe('MainLayout', () => {
  it('renders VibeCRM title', async () => {
     // Mock getObjects to return empty array to avoid act warnings
     vi.spyOn(metaApi.metaApi, 'getObjects').mockResolvedValue([]);

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MainLayout />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('VibeCRM')).toBeInTheDocument();
    });
  });
});
