import os
from PIL import Image

input_dir = '.'
output_dir = '.'
files = ['Alex.png', 'Jose Luis.png', 'Maf.png', 'Mariel.png', 'Monse.png', 'Sckar.png', 'Toño.png']

for file_name in files:
    try:
        if not os.path.exists(file_name):
            continue
        
        img = Image.open(os.path.join(input_dir, file_name)).convert("RGB")
        w, h = img.size
        
        # Crop a square from the top-center
        crop_size = min(w, h)
        left = (w - crop_size) // 2
        top = int(h * 0.05) # Start 5% from top
        if top + crop_size > h:
            top = h - crop_size
        
        right = left + crop_size
        bottom = top + crop_size
        
        cropped_img = img.crop((left, top, right, bottom))
        
        # Resize to 400x400 for consistency
        cropped_img = cropped_img.resize((400, 400), Image.Resampling.LANCZOS)
        
        output_path = os.path.join(output_dir, f"avatar_{file_name}")
        cropped_img.save(output_path)
        print(f"Saved {output_path}")

    except Exception as e:
        print(f"Error processing {file_name}: {e}")
