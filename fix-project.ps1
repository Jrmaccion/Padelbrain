# fix-project.ps1 - Arregla configuración y dependencias

$ErrorActionPreference = "Stop"

Write-Host "🔧 Arreglando configuración del proyecto..." -ForegroundColor Cyan

# 1. Actualizar tsconfig.json
Write-Host "`n📝 Actualizando tsconfig.json..." -ForegroundColor Yellow
@"
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-native",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
"@ | Out-File -FilePath "tsconfig.json" -Encoding utf8 -Force

# 2. Actualizar package.json con todas las dependencias
Write-Host "📦 Actualizando package.json..." -ForegroundColor Yellow
@"
{
  "name": "padelbrain",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.4",
    "@react-native-async-storage/async-storage": "1.21.0",
    "react-native-get-random-values": "^1.11.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "@types/react-native": "~0.73.0",
    "@types/uuid": "^9.0.7",
    "babel-plugin-module-resolver": "^5.0.0",
    "typescript": "^5.3.0"
  },
  "private": true
}
"@ | Out-File -FilePath "package.json" -Encoding utf8 -Force

# 3. Limpiar y reinstalar
Write-Host "`n🗑️  Limpiando node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force
}
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force
}

Write-Host "📥 Instalando dependencias..." -ForegroundColor Yellow
npm install

Write-Host "`n✅ Configuración arreglada!" -ForegroundColor Green
Write-Host "`n🚀 Para iniciar la app, ejecuta: npm start" -ForegroundColor Cyan