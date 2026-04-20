# 🗺️ PLAN IMPLEMENTATION - BẢN ĐỒ CẢNH BÁO DỊCH BỆNH

## 📌 TỔNG QUAN

Chức năng hiển thị bản đồ cảnh báo với các marker theo bệnh, cho phép user xem phân bố dịch bệnh theo thời gian và loại bệnh.

---

## 🔄 WORKFLOW

```
1. User mở trang "Bản đồ cảnh báo"
   ↓
2. Frontend tự động gọi API: GET /api/map/markers?days=30
   ↓
3. Backend query 3 bảng:
   - diagnose_history        → latitude, longitude, created_at
   - diagnose_history_detail → disease_id
   - disease                 → disease_name
   
   WHERE:
   - latitude IS NOT NULL
   - longitude IS NOT NULL
   - disease_id IS NOT NULL
   - created_at >= now - days
   ↓
4. Trả về List<MarkerDTO>:
   {
     latitude: Double,
     longitude: Double,
     diseaseId: Long,
     diseaseName: String,
     diagnosedAt: LocalDateTime,
     province: String (optional),
     diagnoseHistoryId: Long
   }
   ↓
5. Leaflet.js render marker:
   - Mỗi MarkerDTO → 1 chấm tròn
   - Màu theo disease_id cố định:
     * Đạo ôn  → đỏ (#EF4444)
     * Khô vằn → cam (#F97316)
     * Rầy nâu → xanh lá (#10B981)
     * Khác    → xám (#6B7280)
   ↓
6. User bấm marker → popup hiển thị:
   - Tên bệnh
   - Ngày phát hiện
   - Khu vực (province từ area_info nếu có)
   ↓
7. User filter theo bệnh:
   GET /api/map/markers?diseaseId=1&days=30
   → Xóa marker cũ → render marker mới
   ↓
8. User đổi thời gian:
   GET /api/map/markers?days=7
   → Xóa marker cũ → render marker mới
```

---

## 🏗️ TECH STACK

- **Backend**: Spring Boot 3.x, JPA/Hibernate
- **Frontend**: Leaflet.js
- **Database**: PostgreSQL
- **API**: RESTful

---

## 📦 PHASE 1: BACKEND IMPLEMENTATION

### 1.1. DTO Layer

#### ✅ File: `MarkerDTO.java`
**Location**: `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/response/MarkerDTO.java`

```java
package com.phucnguyen.agriai.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkerDTO {
    private Double latitude;
    private Double longitude;
    private Long diseaseId;
    private String diseaseName;
    private LocalDateTime diagnosedAt;
    private String province;
    private Long diagnoseHistoryId;
}
```

**Mục đích**: 
- Response object cho API endpoint
- Chứa đầy đủ thông tin để render marker trên map
- `province` optional từ AreaInfor
- `diagnoseHistoryId` để link đến detail page sau này

---

### 1.2. Repository Layer

#### ✅ File: `DiagnoseHistoryRepository.java`
**Location**: `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseHistoryRepository.java`

**Thêm method**:

```java
@Query("""
    SELECT new com.phucnguyen.agriai.dto.response.MarkerDTO(
        dh.latitude,
        dh.longitude,
        d.id,
        d.diseaseName,
        dh.createdAt,
        ai.province,
        dh.id
    )
    FROM DiagnoseHistory dh
    JOIN DiagnoseHistoryDetail dhd ON dhd.diagnoseHistory.id = dh.id
    JOIN Disease d ON dhd.disease.id = d.id
    LEFT JOIN AreaInfor ai ON dh.areaInfor.id = ai.id
    WHERE dh.latitude IS NOT NULL
      AND dh.longitude IS NOT NULL
      AND dhd.disease.id IS NOT NULL
      AND dh.isDelete = false
      AND dhd.isDelete = false
      AND dh.createdAt >= :startDate
      AND (:diseaseId IS NULL OR d.id = :diseaseId)
    ORDER BY dh.createdAt DESC
""")
List<MarkerDTO> findMarkersForMap(
    @Param("startDate") LocalDateTime startDate,
    @Param("diseaseId") Long diseaseId
);
```

**Giải thích**:
- JOIN 3 bảng: DiagnoseHistory, DiagnoseHistoryDetail, Disease
- LEFT JOIN AreaInfor để lấy province (có thể null)
- Filter: latitude/longitude not null, không bị xóa, trong khoảng thời gian
- Optional filter theo diseaseId
- Sắp xếp theo thời gian mới nhất

