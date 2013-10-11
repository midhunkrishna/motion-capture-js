var motionCapture = {
    initMoCap: function(videoCanvas, blendModeDiffCanvas){
        if(!this.hasGetUserMedia()){
            alert("cannot capture video camera");
        }else{
            this.getUserVideo();
            this.drawVideoOntoCanvas(videoCanvas, blendModeDiffCanvas);
        }
    },

    drawVideoOntoCanvas: function(videoCanvas, blendModeDiffCanvas){
        lastImage = false;
        this.canvasSource = $(videoCanvas)[0];
        this.contextSource = this.canvasSource.getContext('2d');
        this.blendCanvas = $(blendModeDiffCanvas)[0];
        this.contextBlendCanvas = this.blendCanvas.getContext('2d');
        this.flipCanvas();
        this.updateCanvases();
    },

    flipCanvas: function(){
        this.contextSource.translate(this.canvasSource.width, 0);
        this.contextSource.scale(-1, 1);
    },

    drawVideo: function(){
        this.contextSource.drawImage(this.video, 0, 0, this.video.width, this.video.height);
    },

    updateCanvases: function(){
        var _this = this;
        setTimeout(function(){
            _this.drawVideo();
            _this.blend();
            _this.updateCanvases();
        }, 1000/60);
    },

    getUserVideo: function(){
        this.video = $('video')[0];
        var _this = this;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({audio: false, video: true}, function(stream) {
                _this.video.src = stream;
            }, _this.webcamError);
        } else if (navigator.webkitGetUserMedia) {
           navigator.webkitGetUserMedia({audio: false, video:true}, function(stream){
                         _this.video.src = window.webkitURL.createObjectURL(stream);
            }, _this.webcamError);
        }
    },

    blendModeDifference: function(target, new_data, old_data){
        var _this = this;
        if (new_data.length != old_data.length) return null;
        var i = 0;
        while (i < (new_data.length * 0.25)) {
            target[4*i] = new_data[4*i] == 0 ? 0 : _this.fastAbs(new_data[4*i] - old_data[4*i]);
            target[4*i+1] = new_data[4*i+1] == 0 ? 0 : _this.fastAbs(new_data[4*i+1] - old_data[4*i+1]);
            target[4*i+2] = new_data[4*i+2] == 0 ? 0 : _this.fastAbs(new_data[4*i+2] - old_data[4*i+2]);
            target[4*i+3] = 0xFF;
            ++i;
        }
    },

    bw_blendModeDifference: function(target, new_data, old_data){
        var _this = this;
        if (new_data.length != old_data.length) return null;
        var i = 0;
        while (i < (new_data.length * 0.25)) {
            var avg_new = (new_data[4*i] + new_data[4*i+1] + new_data[4*i+2])/3;
            var avg_old = (old_data[4*i] + old_data[4*i+1] + old_data[4*i+2])/3;
            var diff = _this.fastAbs(avg_new - avg_old);
            target[4*i] = diff;
            target[4*i+1] = diff;
            target[4*i+2] = diff;
            target[4*i+3] = 0xFF;
            ++i;
        }
    },

    blend: function(){
        var width = this.canvasSource.width;
        var height = this.canvasSource.height;
        var sourceImage = this.contextSource.getImageData(0, 0, width, height);
        if (!lastImage) lastImage = this.contextSource.getImageData(0, 0, width, height);
        var blendedResultImage = this.contextSource.createImageData(width, height);
        this.bw_blendModeDifference(blendedResultImage.data, sourceImage.data, lastImage.data);
        this.contextBlendCanvas.putImageData(blendedResultImage, 0, 0);
        lastImage = sourceImage;
    },

    webcamError: function(){
        alert('Webcam error!', e);
    },

    fastAbs: function(value) {
        return value < 0 ? -value : value;
    },

    hasGetUserMedia: function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }
};