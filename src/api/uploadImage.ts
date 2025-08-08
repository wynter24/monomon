import axios from 'axios';

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'monomon');
  formData.append('folder', 'user-image');

  try {
    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
    );
    return data;
  } catch (error) {
    console.error(error);
  }
};
