import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import MobileMapView from '../components/MobileMapView';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import sharedData from '../../shared/data';

// Mock the Location module and Alert
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock data for user location
const mockLocation = {
  coords: {
    latitude: 50.8503,
    longitude: 4.3517,
  },
};

describe('MobileMapView', () => {
  let alertSpy;

  beforeEach(() => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue(mockLocation);
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the map correctly', async () => {
    const component = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        expect(component.getByTestId('map-view')).toBeTruthy();
      });
    });
  });

  it('requests location permission', async () => {
    render(<MobileMapView />);
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('sets user location marker on map', async () => {
    const component = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        expect(component.getByTestId('your-location')).toBeTruthy();
      });
    });
  });

  it('renders shared data markers', async () => {
    const component = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        sharedData.forEach(tree => {
          expect(component.getByTestId(`marker-${tree.id}`)).toBeTruthy();
        });
      });
    });
  });

  it('shows alert when location permission is denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    const component = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Permission Denied',
          'We need access to your location to show it on the map.'
        );
      });
    });
  });

  it('user location marker reflects the user location accurately', async () => {
    const component = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        const userMarker = component.getByTestId('your-location');
        expect(userMarker.props.coordinate.latitude).toBeCloseTo(mockLocation.coords.latitude, 5);
        expect(userMarker.props.coordinate.longitude).toBeCloseTo(mockLocation.coords.longitude, 5);
      });
    });
  });
});
