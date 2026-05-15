import React, { useCallback, useEffect, useState } from 'react';
import { fetchWeatherDiseaseRisks, reverseGeocode } from '../../../services/weatherApi';
import LocationPermissionModal from '../../../components/common/LocationPermissionModal';
import { useLocationPermission } from '../../../context/LocationPermissionContext';
import {
  DEFAULT_PROVINCE,
  VIETNAM_PROVINCES,
  findNearestProvince,
  findProvinceByName,
} from '../../../utils/vietnamProvinces';

const Skeleton = ({ className }) => (
  <div className={`bg-slate-100 rounded-xl animate-pulse ${className}`} />
);

const formatMetric = (value, suffix) => {
  if (value === null || value === undefined || value === '') return '--';
  return `${Math.round(Number(value))}${suffix}`;
};

const STORAGE_KEY = 'agriai_selected_province_id';
const GPS_STORAGE_KEY = 'agriai_last_gps_location';

const isMediumRisk = (risk) => {
  const group = risk?.conditionGroup || '';
  return group.toUpperCase().includes('MEDIUM');
};

const mapRiskToDisease = (risk) => ({
  id: risk.diseaseId || risk.conditionGroup || risk.diseaseName,
  name: risk.diseaseName || 'Bệnh cây trồng',
  nameEn: risk.diseaseCode,
  icon: 'bug_report',
  risk: isMediumRisk(risk) ? 'MEDIUM' : 'HIGH',
  description: risk.recommendationNotes
    || (risk.matchedConditions || []).join(', ')
    || 'Thời tiết hiện tại thuận lợi cho bệnh phát triển.',
});

