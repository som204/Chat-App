import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export const uploadFile = async (file, userName, folderName, fileName) => {
  try {
    const data = await client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${userName}/${folderName}/${fileName}`,
        Body: file,
        ContentType: "application/json",
      })
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getFile = async (userName, folderName, fileName) => {
  try {
    const data = await client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${userName}/${folderName}/${fileName}`,
      })
    );
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    return streamToString(data.Body);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const deleteFile = async (userName, folderName, fileName) => {
  try {
    const data = await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${userName}/${folderName}/${fileName}`,
      })
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};
