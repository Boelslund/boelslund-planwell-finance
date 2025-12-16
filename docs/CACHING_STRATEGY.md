# Caching Strategy

This document explains the caching strategy implemented for Boelslund PlanWell Finance on Firebase Hosting.

## Overview

The application uses a modern caching strategy that balances performance with the ability to push updates quickly to users.

## Cache Configuration

### HTML Files (`index.html`)

```
Cache-Control: public, max-age=0, must-revalidate
```

**Purpose**: Ensure users always get the latest version of the app

- **`max-age=0`** - Browser checks with server on every visit
- **`must-revalidate`** - Forces revalidation when cached copy is stale
- **`public`** - Can be cached by CDN and intermediate caches

**Why**: The HTML file contains references to hashed asset files. When we deploy a new version, the HTML updates to reference new hashed files. Users must always fetch the latest HTML to get the correct asset references.

### JavaScript and CSS Files

```
Cache-Control: public, max-age=31536000, immutable
```

**Purpose**: Aggressive caching for versioned assets

- **`max-age=31536000`** - Cache for 1 year (365 days)
- **`immutable`** - Tells browser the file will never change
- **`public`** - Can be cached by CDN and intermediate caches

**Why**: Vite automatically generates content-hashed filenames (e.g., `index-BKeQost_.js`). These files are immutable - if content changes, the hash changes, creating a new filename. Old files can be cached forever without risk of serving stale content.

### Images and Fonts

```
Cache-Control: public, max-age=31536000, immutable
```

**File types**: `.jpg`, `.jpeg`, `.gif`, `.png`, `.svg`, `.webp`, `.ico`, `.woff`, `.woff2`, `.ttf`, `.eot`

**Purpose**: Long-term caching for static assets

**Why**: Images and fonts rarely change. Like JS/CSS, if they do change, they should use hashed filenames or versioned paths.

## How It Works

### Deployment Flow

```
1. Developer builds app
   → Vite generates hashed filenames
   
2. Files generated:
   dist/
   ├── index.html                    (not hashed)
   ├── assets/index-BKeQost_.js     (hashed)
   └── assets/index-heUMEuti.css    (hashed)

3. Deploy to Firebase
   → All files uploaded to hosting

4. User visits site:
   → Fetches index.html (always latest)
   → HTML references index-BKeQost_.js
   → Browser caches JS for 1 year
   
5. New deployment:
   → New hashes: index-XyZ123_.js
   → index.html now references XyZ123
   → Users get new HTML → fetch new assets
```

### Cache Busting

**Vite Automatic Hashing**: Vite includes content hash in filenames by default:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Default behavior - content hash in filename
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
```

This happens automatically - no configuration needed!

## Benefits

### ✅ Fast Loading

- **First visit**: Downloads all assets (inevitable)
- **Repeat visits**: Everything cached except HTML
- **After updates**: Only new assets downloaded

### ✅ Instant Updates

- Users get updates within seconds of deployment
- No need to clear browser cache manually
- No "hard refresh" required

### ✅ CDN Efficiency

- Assets cached at CDN edge locations globally
- Reduces origin server load
- Faster delivery worldwide

### ✅ Reduced Bandwidth

- Assets only downloaded once per version
- Saves bandwidth for users and hosting
- Better mobile experience

## Verification

### Check Cache Headers in Production

```bash
# Check HTML caching
curl -I https://your-app.web.app/index.html | grep -i cache-control

# Check JS caching
curl -I https://your-app.web.app/assets/index-[hash].js | grep -i cache-control

# Check CSS caching
curl -I https://your-app.web.app/assets/index-[hash].css | grep -i cache-control
```

### Browser DevTools

1. Open DevTools → Network tab
2. Reload page
3. Check Response Headers for each file
4. Look for `Cache-Control` header

### Expected Results

| File Type | Cache-Control Header | Max Age |
|-----------|---------------------|---------|
| `index.html` | `public, max-age=0, must-revalidate` | 0 seconds |
| `*.js` | `public, max-age=31536000, immutable` | 1 year |
| `*.css` | `public, max-age=31536000, immutable` | 1 year |
| `*.png` | `public, max-age=31536000, immutable` | 1 year |

## Configuration Files

### Firebase Hosting

Cache headers are configured in `firebase.json`:

```json
{
  "hosting": [
    {
      "target": "production",
      "headers": [
        {
          "source": "/index.html",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "public, max-age=0, must-revalidate"
            }
          ]
        },
        {
          "source": "**/*.@(js|css)",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "public, max-age=31536000, immutable"
            }
          ]
        }
      ]
    }
  ]
}
```

## Best Practices

### ✅ DO

- Use content hashing for all assets (Vite does this automatically)
- Keep HTML cache duration short (0 or very low)
- Use long cache durations for hashed assets
- Add `immutable` directive for hashed files
- Test cache headers after deployment

### ❌ DON'T

- Cache HTML files for long periods
- Use long cache durations without content hashing
- Rely on "clear cache" instructions for users
- Cache API responses with static content headers
- Forget to update cache headers when changing asset naming

## Troubleshooting

### Users Not Getting Updates

**Symptoms**: Users report seeing old version after deployment

**Solutions**:
1. Verify HTML is not cached: `curl -I https://your-app.web.app/`
2. Check if HTML references new hashed files
3. Clear CDN cache if using additional CDN
4. Verify deployment completed successfully

### Assets Loading Slowly

**Symptoms**: Slow load times on repeat visits

**Solutions**:
1. Check if cache headers are applied: Look in DevTools
2. Verify files are being cached: Check "from disk cache" in Network tab
3. Ensure CDN is enabled on Firebase Hosting
4. Consider adding Service Worker for offline support

### Cache Headers Not Applied

**Symptoms**: Headers don't match `firebase.json` configuration

**Solutions**:
1. Redeploy: `firebase deploy --only hosting`
2. Check file patterns match actual filenames
3. Verify JSON syntax in `firebase.json`
4. Clear CDN cache manually in Firebase Console

## Future Enhancements

### Service Worker

Add a service worker for:
- Offline functionality
- Background sync
- Push notifications
- Faster repeat visits

### Preloading

Use `<link rel="preload">` for critical assets:

```html
<link rel="preload" href="/assets/index-[hash].js" as="script">
<link rel="preload" href="/assets/index-[hash].css" as="style">
```

### HTTP/2 Server Push

Consider server push for critical resources (Firebase Hosting supports this).

## References

- [Firebase Hosting Headers](https://firebase.google.com/docs/hosting/full-config#headers)
- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Web.dev: HTTP Caching](https://web.dev/http-cache/)
- [Vite: Building for Production](https://vitejs.dev/guide/build.html)
