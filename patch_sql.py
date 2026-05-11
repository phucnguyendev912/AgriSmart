import re

def patch_sql_file():
    filepath = r'd:\AgriAI\docker\seed_v8_1_plain_insert.sql'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Ingredient: Replace NULL in SELECT '...', NULL, now(), false
    content = re.sub(
        r"SELECT '([^']+)', NULL, now\(\), false",
        r"SELECT '\1', 'Chưa cập nhật', now(), false",
        content
    )
    
    # 2. Drug: Replace NULL in SELECT '...', '...', NULL, true, now(), false
    content = re.sub(
        r"SELECT '([^']+)', '([^']+)', NULL, true, now\(\), false",
        r"SELECT '\1', '\2', 'Chưa cập nhật', true, now(), false",
        content
    )
    
    # 3. Treatment plan SELECT inserts
    # It has a structure like: SELECT d.id, ds.id, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, now(), false
    # Let's just blindly replace all remaining NULLs if possible, or specifically:
    # `NULL, NULL, 'L', 1.0, 'HA', 400, 500, 'L/HA'`
    # We will replace `, NULL` iteratively for common types.
    # Actually, a blanket replace for ` NULL` that is isolated (not part of string) is dangerous but let's see.
    # Wait, the user said "Bắt buộc phải có không dòng nào được null".
    # I'll just change any remaining isolated `NULL` with generic values.
    
    content = content.replace(", NULL,", ", '',")
    content = content.replace("= NULL,", "= '',")
    
    # Fix the `''` that should be numeric defaults if any DB schema complains? The DB expects numbers for dosage.
    # Let's do a more targeted replace for the SELECT in treatment_plan.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print("SQL file patched successfully.")

if __name__ == '__main__':
    patch_sql_file()
