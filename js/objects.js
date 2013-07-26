function GameObj() {
    this.group = "none";
    this.penetrable = false; // all objects are impenetrable by default
    this.boundingShape = {
        "type": "box",
        "coords": [[0,0]]
    }
}

GameObj.prototype.isCollide = function(obj) {
    // now only box-box supported
    if (this.boundingShape.type == "box" && obj.boundingShape.type == "box") {
        return boxesOverlap(this.boundingShape.coords, obj.boundingShape.coords);
    }
    return false;
}





Source.prototype = new GameObj();
Source.prototype.constructor = Source;
function Source(x, y, dir) {
    GameObj.call(this);
    this.group = "source";
    this.penetrable = true;
    
    var radius = 15;
    var angleDeg = 60;
    var rotationDeg = 150 + dir * 180 / Math.PI;
    
    // getting its bounding box if it's placed in (0,0) with 0 dir
    var bbxMax = 0;
    var bbxMin = -radius * Math.cos(angleDeg/2 * Math.PI/180);
    var bbyMax =  radius * Math.sin(angleDeg/2 * Math.PI/180);
    var bbyMin = -bbyMax;
    var boundingBox = [[bbxMin, bbyMin], [bbxMax, bbyMin], [bbxMax, bbyMax], [bbxMin, bbyMax]];
    
    // then let's transform it
    boundingBox = rotateBox(boundingBox, [0,0], dir);
    boundingBox = moveBox(boundingBox, [x,y]);
    
    this.boundingShape = {
        "type": "box",
        "coords": boundingBox
    }
    
    this.dir = dir;
    this.type = "source";
    
    this.shape = new Kinetic.Wedge({
        x: x,
        y: y,
        radius: radius,
        angleDeg: angleDeg,
        rotationDeg: rotationDeg,
        strokeWidth: 1
    });
    
    this.energy = 0;
    this.canEmit = 1;
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
    this.energy = 1000;
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
    this.energy = 1000;
    
    this.emitCountDownVal = 10;
    this.emitCountDown = this.emitCountDownVal;
}

    BurstSourceObj.prototype.canEmitParticle = function() {
        if (!this.canEmit) this.emitCountDown -= 1;
        if (this.emitCountDown == 0) this.canEmit = 1;
        return Source.prototype.canEmitParticle.call(this);
    }

    BurstSourceObj.prototype.emitParticle = function(particleType) {
        var particleObj = Source.prototype.emitParticle.call(this, particleType);
        this.canEmit = 0;
        var thisObj = this;
        this.emitCountDown = this.emitCountDownVal;
        return particleObj;
    }





Target.prototype = new GameObj();
Target.prototype.constructor = Target;
function Target(x, y, dir) {
    GameObj.call(this);
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
    
    this.boundingShape = {
        "type": "box",
        "coords": [[x,y], [x+width,y], [x+width,y+height], [x,y+height]]
    }
    
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
}





Path.prototype = new GameObj();
Path.prototype.constructor = Path;
function Path(x, y, dir) {
    GameObj.call(this);
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
    
    this.boundingShape = {
        "type": "box",
        "coords": [[x,y], [x+width,y], [x+width,y+height], [x,y+height]]
    }
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
    this.shape.setFill("blue");
    this.shape.setStroke("black");
    
    this.Bz = 3.15;
}

AltMagFieldObj.prototype = new Path();
AltMagFieldObj.prototype.constructor = AltMagFieldObj;
function AltMagFieldObj(x, y, dir) {
    Path.call(this, x, y, dir);
    this.type = "alt-mag-field";
    this.shape.setFill("yellow");
    this.shape.setStroke("black");
}

ElecFieldObj.prototype = new Path();
ElecFieldObj.prototype.constructor = ElecFieldObj;
function ElecFieldObj(x, y, dir) {
    Path.call(this, x, y, dir);
    this.E = 100;
    this.type = "elec-field";
    this.shape.setFill("red");
    this.shape.setStroke("black");
}






Particle.prototype = new GameObj();
Particle.prototype.constructor = Particle;
function Particle(x, y, dir) {
    GameObj.call(this);
    this.group = "particle";
    var r = 4;
    
    this.type = "particle";
    this.shape = new Kinetic.Circle({
        x: x,
        y: y,
        radius: r,
        strokeWidth: 1
    });
    this.boundingShape = {
        "type": "box",
        "coords": [[x-r/2,y-r/2],[x+r/2,y-r/2],[x+r/2,y+r/2],[x-r/2,y+r/2]]
    }
    
    this.m = 1; // in eV/c^2
    this.vx = 0;
    this.vy = 0;
    this.q = 1; // in fundamental charge unit
    
    this.exist = 1;
}

    Particle.prototype.move = function() {
        var dx = this.vx * C.dt;
        var dy = this.vy * C.dt;
        this.shape.setX(this.shape.getX() + dx);
        this.shape.setY(this.shape.getY() + dy);
        this.boundingShape.coords = moveBox(this.boundingShape.coords, [dx, dy]);
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

MuonObj.prototype = new Particle();
MuonObj.prototype.constructor = MuonObj;
function MuonObj(x, y, dir) {
    Particle.call(this, x, y, dir);
    this.type = "muon";
    this.shape.setFill("red");
    this.shape.setStroke("green");
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
    return;
}
