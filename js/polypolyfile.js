//Normalize APIs
window.URL = window.URL || window.webkitURL;
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

var fileSystem, size = 1024*1024*1024; //1GB

function addImageToList(loadedEvent) {
    var dataURI = '';
    if (loadedEvent.target) {
        dataURI = loadedEvent.target.result;
    } else {
        dataURI = loadedEvent;
    }
    var img = document.createElement('img');
    img.src = dataURI;
    document.getElementById('filelist').appendChild(img);
}

function getOrientation(dataURL) {
    var byteString = atob(dataURL.split(',')[1]);
    var binaryFile = new BinaryFile(byteString, 0, byteString.length);
    var exif = EXIF.readFromBinaryFile(binaryFile);
    if (exif && exif['Orientation']) {
        return exif['Orientation'];
    }
    return 0;
}

function handleError(errorEvent) { 
    var errorInfo = "";
    try {
        errorInfo = JSON.stringify(errorEvent);
    } catch (ignored) {}
    log('Error with filesystem API:'+errorInfo); //Async error handler
}

function handleOpenFileSystem(newFileSystem) {
    log("have open file system");
    fileSystem = newFileSystem;
    var dirReader = fileSystem.root.createReader();
    var entries = [];

    // Call the reader.readEntries() until no more results are returned.
    var readEntries = function() {
        dirReader.readEntries (function(results) {
            log("have directory");
            if (!results.length) {
                listResults(entries.sort());
            } else {
                entries = entries.concat(toArray(results));
                readEntries();
            }
        }, handleError);
    };
    readEntries(); // Start reading dirs.
}

function listResults(entries) {
    entries.forEach(function(entry, i) {
        entry.file(readImageAsDataURL);
        log('found filesystem entry:'+entry.name);
    });
}

function log(message) {
    var konsole = document.getElementById('konsole');
    konsole.value += "\n" + message;
}

function openFileSystem() {
    log('Opening filesystem API');
    window.requestFileSystem(PERSISTENT, size, handleOpenFileSystem, function(){
        //Filesystem may not be ready yet, try again 
        setTimeout(openFileSystem, 30);
    });
}

function prepareImage(event) {
    var loading = document.getElementById('loading');
    loading.style.display = 'block';
    var fileToAdd = event.target.files[0];
    var fileParts = fileToAdd.name.split('.');
    var fileName = new Date().getTime() + '.' + fileParts[fileParts.length-1];
    readImageAsDataURL(fileToAdd, function(e) {
        var dataUrl = e.target.result;
        var orientation = 0;
        if (fileToAdd.type == 'image/jpeg') {
            orientation = getOrientation(dataUrl); 
        }
        resizeImage(fileToAdd, fileName, orientation); // send it to canvas
    });
}

function readImageAsDataURL(file, callback) {
    callback = callback || addImageToList;
    var reader = new FileReader();
    reader.onload = callback;
    reader.readAsDataURL(file);
}

function resizeImage(file, fileName, orient) {
    var canvas = document.createElement('canvas');
    var mpImg = new MegaPixImage(file);
    mpImg.onrender = function(canvas) {
        var dataURI = canvas.toDataURL("image/jpeg");
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for(var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        var uint = new Uint8Array(array);
        var resizedFile = new Blob([uint.buffer], {type: 'image/jpeg'});
        saveFile(resizedFile, fileName);
        addImageToList(dataURI);
    };
    mpImg.render(canvas, { maxWidth: 320, maxHeight: 320, quality: 0.5, orientation: orient });
}           

function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
}

function saveFile(fileToSave, fileName) {
    log("file name is: "+fileName);
    fileSystem.root.getFile(fileName, {create: true, exclusive: true}, 
        function(fileEntry) {        
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.write(fileToSave);
		var loading = document.getElementById('loading');
		loading.style.display = 'none';
            }, handleError);                      
        }, 
    handleError);            
}

document.addEventListener('DOMContentLoaded', function(){
    if (navigator.webkitPersistentStorage) {
        navigator.webkitPersistentStorage.requestQuota(size, openFileSystem, handleError);
    } else if (window.webkitStorageInfo) {
        window.webkitStorageInfo.requestQuota(PERSISTENT, size, openFileSystem, handleError);
    } else {
        openFileSystem();
    }
    document.getElementById('userphoto').addEventListener('change',prepareImage);    
});