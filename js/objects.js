function GameObj(x, y, dir) {
    this.group = "none";
    this.penetrable = false; // all objects are impenetrable by default
    this.dir = dir;
    this.shape = new Kinetic.Rect({
        x: x,
        y: y,
        width: 0,
        height: 0
    });
    this.updateBoundingShape();
}

GameObj.prototype.updateBoundingShape = function() { // bounding shape is rectangular by default
    var x = this.shape.getX();
    var y = this.shape.getY();
    var w = this.shape.getWidth();
    var h = this.shape.getHeight();
    this.boundingShape = {
        "type": "box",
        "coords": [[x,y],[x+w,y],[x+w,y+h],[x,y+h]]
    }
}

GameObj.prototype.isCollide = function(obj) {
    // now only box-box supported
    if (this.boundingShape.type == "box" && obj.boundingShape.type == "box") {
        return boxesOverlap(this.boundingShape.coords, obj.boundingShape.coords);
    }
    return false;
}

GameObj.prototype.moveTo = function(x, y) {
    this.shape.setX(x);
    this.shape.setY(y);
    this.updateBoundingShape();
}

GameObj.prototype.postProcess = function() { // post process is to be executed in each frame, e.g. count down timer to toggle magnetic field in alt-mag-field
    // default, do nothing here
}

GameObj.prototype.on = function(evtStr, handler) { // event handler for object, if obj.shape.on do not work properly
    var thisObj = this;
    this.shape.on(evtStr, function(e) {
        handler.call(thisObj, e);
    });
}




Source.prototype = new GameObj();
Source.prototype.constructor = Source;
function Source(x, y, dir) {
    GameObj.call(this, x, y, dir);
    this.group = "source";
    this.penetrable = true;
    
    this.radius = 15;
    this.angleDeg = 60;
    this.rotationDeg = 150 + dir * 180 / Math.PI;
    
    this.type = "source";
    
    this.shape = new Kinetic.Wedge({
        x: x,
        y: y,
        radius: this.radius,
        angleDeg: this.angleDeg,
        rotationDeg: this.rotationDeg,
        strokeWidth: 1
    });
    
    this.updateBoundingShape();
    
    this.energy = 0;
    this.canEmit = 1;
}

    Source.prototype.updateBoundingShape = function() {
        var x = this.shape.getX();
        var y = this.shape.getY();
        
        // getting its bounding box if it's placed in (0,0) with 0 dir
        var bbxMax = 0;
        var bbxMin = -this.radius * Math.cos(this.angleDeg/2 * Math.PI/180);
        var bbyMax =  this.radius * Math.sin(this.angleDeg/2 * Math.PI/180);
        var bbyMin = -bbyMax;
        var boundingBox = [[bbxMin, bbyMin], [bbxMax, bbyMin], [bbxMax, bbyMax], [bbxMin, bbyMax]];
        
        // then let's transform it
        boundingBox = rotateBox(boundingBox, [0,0], this.dir);
        boundingBox = moveBox(boundingBox, [x,y]);
        
        this.boundingShape = {
            "type": "box",
            "coords": boundingBox
        }
    }

    Source.prototype.canEmitParticle = function() {
        return this.canEmit;
    }

    Source.prototype.emitParticle = function(particleType) {
        // initial condition of the particle
        var x = this.shape.getX();
        var y = this.shape.getY();
        var dir = 0;
        
        // create the particle object
        var constructor = getConstructorFromType(particleType);
        var particleObj = new constructor(x, y, dir);
        
        // set velocity of the particle
        particleObj.setEnergy(this.energy);
        particleObj.setVelocityRad(this.dir);
        
        return particleObj;
    }
    
    Source.prototype.reset = function() {
        this.canEmit = 1;
    }

SingleSourceObj.prototype = new Source();
SingleSourceObj.prototype.constructor = SingleSourceObj;
function SingleSourceObj(x, y, dir) {
    Source.call(this, x, y, dir);
    this.type = "single-source";
    this.shape.setFill("red");
    this.shape.setStroke("blue");
    this.energy = 2000;
}

    SingleSourceObj.prototype.emitParticle = function(particleType) {
        var particleObj = Source.prototype.emitParticle.call(this, particleType);
        this.canEmit = 0;
        return particleObj;
    }

