import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Set up the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'student_avatars', // Folder name in your Cloudinary dashboard
    allowed_formats: ['jpg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional resizing
  },
});

// 3. Set up storage engine for notice attachments
const attachmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    
    // For documents (especially PDFs), use 'raw' so Cloudinary doesn't process them as images.
    // This allows Google Docs Viewer to correctly fetch and render them.
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(ext)) {
      return {
        folder: 'notice_attachments',
        resource_type: 'raw'
      };
    }

    // For images and other media
    return {
      folder: 'notice_attachments',
      resource_type: 'auto',
      format: ext,
    };
  },
});

export { cloudinary, storage, attachmentStorage };