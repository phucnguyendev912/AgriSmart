package com.phucnguyen.agriai.module.chat.service;
import com.phucnguyen.agriai.module.diagnose.entity.Disease;

import com.phucnguyen.agriai.module.chat.enums.ChatQueryMode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ChatQueryModeClassifierTest {

    private ChatQueryModeClassifier classifier;

    @BeforeEach
    void setUp() {
        classifier = new ChatQueryModeClassifier();
    }

    // --- KNOWLEDGE_QUERY cases ---

    @Test
    @DisplayName("'triệu chứng' keyword → KNOWLEDGE_QUERY")
    void symptomKeywordReturnsKnowledge() {
        assertEquals(ChatQueryMode.KNOWLEDGE_QUERY,
                classifier.classify("Bệnh đốm nâu có triệu chứng như nào?"));
    }

    @Test
    @DisplayName("'là gì' keyword → KNOWLEDGE_QUERY")
    void isWhatKeywordReturnsKnowledge() {
        assertEquals(ChatQueryMode.KNOWLEDGE_QUERY,
                classifier.classify("Bệnh đốm nâu là gì?"));
    }

    @Test
    @DisplayName("'nguyên nhân' keyword → KNOWLEDGE_QUERY")
    void causeKeywordReturnsKnowledge() {
        assertEquals(ChatQueryMode.KNOWLEDGE_QUERY,
                classifier.classify("Nguyên nhân gây bệnh đạo ôn là gì?"));
    }

    @Test
    @DisplayName("'phân biệt' keyword → KNOWLEDGE_QUERY")
    void distinguishKeywordReturnsKnowledge() {
        assertEquals(ChatQueryMode.KNOWLEDGE_QUERY,
                classifier.classify("Phân biệt bạc lá và cháy bìa lá như thế nào?"));
    }

    @Test
    @DisplayName("Disease name without ownership → KNOWLEDGE_QUERY (default)")
    void diseaseNameWithoutOwnershipReturnsKnowledge() {
        assertEquals(ChatQueryMode.KNOWLEDGE_QUERY,
                classifier.classify("Đạo ôn phun thuốc gì"));
    }

    // --- DIAGNOSIS_CASE cases ---

    @Test
    @DisplayName("'lúa tôi' keyword → DIAGNOSIS_CASE")
    void myRiceKeywordReturnsDiagnosis() {
        assertEquals(ChatQueryMode.DIAGNOSIS_CASE,
                classifier.classify("Lúa tôi có đốm nâu trên lá"));
    }

    @Test
    @DisplayName("'ruộng tôi' keyword → DIAGNOSIS_CASE")
    void myFieldKeywordReturnsDiagnosis() {
        assertEquals(ChatQueryMode.DIAGNOSIS_CASE,
                classifier.classify("Ruộng tôi không biết bị bệnh gì"));
    }

    @Test
    @DisplayName("'đang bị' keyword → DIAGNOSIS_CASE")
    void currentlyAffectedKeywordReturnsDiagnosis() {
        assertEquals(ChatQueryMode.DIAGNOSIS_CASE,
                classifier.classify("Lúa đang bị vàng lá, không biết sao"));
    }

    @Test
    @DisplayName("'lúa em' keyword → DIAGNOSIS_CASE")
    void myRiceInformalKeywordReturnsDiagnosis() {
        assertEquals(ChatQueryMode.DIAGNOSIS_CASE,
                classifier.classify("Lúa em xuất hiện đốm đen trên bẹ"));
    }

    @Test
    @DisplayName("'có vết' keyword → DIAGNOSIS_CASE")
    void hasMarkKeywordReturnsDiagnosis() {
        assertEquals(ChatQueryMode.DIAGNOSIS_CASE,
                classifier.classify("Cây lúa có vết nâu trên thân"));
    }

    // --- Priority: KNOWLEDGE beats DIAGNOSIS when both present ---

    @Test
    @DisplayName("Both triggers present → KNOWLEDGE_QUERY wins (priority rule)")
    void knowledgeTriggerWinsOverDiagnosis() {
        // "lúa tôi" = DIAGNOSIS, "triệu chứng" = KNOWLEDGE → KNOWLEDGE wins
        assertEquals(ChatQueryMode.KNOWLEDGE_QUERY,
                classifier.classify("Lúa tôi bị bệnh gì, triệu chứng đốm nâu là nào?"));
    }

    // --- Default fallback ---

    @Test
    @DisplayName("Ambiguous query without triggers → KNOWLEDGE_QUERY default")
    void ambiguousQueryReturnsKnowledgeDefault() {
        assertEquals(ChatQueryMode.KNOWLEDGE_QUERY,
                classifier.classify("đốm nâu trên lúa"));
    }
}
