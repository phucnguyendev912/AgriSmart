import { useMemo } from "react";
import useSupercluster from "use-supercluster";

/**
 * Convert raw API markers → GeoJSON points cho supercluster.
 * Supercluster dùng [longitude, latitude] (GeoJSON standard) — đảo ngược so với Leaflet.
 */
function toGeoJsonPoints(markers) {
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
 * Hook tính clusters từ markers + map bounds/zoom hiện tại.
 *
 * @param {Array} markers - Dữ liệu thô từ API
 * @param {Array} bounds  - [west, south, east, north] từ map.getBounds()
 * @param {number} zoom   - Zoom level hiện tại
 * @returns {{ clusters, supercluster }}
 */
export function useMapClusters(markers, bounds, zoom) {
  const points = useMemo(() => toGeoJsonPoints(markers), [markers]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,      // [west, south, east, north]
    zoom,
    options: {
      radius: 75,   // pixel radius để gom nhóm — tăng → gom rộng hơn
      maxZoom: 17,  // zoom tối đa trước khi tách hết ra điểm đơn
      minPoints: 2, // tối thiểu 2 điểm mới tạo cluster
    },
  });

  return { clusters, supercluster };
}
