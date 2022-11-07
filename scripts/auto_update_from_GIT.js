const fs = require('fs')
var ncp = require('ncp').ncp;
const rp = require('request-promise')
const request = require('request')
destination = './temp.zip'
var AdmZip = require('adm-zip');


cleanup()
//Version compare---------------------------------------------------------------------
function compareVersion(v1, v2) {
    if (typeof v1 !== 'string') return false;
    if (typeof v2 !== 'string') return false;
    v1 = v1.split('.');
    v2 = v2.split('.');
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
    }
    return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
}
//------------------------------------------------------------------End Version Compare
//Close Loading Modal------------------------------------------------------------------

//------------------------------------------------------------------End Closing
//CheckVersion--------------------------------------------------------------------------
setTimeout(GetPackageFile,1000);
GetPackageFile()

function GetPackageFile(x) {
    var options2 = {
        'method': 'GET',
        'url': 'https://raw.githubusercontent.com/marcelrottmann/heating_dashboard/master/package.json',
    };
    rp(options2)
        .then(function (parsedBody) {
            console.log(parsedBody)
            CloudVersion = JSON.parse(parsedBody).version
            LocalVersion = JSON.parse(fs.readFileSync('./package.json')).version
            console.log(JSON.parse(parsedBody).version)
            console.log(JSON.parse(fs.readFileSync('./package.json')).version)
            if (compareVersion(LocalVersion,CloudVersion) < 0){
            GetAllFiles()
            }
            else (CloseLoadingModal())
        })
        .catch(function (err) {
            console.log(err)
            //window.alert('Failed to read version' + err.error)
            CloseLoadingModal()
            return
        });
}


//------------------------------------------------------------------------------End Check Version
//Get All Files and Copy them and Clean up------------------------------------------------------
function GetAllFiles(x) {
    request('https://codeload.github.com/marcelrottmann/heating_dashboard/zip/master')
        .pipe(fs.createWriteStream('temp.zip'))
        .on('close', function () {
            console.log('File written!'); ReadFiles()
        });
}
//--------------------------------------------Get files--------------------------------------------
function ReadFiles(x) {
    cleanup()
    var SDMZipFileName = 'temp.zip'
    console.log(SDMZipFileName)
    var zip = new AdmZip(SDMZipFileName)
    var zipEntries = zip.getEntries(); // an array of ZipEntry records
    zip.extractAllTo(/*target path*/"./temp", /*overwrite*/true)
    console.log('true')
        ncp("./temp/ConfigEditor-master", "./", function (err) {
            if (err) {
              //window.alert('Failed to download the new version, the programme will try again next time you reload the programme.')
              PackageJSON = JSON.parse(fs.readFileSync('./package.json'))
              PackageJSON.version = "1.0.0"
              fs.writeFileSync('./package.json',JSON.stringify(PackageJSON))
              return console.error(err);

            }
            console.log('done!');
           });
           
           fs.stat('./temp.zip', function (err, stats) {
            console.log(stats);//here we got all information of file in stats variable
         
            if (err) {
                CloseLoadingModal()
                return console.error(err);
                
            }
         
            fs.unlink('./temp.zip',function(err) {
                 CloseLoadingModal()
                 console.log('file deleted successfully');
                 if(err) return console.log(err);
                 //Force Redownload next time
                 PackageJSON = JSON.parse(fs.readFileSync('./package.json'))
                 PackageJSON.version = "1.0.0"
                 fs.writeFileSync('./package.json',JSON.stringify(PackageJSON))
                 
            });  
         });
//
     
}



function cleanup()
{
  if (fs.existsSync('./temp')){ deleteFolderRecursive('./temp') }
  makeFolderIfNotExist('./temp')
}
function deleteFolderRecursive(path) 
{
  try {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
  catch (e) { 
      console.log(e)
      CloseLoadingModal()
  }
}
function makeFolderIfNotExist(pth)
{
  //MAKE FOLDER IF NOT EXIST
  if (!fs.existsSync(pth)){ fs.mkdirSync(pth) }
}
