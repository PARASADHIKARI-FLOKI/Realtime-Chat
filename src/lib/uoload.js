import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const upload = async (file, prevImageUrl) => {
  return new Promise(async (resolve, reject) => {
    if (!file) {
      resolve(prevImageUrl); // If no new file is selected, keep the existing image
      return;
    }

    const storage = getStorage();

    // If there's a previous image, delete it first
    if (prevImageUrl) {
      try {
        // Extract the storage path from the full URL
        const baseUrl = "https://firebasestorage.googleapis.com/v0/b/";
        const pathStart = prevImageUrl.indexOf("/o/") + 3; // "/o/" indicates start of path
        const pathEnd = prevImageUrl.indexOf("?alt=");
        const filePath = decodeURIComponent(prevImageUrl.substring(pathStart, pathEnd));

        const oldImageRef = ref(storage, filePath);
        await deleteObject(oldImageRef);
        console.log("Previous image deleted successfully.");
      } catch (error) {
        console.warn("Error deleting old image:", error);
      }
    }

    // Upload new image
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => reject(error),
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

export default upload;
