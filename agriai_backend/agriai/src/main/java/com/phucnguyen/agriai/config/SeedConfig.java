package com.phucnguyen.agriai.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SeedConfig {

    @Bean
    public CommandLineRunner seedDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("DELETE FROM treatment_plan");

                String sql1 = "INSERT INTO treatment_plan (disease_id, treatment_name, ingredient_id, drug_name, dosage, application_method, application_time, frequency, safety_notes, is_required, is_delete, created_at) "
                        +
                        "VALUES (7, 'Phác đồ điều trị Đạo ôn', 12, 'Beam 75WP', '20-30g / 20 lít nước', 'Phun sương đều mặt lá', 'Sáng sớm hoặc chiều mát', '7-10 ngày/lần', 'Cách ly 7 ngày trước thu hoạch. Phun khi vết bệnh chớm xuất hiện.', true, false, NOW())";
                jdbcTemplate.update(sql1);

                String sql2 = "INSERT INTO treatment_plan (disease_id, treatment_name, ingredient_id, drug_name, dosage, application_method, application_time, frequency, safety_notes, is_required, is_delete, created_at) "
                        +
                        "VALUES (5, 'Phác đồ điều trị Đốm nâu', 11, 'Tilt Super 300EC', '10-15ml / 16 lít nước', 'Phun khi bệnh chớm xuất hiện', 'Chiều mát', '10 ngày/lần', 'Bổ sung thêm phân Kali để tăng sức đề kháng.', true, false, NOW())";
                jdbcTemplate.update(sql2);

                String sql3 = "INSERT INTO treatment_plan (disease_id, treatment_name, ingredient_id, drug_name, dosage, application_method, application_time, frequency, safety_notes, is_required, is_delete, created_at) "
                        +
                        "VALUES (3, 'Phác đồ điều trị Bạc lá', 10, 'Xanthomix 20WP', '25g / 25 lít nước', 'Phun ướt đều tán lá', 'Sáng sớm', '5-7 ngày/lần', 'Ngừng bón đạm khi cây bị bệnh.', true, false, NOW())";
                jdbcTemplate.update(sql3);

                System.out.println("====== SUCCESS: Database seeded with UTF-8 characters! ======");
            } catch (Exception e) {
                System.err.println("Seed error: " + e.getMessage());
            }
        };
    }
}
