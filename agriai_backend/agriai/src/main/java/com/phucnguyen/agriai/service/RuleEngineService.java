package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.entity.DrugInteraction;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.entity.TreatmentWeatherCondition;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.enums.WeatherFactor;
import com.phucnguyen.agriai.repository.DrugInteractionRepository;
import com.phucnguyen.agriai.repository.TreatmentPlanRepository;
import com.phucnguyen.agriai.repository.TreatmentWeatherConditionRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RuleEngineService {

    private static final List<String> BLOCKING_ACTION_RULE_KEYWORDS = List.of("SEPARATE", "DO_NOT", "AVOID");

    private final TreatmentPlanRepository treatmentPlanRepository;
    private final DrugInteractionRepository drugInteractionRepository;
    private final TreatmentWeatherConditionRepository weatherConditionRepository;

    public RuleEngineService(
            TreatmentPlanRepository treatmentPlanRepository,
            DrugInteractionRepository drugInteractionRepository,
            TreatmentWeatherConditionRepository weatherConditionRepository) {
        this.treatmentPlanRepository = treatmentPlanRepository;
        this.drugInteractionRepository = drugInteractionRepository;
        this.weatherConditionRepository = weatherConditionRepository;
    }

    /**
     * Entry point chính của Rule Engine.
     * Hàm này nhận danh sách bệnh được phát hiện và thông tin thời tiết để tính
     * toán:
     * - Các phác đồ điều trị phù hợp nhất.
     * - Cảnh báo tương tác hóa học giữa các loại thuốc.
     * - Đánh giá rủi ro thời tiết (mưa to, nhiệt độ cao).
     * - Phân bổ lịch phun thuốc tối ưu (kết hợp chung hay tách đợt riêng).
     */
    public RuleEngineResult process(List<Integer> diseaseIds, WeatherDTO weather) {
        if (diseaseIds == null || diseaseIds.isEmpty()) {
            return RuleEngineResult.empty();
        }

        Map<Integer, List<TreatmentPlan>> plansByDisease = new LinkedHashMap<>();
        for (Integer diseaseId : diseaseIds) {
            List<TreatmentPlan> plans = treatmentPlanRepository.findByDiseaseIdAndIsDeleteFalse(diseaseId);
            if (!plans.isEmpty()) {
                plansByDisease.put(diseaseId, plans);
            }
        }

        List<TreatmentPlan> selectedPlans = plansByDisease.values().stream()
                .map(this::selectPrimaryPlan)
                .filter(Objects::nonNull)
                .toList();

        List<InteractionWarningDTO> interactionWarnings = buildInteractionWarnings(selectedPlans);
        Map<Integer, List<WeatherAlertDTO>> weatherAlertsByPlan = buildWeatherAlerts(selectedPlans, weather);
        List<WeatherAlertDTO> weatherAlerts = weatherAlertsByPlan.values().stream()
                .flatMap(List::stream)
                .toList();

        List<TreatmentProgramDTO> programs = buildPrograms(selectedPlans, interactionWarnings, weatherAlertsByPlan);
        List<TreatmentDTO> flatTreatments = programs.stream()
                .flatMap(program -> program.getTreatments().stream())
                .toList();

        String strategy = deriveStrategy(programs, interactionWarnings);
        return new RuleEngineResult(flatTreatments, List.of(), programs, interactionWarnings, weatherAlerts, strategy);
    }

    /**
     * Dựa trên danh sách các phác đồ thay thế cho 1 loại bệnh, hàm này chọn ra 1
     * phác đồ ưu tiên nhất.
     * Độ ưu tiên: Bắt buộc (isRequired = true) -> Có chứa hoạt chất -> ID cũ hơn.
     */
    private TreatmentPlan selectPrimaryPlan(List<TreatmentPlan> plans) {
        return plans.stream()
                .sorted(Comparator
                        .comparing((TreatmentPlan plan) -> Boolean.TRUE.equals(plan.getIsRequired())).reversed()
                        .thenComparing(plan -> plan.getIngredient() != null, Comparator.reverseOrder())
                        .thenComparing(TreatmentPlan::getId))
                .findFirst()
                .orElse(null);
    }

    /**
     * Kiểm tra chéo toàn bộ các hoạt chất của các phác đồ đã chọn.
     * Truy xuất DB để lấy ra các cảnh báo xung đột hóa học (DrugInteraction) giữa
     * các cặp hoạt chất đó.
     */
    private List<InteractionWarningDTO> buildInteractionWarnings(List<TreatmentPlan> plans) {
        List<Integer> ingredientIds = plans.stream()
                .filter(plan -> plan.getIngredient() != null)
                .map(plan -> plan.getIngredient().getId())
                .distinct()
                .toList();

        if (ingredientIds.size() < 2) {
            return List.of();
        }

        return drugInteractionRepository.findInteractionsBetweenIngredients(ingredientIds).stream()
                .map(this::toInteractionWarning)
                .toList();
    }

    /**
     * Biến đổi Entity tương tác thuốc từ DB thành DTO linh hoạt, đồng thời
     * tự động quét rule (ví dụ có các từ ["SEPARATE", "AVOID"]) để quyết định xem
     * tương tác này có BẮT BUỘC phải tách đợt phun hay không (blocksMixing = true).
     */
    private InteractionWarningDTO toInteractionWarning(DrugInteraction interaction) {
        String actionRule = interaction.getActionRule();
        boolean blocksMixing = actionRule != null
                && BLOCKING_ACTION_RULE_KEYWORDS.stream()
                        .anyMatch(keyword -> actionRule.toUpperCase().contains(keyword));
        return InteractionWarningDTO.builder()
                .ingredientAId(interaction.getIngredientA() != null ? interaction.getIngredientA().getId() : null)
                .ingredientAName(
                        interaction.getIngredientA() != null ? interaction.getIngredientA().getIngredientName() : null)
                .ingredientBId(interaction.getIngredientB() != null ? interaction.getIngredientB().getId() : null)
                .ingredientBName(
                        interaction.getIngredientB() != null ? interaction.getIngredientB().getIngredientName() : null)
                .interactionType(interaction.getInteractionType())
                .severity(interaction.getSeverity())
                .actionRule(actionRule)
                .warningMessage(interaction.getWarningMessage())
                .blocksMixing(blocksMixing)
                .intervalDays(interaction.getIntervalDays())
                .build();
    }

    /**
     * Đối chiếu thông số thời tiết thực tế (nhiệt độ, độ ẩm...) với các khuyến cáo
     * thời tiết
     * của từng loại thuốc. Trả về danh sách cảnh báo nếu điều kiện thực tế vi phạm
     * khuyến cáo.
     */
    private Map<Integer, List<WeatherAlertDTO>> buildWeatherAlerts(List<TreatmentPlan> plans, WeatherDTO weather) {
        if (weather == null || plans.isEmpty()) {
            return Map.of();
        }

        List<Integer> planIds = plans.stream().map(TreatmentPlan::getId).toList();
        List<TreatmentWeatherCondition> conditions = weatherConditionRepository
                .findByTreatmentplanIdInAndIsDeleteFalse(planIds);

        Map<Integer, List<WeatherAlertDTO>> alertsByPlan = new LinkedHashMap<>();
        for (TreatmentWeatherCondition condition : conditions) {
            Double actualValue = getWeatherValue(weather, condition.getWeatherFactor());
            if (actualValue == null) {
                continue;
            }

            boolean violated = isConditionViolated(condition, actualValue);
            WeatherAlertDTO alert = WeatherAlertDTO.builder()
                    .treatmentPlanId(condition.getTreatmentplan().getId())
                    .treatmentName(condition.getTreatmentplan().getTreatmentName())
                    .weatherFactor(condition.getWeatherFactor() != null ? condition.getWeatherFactor().name() : null)
                    .operator(condition.getOperator() != null ? condition.getOperator().name() : null)
                    .actualValue(actualValue)
                    .minValue(toDouble(condition.getMinValue()))
                    .maxValue(toDouble(condition.getMaxValue()))
                    .required(Boolean.TRUE.equals(condition.getIsRequired()))
                    .violated(violated)
                    .recommendationNote(condition.getRecommendationNote())
                    .unit(condition.getUnit())
                    .build();

            alertsByPlan.computeIfAbsent(condition.getTreatmentplan().getId(), ignored -> new ArrayList<>())
                    .add(alert);
        }
        return alertsByPlan;
    }

    /**
     * Hàm quan trọng nhất của Rule Engine: Nhóm các phác đồ điều trị thành từng Đợt
     * phun (Spray Program).
     * Thuật toán:
     * - Thử thêm từng loại thuốc vào một đợt phun.
     * - Nếu thuốc mới có xung đột hóa học cấm pha trộn với bất kỳ thuốc nào trong
     * đợt đó, nó sẽ tự tách sang đợt phun mới.
     * - Tự động thiết lập số ngày cách nhau giữa các đợt phun.
     */
    private List<TreatmentProgramDTO> buildPrograms(
            List<TreatmentPlan> selectedPlans,
            List<InteractionWarningDTO> interactionWarnings,
            Map<Integer, List<WeatherAlertDTO>> weatherAlertsByPlan) {
        List<List<TreatmentPlan>> groupedPlans = new ArrayList<>();
        for (TreatmentPlan candidate : selectedPlans) {
            boolean added = false;
            for (List<TreatmentPlan> group : groupedPlans) {
                if (canBeGrouped(candidate, group, interactionWarnings)) {
                    group.add(candidate);
                    added = true;
                    break;
                }
            }
            if (!added) {
                List<TreatmentPlan> newGroup = new ArrayList<>();
                newGroup.add(candidate);
                groupedPlans.add(newGroup);
            }
        }

        // Determine overall case type
        boolean isSingleGroup = groupedPlans.size() == 1;
        boolean hasConflict = !interactionWarnings.isEmpty();

        // Derive recommended interval from the most severe conflict (max intervalDays)
        Integer maxIntervalDays = interactionWarnings.stream()
                .filter(w -> w.getIntervalDays() != null)
                .map(InteractionWarningDTO::getIntervalDays)
                .max(Integer::compareTo)
                .orElse(null);

        List<TreatmentProgramDTO> programs = new ArrayList<>();
        for (int i = 0; i < groupedPlans.size(); i++) {
            List<TreatmentPlan> group = groupedPlans.get(i);
            List<TreatmentDTO> treatments = group.stream()
                    .map(plan -> toTreatmentDTO(plan, weatherAlertsByPlan.getOrDefault(plan.getId(), List.of()),
                            isSingleGroup))
                    .toList();

            List<String> diseaseNames = treatments.stream()
                    .map(TreatmentDTO::getDiseaseName)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            boolean blocked = treatments.stream().anyMatch(t -> Boolean.TRUE.equals(t.getWeatherBlocked()));
            boolean hasGroupInteraction = hasGroupInteractions(group, interactionWarnings);
            boolean mixAllowed = group.size() <= 1 || !hasGroupInteraction;

            programs.add(TreatmentProgramDTO.builder()
                    .programOrder(i + 1)
                    .programCode("SPRAY-" + (i + 1))
                    .strategy(isSingleGroup ? (hasConflict ? "MIX_WITH_WARNING" : "SINGLE_DISEASE_OR_SAFE_MIX")
                            : "SEPARATE_SPRAY")
                    .status(blocked ? "BLOCKED_BY_WEATHER" : "READY")
                    .mixAllowed(mixAllowed)
                    .diseaseNames(diseaseNames)
                    .reasons(buildProgramReasons(group, interactionWarnings, blocked))
                    .warnings(List.of())
                    .treatments(treatments)
                    .intervalDays((!isSingleGroup && i > 0) ? maxIntervalDays : null)
                    .build());
        }

        return programs;
    }

    /**
     * Kiểm tra xem một loại thuốc (candidate) có an toàn để pha chung vào một nhóm
     * thuốc đã có hay không.
     * Bằng cách đối chiếu với danh sách các cảnh báo CẤM pha trộn (blocksMixing).
     */
    private boolean canBeGrouped(
            TreatmentPlan candidate,
            List<TreatmentPlan> group,
            List<InteractionWarningDTO> interactionWarnings) {
        for (TreatmentPlan existing : group) {
            if (hasBlockingInteraction(candidate, existing, interactionWarnings)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Đánh giá chi tiết xem giữa 2 loại thuốc cụ thể có bất kỳ xung đột nào cấm pha
     * trộn hay không.
     */
    private boolean hasBlockingInteraction(
            TreatmentPlan planA,
            TreatmentPlan planB,
            List<InteractionWarningDTO> interactionWarnings) {
        Integer ingredientAId = planA.getIngredient() != null ? planA.getIngredient().getId() : null;
        Integer ingredientBId = planB.getIngredient() != null ? planB.getIngredient().getId() : null;
        if (ingredientAId == null || ingredientBId == null) {
            return false;
        }
        return interactionWarnings.stream().anyMatch(warning -> Boolean.TRUE.equals(warning.getBlocksMixing())
                && samePair(ingredientAId, ingredientBId, warning));
    }

    /**
     * Check xem 2 hoạt chất có trùng khớp với một cặp hoạt chất đã được cấu hình
     * trong bảng cảnh báo không. (Vị trí A, B không quan trọng)
     */
    private boolean samePair(Integer ingredientAId, Integer ingredientBId, InteractionWarningDTO warning) {
        return Objects.equals(ingredientAId, warning.getIngredientAId())
                && Objects.equals(ingredientBId, warning.getIngredientBId())
                || Objects.equals(ingredientAId, warning.getIngredientBId())
                        && Objects.equals(ingredientBId, warning.getIngredientAId());
    }

    /**
     * Gán các "mã lý do" (Reason Codes) để giải thích vì sao hệ thống lại cấu trúc
     * đợt phun này như thế.
     * Code sẽ được chuyển về Frontend để tự động sinh ra tiêu đề (VD: Phác đồ điều
     * trị, Phác đồ kết hợp...).
     */
    private List<String> buildProgramReasons(
            List<TreatmentPlan> group,
            List<InteractionWarningDTO> interactionWarnings,
            boolean blocked) {
        List<String> reasons = new ArrayList<>();
        if (group.size() > 1) {
            reasons.add("MIX_COMPATIBLE");
        }
        if (group.size() == 1 && !interactionWarnings.isEmpty()) {
            reasons.add("CONFLICT_SEPARATED");
        }
        if (blocked) {
            reasons.add("WEATHER_BLOCKED");
        }
        if (reasons.isEmpty()) {
            reasons.add("DEFAULT_PRIORITY");
        }
        return reasons;
    }

    /**
     * Kiểm tra xem nhóm thuốc hiện tại có gặp cảnh báo hóa học cấp nhẹ không.
     * (Cảnh báo nhẹ = không cấm pha chung, nhưng cần cẩn thận).
     */
    private boolean hasGroupInteractions(
            List<TreatmentPlan> group,
            List<InteractionWarningDTO> interactionWarnings) {
        Set<Integer> ingredientIds = group.stream()
                .filter(plan -> plan.getIngredient() != null)
                .map(plan -> plan.getIngredient().getId())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return interactionWarnings.stream()
                .anyMatch(warning -> ingredientIds.contains(warning.getIngredientAId())
                        && ingredientIds.contains(warning.getIngredientBId()));
    }

    /**
     * Chuyển đổi một TreatmentPlan (thực thể DB) thành TreatmentDTO (đối tượng trả
     * về cho API).
     * Hàm này cũng sẽ gắn luôn cờ `weatherBlocked` nếu phác đồ này đang vi phạm
     * điều kiện thời tiết bắt buộc.
     */
    private TreatmentDTO toTreatmentDTO(
            TreatmentPlan plan,
            List<WeatherAlertDTO> weatherAlerts,
            boolean mergedProgram) {
        List<String> ingredients = new ArrayList<>();
        if (plan.getIngredient() != null) {
            ingredients.add(plan.getIngredient().getIngredientName());
        }

        boolean weatherBlocked = weatherAlerts.stream()
                .anyMatch(
                        alert -> Boolean.TRUE.equals(alert.getRequired()) && Boolean.TRUE.equals(alert.getViolated()));

        return TreatmentDTO.builder()
                .treatmentPlanId(plan.getId())
                .diseaseId(plan.getDisease() != null ? plan.getDisease().getId() : null)
                .diseaseName(plan.getDisease() != null ? plan.getDisease().getDiseaseName() : null)
                .treatmentName(plan.getTreatmentName())
                .ingredientId(plan.getIngredient() != null ? plan.getIngredient().getId() : null)
                .ingredientName(plan.getIngredient() != null ? plan.getIngredient().getIngredientName() : null)
                .ingredientDescription(plan.getIngredient() != null ? plan.getIngredient().getDescription() : null)
                .drugName(plan.getDrugName())
                .activeIngredients(ingredients)
                .dosage(plan.getDosage())
                .dosagePerHaValue(plan.getDosagePerHaValue())
                .dosagePerHaUnit(plan.getDosagePerHaUnit())
                .waterVolumePerHa(plan.getWaterVolumePerHa())
                .applicationMethod(plan.getApplicationMethod())
                .applicationTime(plan.getApplicationTime())
                .frequency(plan.getFrequency())
                .safetyNotes(plan.getSafetyNotes())
                .spraySchedule(mergedProgram ? "MERGED" : "SEPARATE")
                .required(Boolean.TRUE.equals(plan.getIsRequired()))
                .weatherBlocked(weatherBlocked)
                .weatherWarnings(List.of())
                .build();
    }

    /**
     * Tính toán ra một "Chiến lược tổng thể" (Strategy) đại diện cho toàn bộ chẩn
     * đoán này.
     * Ví dụ:
     * - NO_TREATMENT: Không có phác đồ nào.
     * - SINGLE_DISEASE_OR_SAFE_MIX: Chỉ 1 đợt phun (có thể cho 1 hoặc nhiều bệnh
     * nhưng hợp nhau).
     * - MIX_WITH_WARNING: Phun chung 1 đợt nhưng có cảnh báo nhẹ (thường do người
     * dùng ép pha chung mặc dù có tương tác).
     * - SEPARATE_SPRAY: Đã tách thành nhiều đợt phun khác nhau do xung đột hóa học
     * nặng.
     */
    private String deriveStrategy(List<TreatmentProgramDTO> programs, List<InteractionWarningDTO> interactionWarnings) {
        if (programs.isEmpty()) {
            return "NO_TREATMENT";
        }
        if (programs.size() == 1 && interactionWarnings.isEmpty()) {
            return "SINGLE_DISEASE_OR_SAFE_MIX";
        }
        if (programs.size() == 1) {
            return "MIX_WITH_WARNING";
        }
        return "SEPARATE_SPRAY";
    }

    private Double getWeatherValue(WeatherDTO weather, WeatherFactor factor) {
        if (weather == null || factor == null) {
            return null;
        }
        return switch (factor) {
            case TEMPERATURE -> weather.getTemperature();
            case HUMIDITY -> weather.getHumidity();
            case RAINFALL -> weather.getRainfall();
            case WIND_SPEED -> null;
        };
    }

    // Kiểm tra điều kiện thời tiết chặn
    private boolean isConditionViolated(TreatmentWeatherCondition condition, Double actualValue) {
        BigDecimal actual = BigDecimal.valueOf(actualValue);
        Operator operator = condition.getOperator();
        if (operator == null) {
            return false;
        }

        // DB User thường lưu giá trị ngưỡng ở cột min_value cho cả LESS_THAN,
        // GREATER_THAN và EQUALS.
        BigDecimal threshold = condition.getMinValue() != null ? condition.getMinValue() : condition.getMaxValue();

        return switch (operator) {
            // Yêu cầu LỚN HƠN threshold -> Vi phạm nếu THẤP HƠN HOẶC BẰNG
            case GREATER_THAN -> threshold != null && actual.compareTo(threshold) <= 0;
            // Yêu cầu NHỎ HƠN threshold -> Vi phạm nếu LỚN HƠN HOẶC BẰNG
            case LESS_THAN -> threshold != null && actual.compareTo(threshold) >= 0;
            // Yêu cầu NẰM GIỮA min và max -> Vi phạm nếu NẰM NGOÀI
            case BETWEEN -> (condition.getMinValue() != null && actual.compareTo(condition.getMinValue()) < 0)
                    || (condition.getMaxValue() != null && actual.compareTo(condition.getMaxValue()) > 0);
            // Yêu cầu BẰNG threshold -> Vi phạm nếu KHÁC
            case EQUALS -> threshold != null && actual.compareTo(threshold) != 0;
        };
    }

    // Chuyển đổi BigDecimal sang Double
    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }

    // Kết quả của RuleEngineService
    public record RuleEngineResult(
            List<TreatmentDTO> treatments,
            List<String> warnings,
            List<TreatmentProgramDTO> sprayPrograms,
            List<InteractionWarningDTO> interactionWarnings,
            List<WeatherAlertDTO> weatherAlerts,
            String strategy) {
        static RuleEngineResult empty() {
            return new RuleEngineResult(List.of(), List.of(), List.of(), List.of(), List.of(), "NO_TREATMENT");
        }
    }
}
