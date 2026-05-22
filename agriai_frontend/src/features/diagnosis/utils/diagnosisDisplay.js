/**
 * Groups and builds structured treatment programs from spray scheduling or direct treatment options.
 * Falls back to default ranked priority if no explicit spray programs are defined.
 * 
 * @param {Array} sprayPrograms - Scheduling options computed from Backend.
 * @param {Array} treatments - Raw list of possible chemical/biological treatment products.
 * @returns {Array} Structured treatment program groups ready for rendering.
 */
export const buildTreatmentPrograms = (sprayPrograms = [], treatments = []) => {
    if (Array.isArray(sprayPrograms) && sprayPrograms.length > 0) {
        return sprayPrograms;
    }

    if (!Array.isArray(treatments) || treatments.length === 0) {
        return [];
    }

    const sortedTreatments = [...treatments].sort((a, b) => {
        const diseaseCompare = (a.diseaseName || '').localeCompare(b.diseaseName || '');
        if (diseaseCompare !== 0) return diseaseCompare;
        return (a.rank || 999) - (b.rank || 999);
    });

    const diseaseNames = [...new Set(sortedTreatments.map(t => t.diseaseName).filter(Boolean))];

    return [{
        programOrder: 1,
        programCode: 'RANKED_TREATMENTS',
        strategy: 'RANKED_TREATMENTS',
        status: 'READY',
        mixAllowed: true,
        diseaseNames,
        reasons: ['DEFAULT_PRIORITY'],
        treatments: sortedTreatments,
        intervalDays: null
    }];
};

/**
 * Builds cultivation measure recommendations based on diagnostic results,
 * interaction warnings, and weather risk parameters.
 * 
 * @param {Object} result - Full diagnosis result payload.
 * @returns {Array<string>} List of Vietnamese recommendation text lines.
 */
export const getCultivationMeasures = (result) => {
    if (!result) return [];

    const diagnosisType = result.diagnosisType;
    const treatments = result.treatments || [];
    const interactionWarnings = result.interactionWarnings || [];
    const diseaseWeatherRisks = result.diseaseWeatherRisks || [];

    if (diagnosisType === 'HEALTHY') {
        return ['Tiếp tục theo dõi lá và thân 2-3 ngày/lần, giữ ruộng thông thoáng.'];
    }

    if (diagnosisType === 'UNKNOWN') {
        return ['Không xác định được bệnh. Vui lòng thử lại với ảnh rõ hơn.'];
    }

    const measures = [];

    if (treatments.length > 0) {
        measures.push('Ưu tiên dùng phác đồ được đánh dấu khuyến nghị cho từng bệnh.');
    }

    if (interactionWarnings.length > 0) {
        measures.push('Kiểm tra cảnh báo tương tác hoạt chất trước khi pha hoặc phun chung.');
    }

    if (diseaseWeatherRisks.length > 0) {
        measures.push('Điều kiện thời tiết đang thuận lợi cho bệnh phát triển, cần theo dõi ruộng sát hơn.');
    }

    if (measures.length === 0) {
        measures.push('Theo dõi lại sau 3-5 ngày và chụp lại ảnh nếu triệu chứng lan rộng.');
    }

    return measures;
};
