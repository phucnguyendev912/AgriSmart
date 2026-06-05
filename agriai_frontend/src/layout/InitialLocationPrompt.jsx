import { useEffect } from 'react';
import { useLocationPermission } from '../context/LocationPermissionContext';

const INITIAL_LOCATION_PROMPT_KEY = 'agriai_initial_location_prompted';

export default function InitialLocationPrompt() {
  const { hasCoords, gpsStatus, requestLocation } = useLocationPermission();

  useEffect(() => {
    if (hasCoords || gpsStatus === 'unsupported') return;
    if (sessionStorage.getItem(INITIAL_LOCATION_PROMPT_KEY)) return;

    sessionStorage.setItem(INITIAL_LOCATION_PROMPT_KEY, 'true');
    requestLocation();
  }, [gpsStatus, hasCoords, requestLocation]);

  return null;
}