---

### 1.3. Service Layer

#### ✅ File: `MapService.java`
**Location**: `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/MapService.java`

```java
package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.response.MarkerDTO;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MapService {
    
    private final DiagnoseHistoryRepository diagnoseHistoryRepository;

    /**
     * Lấy danh sách marker cho bản đồ cảnh báo
     * 
     * @param days Số ngày lấy dữ liệu (mặc định 30)
     * @param diseaseId ID bệnh cần filter (null = tất cả)
     * @return List marker
     */
    @Transactional(readOnly = true)
    public List<MarkerDTO> getMapMarkers(Integer days, Long diseaseId) {
        if (days == null || days <= 0) {
            days = 30; // Default 30 days
        }
        
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        
        log.info("Fetching map markers: days={}, diseaseId={}, startDate={}", 
                 days, diseaseId, startDate);
        
        List<MarkerDTO> markers = diagnoseHistoryRepository.findMarkersForMap(
            startDate, 
            diseaseId
        );
        
        log.info("Found {} markers", markers.size());
        
        return markers;
    }
}
```

**Logic**:
- Validate `days` parameter (default 30)
- Tính `startDate` = now - days
- Gọi repository query
- Log để debug
- Return list markers

---

### 1.4. Controller Layer

#### ✅ File: `MapController.java`
**Location**: `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/MapController.java`

```java
package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.response.MarkerDTO;
import com.phucnguyen.agriai.service.MapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
@Tag(name = "Map", description = "Disease outbreak map APIs")
public class MapController {
    
    private final MapService mapService;

    /**
     * GET /api/map/markers
     * Lấy danh sách marker cho bản đồ cảnh báo
     * 
     * @param days Số ngày lấy dữ liệu (default: 30)
     * @param diseaseId ID bệnh cần filter (optional)
     * @return List<MarkerDTO>
     */
    @GetMapping("/markers")
    @Operation(
        summary = "Get disease outbreak markers",
        description = "Retrieve markers for disease outbreak map with optional filters"
    )
    public ResponseEntity<List<MarkerDTO>> getMarkers(
        @Parameter(description = "Number of days to fetch data (default: 30)")
        @RequestParam(required = false, defaultValue = "30") Integer days,
        
        @Parameter(description = "Disease ID to filter (optional)")
        @RequestParam(required = false) Long diseaseId
    ) {
        List<MarkerDTO> markers = mapService.getMapMarkers(days, diseaseId);
        return ResponseEntity.ok(markers);
    }
}
```

**API Endpoint**:
- **URL**: `GET /api/map/markers`
- **Query Params**:
  - `days` (optional, default=30): Số ngày lấy dữ liệu
  - `diseaseId` (optional): Filter theo bệnh
- **Response**: `List<MarkerDTO>`

**Examples**:
```bash
# Lấy tất cả marker 30 ngày gần nhất
GET /api/map/markers

# Lấy marker 7 ngày gần nhất
GET /api/map/markers?days=7

# Lấy marker của bệnh ID=1 trong 30 ngày
GET /api/map/markers?diseaseId=1&days=30

# Lấy marker của bệnh ID=2 trong 14 ngày
GET /api/map/markers?diseaseId=2&days=14
```

---

## 🎨 PHASE 2: FRONTEND IMPLEMENTATION

### 2.1. Setup Dependencies

**File**: `package.json`

```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8"
  }
}
```

**Install**:
```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

---

### 2.2. Disease Color Mapping

**File**: `agriai_frontend/src/constants/diseaseColors.ts`

```typescript
export const DISEASE_COLORS: Record<string, string> = {
  // Đạo ôn (Blast)
  '1': '#EF4444', // red-500
  
  // Khô vằn (Brown spot)
  '2': '#F97316', // orange-500
  
  // Rầy nâu (Brown planthopper)
  '3': '#10B981', // green-500
  
  // Default
  'default': '#6B7280' // gray-500
};

export const getDiseaseColor = (diseaseId: number): string => {
  return DISEASE_COLORS[diseaseId.toString()] || DISEASE_COLORS.default;
};

export const DISEASE_NAMES: Record<string, string> = {
  '1': 'Đạo ôn',
  '2': 'Khô vằn',
  '3': 'Rầy nâu'
};
```

---

### 2.3. Map Component

**File**: `agriai_frontend/src/components/DiseaseMap.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDiseaseColor } from '../constants/diseaseColors';
import { fetchMapMarkers, MarkerDTO } from '../services/mapService';

