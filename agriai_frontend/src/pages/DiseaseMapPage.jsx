import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import SEO from "../components/common/SEO";
import { ClusterMarker, useMapClusters } from "../features/map";

import { getMarkers, getDiseases } from "../services/diseaseMapService";

const MARKER_COLOR = "#EF4444";

// Pin icon cho Hoàng Sa & Trường Sa
const islandPinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
  shadowSize: [32, 32],
});

const ISLAND_PINS = [
  { id: "hoang-sa", name: "Quần đảo Hoàng Sa", lat: 16.5, lng: 112.0 },
  { id: "truong-sa", name: "Quần đảo Trường Sa", lat: 10.0, lng: 114.2 },
];
/**
 * DiseaseMapPage Component
 * Renders an interactive Leaflet map displaying clustered crop disease outbreak points.
 * Provides custom filtering by disease type and time period.
 */

/**
 * MapEventHandler Helper Component
 * Listens to map bounds and zoom level changes, lifting state changes up to the parent component.
 * @param {Object} props - Component properties.
 * @param {Function} props.onBoundsChange - Callback triggered on map view change.
 */
function MapEventHandler({ onBoundsChange }) {
  const map = useMap();

  const update = useCallback(() => {
    const b = map.getBounds();
    onBoundsChange({
      bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      zoom: map.getZoom(),
    });
  }, [map, onBoundsChange]);

  useMapEvents({
    moveend: update,
    zoomend: update,
  });

  // Call initially when the map is ready
  useEffect(() => {
    update();
  }, [update]);

  return null;
}

