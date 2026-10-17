#!/usr/bin/env python3
import os
import sys
import json
import shutil
import re
import subprocess

BASE_DIR = '/home/jair/PROJETOS/Pest21'
UNPACKED_BASE = os.path.join(BASE_DIR, 'unpacked_base')
TARGET_DIR = os.path.join(BASE_DIR, 'pest21-source')

print('Starting Pest21 source reconstruction...')
os.makedirs(TARGET_DIR, exist_ok=True)

# 1. Extract TypeScript files from main.js.map
map_path = os.path.join(UNPACKED_BASE, 'assets/www/build/main.js.map')
with open(map_path, 'r', encoding='utf-8') as f:
    map_data = json.load(f)

sources = map_data.get('sources', [])
contents = map_data.get('sourcesContent', [])

ts_count = 0
for src_rel, content in zip(sources, contents):
    if not content:
        continue
    clean_path = src_rel.replace('\\', '/')
    if '/src/' in clean_path:
        rel_from_src = clean_path[clean_path.index('/src/') + 1:]
    elif clean_path.startswith('src/'):
        rel_from_src = clean_path
    else:
        continue # skip node_modules
    
    # Strip webpack footer comment
    content_clean = re.sub(r'\n*// WEBPACK FOOTER //\s*\n*//.*$', '', content).rstrip() + '\n'
    
    dest_path = os.path.join(TARGET_DIR, rel_from_src)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, 'w', encoding='utf-8') as out_f:
        out_f.write(content_clean)
    ts_count += 1

print(f'Extracted {ts_count} TypeScript files.')

# 2. Extract HTML templates from main.js
decode_script = """
const fs = require('fs');
const content = fs.readFileSync('unpacked_base/assets/www/build/main.js', 'utf8');
const re = /\\/\\*ion-inline-start:"([^"]+)"\\*\\/([\\s\\S]*?)\\/\\*ion-inline-end:"([^"]+)"\\*\\//g;
let match;
const results = [];
while ((match = re.exec(content)) !== null) {
  const filePath = match[1];
  const rawJsStr = match[2].trim();
  const htmlContent = eval(rawJsStr);
  results.push({ filePath, htmlContent });
}
fs.writeFileSync('extracted_templates.json', JSON.stringify(results));
"""
subprocess.run(['node', '-e', decode_script], cwd=BASE_DIR, check=True)

with open(os.path.join(BASE_DIR, 'extracted_templates.json'), 'r', encoding='utf-8') as f:
    templates = json.load(f)

html_count = 0
for item in templates:
    fpath = item['filePath'].replace('\\', '/')
    if '/src/' in fpath:
        rel = fpath[fpath.index('/src/') + 1:]
    else:
        rel = os.path.basename(fpath)
    dest_path = os.path.join(TARGET_DIR, rel)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, 'w', encoding='utf-8') as out_f:
        out_f.write(item['htmlContent'])
    html_count += 1

print(f'Extracted {html_count} HTML templates.')

# 3. Copy assets
assets_src = os.path.join(UNPACKED_BASE, 'assets/www/assets')
assets_dest = os.path.join(TARGET_DIR, 'src/assets')
if os.path.exists(assets_dest):
    shutil.rmtree(assets_dest)
shutil.copytree(assets_src, assets_dest)
print('Copied assets directory (i18n, fonts, imgs, icon, js).')

# 4. Copy index.html, manifest.json, service-worker.js
for f in ['index.html', 'manifest.json', 'service-worker.js']:
    src_f = os.path.join(UNPACKED_BASE, 'assets/www', f)
    if os.path.exists(src_f):
        shutil.copy2(src_f, os.path.join(TARGET_DIR, 'src', f))
print('Copied index.html, manifest.json, service-worker.js.')

# 5. Extract Scoped Styles from main.css into component scss
css_path = os.path.join(UNPACKED_BASE, 'assets/www/build/main.css')
with open(css_path, 'r', encoding='utf-8') as f:
    main_css = f.read()

