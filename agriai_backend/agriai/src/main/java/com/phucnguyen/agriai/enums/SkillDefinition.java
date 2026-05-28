package com.phucnguyen.agriai.enums;

import java.nio.file.Path;

public enum SkillDefinition {

    DISEASE("01_nhan_dien_benh", "nhan-dien-benh-lua"),
    TREATMENT("02_phac_do_dieu_tri", "phac-do-dieu-tri-lua"),
    CONFLICT("03_xung_dot_thuoc", "xung-dot-thuoc-lua"),
    CULTIVATION("04_ky_thuat_canh_tac", "ky-thuat-canh-tac-lua");

    private static final String SKILL_FILENAME = "SKILL.md";

    private final String folderName;
    private final String skillName;

    SkillDefinition(String folderName, String skillName) {
        this.folderName = folderName;
        this.skillName = skillName;
    }

    public String getFolderName() {
        return folderName;
    }

    public String getSkillName() {
        return skillName;
    }

    // resolve full path: basePath/folderName/SKILL.md
    public Path getFilePath(String basePath) {
        return Path.of(basePath, folderName, SKILL_FILENAME);
    }
}
