const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const configured = () => ['CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_R2_ACCESS_KEY_ID','CLOUDFLARE_R2_SECRET_ACCESS_KEY','CLOUDFLARE_R2_BUCKET'].every(k => process.env[k]);
let client;
function getClient() { if (!configured()) throw new Error('Cloudflare R2 is not configured'); if (!client) client = new S3Client({ region: 'auto', endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID, secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY } }); return client; }
async function uploadBuffer({ key, buffer, contentType }) { await getClient().send(new PutObjectCommand({ Bucket: process.env.CLOUDFLARE_R2_BUCKET, Key: key, Body: buffer, ContentType: contentType })); return { key, url: process.env.CLOUDFLARE_R2_PUBLIC_URL ? `${process.env.CLOUDFLARE_R2_PUBLIC_URL.replace(/\/$/,'')}/${key}` : null }; }
async function signedReadUrl(key, expiresIn=900) { return getSignedUrl(getClient(), new GetObjectCommand({ Bucket: process.env.CLOUDFLARE_R2_BUCKET, Key: key }), { expiresIn }); }
async function deleteObject(key) { return getClient().send(new DeleteObjectCommand({ Bucket: process.env.CLOUDFLARE_R2_BUCKET, Key: key })); }
module.exports = { configured, uploadBuffer, signedReadUrl, deleteObject };
