"""
Generate draw.io sequence diagrams for AgriAI 3 features.
Output: docs/AgriAI-sequence-diagrams.drawio
"""

import xml.etree.ElementTree as ET
from xml.dom import minidom

# ─── Layout constants ────────────────────────────────────────────
CX = {"user": 70, "ui": 240, "srv": 430, "db": 610}
W_HEADER = {"user": 80, "ui": 140, "srv": 110, "db": 110}
STEP_H = 56          # vertical gap between steps
Y_HEADER = 16
H_HEADER = 44
Y_LIFELINE_START = Y_HEADER + H_HEADER
Y_FIRST_STEP = Y_LIFELINE_START + 70
LOOP_OFFSET = 50     # self-loop right extension

STYLE_HEADER_USER = (
    "shape=mxgraph.basic.person;fillColor=#f3e8ff;strokeColor=#9673a6;"
    "fontStyle=1;fontSize=11;verticalLabelPosition=bottom;verticalAlign=top;"
)
STYLE_HEADER_UI = (
    "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
    "fontStyle=1;fontSize=11;"
)
STYLE_HEADER_SRV = (
    "rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d6b656;"
    "fontStyle=1;fontSize=11;"
)
STYLE_HEADER_DB = (
    "rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;"
    "fontStyle=1;fontSize=11;"
)
STYLE_LIFELINE = (
    "endArrow=none;dashed=1;strokeColor=#999999;strokeWidth=1;"
)
STYLE_ARROW_SOLID = (
    "endArrow=block;endFill=1;edgeStyle=elbowEdgeStyle;elbow=horizontal;"
    "strokeColor=#333333;strokeWidth=1.5;fontSize=10;labelBackgroundColor=#ffffff;"
)
STYLE_ARROW_DASHED = (
    "endArrow=open;dashed=1;endFill=0;edgeStyle=elbowEdgeStyle;elbow=horizontal;"
    "strokeColor=#666666;strokeWidth=1.5;fontSize=10;fontColor=#666666;"
    "labelBackgroundColor=#ffffff;"
)
STYLE_ARROW_SELF = (
    "endArrow=block;endFill=1;edgeStyle=orthogonalEdgeStyle;"
    "strokeColor=#333333;strokeWidth=1.5;fontSize=10;labelBackgroundColor=#ffffff;"
    "exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;"
)
STYLE_NUMBER = (
    "ellipse;whiteSpace=wrap;html=1;fillColor=#333333;strokeColor=#333333;"
    "fontColor=#ffffff;fontStyle=1;fontSize=9;align=center;"
)


# ─── Helpers ─────────────────────────────────────────────────────

def cell(parent, cid, value="", style="", vertex=False, edge=False,
         x=0, y=0, w=0, h=0, src=None, tgt=None, points=None, rel_geom=False):
    attrs = {"id": cid, "value": value, "parent": parent}
    if style:
        attrs["style"] = style
    if vertex:
        attrs["vertex"] = "1"
    if edge:
        attrs["edge"] = "1"
    if src:
        attrs["source"] = src
    if tgt:
        attrs["target"] = tgt
    el = ET.Element("mxCell", attrs)
    geo_attrs = {}
    if rel_geom:
        geo_attrs = {"relative": "1", "as": "geometry"}
    else:
        geo_attrs = {"x": str(x), "y": str(y), "width": str(w), "height": str(h), "as": "geometry"}
    geo = ET.SubElement(el, "mxGeometry", geo_attrs)
    if points:
        arr = ET.SubElement(geo, "Array", {"as": "points"})
        for px, py in points:
            ET.SubElement(arr, "mxPoint", {"x": str(px), "y": str(py)})
    return el


