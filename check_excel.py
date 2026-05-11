import pandas as pd
import sys

def check_excel(file_path, out_file):
    out_file.write(f"--- Analyzing {file_path} ---\n")
    try:
        df = pd.read_excel(file_path)
        out_file.write("Columns:\n")
        for col in df.columns:
            out_file.write(f"  - {col}\n")
        
        out_file.write(f"\nShape: {df.shape}\n")
        
        null_counts = df.isnull().sum()
        out_file.write("\nNull counts:\n")
        out_file.write(str(null_counts[null_counts > 0]) + "\n")
        
        if null_counts.sum() > 0:
            out_file.write("\nSample rows with nulls:\n")
            null_rows = df[df.isnull().any(axis=1)]
            out_file.write(null_rows.head(10).to_string() + "\n")
        else:
            out_file.write("\nNo nulls found!\n")
            
        out_file.write("\nSample data:\n")
        out_file.write(df.head().to_string() + "\n")
        
    except Exception as e:
        out_file.write(f"Error reading {file_path}: {e}\n")

if __name__ == "__main__":
    file1 = r"C:\Users\nguye\Downloads\rice-disease-treatment-seed-report-v8.1-scoped.xlsx"
    file2 = r"C:\Users\nguye\Downloads\rice-disease-treatment-seed-v8.1-demo-clean.xlsx"
    
    with open("excel_info.txt", "w", encoding="utf-8") as f:
        check_excel(file1, f)
        f.write("\n" + "="*50 + "\n")
        check_excel(file2, f)