// -------------------------------------------------------------------
export default function DiseaseMapPage() {
  const [markers, setMarkers] = useState([]);
  const [days, setDays] = useState(30);
  const [diseaseId, setDiseaseId] = useState(null);
  const [diseasesList, setDiseasesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cluster state: initializes default bounding box for Vietnam [west, south, east, north]
  // so supercluster can calculate clusters immediately without waiting for map events.
  const [mapState, setMapState] = useState({
    bounds: [102.14, 8.18, 109.46, 23.39],
    zoom: 6,
  });

  const handleBoundsChange = useCallback(({ bounds, zoom }) => {
    setMapState({ bounds, zoom });
  }, []);

  // Calculate clusters from current markers and bounds/zoom
  const { clusters, supercluster } = useMapClusters(
    markers,
    mapState.bounds,
    mapState.zoom
  );

  const fetchMarkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { days };
      if (diseaseId) params.diseaseId = diseaseId;
      const res = await getMarkers(params);
      setMarkers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Không thể tải dữ liệu bản đồ. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [days, diseaseId]);

  useEffect(() => { fetchMarkers(); }, [fetchMarkers]);

  useEffect(() => {
    const fetchDiseasesList = async () => {
      try {
        const res = await getDiseases();
        setDiseasesList(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách bệnh", err);
      }
    };
    fetchDiseasesList();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "—";
    // Backend trả về LocalDateTime không có timezone (ví dụ: "2026-05-23T16:30:00").
    // Một số browser parse chuỗi này là UTC → lệch 7h so với giờ Việt Nam.
    // Gắn "+07:00" để đảm bảo luôn được hiểu đúng là giờ Việt Nam (UTC+7).
    const normalized = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "+07:00";
    return new Date(normalized).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface pt-20">
      <SEO
        title="Bản đồ cảnh báo dịch bệnh cây trồng"
        description="Theo dõi phân bố dịch bệnh cây trồng theo thời gian thực trên bản đồ tương tác."
        keywords="bản đồ dịch bệnh, cảnh báo bệnh lúa, bản đồ nông nghiệp, AgriSmart"
        url="/warning-map"
      />

      {/* Header */}
      <div className="px-6 py-5 border-b border-surface-variant/30 bg-surface-container-lowest">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">map</span>
          Bản đồ cảnh báo dịch bệnh
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Phân bố các ca chẩn đoán bệnh thực tế của nông dân
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-surface-container flex flex-wrap gap-4 items-center border-b border-surface-variant/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Thời gian:</span>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                days === d
                  ? "bg-primary text-white"
                  : "bg-surface-container-highest text-on-surface-variant hover:bg-primary/10"
              }`}
            >
              {d} ngày
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface-variant flex-shrink-0">Bệnh:</span>
          <div className="relative">
            <select
              value={diseaseId || ""}
              onChange={(e) => setDiseaseId(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-bold bg-surface-container-highest text-on-surface hover:bg-surface-variant/50 transition-colors cursor-pointer border-none outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              style={{ WebkitAppearance: "none", MozAppearance: "none" }}
            >
              <option value="">Tất cả các loại bệnh</option>
              {diseasesList.map((d) => (
                <option key={d.id} value={d.id}>{d.diseaseName}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {loading && (
          <span className="text-sm text-primary animate-pulse ml-auto">Đang tải dữ liệu...</span>
        )}
        {!loading && (
          <span className="text-sm text-on-surface-variant ml-auto">
            {markers.length} điểm bệnh
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-error-container text-error text-sm">
          {error}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative z-10" style={{ minHeight: "500px" }}>
        <MapContainer
          center={[16.047079, 108.20623]}
          zoom={6}
          style={{ width: "100%", height: "100%", minHeight: "500px" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          />

          {/* Pin markers for Hoàng Sa & Trường Sa */}
          {ISLAND_PINS.map((island) => (
            <Marker key={island.id} position={[island.lat, island.lng]} icon={islandPinIcon}>
              <Popup>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{island.name}</div>
              </Popup>
            </Marker>
          ))}

          {/* Listen for map bounds and zoom changes */}
          <MapEventHandler onBoundsChange={handleBoundsChange} />

          {/* Render map cluster bubbles or single marker points */}
          {clusters.map((point) => {
            const [lng, lat] = point.geometry.coordinates;
            const isCluster = point.properties.cluster;

            if (isCluster) {
              return (
                <ClusterMarker
                  key={`cluster-${point.id}`}
                  cluster={point}
                  supercluster={supercluster}
                />
              );
            }

            // Single point marker - keep original Leaflet CircleMarker styles
            const m = point.properties;
            return (
              <CircleMarker
                key={`point-${m.detailId}`}
                center={[lat, lng]}
                radius={10}
                pathOptions={{
                  fillColor: MARKER_COLOR,
                  color: MARKER_COLOR,
                  fillOpacity: 0.75,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm" style={{ minWidth: 180 }}>
                    <div className="flex items-center gap-2 font-semibold text-base mb-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: MARKER_COLOR }}
                      />
                      {m.diseaseName ?? "Không rõ"}
                    </div>
                    <div>
                      <span className="text-gray-500">Ngày phát hiện:&nbsp;</span>
                      <span className="font-medium">{formatDate(m.diagnosedAt)}</span>
                    </div>
                    {m.province && (
                      <div>
                        <span className="text-gray-500">Khu vực:&nbsp;</span>
                        <span className="font-medium">{m.province}</span>
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-surface-container-lowest border-t border-surface-variant/20 flex flex-wrap gap-6 text-sm items-center">
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: MARKER_COLOR }} />
          Điểm dịch bệnh
        </div>

        {/* Cluster legend */}
        <div className="flex gap-3 ml-auto text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" /> &lt; 10 ca
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400" /> 10–49 ca
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> ≥ 50 ca
          </span>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-surface-variant/20 px-6 py-4 flex justify-between items-center z-50">
        <Link to="/farming-areas" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="text-[10px] font-medium">Khu vực</span>
        </Link>
        <Link to="/diagnosis" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">search</span>
          <span className="text-[10px] font-medium">Chẩn đoán</span>
        </Link>
        <Link to="/warning-map" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
          <span className="text-[10px] font-bold">Bản đồ</span>
        </Link>
        <Link to="/history" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">history</span>
          <span className="text-[10px] font-medium">Lịch sử</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-medium">Cá nhân</span>
        </Link>
      </div>
    </div>
  );
}