def build_diagram(name: str, steps: list) -> ET.Element:
    """
    steps = list of dicts:
      { from: 'user'|'ui'|'srv'|'db', to: same, label: str, dashed: bool }
      Special: from==to means self-loop
    """
    participants = ["user", "ui", "srv", "db"]
    labels = {"user": "User", "ui": "Trang chẩn đoán", "srv": "Server", "db": "Database"}
    header_styles = {
        "user": STYLE_HEADER_USER, "ui": STYLE_HEADER_UI,
        "srv": STYLE_HEADER_SRV, "db": STYLE_HEADER_DB,
    }

    y_end = Y_FIRST_STEP + len(steps) * STEP_H + 60

    root = ET.Element("root")
    ET.SubElement(root, "mxCell", {"id": "0"})
    ET.SubElement(root, "mxCell", {"id": "1", "parent": "0"})

    pid = 10

    # ── Participant headers
    for p in participants:
        cx = CX[p]
        w = W_HEADER[p]
        x = cx - w // 2
        if p == "user":
            h = 56
        else:
            h = H_HEADER
        root.append(cell("1", str(pid), labels[p], header_styles[p],
                          vertex=True, x=x, y=Y_HEADER, w=w, h=h))
        pid += 1

    # ── Lifelines
    for p in participants:
        cx = CX[p]
        root.append(cell("1", str(pid), "", STYLE_LIFELINE, edge=True,
                          points=[(cx, Y_LIFELINE_START), (cx, y_end)],
                          rel_geom=True))
        pid += 1

    # ── Steps
    for i, step in enumerate(steps):
        y = Y_FIRST_STEP + i * STEP_H
        fr = step["from"]
        to = step["to"]
        label = step["label"]
        dashed = step.get("dashed", False)
        num = i + 1

        if fr == to:
            # Self-loop
            x_center = CX[fr]
            loop_x = x_center + LOOP_OFFSET
            root.append(cell("1", str(pid), label, STYLE_ARROW_SELF, edge=True,
                              points=[(loop_x, y - 10), (loop_x, y + 20)],
                              rel_geom=True))
            pid += 1
            # Number circle
            root.append(cell("1", str(pid), str(num), STYLE_NUMBER,
                              vertex=True, x=loop_x - 8, y=y - 20, w=18, h=18))
            pid += 1
        else:
            # Direction
            x1 = CX[fr]
            x2 = CX[to]
            style = STYLE_ARROW_DASHED if dashed else STYLE_ARROW_SOLID
            mid_x = (x1 + x2) // 2
            root.append(cell("1", str(pid), label, style, edge=True,
                              points=[(x1, y), (x2, y)],
                              rel_geom=True))
            pid += 1
            # Number circle
            root.append(cell("1", str(pid), str(num), STYLE_NUMBER,
                              vertex=True, x=mid_x - 9, y=y - 22, w=18, h=18))
            pid += 1

    # ── Bottom actor footers
    for p in participants:
        cx = CX[p]
        w = W_HEADER[p]
        x = cx - w // 2
        if p == "user":
            h = 56
        else:
            h = H_HEADER
        root.append(cell("1", str(pid), labels[p], header_styles[p],
                          vertex=True, x=x, y=y_end + 10, w=w, h=h))
        pid += 1

    graph = ET.Element("mxGraphModel", {
        "dx": "1200", "dy": "800", "grid": "0", "gridSize": "10",
        "guides": "1", "tooltips": "1", "connect": "1", "arrows": "1",
        "fold": "1", "page": "0", "pageScale": "1",
        "pageWidth": "720", "pageHeight": str(y_end + 200),
        "math": "0", "shadow": "0",
    })
    graph.append(root)
    diag = ET.Element("diagram", {"id": name.replace(" ", "_"), "name": name})
    diag.text = ET.tostring(graph, encoding="unicode")
    return diag


# ─── Diagram 1: Chẩn đoán bệnh ───────────────────────────────────
STEPS_DIAGNOSE = [
    {"from": "user", "to": "ui",  "label": "Yêu cầu trang chẩn đoán"},
    {"from": "ui",   "to": "srv", "label": "Tải danh sách loại cây trồng"},
    {"from": "srv",  "to": "db",  "label": "Lấy danh sách loại cây đang hoạt động"},
    {"from": "db",   "to": "srv", "label": "Trả về danh sách loại cây", "dashed": True},
    {"from": "srv",  "to": "ui",  "label": "Trả về danh sách loại cây", "dashed": True},
    {"from": "ui",   "to": "user","label": "Hiển thị trang chẩn đoán", "dashed": True},
    {"from": "ui",   "to": "ui",  "label": "Xin quyền GPS"},
    {"from": "ui",   "to": "user","label": "Hiển thị trạng thái GPS", "dashed": True},
    {"from": "user", "to": "ui",  "label": "Chọn loại cây và tải ảnh"},
    {"from": "ui",   "to": "user","label": "Hiển thị ảnh xem trước", "dashed": True},
    {"from": "user", "to": "ui",  "label": "Bấm chẩn đoán"},
    {"from": "ui",   "to": "ui",  "label": "Kiểm tra dữ liệu đầu vào"},
    {"from": "ui",   "to": "srv", "label": "Gửi yêu cầu chẩn đoán (multipart/form-data)"},
    {"from": "srv",  "to": "srv", "label": "Xác thực người dùng (Principal)"},
    {"from": "srv",  "to": "db",  "label": "Kiểm tra loại cây và người dùng"},
    {"from": "db",   "to": "srv", "label": "Trả về dữ liệu hợp lệ", "dashed": True},
    {"from": "srv",  "to": "db",  "label": "Tạo lịch sử chẩn đoán (status=PENDING)"},
    {"from": "db",   "to": "srv", "label": "Trả về mã lịch sử", "dashed": True},
    {"from": "srv",  "to": "srv", "label": "Upload ảnh lên Cloudinary → imageUrl"},
    {"from": "srv",  "to": "srv", "label": "Gọi AI Model (YOLO) → nhận diện bệnh"},
    {"from": "srv",  "to": "srv", "label": "Gọi OpenWeatherMap → dữ liệu thời tiết"},
    {"from": "srv",  "to": "srv", "label": "Chờ và tổng hợp kết quả (join futures)"},
    {"from": "srv",  "to": "db",  "label": "Tra cứu bệnh từ kết quả nhận diện"},
    {"from": "db",   "to": "srv", "label": "Trả về thông tin bệnh", "dashed": True},
    {"from": "srv",  "to": "db",  "label": "Tra cứu phác đồ, thuốc và cảnh báo"},
    {"from": "db",   "to": "srv", "label": "Trả về dữ liệu điều trị", "dashed": True},
    {"from": "srv",  "to": "srv", "label": "Sinh hướng dẫn canh tác (AI Guidance)"},
    {"from": "srv",  "to": "db",  "label": "Cập nhật lịch sử và lưu chi tiết"},
    {"from": "db",   "to": "srv", "label": "Xác nhận lưu kết quả", "dashed": True},
    {"from": "srv",  "to": "ui",  "label": "Trả về kết quả chẩn đoán", "dashed": True},
    {"from": "ui",   "to": "user","label": "Hiển thị kết quả chẩn đoán", "dashed": True},
]

