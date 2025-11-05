#!/usr/bin/env python3
"""
Script para subir archivos de Cabo Health a GitHub
Utiliza las herramientas MCP de GitHub disponibles
"""

import os
import json
from pathlib import Path

def get_files_to_upload():
    """Obtiene la lista de archivos a subir, excluyendo directorios excluidos"""
    exclude_dirs = ['node_modules', 'dist', '.git', '__pycache__', '.vite-temp']
    
    files_to_upload = []
    cabo_health_path = Path('/workspace/cabo-health')
    
    for file_path in cabo_health_path.rglob('*'):
        if file_path.is_file():
            # Verificar si está en directorio excluido
            if any(exclude_dir in file_path.parts for exclude_dir in exclude_dirs):
                continue
            
            # Calcular ruta relativa desde el directorio del proyecto
            relative_path = file_path.relative_to(cabo_health_path)
            files_to_upload.append({
                'path': str(relative_path),
                'abs_path': str(file_path),
                'size': file_path.stat().st_size
            })
    
    return sorted(files_to_upload, key=lambda x: x['path'])

def generate_upload_summary():
    """Genera resumen de archivos a subir"""
    files = get_files_to_upload()
    
    print("=" * 80)
    print("🏥 CABO HEALTH - RESUMEN DE ARCHIVOS PARA GITHUB")
    print("=" * 80)
    print(f"Total de archivos: {len(files)}")
    print(f"Tamaño total: {sum(f['size'] for f in files):,} bytes")
    print("=" * 80)
    
    print("\n📁 ARCHIVOS PRINCIPALES:")
    main_files = [
        'README.md', 'package.json', 'LICENSE', '.gitignore', 
        '.env.example', 'tsconfig.json', 'vite.config.ts',
        'tailwind.config.js', 'index.html'
    ]
    
    for main_file in main_files:
        file_info = next((f for f in files if f['path'] == main_file), None)
        if file_info:
            print(f"✅ {main_file} ({file_info['size']:,} bytes)")
        else:
            print(f"❌ {main_file} (NO ENCONTRADO)")
    
    print(f"\n📂 ESTRUCTURA DE DIRECTORIOS:")
    dirs = set()
    for f in files:
        dir_name = os.path.dirname(f['path'])
        if dir_name:
            dirs.add(dir_name)
    
    for dir_name in sorted(dirs):
        file_count = len([f for f in files if os.path.dirname(f['path']) == dir_name])
        print(f"📁 {dir_name}/ ({file_count} archivos)")
    
    print(f"\n🔧 PARA SUBIR A GITHUB:")
    print("1. Crear repositorio en GitHub.com")
    print("2. Usar las herramientas MCP de GitHub para subir archivos")
    print("3. Empezar con archivos principales y luego subdirectorios")
    
    return files

if __name__ == "__main__":
    files = generate_upload_summary()
    
    # Guardar lista detallada para referencia
    with open('/workspace/docs/github-files-list.json', 'w', encoding='utf-8') as f:
        json.dump(files, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Lista detallada guardada en: /workspace/docs/github-files-list.json")
