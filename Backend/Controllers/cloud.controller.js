import { uploadFile, getFile, deleteFile } from "../Services/cloud.service.js";

export const putData = async (req, res) => {
  try {
    const file = req.body;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { userName, folderName, fileName } = req.body;
    const data = await uploadFile(file.file, userName, folderName, fileName);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getData = async (req, res) => {
  try {
    const { userName, folderName, fileName } = req.body;
    const data = await getFile(userName, folderName, fileName);
    res.status(200).json({ data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteData = async (req, res) => {
  try {
    const { userName, folderName, fileName } = req.body;
    const data = await deleteFile(userName, folderName, fileName);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