# ─── Diagram 2: Cảnh báo thời tiết ───────────────────────────────
STEPS_WEATHER = [
    {"from": "user", "to": "ui",  "label": "Mở trang Home"},
    {"from": "ui",   "to": "ui",  "label": "navigator.geolocation.getCurrentPosition()"},
    {"from": "ui",   "to": "user","label": "Hiển thị trạng thái GPS", "dashed": True},
    {"from": "ui",   "to": "srv", "label": "GET /api/weather/disease-risks?lat=...&lng=..."},
    {"from": "srv",  "to": "srv", "label": "weatherPort.getCurrentWeather() → OpenWeatherMap"},
    {"from": "srv",  "to": "db",  "label": "findByIsActiveTrueAndIsDeleteFalse() → DiseaseWeatherCondition"},
    {"from": "db",   "to": "srv", "label": "Tất cả điều kiện thời tiết-bệnh active", "dashed": True},
    {"from": "srv",  "to": "srv", "label": "evaluateAll(): nhóm, so khớp, deduplicate"},
    {"from": "srv",  "to": "ui",  "label": "WeatherDiseaseRiskResponse {weather, diseaseWeatherRisks[]}", "dashed": True},
    {"from": "ui",   "to": "user","label": "Hiển thị card thời tiết + danh sách bệnh nguy cơ", "dashed": True},
]

# ─── Diagram 3: Bản đồ dịch bệnh ─────────────────────────────────
STEPS_MAP = [
    {"from": "user", "to": "ui",  "label": "Mở trang Bản đồ dịch bệnh"},
    {"from": "ui",   "to": "srv", "label": "GET /api/map/diseases"},
    {"from": "srv",  "to": "db",  "label": "findAll() → Disease[]"},
    {"from": "db",   "to": "srv", "label": "Danh sách bệnh", "dashed": True},
    {"from": "srv",  "to": "ui",  "label": "[ {id, diseaseName} ]", "dashed": True},
    {"from": "ui",   "to": "srv", "label": "GET /api/map/markers?days=30"},
    {"from": "srv",  "to": "db",  "label": "findMarkers(since, diseaseId) — JOIN history+detail+disease+area_infor"},
    {"from": "db",   "to": "srv", "label": "List<MapMarkerResponse>", "dashed": True},
    {"from": "srv",  "to": "ui",  "label": "Danh sách markers có tọa độ", "dashed": True},
    {"from": "ui",   "to": "ui",  "label": "useMapClusters() → Supercluster tính cluster"},
    {"from": "ui",   "to": "user","label": "Render bản đồ Leaflet.js với clusters", "dashed": True},
    {"from": "user", "to": "ui",  "label": "Đổi bộ lọc (days / diseaseId)"},
    {"from": "ui",   "to": "srv", "label": "GET /api/map/markers?days=7&diseaseId=5"},
    {"from": "srv",  "to": "db",  "label": "findMarkers(since=7days, diseaseId=5)"},
    {"from": "db",   "to": "srv", "label": "Filtered markers", "dashed": True},
    {"from": "srv",  "to": "ui",  "label": "Filtered markers", "dashed": True},
    {"from": "ui",   "to": "user","label": "Cập nhật bản đồ", "dashed": True},
    {"from": "user", "to": "ui",  "label": "Click vào điểm dịch bệnh"},
    {"from": "ui",   "to": "user","label": "Popup: Tên bệnh + Ngày + Khu vực", "dashed": True},
]


# ─── Build & write file ───────────────────────────────────────────
def build_file():
    mxfile = ET.Element("mxfile", {"version": "24.5.2", "host": "app.diagrams.net"})
    mxfile.append(build_diagram("1. Chẩn đoán bệnh", STEPS_DIAGNOSE))
    mxfile.append(build_diagram("2. Cảnh báo thời tiết", STEPS_WEATHER))
    mxfile.append(build_diagram("3. Bản đồ dịch bệnh", STEPS_MAP))

    raw = ET.tostring(mxfile, encoding="unicode")
    pretty = minidom.parseString(raw).toprettyxml(indent="  ")
    # Remove extra XML declaration added by minidom
    lines = pretty.split("\n")
    if lines[0].startswith("<?xml"):
        lines = lines[1:]
    out = '<?xml version="1.0" encoding="UTF-8"?>\n' + "\n".join(lines)

    out_path = "AgriAI-sequence-diagrams.drawio"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"[OK] Generated: {out_path}")


if __name__ == "__main__":
    build_file()
