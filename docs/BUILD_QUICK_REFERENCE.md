# Build System - Quick Reference

## Quick Commands

```bash
# Development
npm run dev                    # Start Next.js dev server
npm run tauri:dev             # Run desktop app in dev mode

# Production Build
npm run build                 # Build for production
npm run build:prod            # Build with NODE_ENV=production
npm run tauri:build           # Build desktop app

# Analysis & Debug
npm run build:analyze         # Build with bundle analysis
npm run tauri:build:debug     # Build desktop app (debug mode)

# Maintenance
npm run clean                 # Clean build artifacts
npm run clean:all             # Clean everything including node_modules
```

## Build Output Locations

```
out/                          # Next.js static export
.next/                        # Next.js build cache
src-tauri/target/release/     # Tauri desktop builds
```

## Build Optimizations

### Automatic Optimizations
- ✅ Code splitting (vendor, common, tauri chunks)
- ✅ CSS minification (production only)
- ✅ Console removal (production, keeps errors/warnings)
- ✅ Package import optimization (Tauri packages)
- ✅ Bundle analysis (runs after build)

### Manual Optimizations
- Optimize images before adding to project
- Use dynamic imports for large components
- Lazy load routes when possible

## Bundle Size Targets

| Asset Type | Target Size | Warning Threshold |
|------------|-------------|-------------------|
| Total Output | < 5 MB | > 10 MB |
| JS Chunks | < 300 KB | > 500 KB |
| CSS Files | < 50 KB | > 100 KB |
| Vendor Bundle | < 200 KB | > 300 KB |

## Build Troubleshooting

### Build Fails
```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Clean and rebuild
npm run clean:all && npm install && npm run build
```

### Large Bundle Size
```bash
# Analyze bundle
npm run build:analyze

# Check largest files in output
ls -lhS out/_next/static/chunks/
```

### Tauri Build Issues
```bash
# Check Rust installation
rustc --version

# Update Rust
rustup update

# Clean Tauri cache
cd src-tauri && cargo clean
```

## Environment Variables

### Build-Time (set in .env.local)
```bash
NODE_ENV=production
WHISPER_MODEL=whisper-1
GPT_MODEL=gpt-4
```

### Runtime (handled by Tauri)
- API keys (OpenAI, Whisper)
- Sensitive configuration

## Pre-Deployment Checklist

- [ ] Run `npm run build:prod` successfully
- [ ] Check bundle size with analyzer
- [ ] Test static export: `npx serve out`
- [ ] Verify no console errors in production
- [ ] Test desktop build: `npm run tauri:build:debug`
- [ ] Verify all features work in production build

## Performance Tips

1. **Code Splitting**: Use dynamic imports
   ```typescript
   const Component = dynamic(() => import('./Component'));
   ```

2. **Lazy Loading**: Load routes on demand
   ```typescript
   const route = lazy(() => import('./route'));
   ```

3. **Tree Shaking**: Import only what you need
   ```typescript
   import { specific } from 'library'; // Good
   import * as all from 'library';     // Bad
   ```

## Build Metrics

After each build, check:
- Total output size (should be < 10 MB)
- Largest chunks (should be < 500 KB)
- Build time (baseline for comparison)
- Number of chunks (more = better caching)

## Common Issues

### Issue: Build hangs
**Solution**: Kill process and clean cache
```bash
pkill -f "next build"
npm run clean && npm run build
```

### Issue: Out of memory
**Solution**: Increase Node.js heap size
```bash
export NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

### Issue: Missing dependencies
**Solution**: Reinstall packages
```bash
npm run clean:all && npm install
```

## Related Documentation

- [BUILD_CONFIGURATION.md](./BUILD_CONFIGURATION.md) - Detailed build guide
- [TAURI_QUICK_START.md](./TAURI_QUICK_START.md) - Tauri build guide
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development workflow

---

**Last Updated:** January 30, 2026  
**Version:** 1.0.0
