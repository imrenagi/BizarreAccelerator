function Images() {
    // the objects
    this.E = new Image();
    this.Bin = new Image();
    this.Bout = new Image();
    this.BAltIn = new Image();
    this.BAltInOff = new Image();
    this.BAltOut = new Image();
    this.BAltOutOff = new Image();
    this.XRay = new Image();
    
    // load all images from their sources
    this.dir = "img/";
    this.E.src = this.dir + "e.png";
    this.Bin.src = this.dir + "b-in.png";
    this.Bout.src = this.dir + "b-out.png";
    this.BAltIn.src = this.dir + "b-alt-in.png";
    this.BAltInOff.src = this.dir + "b-alt-in-off.png";
    this.BAltOut.src = this.dir + "b-alt-out.png";
    this.BAltOutOff.src = this.dir + "b-alt-out-off.png";
    this.XRay.src = this.dir + "xray.png";
}

var imagesLoader = new Images();
