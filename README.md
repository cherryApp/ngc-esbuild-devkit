# Angular Native Builders with Esbuild

## Usage
1. Install package:
```powershell
npm i ngc-esbuild-devkit -D
```
2. Change builder settings in `angular.json`:
- For production:
```json
    "architect": {
        "build": {
          "builder": "ngc-esbuild-devkit:build",
          ...
        }
    }
```
- For development:
```json
    "architect": {
        "serve": {
          "builder": "ngc-esbuild-devkit:serve",
          ...
        }
    }
```
- For testing:
```json
    "architect": {
        "test": {
          "builder": "ngc-esbuild-devkit:test",
          ...
        }
    }
```
