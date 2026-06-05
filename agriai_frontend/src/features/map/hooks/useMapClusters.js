import { useMemo } from "react";
import useSupercluster from "use-supercluster";

// [lng, lat] — GeoJSON order, reversed from Leaflet
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

export function useMapClusters(markers, bounds, zoom) {
  const points = useMemo(() => toGeoJsonPoints(markers), [markers]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: {
      radius: 75,
      maxZoom: 17,
      minPoints: 2,
    },
  });

  return { clusters, supercluster };
}
