import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const LAST_LOCATION_KEY = 'agriai_last_location';

const LocationPermissionContext = createContext(null);

function readSavedCoords() {
  try {
    const raw = localStorage.getItem(LAST_LOCATION_KEY);
    if (!raw) return { latitude: null, longitude: null };
    const parsed = JSON.parse(raw);
    if (!parsed.latitude || !parsed.longitude) {
      return { latitude: null, longitude: null };
    }
    return {
      latitude: parsed.latitude,
      longitude: parsed.longitude,
    };
  } catch {
    localStorage.removeItem(LAST_LOCATION_KEY);
    return { latitude: null, longitude: null };
  }
}

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(readSavedCoords);
  const [gpsStatus, setGpsStatus] = useState(() => {
    if (coords.latitude && coords.longitude) return 'granted';
    if (!navigator.geolocation) return 'unsupported';
    return 'idle';
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      return Promise.resolve({ ok: false, status: 'unsupported' });
    }

    setGpsStatus('requesting');

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(nextCoords));
          setCoords(nextCoords);
          setGpsStatus('granted');
          resolve({ ok: true, status: 'granted', coords: nextCoords });
        },
        (error) => {
          const status = error.code === error.PERMISSION_DENIED ? 'denied' : 'denied';
          setGpsStatus(status);
          resolve({ ok: false, status });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }, []);

  const value = useMemo(
    () => ({
      coords,
      gpsStatus,
      hasCoords: Boolean(coords.latitude && coords.longitude),
      requestLocation,
    }),
    [coords, gpsStatus, requestLocation]
  );

  return (
    <LocationPermissionContext.Provider value={value}>
      {children}
    </LocationPermissionContext.Provider>
  );
}

export function useLocationPermission() {
  const context = useContext(LocationPermissionContext);
  if (!context) {
    throw new Error('useLocationPermission must be used inside LocationProvider');
  }
  return context;
}
