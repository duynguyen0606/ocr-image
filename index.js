const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const bodyParser = require('body-parser');
const { createWorker } = require('tesseract.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

class NQueenSolver {
  constructor(n) {
    this.n = n;
    this.chessBoard = Array.from({ length: n }, () => Array(n).fill(0));
    this.result = '';
    this.queenCount = 0;
  }

  isSafe(row, col) {
    for (let i = 0; i < col; i++) {
      if (this.chessBoard[row][i] === 1) {
        return false;
      }
    }

    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (this.chessBoard[i][j] === 1) {
        return false;
      }
    }

    for (let i = row, j = col; i < this.n && j >= 0; i++, j--) {
      if (this.chessBoard[i][j] === 1) {
        return false;
      }
    }

    return true;
  }

  solve(col) {
    if (col >= this.n) {
      return true;
    }

    for (let i = 0; i < this.n; i++) {
      if (this.isSafe(i, col)) {
        this.chessBoard[i][col] = 1;
        this.queenCount++;
        if (this.solve(col + 1)) {
          return true;
        }
        this.chessBoard[i][col] = 0; // backtrack
        this.queenCount--;
      }
    }

    return false;
  }

  solveNQueens() {
    if (!this.solve(0)) {
      this.result = 'No solution exists\n';
      return;
    }
    this.printSolution();
  }

  printSolution() {
    let sb = [];
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.n; j++) {
        sb.push(this.chessBoard[i][j] + ' ');
      }
      sb.push('\n');
    }
    this.result = sb.join('');
  }

  getResult() {
    return this.result;
  }

  getQueenCount() {
    return this.queenCount;
  }
}

app.post('/upload', (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).send('Base64 không được gửi');
  }

  // Đọc hình ảnh từ ổ đĩa
  const imageBuffer = Buffer.from(image, 'base64');

  // Mã hóa hình ảnh thành chuỗi Base64
  let startTime = performance.now();
  Tesseract.recognize(imageBuffer, 'eng', {
    logger: (e) => console.log(e),
  }).then(({ data: { text } }) => {
    let endTime = performance.now();
    return res.status(200).json({
      result: text,
      time: endTime - startTime,
    });
  });
});

app.post('/n-queen', (req, res) => {
  const nInput = req.body.nInput;

  if (typeof nInput == 'number') {
    let startTime = performance.now();
    const solver = new NQueenSolver(nInput); // Thay đổi giá trị N theo yêu cầu
    solver.solveNQueens();
    console.log(solver.getResult());
    console.log('Number of Queens: ' + solver.getQueenCount());
    let endTime = performance.now();

    return res.status(200).json({
      result: solver.getResult(),
      count: solver.getQueenCount(),
      timer: endTime - startTime,
    });
  }
});

app.listen(port, () => {
  console.log(`API đang lắng nghe tại http://localhost:${port}`);
});
