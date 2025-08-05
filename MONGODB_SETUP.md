# MongoDB Setup Guide

## 1. Install MongoDB

### Option A: Local Installation
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install MongoDB on your system
3. Start MongoDB service

### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string

## 2. Set Up Environment Variables

1. Copy `env.example` to `.env.local`
2. Update the MongoDB URI:

### For Local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/izone
```

### For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/izone?retryWrites=true&w=majority
```

## 3. Features

### ✅ **MongoDB Integration**
- Products stored in MongoDB database
- Automatic ID generation with ObjectIds
- Timestamps for created/updated tracking
- Proper data validation

### ✅ **API Updates**
- All CRUD operations work with MongoDB
- Proper error handling for database operations
- Automatic connection management

### ✅ **Data Migration**
- Existing file-based data can be migrated
- New products will be saved to MongoDB
- Cloudinary URLs will be stored properly

## 4. Database Schema

### Products Collection:
```javascript
{
  _id: ObjectId,
  name: String (required),
  price: String (required),
  originalPrice: String (required),
  image: String (required),
  discount: String,
  description: String,
  category: String,
  inStock: Boolean,
  rating: Number,
  reviews: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 5. Benefits

- **Scalable**: MongoDB can handle large datasets
- **Flexible**: Schema can evolve over time
- **Reliable**: ACID transactions and data integrity
- **Fast**: Indexed queries for better performance
- **Cloud Ready**: Easy to deploy with MongoDB Atlas

## 6. Testing

1. Start your development server: `npm run dev`
2. Go to admin panel
3. Add a new product with images
4. Check MongoDB to see the saved data

## 7. Troubleshooting

### Connection Issues:
1. Check if MongoDB is running
2. Verify your connection string
3. Ensure network access (for Atlas)

### Data Issues:
1. Check browser console for errors
2. Verify environment variables
3. Check MongoDB logs

## 8. Migration from File Storage

The system will automatically:
- ✅ **Use MongoDB** for new products
- ✅ **Keep Cloudinary** for image storage
- ✅ **Maintain compatibility** with existing code
- ✅ **Handle ObjectIds** instead of numeric IDs 