BurstSourceObj.prototype = new Source();
BurstSourceObj.prototype.constructor = BurstSourceObj;
function BurstSourceObj(x, y, dir) {
    Source.call(this, x, y, dir);
    this.type = "burst-source";
    this.shape.setFill("blue");
    this.shape.setStroke("yellow");
    this.energy = 2000;
    
    this.emitCountDownVal = 10;
    this.emitCountDown = this.emitCountDownVal;
}

    BurstSourceObj.prototype.emitParticle = function(particleType) {
        var particleObj = Source.prototype.emitParticle.call(this, particleType);
        this.canEmit = 0;
        var thisObj = this;
        this.emitCountDown = this.emitCountDownVal;
        return particleObj;
    }
    
    BurstSourceObj.prototype.postProcess = function() {
        if (!this.canEmit) this.emitCountDown -= 1;
        if (this.emitCountDown == 0) this.canEmit = 1;
    }



Target.prototype = new GameObj();
Target.prototype.constructor = Target;
function Target(x, y, dir) {
    GameObj.call(this, x, y, dir);
    this.group = "target";
    this.penetrable = true; // all target are penetrable by default
    
    var width = 20;
    var height = 20;
    
    this.type = "target";
    
    this.shape = new Kinetic.Rect({
        x: x,
        y: y,
        width: width,
        height: height,
        strokeWidth: 1
    });
    
    this.updateBoundingShape();
    
    // default energy to get the goal
    this.energy = 2500;
}

    Target.prototype.checkGoal = function(particle) {
        return particle.getEnergy() > this.energy;
    }
    
    Target.prototype.showParticleEnergy = function(energy) {
        var portion = parseInt(energy / this.energy * 255);
        if (portion > 255) portion = 255;
        // this.shape.setFillR(portion);
        this.shape.setFillG(portion);
        this.shape.setFillB(portion);
        // CONF
    }

FixedTargetObj.prototype = new Target();
FixedTargetObj.prototype.constructor = FixedTargetObj;
function FixedTargetObj(x, y, dir) {
    Target.call(this, x, y, dir);
    this.type = "fixed-target";
    this.shape.setFill("white");
    this.shape.setStroke("green");
}

CollisionTargetObj.prototype = new Target();
CollisionTargetObj.prototype.constructor = CollisionTargetObj;
function CollisionTargetObj(x, y, dir) {
    Target.call(this, x, y, dir);
    this.type = "collision-target";
    this.shape.setFill("white");
    this.shape.setStroke("red");
    this.energy = 5000;
}

    CollisionTargetObj.prototype.checkGoal = function(p0, p1) {
        // see more about CM energy // ???
        return getCMEnergy([p0,p1]) > this.energy;
    }





Path.prototype = new GameObj();
Path.prototype.constructor = Path;
function Path(x, y, dir) {
    GameObj.call(this, x, y, dir);
    this.dir = dir;
    this.group = "path";
    this.penetrable = true; // most of the path are penetrable
    
    var width = 17;
    var height = 17;
    
    this.type = "path";
    this.shape = new Kinetic.Rect({
        x: x,
        y: y,
        width: width,
        height: height,
        strokeWidth: 1
    });
    
    this.updateBoundingShape();
}

    Path.prototype.rotateOnClick = function() { // function to be executed when the object is clicked
        this.dir -= Math.PI/2;
    }

BlockObj.prototype = new Path();
BlockObj.prototype.constructor = BlockObj;
function BlockObj(x, y, dir) {
    Path.call(this, x, y, dir);
    this.penetrable = false; // blocking object is not penetrable
    this.type = "block";
    this.shape.setFill("brown");
    this.shape.setStroke("black");
}

MagFieldObj.prototype = new Path();
MagFieldObj.prototype.constructor = MagFieldObj;
function MagFieldObj(x, y, dir) {
    Path.call(this, x, y, dir);
    this.type = "mag-field";
    this.shape.setFill("blue");
    this.shape.setStroke("white");
    
    this.Bz = 1;
}

StrongMagFieldObj.prototype = new Path();
StrongMagFieldObj.prototype.constructor = StrongMagFieldObj;
function StrongMagFieldObj(x, y, dir) {
    Path.call(this, x, y, dir);
    this.type = "strong-mag-field";
    
    // styling
    this.imgs = [imagesLoader.Bin, imagesLoader.Bout];
    this.imgPointer = (this.dir >= 0) ? 0 : 1;
    this.shape.setFillPatternImage(this.imgs[this.imgPointer]);
    this.shape.setStroke("white");
    
    var BDir = (this.dir >= 0) ? 1 : -1;
    this.Bz = BDir * 5.2;
}

