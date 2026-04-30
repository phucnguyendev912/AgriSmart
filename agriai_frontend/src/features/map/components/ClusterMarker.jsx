import { Marker, useMap } from "react-leaflet";
import L from "leaflet";

/**
 * Trả về màu bubble cluster theo số lượng điểm bên trong.
 * Xanh → ít,  Vàng → trung bình,  Đỏ → nhiều
 */
function getClusterColor(count) {
  if (count >= 50) return { bg: "#EF4444", ring: "#FCA5A5" }; // đỏ
  if (count >= 10) return { bg: "#F59E0B", ring: "#FDE68A" }; // vàng
  return { bg: "#22C55E", ring: "#86EFAC" };                  // xanh
}

/**
 * Tính kích thước bubble theo số điểm (min 36px, max 64px).
 */
function getClusterSize(count) {
  return Math.min(36 + Math.log2(count + 1) * 6, 64);
}

/**
 * Component render cluster bubble trên map.
 * Click → zoom vào vùng cluster đó.
 *
 * @param {object} cluster      - GeoJSON Feature cluster từ supercluster
 * @param {object} supercluster - Supercluster instance
 */
export default function ClusterMarker({ cluster, supercluster }) {
  const map = useMap();

  const [lng, lat] = cluster.geometry.coordinates; // supercluster: [lng, lat]
  const { point_count: count } = cluster.properties;
  const { bg, ring } = getClusterColor(count);
  const size = getClusterSize(count);

  // Tạo div icon tuỳ chỉnh cho cluster bubble
  const icon = L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${bg};
        border: 3px solid ${ring};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size < 44 ? "12" : "14"}px;
        font-weight: 700;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        transition: transform 0.15s ease;
      "
      onmouseover="this.style.transform='scale(1.12)'"
      onmouseout="this.style.transform='scale(1)'"
      >
        ${count}
      </div>
    `,
    className: "",                          // xoá class mặc định của Leaflet
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  });

  function handleClick() {
    const expansionZoom = Math.min(
      supercluster.getClusterExpansionZoom(cluster.id),
      17
    );
    map.flyTo([lat, lng], expansionZoom, { duration: 0.6 });
  }

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    />
  );
}
