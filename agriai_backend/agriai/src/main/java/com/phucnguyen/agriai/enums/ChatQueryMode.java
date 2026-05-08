package com.phucnguyen.agriai.enums;

// distinguishes knowledge questions from real-field diagnosis cases
public enum ChatQueryMode {

    // user asks about disease knowledge: symptoms, causes, characteristics, definitions
    KNOWLEDGE_QUERY,

    // user describes their actual crop/field with a problem they need diagnosed
    DIAGNOSIS_CASE
}
