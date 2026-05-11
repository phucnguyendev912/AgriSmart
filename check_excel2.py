import pandas as pd
import sys

def check_excel_all_sheets(file_path, out_file):
    out_file.write(f"--- Analyzing {file_path} ---\n")
    try:
        xls = pd.ExcelFile(file_path)
        sheet_names = xls.sheet_names
        out_file.write(f"Sheets: {sheet_names}\n\n")
        
        for sheet in sheet_names:
            out_file.write(f"=== Sheet: {sheet} ===\n")
            df = pd.read_excel(xls, sheet_name=sheet)
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
                out_file.write(null_rows.head(20).to_string() + "\n")
            else:
                out_file.write("\nNo nulls found!\n")
                
            out_file.write("\nData preview:\n")
            out_file.write(df.head(15).to_string() + "\n")
            out_file.write("-" * 50 + "\n\n")
        
    except Exception as e:
        out_file.write(f"Error reading {file_path}: {e}\n")

if __name__ == "__main__":
    file2 = r"C:\Users\nguye\Downloads\rice-disease-treatment-seed-v8.1-demo-clean.xlsx"
    
    with open("excel_all_sheets.txt", "w", encoding="utf-8") as f:
        check_excel_all_sheets(file2, f)
