# Cloudinary Setup Guide

## 1. Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. Verify your email address
3. Access your dashboard

## 2. Get Your Credentials

From your Cloudinary dashboard, copy:
- **Cloud Name** (found in the dashboard URL)
- **API Key** (from the dashboard)
- **API Secret** (from the dashboard)

## 3. Set Up Environment Variables

1. Copy `env.example` to `.env.local`
2. Replace the placeholder values with your actual Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 4. Features

### ✅ **Automatic Image Optimization**
- Images are automatically resized to 800x800px
- Quality is optimized automatically
- Format is converted to the best format (WebP when supported)

### ✅ **Secure URLs**
- All images use HTTPS URLs
- Images are stored in the `izone-products` folder

### ✅ **Multiple Image Support**
- Upload up to 5 images per product
- All images are processed in parallel

### ✅ **Error Handling**
- Proper validation of file types and sizes
- Clear error messages for upload failures

## 5. Usage

1. **Add Product**: Select images in the admin panel
2. **Upload**: Images are automatically uploaded to Cloudinary
3. **Display**: Images are served from Cloudinary's CDN
4. **Performance**: Fast loading with global CDN

## 6. Benefits

- **Global CDN**: Fast image delivery worldwide
- **Automatic Optimization**: Reduced file sizes
- **Scalable**: No server storage limitations
- **Reliable**: 99.9% uptime guarantee
- **Free Tier**: 25GB storage and 25GB bandwidth per month

## 7. Troubleshooting

If uploads fail:
1. Check your environment variables are correct
2. Verify your Cloudinary account is active
3. Check the browser console for error messages
4. Ensure images are under 5MB and in supported formats 