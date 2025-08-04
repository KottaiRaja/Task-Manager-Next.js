// app/api/upload/route.js
import AWS from 'aws-sdk'
import { NextResponse } from 'next/server'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

export async function POST(req) {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `user-uploads/${Date.now()}-${file.name}`,
    Body: buffer,
    ContentType: file.type,
  }

  try {
    const result = await s3.upload(uploadParams).promise()
    return NextResponse.json({ url: result.Location })
  } catch (err) {
    console.error('S3 Upload Error:', err)
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
  }
}
