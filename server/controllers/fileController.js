const multer =  require('multer');
const fs = require('fs')
const filePath = '../../data.json'


const  multerStorage =  multer.diskStorage({
    destination :  (req,file,cb) => {
        cb(null,'./uploads/posts')
    },
    filename : (req,file,cb) => {
        console.log(file)
        const ext =  file.mimetype.split('/')[1];
        const rand =  Math.floor(Math.random() * 1E9);
        cb(null, `product-${rand}-${Date.now()}.${ext}`)
    }
})

const multerFilter =  (req,file, cb) =>  {
    console.log(file)
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }
    else{
        cb(new AppError('The  file  you  uploaded is not supported', 400))
    }
}

const  upload =  multer({
    storage : multerStorage,
    fileFilter : multerFilter
})


exports.uploadImage =  upload.single('photo');



exports.postSignal= (req,res) =>  {
    const data = JSON.stringify(req.body);
  
  fs.writeFile(filePath, data, (error) => {
    if (error) {
      console.error('An error occurred:', error);
      res.status(500).send('An error occurred while saving the data.');
    } else {
        res.status(201);
        res.send('Data has been saved successfully.');
      console.log('Data has been saved to data.json');
    }
  });
}

exports.readSignal  =  (req,res) =>  {
    fs.readFile(filePath, 'utf8', (error, data) => {
        if (error) {
          console.error('An error occurred:', error);
        } else {
            res.status(200).send("data found")
          console.log('File contents:', JSON.parse(data));
        }
      });
}