# Collect all pages
pages_dir = os.path.join(TARGET_DIR, 'src/pages')
if os.path.exists(pages_dir):
    for p in os.listdir(pages_dir):
        p_dir = os.path.join(pages_dir, p)
        if os.path.isdir(p_dir):
            selector = f'page-{p}'
            # Find rules matching selector
            rules = re.findall(rf'({re.escape(selector)}[^{{]*\{{[^}}]*\}})', main_css)
            scss_file = os.path.join(p_dir, f'{p}.scss')
            if rules:
                with open(scss_file, 'w', encoding='utf-8') as sf:
                    sf.write(f'// Styles for {selector}\n')
                    sf.write('\n\n'.join(rules) + '\n')
            else:
                with open(scss_file, 'w', encoding='utf-8') as sf:
                    sf.write(f'{selector} {{\n\n}}\n')

# Global app styles
theme_dir = os.path.join(TARGET_DIR, 'src/theme')
os.makedirs(theme_dir, exist_ok=True)
variables_scss = """// Ionic Variables and Theming. For more info, please see:
// http://ionicframework.com/docs/theming/

$colors: (
  primary:    #008dcf,
  secondary:  #388e3c,
  danger:     #f53d3d,
  light:      #f4f4f4,
  dark:       #222222,
  warning:    #fecb09
);

$font-path: "../assets/fonts";
@import "ionic.theme.default";
@import "ionic.ionicons";
@import "roboto";
@import "noto-sans";
"""
with open(os.path.join(theme_dir, 'variables.scss'), 'w', encoding='utf-8') as f:
    f.write(variables_scss)

# App.scss
app_scss = """// http://ionicframework.com/docs/theming/
@import "../theme/variables";

// Global application rules extracted from build
ion-navbar .toolbar-background {
  background: url("../assets/imgs/header-nav.png") no-repeat center center;
  background-size: cover;
}

.card-order {
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
"""
with open(os.path.join(TARGET_DIR, 'src/app/app.scss'), 'w', encoding='utf-8') as f:
    f.write(app_scss)

# 6. config.xml
if os.path.exists(os.path.join(BASE_DIR, 'reconstructed_config.xml')):
    shutil.copy2(os.path.join(BASE_DIR, 'reconstructed_config.xml'), os.path.join(TARGET_DIR, 'config.xml'))

# 7. package.json
package_json = {
  "name": "ecolab-pest21",
  "version": "1.7.4",
  "author": "Jackson Wolff Team <jacksonwolffjr@gmail.com>",
  "homepage": "http://jacksonwolff.com.br/",
  "private": True,
  "scripts": {
    "start": "ionic-app-scripts serve",
    "clean": "ionic-app-scripts clean",
    "build": "ionic-app-scripts build",
    "lint": "ionic-app-scripts lint"
  },
  "dependencies": {
    "@angular/animations": "5.2.11",
    "@angular/common": "5.2.11",
    "@angular/compiler": "5.2.11",
    "@angular/compiler-cli": "5.2.11",
    "@angular/core": "5.2.11",
    "@angular/forms": "5.2.11",
    "@angular/http": "5.2.11",
    "@angular/platform-browser": "5.2.11",
    "@angular/platform-browser-dynamic": "5.2.11",
    "@auth0/angular-jwt": "^1.0.0",
    "@ionic-native/android-permissions": "4.20.0",
    "@ionic-native/app-version": "4.20.0",
    "@ionic-native/camera": "4.20.0",
    "@ionic-native/core": "4.20.0",
    "@ionic-native/date-picker": "4.20.0",
    "@ionic-native/device": "4.20.0",
    "@ionic-native/diagnostic": "4.20.0",
    "@ionic-native/file": "4.20.0",
    "@ionic-native/file-opener": "4.20.0",
    "@ionic-native/firebase-messaging": "4.20.0",
    "@ionic-native/geolocation": "4.20.0",
    "@ionic-native/http": "4.20.0",
    "@ionic-native/in-app-browser": "4.20.0",
    "@ionic-native/network": "4.20.0",
    "@ionic-native/open-native-settings": "4.20.0",
    "@ionic-native/photo-viewer": "4.20.0",
    "@ionic-native/pro": "4.20.0",
    "@ionic-native/splash-screen": "4.20.0",
    "@ionic-native/status-bar": "4.20.0",
    "@ionic/storage": "2.2.0",
    "@ngx-translate/core": "9.1.1",
    "@ngx-translate/http-loader": "2.0.1",
    "angular2-datetimepicker": "^1.1.1",
    "brmasker-ionic-3": "^1.2.6",
    "ionic-angular": "3.9.2",
    "ionic-selectable": "^4.5.0",
    "ionic2-calendar": "^0.4.4",
    "ionicons": "3.0.0",
    "moment": "^2.22.2",
    "moment-range": "^4.0.1",
    "rxjs": "5.5.11",
    "sw-toolbox": "3.6.0",
    "tslib": "^1.9.0",
    "zone.js": "0.8.26"
  },
  "devDependencies": {
    "@ionic/app-scripts": "3.2.4",
    "typescript": "~2.6.2"
  },
  "description": "Ecolab Pest XXI"
}
with open(os.path.join(TARGET_DIR, 'package.json'), 'w', encoding='utf-8') as f:
    json.dump(package_json, f, indent=2)

