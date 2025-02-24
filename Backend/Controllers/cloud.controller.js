/**
 * The above code defines functions for uploading, getting, and deleting files from a cloud service
 * using JavaScript.
 * @param req - The `req` parameter in your code represents the request object, which contains
 * information about the HTTP request that triggered your endpoint. This object includes details such
 * as the request headers, parameters, body, URL, and more.
 * @param res - The `res` parameter in the functions `putData`, `getData`, and `deleteData` stands for
 * the response object in Express.js. It is used to send a response back to the client making the
 * request. In these functions, `res.status(200)` is used to set the HTTP
 * @returns The code snippet provided contains three functions: `putData`, `getData`, and `deleteData`.
 */
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