AltMagFieldObj.prototype = new Path();
AltMagFieldObj.prototype.constructor = AltMagFieldObj;
function AltMagFieldObj(x, y, dir) {
    Path.call(this, x, y, dir);
    this.type = "alt-mag-field";
    
    // styling
    this.imgs = [imagesLoader.BAltIn, imagesLoader.BAltInOff, imagesLoader.BAltOut, imagesLoader.BAltOutOff];
    this.imgPointer = (this.dir >= 0) ? 0 : 2;
    this.shape.setFillPatternImage(this.imgs[this.imgPointer]);
    this.shape.setStroke("white");
    
    var BDir = (this.dir >= 0) ? 1 : -1;
    this.Bz = BDir * 5.2;
    
    this.active = 1;
    this.timerInit = 10;
    this.timer = this.timerInit;
}

    AltMagFieldObj.prototype.postProcess = function() {
        this.timer -= 1;
        if (this.timer == 0) {
            this.timer = this.timerInit;
            this.active = 1 - this.active;
            
            // change appearance
            this.imgPointer ^= 1; // 0 <-> 1 and 2 <-> 3 (on <-> off)
            this.shape.setFillPatternImage(this.imgs[this.imgPointer]);
        }
    }
    
    AltMagFieldObj.prototype.magFieldIsActive = function() {
        return this.active;
    }

    MagFieldObj.prototype.rotateOnClick = function() {
        this.Bz *= -1;
    }
    StrongMagFieldObj.prototype.rotateOnClick = function() {
        this.Bz *= -1;
        
        // change appearance
        this.imgPointer = 1-this.imgPointer;
        this.shape.setFillPatternImage(this.imgs[this.imgPointer]);
    }
    AltMagFieldObj.prototype.rotateOnClick = function() {
        this.Bz *= -1;
        
        // change appearance
        this.imgPointer ^= 2; // 0 <-> 2 and 1 <-> 3 (in <-> out)
        this.shape.setFillPatternImage(this.imgs[this.imgPointer]);
    }
    
ElecFieldObj.prototype = new Path();
ElecFieldObj.prototype.constructor = ElecFieldObj;
function ElecFieldObj(x, y, dir) {
    Path.call(this, x, y, dir);
    this.E = 100;
    this.type = "elec-field";
    
    // styling
    this.img = imagesLoader.E;
    this.shape.setFillPatternImage(this.img);
    this.shape.setFillPatternRotation(this.dir);
    this.shape.setStroke("white");
}

    ElecFieldObj.prototype.rotateOnClick = function() {
        Path.prototype.rotateOnClick.call(this);
        this.shape.setFillPatternRotation(this.dir);
    }






