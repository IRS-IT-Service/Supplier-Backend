const multer = require("multer");
const path = require("path");
const fs = require("fs");
const appRoot = require('app-root-path');

function multerFunction(root){
return multer.diskStorage({
    destination:function(req,file,cb){
        let Path = path.join(appRoot.path,"public" , "upload" , root);
        fs.mkdirSync(Path,{recursive:true})
        cb(null,Path)
    },
    filename: function(req,file,cb){
        cb(null,Date.now() + path.extname(file.originalname));
    },
});
}

module.exports = multerFunction