import { useMemo } from "react";
import useSupercluster from "use-supercluster";

/**
 * Converts raw API markers to GeoJSON points for supercluster.
 * Supercluster uses [longitude, latitude] (GeoJSON standard), which is reversed from Leaflet.
 */
function toGeoJsonPoints(markers) {
  if (!Array.isArray(markers)) return [];
  return markers.map((m) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [m.longitude, m.latitude], // [lng, lat] — GeoJSON order
    },
    properties: {
      detailId: m.detailId,
      diseaseId: m.diseaseId,
      diseaseName: m.diseaseName,
      diagnosedAt: m.diagnosedAt,
      province: m.province,
    },
  }));
}

/**
 * Custom hook to calculate clusters from markers and current map bounds/zoom.
 *
 * @param {Array} markers - Raw markers data from the API
 * @param {Array} bounds  - [west, south, east, north] from map.getBounds()
 * @param {number} zoom   - Current zoom level
 * @returns {{ clusters, supercluster }}
 */
export function useMapClusters(markers, bounds, zoom) {
  const points = useMemo(() => toGeoJsonPoints(markers), [markers]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,      // [west, south, east, north]
    zoom,
    options: {
      radius: 75,   // pixel radius for clustering: increase to make clusters wider
      maxZoom: 17,  // max zoom level before separating into single markers
      minPoints: 2, // minimum points to create a cluster
    },
  });

  return { clusters, supercluster };
}
