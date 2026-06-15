import { useEffect } from 'react';
import { useLocationPermission } from '../context/LocationPermissionContext';

const INITIAL_LOCATION_PROMPT_KEY = 'agriai_initial_location_prompted';

/**
 * Custom hook that triggers a one-time location permission request
 * on the user's first session visit if location has not been obtained yet.
 */
const useInitialLocationPrompt = () => {
  const { hasCoords, gpsStatus, requestLocation } = useLocationPermission();

  useEffect(() => {
    if (hasCoords || gpsStatus === 'unsupported') return;
    if (sessionStorage.getItem(INITIAL_LOCATION_PROMPT_KEY)) return;

    sessionStorage.setItem(INITIAL_LOCATION_PROMPT_KEY, 'true');
    requestLocation();
  }, [gpsStatus, hasCoords, requestLocation]);
};

export default useInitialLocationPrompt;
