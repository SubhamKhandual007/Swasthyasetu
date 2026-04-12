const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    let dir = 'uploads/';
    if (file.fieldname === 'insuranceFile') dir += 'patients/insurance/';
    else if (file.fieldname === 'bloodReport') dir += 'patients/blood/';
    else if (file.fieldname === 'imagingReport') dir += 'patients/imaging/';
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 },
  fileFilter: (_req, file, cb) => {
    const fileTypes = /pdf|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb('Error: Files must be PDF, JPG, or PNG');
  },
});

module.exports = upload;