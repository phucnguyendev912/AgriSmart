import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LocationPermissionContext = createContext(null);

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });
  const [gpsStatus, setGpsStatus] = useState(() => {
    if (!navigator.geolocation) return 'unsupported';
    return 'idle';
  });

  const requestLocation = useCallback((options = {}) => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      return Promise.resolve({ ok: false, status: 'unsupported' });
    }

    setGpsStatus('requesting');

    const finalOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 15000,
      maximumAge: options.maximumAge ?? 0,
    };

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setCoords(nextCoords);
          setGpsStatus('granted');
          resolve({ ok: true, status: 'granted', coords: nextCoords });
        },
        () => {
          setCoords({
            latitude: null,
            longitude: null,
            accuracy: null,
            timestamp: null,
          });
          setGpsStatus('denied');
          resolve({ ok: false, status: 'denied' });
        },
        finalOptions
      );
    });
  }, []);

  // Sync gpsStatus with the real browser permission state on mount and on change.
  // This fixes the case where the user resets location permission in browser settings
  // while the app is open (or was previously open), leaving stale 'granted' state.
  useEffect(() => {
    if (!navigator.permissions) return;
    let permissionStatus;
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      permissionStatus = result;
      // Correct stale 'granted' state if permission was already revoked
      if (result.state === 'denied') {
        setCoords({
          latitude: null,
          longitude: null,
          accuracy: null,
          timestamp: null,
        });
        setGpsStatus('denied');
      } else if (result.state === 'granted') {
        requestLocation();
      }
      // Listen for realtime permission changes (e.g. user toggles in browser settings)
      result.onchange = () => {
        if (result.state === 'denied') {
          setCoords({
            latitude: null,
            longitude: null,
            accuracy: null,
            timestamp: null,
          });
          setGpsStatus('denied');
        } else if (result.state === 'prompt') {
          setGpsStatus('idle');
        } else if (result.state === 'granted') {
          requestLocation();
        }
      };
    });
    return () => {
      if (permissionStatus) permissionStatus.onchange = null;
    };
  }, [requestLocation]);

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
