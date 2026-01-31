# Build Configuration Guide

## Overview

This document describes the production build configuration for the Voice Intelligence Desktop App, including optimizations, bundle analysis, and deployment preparation.

## Build Commands

### Development Build
```bash
npm run dev              # Start development server
npm run tauri:dev        # Run desktop app in development mode
```

### Production Build
```bash
npm run build            # Standard production build
npm run build:prod       # Production build with NODE_ENV=production
npm run tauri:build      # Build desktop application
```

### Analysis & Debugging
```bash
npm run build:analyze    # Build with bundle analysis
npm run tauri:build:debug # Build desktop app in debug mode
```

### Maintenance
```bash
npm run clean            # Clean build artifacts
npm run clean:all        # Clean everything including node_modules
npm run prebuild         # Runs automatically before build
npm run postbuild        # Runs automatically after build (bundle analysis)
```

## Build Optimizations

### 1. Next.js Configuration

The `next.config.ts` includes several production optimizations:

#### React Strict Mode
- Enabled for better development warnings
- Helps identify potential problems in the application

#### SWC Minification
- Uses the faster SWC compiler for minification
- Significantly faster than Terser

#### Console Removal
- Removes `console.log` statements in production
- Keeps `console.error` and `console.warn` for debugging

#### Package Import Optimization
- Optimizes imports from `@tauri-apps/api` and `@tauri-apps/plugin-global-shortcut`
- Reduces bundle size by tree-shaking unused code

### 2. Code Splitting

Webpack is configured with intelligent code splitting:

#### Vendor Chunk
- Separates all `node_modules` into a vendor bundle
- Improves caching as vendor code changes less frequently

#### Common Chunk
- Extracts code shared between multiple pages
- Minimum 2 chunks required for extraction

#### Tauri Chunk
- Isolates Tauri-specific code
- Highest priority to ensure proper loading order

### 3. CSS Optimization

PostCSS configuration includes:

#### Production Mode
- **cssnano**: Minifies CSS output
- Removes comments and whitespace
- Optimizes CSS rules

#### Development Mode
- No minification for faster builds
- Preserves source maps for debugging

### 4. Asset Optimization

#### Images
- Unoptimized for static export (required for Tauri)
- Consider optimizing images manually before adding to project

#### Static Export
- Generates static HTML/CSS/JS files
- No server-side rendering (SSR) for desktop app

## Bundle Analysis

### Automatic Analysis

After each production build, the bundle analyzer runs automatically:

```bash
npm run build  # Automatically runs postbuild script
```

### Analysis Output

The analyzer provides:
- Total size of output directory
- Total size of Next.js build directory
- List of largest files (>100KB)
- Optimization recommendations

### Example Output

```
🔍 Build Output Analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Static Export (out): 2.45 MB
📦 Next.js Build (.next): 15.32 MB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Largest Files in Output:

  245.67 KB    _next/static/chunks/vendor.js
  123.45 KB    _next/static/chunks/main.js
  89.12 KB     _next/static/css/app.css

💡 Optimization Tips:

  ✅ Output size looks good!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Analysis complete!
```

## Build Size Targets

### Recommended Sizes

- **Total Output**: < 10 MB
- **JavaScript Bundles**: < 500 KB per chunk
- **CSS Files**: < 100 KB per file
- **Vendor Bundle**: < 300 KB

### Warning Thresholds

If output exceeds 10 MB, consider:
1. Lazy loading components
2. Dynamic imports for large libraries
3. Code splitting for routes
4. Removing unused dependencies

## Environment Variables

### Build-Time Variables

Set in `.env.local` or `.env.production`:

```bash
NODE_ENV=production
WHISPER_MODEL=whisper-1
GPT_MODEL=gpt-4
HOTKEY_COMBINATION=CommandOrControl+Shift+R
```

### Runtime Variables

Handled by Tauri backend for security:
- API keys (OpenAI, Whisper)
- Sensitive configuration

## Tauri Build Configuration

### Desktop Packaging

The `src-tauri/tauri.conf.json` configures:

#### Build Process
```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../out"
  }
}
```

#### Bundle Settings
- **Targets**: All platforms (Windows, macOS, Linux)
- **Icons**: Multiple sizes for different platforms
- **Code Signing**: Configured for Windows and macOS

### Build Output

Desktop builds are created in:
```
src-tauri/target/release/
├── voice-intelligence.exe      # Windows executable
├── voice-intelligence.msi      # Windows installer
└── bundle/                     # Platform-specific bundles
```

## Testing Production Build

### 1. Test Static Export

```bash
npm run build
npx serve out
```

Visit `http://localhost:3000` to test the static build.

### 2. Test Desktop Build

```bash
npm run tauri:build:debug
```

Run the generated executable from `src-tauri/target/debug/`.

### 3. Verify Optimizations

Check that:
- [ ] Console logs are removed (except errors/warnings)
- [ ] CSS is minified
- [ ] JavaScript is minified
- [ ] Code splitting is working
- [ ] Bundle sizes are within targets

## Troubleshooting

### Build Fails

**Issue**: Build fails with memory error
**Solution**: Increase Node.js memory limit
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Issue**: Tauri build fails
**Solution**: Ensure Rust and system dependencies are installed
```bash
# Check Rust installation
rustc --version

# Update Rust
rustup update
```

### Large Bundle Size

**Issue**: Output exceeds 10 MB
**Solution**: 
1. Run bundle analysis: `npm run build:analyze`
2. Identify large dependencies
3. Consider alternatives or lazy loading
4. Remove unused code

### Missing Assets

**Issue**: Assets not found in production
**Solution**: 
1. Ensure assets are in `public/` directory
2. Use relative paths: `/asset.png` not `./asset.png`
3. Check `next.config.ts` base path configuration

## Performance Checklist

Before deploying:

- [ ] Run production build successfully
- [ ] Bundle size within targets
- [ ] No console errors in production
- [ ] All assets loading correctly
- [ ] Code splitting working
- [ ] CSS minified
- [ ] JavaScript minified
- [ ] Desktop app launches correctly
- [ ] Hotkeys work in production
- [ ] API integrations functional

## Continuous Integration

For automated builds, use:

```yaml
# .github/workflows/build.yml
- name: Build Application
  run: npm run build:prod

- name: Build Desktop App
  run: npm run tauri:build

- name: Upload Artifacts
  uses: actions/upload-artifact@v3
  with:
    name: desktop-app
    path: src-tauri/target/release/bundle/
```

## Next Steps

After completing build configuration:
1. Test production build locally
2. Verify all optimizations
3. Set up code signing (Task 12.2)
4. Create release process (Task 12.3)

## References

- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Tauri Build Guide](https://tauri.app/v1/guides/building/)
- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
