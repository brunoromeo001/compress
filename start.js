/**
 * 
 * Validar se é no formato de audio ou imagem
 * fazer o case para essa validação
 */

const fs = require("fs");
const { writeFile } = require("fs");
const { spawn } = require("child_process");
const imageExtensions = require('image-extensions');
const audioExtensions = require('audio-extensions');
const videoExtensions = require('video-extensions');
const chokidar = require('chokidar');
const watcher = chokidar.watch('./src', {
  persistent: true,
  followSymlinks: false,
  usePolling: true,
  depth: undefined,
  interval: 100,
  ignorePermissionErrors: false
});
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const { format } = require("path");
ffmpeg.setFfmpegPath(ffmpegPath);

const timeOut = 30000;

watcher
  .on('add', function(dirPath) {

    let filename = path.basename(dirPath);

    createFileLog();

    insertLog(`File '${filename}' has been added.`)

    fs.stat(dirPath, (err, stat) =>{

      if (err) throw err
      setTimeout(checkFileCopy, timeOut, dirPath, stat, filename);

    })

    console.log(`File '${filename}' has been added.`);
      
  })
  

  function getDeteTime(){

    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    // prints date & time in YYYY-MM-DD HH:MM:SS format
    return (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

  }

  function insertLog(value){

    writeFile("./log/log.txt", `${getDeteTime()} ${value} \n`, {flag: 'a+'}, err=>{
      
      if(err) throw err;
    })
  }

  function videoConvert(file){

    let format = "mp4"
    fileName = path.parse(file).name

    ffmpeg(`./src/${file}`)
      .output(`./folder/${fileName}.${format}`)
      .videoCodec('libx264')
      .format(format)
      .on('error', (err)=> console.log(`An error occurrend: ${err.message}`))
      .on('codecData', (data) => totalTime = parseInt(data.duration.replace(/:/g, '')))
      .on('progress', (progress) => {

        const time = parseInt(progress.timemark.replace(/:/g, ''))        
        const percent = ((time / totalTime) * 100 ).toFixed(2) + '%';
            
        console.log(`Converting '${file}' file - ${percent} complete.`)
        
      })
      .on('end', ()=> {
        console.log(`File '${file}' has been converted.`);

        insertLog(`File '${file}' has been converted.`);

        fs.unlinkSync(`./src/${file}`);
      })
      .run();
  }

  function audioConvert(file){

    let format = "mp3"
    fileName = path.parse(file).name

    ffmpeg(`./src/${file}`)
      .output(`./folder/${fileName}.${format}`)
      .audioCodec('libmp3lame')
      .format(format)
      .on('error', (err)=> console.log(`An error occurrend: ${err.message}`))
      .on('codecData', (data) => totalTime = parseInt(data.duration.replace(/:/g, '')))
      .on('progress', (progress) => {

        const time = parseInt(progress.timemark.replace(/:/g, ''))        
        const percent = ((time / totalTime) * 100 ).toFixed(2) + '%';
            
        console.log(`Converting '${file}' file - ${percent} complete.`)
        
      })
      .on('end', ()=> {
        console.log(`File '${file}' has been converted. -- ${format}`);

        insertLog(`File '${file}' has been converted. -- ${format}`);

        fs.unlinkSync(`./src/${file}`);
      })
      .run();
  }


  function createFileLog(){
    fs.mkdir('./log', {recursive: true}, (err)=>{

      if(err) throw err;
      
    })
  }

  async function processConvert(file){

    fileName = path.parse(file).name;
    fileExt = path.parse(file).ext;
    ext = fileExt.replace('.', '');

    if(videoExtensions.includes(ext)){

      if(!fs.existsSync(`./folder/${fileName}.mp4`)){    
         
        await videoConvert(file)    
       
      }else{
  
        console.log(`File '${file}' already exists in directory.`)
        insertLog(`File '${file}' already exists in directory.`)
        fs.unlinkSync(`./src/${file}`);
      }

    } else if(audioExtensions.includes(ext)){

      await audioConvert(file)
    
    } else if(imageExtensions.includes(ext)){

      console.log('Converting image...')
    
    }else{

      console.log(`File '${file}' is in unsupported format.`)
      insertLog(`File '${file}' is in unsupported format.`)
      fs.unlinkSync(`./src/${file}`);

    } 
  
  }

  function checkFileCopy(path, prev, filename){

    fs.stat(path, (err, stat) => {

      if (err) throw err;
      
      if(stat.mtime.getTime() === prev.mtime.getTime()){
         
        processConvert(filename)
      }else{

        setTimeout(checkFileCopy, timeOut, path, stat, filename);
      }
    });
  }

