import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UploadView from './UploadView';
import data from '../../../shared/data';

jest.mock('../../../shared/data', () => ({
  addTree: jest.fn(),
}));

describe('UploadView Component', () => {
  beforeEach(() => {
    sessionStorage.setItem('token', 'mock-token');
    fetch.resetMocks();
  });

  test('renders upload interface', () => {
    render(
      <BrowserRouter>
        <UploadView />
      </BrowserRouter>
    );

    expect(screen.getByText(/Sleep je JSON-bestand hierheen/i)).toBeInTheDocument();
    expect(screen.getByText(/klik om een bestand te selecteren/i)).toBeInTheDocument();
  });

  test('validates and uploads a JSON file with valid trees', async () => {
    const mockJSON = [
      {
        name: 'Tree A',
        position: [50.95306, 5.352692],
        description: 'Sample description A',
      },
      {
        name: 'Tree B',
        position: [50.95310, 5.352700],
        description: 'Sample description B',
      },
    ];
  
    const file = new Blob([JSON.stringify(mockJSON)], { type: 'application/json' });
    const mockFile = new File([file], 'trees.json', { type: 'application/json' });
  
    render(
      <BrowserRouter>
        <UploadView />
      </BrowserRouter>
    );
  
    const fileInput = screen.getByLabelText(/klik om een bestand te selecteren/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
  
    await waitFor(() => {
      expect(data.addTree).toHaveBeenCalledTimes(2);
      expect(data.addTree).toHaveBeenCalledWith({
        name: 'Tree A',
        description: 'Sample description A',
        latitude: 50.95306,
        longitude: 5.352692,
      });
    });
  });
  

  test('shows error for invalid file type', async () => {
    const invalidFile = new File(['Not a JSON'], 'invalid.txt', { type: 'text/plain' });

    render(
      <BrowserRouter>
        <UploadView />
      </BrowserRouter>
    );

    const fileInput = screen.getByLabelText(/klik om een bestand te selecteren/i);
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Selecteer een geldig JSON-bestand/i)).toBeInTheDocument();
    });
  });

  test('shows error for missing name', async () => {
    const mockJSON = [
      {
        position: [50.95306, 5.352692],
      },
    ];

    const file = new Blob([JSON.stringify(mockJSON)], { type: 'application/json' });
    const mockFile = new File([file], 'trees.json', { type: 'application/json' });

    render(
      <BrowserRouter>
        <UploadView />
      </BrowserRouter>
    );

    const fileInput = screen.getByLabelText(/klik om een bestand te selecteren/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Boom met index 0: Naam ontbreekt./i)).toBeInTheDocument();
    });
  });

  test('shows error for missing position', async () => {
    const mockJSON = [
      {
        name: 'Tree A',
      },
    ];

    const file = new Blob([JSON.stringify(mockJSON)], { type: 'application/json' });
    const mockFile = new File([file], 'trees.json', { type: 'application/json' });

    render(
      <BrowserRouter>
        <UploadView />
      </BrowserRouter>
    );

    const fileInput = screen.getByLabelText(/klik om een bestand te selecteren/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Boom met index 0: De positie ontbreekt of is ongeldig./i)).toBeInTheDocument();
    });
  });

  test('shows error for invalid position format', async () => {
    const mockJSON = [
      {
        name: 'Tree A',
        position: ['invalid', 'data'],
      },
    ];

    const file = new Blob([JSON.stringify(mockJSON)], { type: 'application/json' });
    const mockFile = new File([file], 'trees.json', { type: 'application/json' });

    render(
      <BrowserRouter>
        <UploadView />
      </BrowserRouter>
    );

    const fileInput = screen.getByLabelText(/klik om een bestand te selecteren/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Boom met index 0: De positie ontbreekt of is ongeldig./i)).toBeInTheDocument();
    });
  });

  test('shows error for empty array', async () => {
    const mockJSON = [];

    const file = new Blob([JSON.stringify(mockJSON)], { type: 'application/json' });
    const mockFile = new File([file], 'trees.json', { type: 'application/json' });

    render(
      <BrowserRouter>
        <UploadView />
      </BrowserRouter>
    );

    const fileInput = screen.getByLabelText(/klik om een bestand te selecteren/i);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Het JSON-bestand bevat geen geldige bomen./i)).toBeInTheDocument();
    });
  });
});