interface DiseaseMapProps {
  days?: number;
  diseaseId?: number | null;
}

export const DiseaseMap: React.FC<DiseaseMapProps> = ({ 
  days = 30, 
  diseaseId = null 
}) => {
  const [markers, setMarkers] = useState<MarkerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Center of Vietnam
  const center: LatLngExpression = [16.0544, 108.2022];

  useEffect(() => {
    loadMarkers();
  }, [days, diseaseId]);

  const loadMarkers = async () => {
    setLoading(true);
    try {
      const data = await fetchMapMarkers(days, diseaseId);
      setMarkers(data);
    } catch (error) {
      console.error('Failed to load markers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded shadow">
          Đang tải dữ liệu...
        </div>
      )}
      
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker, index) => (
          <CircleMarker
            key={`${marker.diagnoseHistoryId}-${index}`}
            center={[marker.latitude, marker.longitude]}
            radius={8}
            pathOptions={{
              fillColor: getDiseaseColor(marker.diseaseId),
              fillOpacity: 0.7,
              color: getDiseaseColor(marker.diseaseId),
              weight: 2,
              opacity: 0.9
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">
                  {marker.diseaseName}
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>Ngày phát hiện:</strong><br />
                  {formatDate(marker.diagnosedAt)}
                </p>
                {marker.province && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Khu vực:</strong> {marker.province}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded shadow">
        <p className="text-sm font-semibold mb-2">Tổng số ca: {markers.length}</p>
      </div>
    </div>
  );
};
```

---

### 2.4. API Service

**File**: `agriai_frontend/src/services/mapService.ts`

```typescript
import axios from 'axios';

export interface MarkerDTO {
  latitude: number;
  longitude: number;
  diseaseId: number;
  diseaseName: string;
  diagnosedAt: string;
  province?: string;
  diagnoseHistoryId: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const fetchMapMarkers = async (
  days: number = 30,
  diseaseId?: number | null
): Promise<MarkerDTO[]> => {
  const params: any = { days };
  if (diseaseId) {
    params.diseaseId = diseaseId;
  }
  
  const response = await axios.get<MarkerDTO[]>(
    `${API_BASE_URL}/api/map/markers`,
    { params }
  );
  
  return response.data;
};
```

---

### 2.5. Filter Component

**File**: `agriai_frontend/src/components/MapFilters.tsx`

```typescript
import React from 'react';

interface MapFiltersProps {
  days: number;
  diseaseId: number | null;
  onDaysChange: (days: number) => void;
  onDiseaseChange: (diseaseId: number | null) => void;
  diseases: Array<{ id: number; name: string }>;
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  days,
  diseaseId,
  onDaysChange,
  onDiseaseChange,
  diseases
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex gap-4 items-center">
        {/* Time filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Thời gian:</label>
          <select
            value={days}
            onChange={(e) => onDaysChange(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            <option value={7}>7 ngày</option>
            <option value={14}>14 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={60}>60 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
        </div>

        {/* Disease filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Loại bệnh:</label>
          <select
            value={diseaseId || ''}
            onChange={(e) => onDiseaseChange(e.target.value ? Number(e.target.value) : null)}
            className="border rounded px-3 py-2"
          >
            <option value="">Tất cả</option>
            {diseases.map(disease => (
              <option key={disease.id} value={disease.id}>
                {disease.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
```

---

### 2.6. Main Page Component

**File**: `agriai_frontend/src/pages/DiseaseMapPage.tsx`

```typescript
import React, { useState } from 'react';
import { DiseaseMap } from '../components/DiseaseMap';
import { MapFilters } from '../components/MapFilters';

const DISEASES = [
  { id: 1, name: 'Đạo ôn' },
  { id: 2, name: 'Khô vằn' },
  { id: 3, name: 'Rầy nâu' }
];

export const DiseaseMapPage: React.FC = () => {
  const [days, setDays] = useState(30);
  const [diseaseId, setDiseaseId] = useState<number | null>(null);

  return (
    <div className="h-screen flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">Bản đồ cảnh báo dịch bệnh</h1>
      
      <MapFilters
        days={days}
        diseaseId={diseaseId}
        onDaysChange={setDays}
        onDiseaseChange={setDiseaseId}
        diseases={DISEASES}
      />
      
      <div className="flex-1 rounded-lg overflow-hidden shadow-lg">
        <DiseaseMap days={days} diseaseId={diseaseId} />
      </div>
    </div>
  );
};
```

---

## 🧪 TESTING

### Backend Testing

**File**: `src/test/java/com/phucnguyen/agriai/controller/MapControllerTest.java`

```java
@SpringBootTest
@AutoConfigureMockMvc
class MapControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetMarkers_Default() throws Exception {
        mockMvc.perform(get("/api/map/markers"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
    
    @Test
    void testGetMarkers_WithDays() throws Exception {
        mockMvc.perform(get("/api/map/markers?days=7"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
    
    @Test
    void testGetMarkers_WithDiseaseId() throws Exception {
        mockMvc.perform(get("/api/map/markers?diseaseId=1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
}
```

### Manual Testing

```bash
# Test 1: Lấy tất cả marker 30 ngày
curl http://localhost:8080/api/map/markers

# Test 2: Lấy marker 7 ngày
curl http://localhost:8080/api/map/markers?days=7

# Test 3: Filter theo bệnh
curl http://localhost:8080/api/map/markers?diseaseId=1&days=30
```

---

## 📊 DATABASE QUERY PERFORMANCE

### Index Recommendations

```sql
-- Index cho query performance
CREATE INDEX idx_diagnose_history_location_date 
ON diagnose_history(latitude, longitude, created_at) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX idx_diagnose_history_detail_disease 
ON diagnose_history_detail(diagnose_history_id, disease_id);

CREATE INDEX idx_diagnose_history_created_at 
ON diagnose_history(created_at DESC);
```

### Expected Query Performance
- **< 100 records**: < 50ms
- **100-1000 records**: < 200ms
- **> 1000 records**: Consider pagination

---

## 🎯 FEATURES CHECKLIST

### Backend
- [x] MarkerDTO created
- [x] Repository custom query
- [x] MapService business logic
- [x] MapController REST endpoint
- [x] API documentation (Swagger)
- [ ] Unit tests
- [ ] Integration tests

### Frontend
- [x] Leaflet.js setup
- [x] DiseaseMap component
- [x] MapFilters component
- [x] Color mapping by disease
- [x] Popup with disease info
- [x] API service integration
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design

---

## 🚀 DEPLOYMENT CHECKLIST

### Backend
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] API rate limiting (if needed)
- [ ] CORS configuration
- [ ] Logging configured

### Frontend
- [ ] Environment variables (.env)
- [ ] Build optimization
- [ ] Map tile provider configured
- [ ] Error boundaries
- [ ] Analytics tracking (optional)

---

## 📝 API DOCUMENTATION

### Endpoint: Get Map Markers

**URL**: `GET /api/map/markers`

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| days | Integer | No | 30 | Số ngày lấy dữ liệu |
| diseaseId | Long | No | null | ID bệnh cần filter |

**Response**: `200 OK`
```json
[
  {
    "latitude": 10.762622,
    "longitude": 106.660172,
    "diseaseId": 1,
    "diseaseName": "Đạo ôn",
    "diagnosedAt": "2026-04-15T10:30:00",
    "province": "TP. Hồ Chí Minh",
    "diagnoseHistoryId": 123
  }
]
```

**Error Responses**:
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Server error

---

## 🔧 TROUBLESHOOTING

### Issue 1: Markers không hiển thị
**Cause**: Dữ liệu không có latitude/longitude
**Solution**: Check database, ensure diagnose_history có coordinates

### Issue 2: Query chậm
**Cause**: Thiếu index
**Solution**: Tạo indexes như trong phần Database Query Performance

### Issue 3: CORS error
**Cause**: Backend chưa config CORS
**Solution**: Add CORS configuration trong Spring Boot

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

---

## 📚 REFERENCES

- [Leaflet.js Documentation](https://leafletjs.com/)
- [React Leaflet](https://react-leaflet.js.org/)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [PostgreSQL Spatial](https://www.postgresql.org/docs/current/functions-geometry.html)

---

## ✅ NEXT STEPS

1. **Implement Backend** (Phase 1)
   - Tạo các file theo plan
   - Test API endpoints
   - Verify query performance

2. **Implement Frontend** (Phase 2)
   - Setup Leaflet.js
   - Tạo components
   - Integrate với API

3. **Testing & Optimization**
   - Unit tests
   - Integration tests
   - Performance tuning

4. **Deployment**
   - Deploy backend
   - Deploy frontend
   - Monitor performance

---

**Created**: 2026-04-20
**Author**: AI Assistant
**Version**: 1.0