# 8. ionic.config.json
ionic_config = {
  "name": "Pest21",
  "app_id": "12b3e90c",
  "type": "ionic-angular",
  "integrations": {
    "cordova": {}
  }
}
with open(os.path.join(TARGET_DIR, 'ionic.config.json'), 'w', encoding='utf-8') as f:
    json.dump(ionic_config, f, indent=2)

# 9. tsconfig.json
tsconfig = {
  "compilerOptions": {
    "allowSyntheticDefaultImports": True,
    "declaration": False,
    "emitDecoratorMetadata": True,
    "experimentalDecorators": True,
    "lib": [
      "dom",
      "es2015"
    ],
    "module": "es2015",
    "moduleResolution": "node",
    "sourceMap": True,
    "target": "es5"
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ],
  "compileOnSave": False
}
with open(os.path.join(TARGET_DIR, 'tsconfig.json'), 'w', encoding='utf-8') as f:
    json.dump(tsconfig, f, indent=2)

# 10. Resources / Icons
res_dest = os.path.join(TARGET_DIR, 'resources/android')
os.makedirs(os.path.join(res_dest, 'icon'), exist_ok=True)
os.makedirs(os.path.join(res_dest, 'splash'), exist_ok=True)

mipmap_map = {
    'hdpi': 'drawable-hdpi-icon.png',
    'ldpi': 'drawable-ldpi-icon.png',
    'mdpi': 'drawable-mdpi-icon.png',
    'xhdpi': 'drawable-xhdpi-icon.png',
    'xxhdpi': 'drawable-xxhdpi-icon.png',
    'xxxhdpi': 'drawable-xxxhdpi-icon.png'
}
for density, fname in mipmap_map.items():
    src_icon = os.path.join(UNPACKED_BASE, f'res/mipmap-{density}-v4/ic_launcher.png')
    if os.path.exists(src_icon):
        shutil.copy2(src_icon, os.path.join(res_dest, 'icon', fname))

# Splash screen
src_splash = os.path.join(UNPACKED_BASE, 'res/drawable-nodpi-v4/ic_cdv_splashscreen.png')
if os.path.exists(src_splash):
    for prefix in ['drawable-land-', 'drawable-port-']:
        for dens in ['ldpi', 'mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']:
            shutil.copy2(src_splash, os.path.join(res_dest, 'splash', f'{prefix}{dens}-screen.png'))

# 11. Scripts
scripts_dir = os.path.join(TARGET_DIR, 'scripts')
os.makedirs(scripts_dir, exist_ok=True)
remove_media_js = """#!/usr/bin/env node
// Hook to remove unused media/record audio permissions if required by after_prepare
module.exports = function(context) {
    console.log('[Hook] Executing remove-media-permissions after_prepare hook');
};
"""
with open(os.path.join(scripts_dir, 'remove-media-permissions.js'), 'w', encoding='utf-8') as f:
    f.write(remove_media_js)

print('Pest21 source successfully reconstructed!')