Particle.prototype = new GameObj();
Particle.prototype.constructor = Particle;
function Particle(x, y, dir) {
    GameObj.call(this, x, y, dir);
    this.group = "particle";
    var r = 4;
    
    this.type = "particle";
    this.shape = new Kinetic.Circle({
        x: x,
        y: y,
        radius: r,
        strokeWidth: 1
    });
    this.updateBoundingShape();
    
    this.m = 1; // in eV/c^2
    this.vx = 0;
    this.vy = 0;
    this.q = 1; // in fundamental charge unit
    
    this.exist = 1;
    this.lifetime = Infinity;
}

    Particle.prototype.updateBoundingShape = function() {
        var x = this.shape.getX();
        var y = this.shape.getY();
        var r = this.shape.getWidth()/2;
        
        var scale = Math.sqrt(Math.PI/4); // to get the same area between the circle and the bounding box of particle
        var d = r*scale;
        
        this.boundingShape = {
            "type": "box",
            "coords": [[x-d,y-d],[x+d,y-d],[x+d,y+d],[x-d,y+d]]
        }
    }

    Particle.prototype.move = function() {
        var dx = this.vx * C.dt;
        var dy = this.vy * C.dt;
        this.moveTo(this.shape.getX() + dx, this.shape.getY() + dy);
        // console.log(this.boundingShape.coords[0][0], this.boundingShape.coords[0][1]);
        // this.shape.setX(this.shape.getX() + dx);
        // this.shape.setY(this.shape.getY() + dy);
        // this.boundingShape.coords = moveBox(this.boundingShape.coords, [dx, dy]);
    }

    Particle.prototype.getVelocityRad = function() {
        return Math.atan2(this.vy, this.vx);
    }
    
    Particle.prototype.setVelocityRad = function(rad) {
        // get its velocity
        var v = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        this.vx = v * Math.cos(rad);
        this.vy = v * Math.sin(rad);
    }

    Particle.prototype.accelerate = function(ax, ay) {
        this.vx += ax * C.dt;
        this.vy += ay * C.dt;
    }

    Particle.prototype.doLorentzForce = function(Bz) {
        var omega = -this.q * Bz / this.m;
        var dtheta = omega * C.dt;
        this.setVelocityRad(this.getVelocityRad() + dtheta);
    }

    Particle.prototype.doElectricForce = function(E, dir) {
        var qOverM = this.q/this.m;
        var Ex = E * Math.cos(dir);
        var Ey = E * Math.sin(dir);
        this.accelerate(qOverM*Ex, qOverM*Ey);
    }
    
    Particle.prototype.getEnergy = function() {
        return 0.5 * this.m * (this.vx * this.vx + this.vy * this.vy);// / C.e;
    }

    Particle.prototype.setEnergy = function(energy) { // energy in eV
        // get the direction of the particle
        var rad = 0;
        if (this.vx == 0 && this.vy == 0) rad = 0;
        else rad = Math.atan2(this.vy, this.vx);
        
        var v = Math.sqrt(2*energy / this.m);
        this.vx = v * Math.cos(rad);
        this.vy = v * Math.sin(rad);
    }

    Particle.prototype.postProcess = function() {
        // in future, please consider relativistic effect!
        this.lifetime -= 1;
    }
    
    // decay of a particle usually emits some new particles, this function create new particles and return them
    Particle.prototype.decayParticles = function() {
        // initial condition of the particle
        var x = this.shape.getX();
        var y = this.shape.getY();
        var dir = this.dir; //Math.random() * 2 * Math.PI;
        
        // create the particle object
        var constructor = getConstructorFromType("photon");
        var particleObj = new constructor(x, y, dir);
        
        // set velocity of the particle
        particleObj.setEnergy(this.getEnergy());
        particleObj.setVelocityRad(dir);
        
        return [particleObj];
    }
    
    // collision between 2 particles usually emits some new particles, this function create the new particles and return them
    Particle.prototype.collisionParticles = function(p1) {
        var particles = [];
        for (var i = 0; i < 2; i++) {
            // initial condition of the particle
            var x = this.shape.getX();
            var y = this.shape.getY();
            var dir = Math.random() * 2 * Math.PI;
            
            // create the particle object
            var constructor = getConstructorFromType("photon");
            var particleObj = new constructor(x, y, dir);
            
            // set velocity of the particle
            particleObj.setEnergy(this.getEnergy());
            particleObj.setVelocityRad(dir);
            
            particles.push(particleObj);
        }
        return particles;
    }

MuonObj.prototype = new Particle();
MuonObj.prototype.constructor = MuonObj;
function MuonObj(x, y, dir) {
    Particle.call(this, x, y, dir);
    this.type = "muon";
    this.shape.setFill("red");
    this.shape.setStroke("green");
    this.lifetime = Infinity;
}

ProtonObj.prototype = new Particle();
ProtonObj.prototype.constructor = ProtonObj;
function ProtonObj(x, y, dir) {
    Particle.call(this, x, y, dir);
    this.type = "proton";
    this.shape.setFill("blue");
    this.shape.setStroke("white");
}

ElectronObj.prototype = new Particle();
ElectronObj.prototype.constructor = ElectronObj;
function ElectronObj(x, y, dir) {
    Particle.call(this, x, y, dir);
    this.type = "electron";
    this.shape.setFill("yellow");
    this.shape.setStroke("white");
}

PositronObj.prototype = new Particle();
PositronObj.prototype.constructor = PositronObj;
function PositronObj(x, y, dir) {
    Particle.call(this, x, y, dir);
    this.type = "positron";
    this.shape.setFill("yellow");
    this.shape.setStroke("black");
}

PhotonObj.prototype = new Particle();
PhotonObj.prototype.constructor = PhotonObj;
function PhotonObj(x, y, dir) {
    Particle.call(this, x, y, dir);
    this.type = "photon";
    this.penetrable = true;
    this.q = 0;
    
    this.shape.setRadius(2);
    this.shape.setFill("yellow");
    this.shape.setStroke("white");
}




function getConstructorFromType(type) {
    if (type == "single-source") return SingleSourceObj;
    else if (type == "burst-source") return BurstSourceObj;
    else if (type == "fixed-target") return FixedTargetObj;
    else if (type == "collision-target") return CollisionTargetObj;
    else if (type == "block") return BlockObj;
    else if (type == "mag-field") return MagFieldObj;
    else if (type == "strong-mag-field") return StrongMagFieldObj;
    else if (type == "alt-mag-field") return AltMagFieldObj;
    else if (type == "elec-field") return ElecFieldObj;
    else if (type == "muon") return MuonObj;
    else if (type == "proton") return ProtonObj;
    else if (type == "electron") return ElectronObj;
    else if (type == "positron") return PositronObj;
    else if (type == "photon") return PhotonObj;
    return;
}
