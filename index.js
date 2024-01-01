const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

const upload = multer({ dest: 'uploads/' });

// Hàm sử dụng worker để nhận dạng văn bản từ hình ảnh
const recognizeText = async (imagePath) => {
  try {
    const worker = await createWorker();
    // await worker.load();
    // await worker.loadLanguage('eng');
    // await worker.initialize('eng');
    const {
      data: { text },
    } = await worker.recognize(imagePath);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Tesseract.recognize('./text-image.png', 'eng', {
//   logger: (e) => console.log(e),
// }).then(({ data: { text } }) => {
//   console.log(text);
// });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Không có tệp hình ảnh được gửi.');
  }

  // Đọc hình ảnh từ ổ đĩa
  const imageBuffer = fs.readFileSync(req.file.path);

  // Mã hóa hình ảnh thành chuỗi Base64

  Tesseract.recognize(imageBuffer, 'eng', {
    logger: (e) => console.log(e),
  }).then(({ data: { text } }) => {
    console.log(text);
    return res.status(200).json(text);
  });

  // Xóa tệp hình ảnh tạm thời sau khi đã đọc và mã hóa nó
  // fs.unlinkSync(req.file.path);

  // // Trả về chuỗi Base64 cho máy khách
  // res.send({ base64Image });
});

app.listen(port, () => {
  console.log(`API đang lắng nghe tại http://localhost:${port}`);
});
