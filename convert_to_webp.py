"""
Optimizador de assets para Matilde Agency - Versión WebP
- Convierte PNGs a WebP para máxima compresión
- Preserva transparencia
- Genera reporte de ahorro
"""

from PIL import Image
import os, shutil

BASE_DIR = '.'
BACKUP_DIR = os.path.join(BASE_DIR, '_originals_backup')
os.makedirs(BACKUP_DIR, exist_ok=True)

# Configuración de calidad por tipo de archivo
SETTINGS = {
    'logo':     (600,  600,  85),   # Logo: máx 600px
    'avatar':   (400,  400,  80),   # Avatares: 400px
    'cliente':  (1200, 800,  75),   # Clientes: máx 1200px
    'personaje':(800,  1200, 80),   # IA persona
    'default':  (1200, 1200, 80),
}

def get_setting(filename):
    f = filename.lower()
    if 'logo' in f:          return SETTINGS['logo']
    if 'avatar' in f:        return SETTINGS['avatar']
    if 'clientes' in f:      return SETTINGS['cliente']
    if 'personaje' in f or 'matilde-h' in f or 'eyelash' in f: return SETTINGS['personaje']
    return SETTINGS['default']

files_to_process = [
    'logo.png',
    'logo-matilde.png',
    'PERSONAJE IA.png',
    'matilde-hablando.png',
    'matilde-eyelashes.png',
    'clientes-aliados-1.png',
    'clientes-aliados-2.png',
    'clientes-aliados-3.png',
    'clientes-aliados-branding-agency.png',
    'clientes-aliados-lab-tech.png',
    'clientes-aliados-produccion-medica.png',
    'avatares_caricatura/Alex_avatar.png',
    'avatares_caricatura/Jose_Luis_avatar.png',
    'avatares_caricatura/Maf_avatar.png',
    'avatares_caricatura/Mariel_avatar.png',
    'avatares_caricatura/Monse_avatar.png',
    'avatares_caricatura/Sckar_avatar.png',
    'avatares_caricatura/Tono_avatar.png',
]

total_before = 0
total_after  = 0

print(f"{'Archivo':<45} {'Antes':>10} {'WebP':>10} {'Ahorro':>8}")
print("-" * 78)

for rel_path in files_to_process:
    full_path = os.path.join(BASE_DIR, rel_path)
    if not os.path.exists(full_path):
        continue

    size_before = os.path.getsize(full_path)
    total_before += size_before

    max_w, max_h, quality = get_setting(rel_path)
    
    # Path for webp
    webp_path = os.path.splitext(full_path)[0] + '.webp'

    try:
        img = Image.open(full_path)
        if img.width > max_w or img.height > max_h:
            img.thumbnail((max_w, max_h), Image.LANCZOS)

        img.save(webp_path, 'WEBP', quality=quality, lossless=False)

        size_after = os.path.getsize(webp_path)
        total_after += size_after
        saving_pct = (1 - size_after / size_before) * 100

        name = os.path.basename(rel_path)[:44]
        print(f"  {name:<44} {size_before/1024:>8.0f}KB {size_after/1024:>8.0f}KB {saving_pct:>7.1f}%")

    except Exception as e:
        print(f"  [ERROR] {rel_path}: {e}")
        total_after += size_before

print("-" * 78)
print(f"  {'TOTAL':<44} {total_before/1024/1024:>7.2f}MB {total_after/1024/1024:>7.2f}MB {(1-total_after/total_before)*100:>7.1f}%")
print(f"\n  Ahorrado: {(total_before - total_after)/1024/1024:.2f} MB")
