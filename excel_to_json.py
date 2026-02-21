import pandas as pd
import json
import os

file_path = 'SET UP (1).xlsx'
output_dir = 'backend/src/main/resources'
output_file = os.path.join(output_dir, 'questions_seed.json')

def parse_excel():
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    xls = pd.ExcelFile(file_path)
    questions = []
    
    # Process Sheet 1
    try:
        df = pd.read_excel(xls, sheet_name='NGUỒN DỮ LIỆU VÀO')
        current_section = "Thông tin chung"
        
        for index, row in df.iterrows():
            if index < 3: continue
            
            # Heuristics for Section
            col0 = str(row.iloc[0]) if not pd.isna(row.iloc[0]) else ""
            col1 = str(row.iloc[1]) if not pd.isna(row.iloc[1]) else ""
            col2 = str(row.iloc[2]) if not pd.isna(row.iloc[2]) else ""
            
            if len(col0) > 5 and len(col2) == 0:
                current_section = col0.strip()
                continue
            
            # Question Data
            code = str(row.iloc[2]) if not pd.isna(row.iloc[2]) else ""
            text = str(row.iloc[3]) if not pd.isna(row.iloc[3]) else ""
            inputType = str(row.iloc[4]) if not pd.isna(row.iloc[4]) else ""
            
            if code and text and len(code) < 20:
                # Map input type to Enum
                q_type = "TEXT"
                if "lựa chọn" in inputType.lower():
                    q_type = "SINGLE_CHOICE"
                elif "số" in inputType.lower() or "tuổi" in text.lower():
                    q_type = "NUMBER"
                
                questions.append({
                    "section": current_section,
                    "code": code,
                    "text": text,
                    "type": q_type,
                    "originalType": inputType
                })
    except Exception as e:
        print(f"Error sheet 1: {e}")

    # Write JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(questions)} questions to {output_file}")

if __name__ == "__main__":
    parse_excel()