const WeatherDiseaseSection = () => {
  const { coords, gpsStatus, hasCoords, requestLocation } = useLocationPermission();
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [weather, setWeather] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [isLocating, setIsLocating] = useState(false); // false vì sẽ check localStorage trước
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const loadWeather = useCallback(async (province) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherDiseaseRisks(province.lat, province.lon);
      setWeather(data.weather || null);
      setDiseases((data.diseaseWeatherRisks || []).map(mapRiskToDisease));
    } catch {
      setError('Không thể tải dữ liệu thời tiết.');
      setWeather(null);
      setDiseases([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyCurrentLocation = useCallback(async (latitude, longitude) => {
    const name = await reverseGeocode(latitude, longitude).catch(() => '');
    const province = findProvinceByName(name) || findNearestProvince(latitude, longitude);
    localStorage.setItem(STORAGE_KEY, province.id);
    localStorage.setItem(GPS_STORAGE_KEY, JSON.stringify({
      latitude,
      longitude,
      provinceId: province.id,
    }));
    setSelectedProvince({ ...province, lat: latitude, lon: longitude });
  }, []);

  // Mount: đọc localStorage trước, sau đó dùng tọa độ đã có hoặc tỉnh mặc định
  useEffect(() => {
    const savedGps = localStorage.getItem(GPS_STORAGE_KEY);
    if (savedGps) {
      try {
        const parsed = JSON.parse(savedGps);
        const savedProvince = VIETNAM_PROVINCES.find((p) => p.id === Number(parsed.provinceId));
        if (savedProvince && parsed.latitude && parsed.longitude) {
          setSelectedProvince({
            ...savedProvince,
            lat: parsed.latitude,
            lon: parsed.longitude,
          });
          return;
        }
      } catch {
        localStorage.removeItem(GPS_STORAGE_KEY);
      }
    }

    if (hasCoords) {
      applyCurrentLocation(coords.latitude, coords.longitude)
        .catch(() => setSelectedProvince(DEFAULT_PROVINCE));
      return;
    }

    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      const saved = VIETNAM_PROVINCES.find((p) => p.id === Number(savedId));
      if (saved) {
        setSelectedProvince(saved);
        return;
      }
    }

    setSelectedProvince(DEFAULT_PROVINCE);
  }, [applyCurrentLocation, coords.latitude, coords.longitude, hasCoords]);

  useEffect(() => {
    if (selectedProvince) loadWeather(selectedProvince);
  }, [selectedProvince, loadWeather]);

  const handleAllowLocation = async () => {
    setIsLocating(true);
    const result = await requestLocation();

    if (result.ok) {
      await applyCurrentLocation(result.coords.latitude, result.coords.longitude);
    } else if (!selectedProvince) {
      setSelectedProvince(DEFAULT_PROVINCE);
    }

    setIsLocating(false);
    setShowLocationModal(false);
  };

  const handleContinueWithoutLocation = () => {
    if (!selectedProvince) {
      setSelectedProvince(DEFAULT_PROVINCE);
    }
    setShowLocationModal(false);
  };

  const metrics = weather ? [
    {
      icon: 'thermostat',
      value: formatMetric(weather.temperature, '°C'),
      label: 'Nhiệt độ',
      colorText: 'text-orange-600',
      colorBg: 'bg-orange-50',
      border: 'border-orange-100',
    },
    {
      icon: 'water_drop',
      value: formatMetric(weather.humidity, '%'),
      label: 'Độ ẩm',
      colorText: 'text-sky-600',
      colorBg: 'bg-sky-50',
      border: 'border-sky-100',
    },
    {
      icon: 'rainy',
      value: formatMetric(weather.rainfall ?? weather.precipitation, 'mm'),
      label: 'Lượng mưa',
      colorText: 'text-emerald-700',
      colorBg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ] : null;

  const highCount = diseases.filter((d) => d.risk === 'HIGH').length;
  const highRiskDiseases = diseases.filter((d) => d.risk === 'HIGH');
  const mediumRiskDiseases = diseases.filter((d) => d.risk !== 'HIGH');

  const renderWeatherContext = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-9" />)}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-xs text-red-500 space-y-2">
          <div className="flex items-start gap-1.5">
            <span className="material-symbols-outlined text-base shrink-0">cloud_off</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => selectedProvince && loadWeather(selectedProvince)}
            className="text-xs font-semibold text-red-600 underline underline-offset-2"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (!metrics) return null;

    return (
      <div className="flex flex-col gap-1.5">
        {metrics.map((m) => (
          <div
            key={m.icon}
            className={`flex items-center gap-1.5 rounded-lg border ${m.border} ${m.colorBg} px-2 py-1.5`}
          >
            <span
              className={`material-symbols-outlined text-[16px] shrink-0 ${m.colorText}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {m.icon}
            </span>
            <span className={`text-sm font-extrabold leading-none ${m.colorText}`}>
              {m.value}
            </span>
            <span className="min-w-0 truncate text-[11px] font-semibold text-slate-500">
              · {m.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderHighRiskCard = (disease) => (
    <div
      key={disease.id}
      className="relative overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-4 py-4 shadow-sm"
    >
      <div className="absolute left-0 inset-y-0 w-1.5 bg-red-500" />
      <div className="flex items-start gap-3 pl-1">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {disease.icon}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-900">{disease.name}</span>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-600">
              NGUY CƠ CAO
            </span>
          </div>
          <h3 className="text-base font-black leading-snug text-slate-950 md:text-lg">
            {disease.name} có nguy cơ bùng phát
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {disease.description}
          </p>
          <button
            type="button"
            onClick={() => setSelectedDisease(disease)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
          >
            Chi tiết bệnh
            <span className="material-symbols-outlined text-base">info</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMediumRiskRow = (disease) => (
    <div
      key={disease.id}
      className="relative flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5"
    >
      <div className="absolute left-0 inset-y-0 w-1 rounded-l-xl bg-amber-400" />
      <span
        className="material-symbols-outlined mt-0.5 shrink-0 text-lg text-amber-600"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {disease.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{disease.name}</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">
            TRUNG BÌNH
          </span>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          {disease.description}
        </p>
      </div>
    </div>
  );

  return (
    <section className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span className="w-8 h-1 bg-primary rounded-full inline-block" />
        Thời tiết & Cảnh báo bệnh
      </h2>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-slate-50/70 border-b border-slate-100">
          <span
            className="material-symbols-outlined text-primary text-lg shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            location_on
          </span>
          <span className="text-sm font-medium text-slate-600 shrink-0 hidden sm:block">
            Bạn đang ở khu vực
          </span>
          <select
            value={selectedProvince?.id ?? ''}
            onChange={(e) => {
              const p = VIETNAM_PROVINCES.find((province) => province.id === Number(e.target.value));
              if (p) {
                localStorage.setItem(STORAGE_KEY, p.id);
                localStorage.removeItem(GPS_STORAGE_KEY);
                setSelectedProvince(p);
              }
            }}
            disabled={isLocating || isLoading}
            className="text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50"
          >
            {isLocating && !selectedProvince && (
              <option value="">Đang xác định vị trí...</option>
            )}
            {VIETNAM_PROVINCES.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            disabled={isLocating || isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/10 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {isLocating ? 'progress_activity' : 'my_location'}
            </span>
            Dùng vị trí
          </button>

          {highCount > 0 && !isLoading && (
            <span className="ml-auto text-xs font-bold px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full shrink-0">
              {highCount} nguy cơ cao
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="md:col-span-1 p-3 md:p-4 flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Thời tiết hiện tại
            </p>
            {renderWeatherContext()}
          </div>

          <div className="md:col-span-4 p-4 md:p-5 flex flex-col gap-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Các bệnh cần chú ý
            </p>

            {isLoading && (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-28" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            )}

            {!isLoading && diseases.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {highRiskDiseases.map(renderHighRiskCard)}
                {mediumRiskDiseases.map(renderMediumRiskRow)}
              </div>
            )}

            {!isLoading && !error && diseases.length === 0 && weather && (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <span
                  className="material-symbols-outlined text-4xl text-emerald-400"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div>
                  <p className="font-bold text-emerald-700 text-sm">Không có cảnh báo đáng kể</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Điều kiện thời tiết ít thuận lợi cho dịch bệnh.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDisease && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disease-detail-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDisease(null);
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {selectedDisease.icon}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-red-600">
                    {selectedDisease.risk === 'HIGH' ? 'NGUY CƠ CAO' : 'TRUNG BÌNH'}
                  </p>
                  <h3 id="disease-detail-title" className="text-xl font-black text-slate-950">
                    {selectedDisease.name}
                  </h3>
                  {selectedDisease.nameEn && (
                    <p className="text-sm font-medium text-slate-500">{selectedDisease.nameEn}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDisease(null)}
                aria-label="Đóng chi tiết bệnh"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Bệnh này là gì?</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {selectedDisease.description}
                </p>
              </div>

              {metrics && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Điều kiện liên quan hiện tại
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {metrics.map((m) => (
                      <div key={m.icon} className={`rounded-xl border ${m.border} ${m.colorBg} p-3`}>
                        <span className={`material-symbols-outlined text-lg ${m.colorText}`}>
                          {m.icon}
                        </span>
                        <p className={`mt-1 text-sm font-black ${m.colorText}`}>{m.value}</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LocationPermissionModal
        open={showLocationModal}
        loading={isLocating || gpsStatus === 'requesting'}
        blocked={gpsStatus === 'unsupported'}
        title="Dùng vị trí hiện tại?"
        description="Vị trí hiện tại giúp hệ thống tải thời tiết và cảnh báo bệnh theo đúng khu vực của bạn."
        onAllow={handleAllowLocation}
        onContinue={handleContinueWithoutLocation}
        onClose={handleContinueWithoutLocation}
      />
    </section>
  );
};

export default WeatherDiseaseSection;
