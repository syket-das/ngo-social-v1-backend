const {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKET_ACCESS_KEY_SECRET,
  },
});
const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;

async function addMediaToS3({ key, body, mimetype }) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: mimetype,
  });

  try {
    const response = await s3.send(command);
    return response;
  } catch (error) {
    console.log('Error', error);
    return error;
  }
}

function getMediaFromS3(key) {
  const url = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${key}`;
  return url;
}

async function deleteMediaFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await s3.send(command);
    return response;
  } catch (error) {
    console.log('Error', error);
    return error;
  }
}

module.exports = {
  getMediaFromS3,
  addMediaToS3,
  deleteMediaFromS3,
};
