import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MobileMapView from '../components/MobileMapView';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import sharedData from '../../shared/data';
import { useNavigation } from '@react-navigation/native';

// Mock the Location module and Alert
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock useNavigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock data for user location
const mockLocation = {
  coords: {
    latitude: 50.8503,
    longitude: 4.3517,
  },
};

// Mock navigation.navigate
const mockNavigate = jest.fn();
useNavigation.mockReturnValue({
  navigate: mockNavigate,
});

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
    const { getByTestId } = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        expect(getByTestId('map-view')).toBeTruthy();
      });
    });
  });

  it('requests location permission', async () => {
    render(<MobileMapView />);
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('sets user location marker on map', async () => {
    const { getByTestId } = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        expect(getByTestId('your-location')).toBeTruthy();
      });
    });
  });

  it('renders shared data markers', async () => {
    const { getByTestId } = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        sharedData.forEach(tree => {
          expect(getByTestId(`marker-${tree.id}`)).toBeTruthy();
        });
      });
    });
  });

  it('shows alert when location permission is denied', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    render(<MobileMapView />);
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
    const { getByTestId } = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        const userMarker = getByTestId('your-location');
        expect(userMarker.props.coordinate.latitude).toBeCloseTo(mockLocation.coords.latitude, 5);
        expect(userMarker.props.coordinate.longitude).toBeCloseTo(mockLocation.coords.longitude, 5);
      });
    });
  });

  it('sets user location state when user location is obtained', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValueOnce({
      coords: {
        latitude: 50.8503,
        longitude: 4.3517,
      },
    });

    const { getByTestId } = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        const userLocationMarker = getByTestId('your-location');
        expect(userLocationMarker.props.coordinate.latitude).toBe(50.8503);
        expect(userLocationMarker.props.coordinate.longitude).toBe(4.3517);
      });
    });
  });

  it('does not set user location state when user location is null', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValueOnce(null);

    const { queryByTestId } = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        expect(queryByTestId('your-location')).toBeNull();
      });
    });
  });

  it('navigates to TreeDetails view when Callout is pressed', async () => {
    const { getByTestId } = render(<MobileMapView />);
    await act(async () => {
      await waitFor(() => {
        const treeId = sharedData[0].id;
        const callout = getByTestId(`callout=${treeId}`);
        fireEvent.press(callout);
        expect(mockNavigate).toHaveBeenCalledWith('TreeDetails', { tree: sharedData[0] });
      });
    });
  });
});
