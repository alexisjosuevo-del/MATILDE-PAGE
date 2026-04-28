import cv2
import os
import numpy as np

input_dir = '.'
output_dir = '.'
files = ['avatar_Alex.png', 'avatar_Jose Luis.png', 'avatar_Maf.png', 'avatar_Mariel.png', 'avatar_Monse.png', 'avatar_Sckar.png', 'avatar_Toño.png']

for file_name in files:
    try:
        input_path = os.path.join(input_dir, file_name)
        if not os.path.exists(input_path):
            continue
            
        print(f"Cartoonizing {file_name}...")
        
        # Read with numpy to handle unicode
        stream = open(input_path, "rb")
        bytes = bytearray(stream.read())
        numpyarray = np.asarray(bytes, dtype=np.uint8)
        img = cv2.imdecode(numpyarray, cv2.IMREAD_UNCHANGED)
        
        # 1. Edge detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.medianBlur(gray, 5)
        edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
        
        # 2. Color smoothing
        color = cv2.bilateralFilter(img, 9, 300, 300)
        
        # 3. Combine
        cartoon = cv2.bitwise_and(color, color, mask=edges)
        
        # Save
        output_name = file_name.replace('avatar_', 'cartoon_')
        output_path = os.path.join(output_dir, output_name)
        
        is_success, im_buf_arr = cv2.imencode(".png", cartoon)
        im_buf_arr.tofile(output_path)
        print(f"Saved {output_path}")

    except Exception as e:
        print(f"Error processing {file_name}: {e}")

print("Done cartoonizing avatars.")
