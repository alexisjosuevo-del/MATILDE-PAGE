import zipfile, re

doc_path = 'Especificacion_Matilde.docx'

with zipfile.ZipFile(doc_path) as z:
    # Check font table
    try:
        with z.open('word/fontTable.xml') as f:
            content = f.read().decode('utf-8', errors='replace')
            fonts = re.findall(r'w:name="([^"]+)"', content)
            print('=== FUENTES EMBEBIDAS EN EL DOCUMENTO ===')
            for font in sorted(set(fonts)):
                print(' -', font)
    except Exception as e:
        print(f'Error fontTable: {e}')

    # Also check styles.xml for font references
    try:
        with z.open('word/styles.xml') as f:
            content = f.read().decode('utf-8', errors='replace')
            fonts2 = re.findall(r'w:name="([^"]+)"', content)
            print('\n=== FUENTES EN ESTILOS ===')
            for font in sorted(set(fonts2)):
                if any(kw in font.lower() for kw in ['font', 'syne', 'inter', 'lemon', 'outfit', 'raleway', 'montserrat', 'gilroy', 'heading', 'body', 'calibri', 'arial', 'times']):
                    print(' -', font)
    except Exception as e:
        print(f'Error styles: {e}')
