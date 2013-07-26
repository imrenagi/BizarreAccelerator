var stage;
var runTimerID = 0;

function requestStage(stageNum) {
    $.ajax({
        "type": "POST",
        "url" : "stage-loader.php",
        "data": {s: stageNum}, // add cookie here ???
        "dataType": "json",
        "success": function(json) {
            if (json.eligible) {
                stage = new Stage(json);
                stage.setup();
            }
            else {
                alert("Please pass the previous stages first");
                loadPage("stage-selection.html");
            }
        }
    });
}

function Stage(data) {
    this.data = data;
    
    // stage-specific variables
    this.map = data.map;
    this.goal = data.map.goal;
    this.utilities = data.utilities;
    this.particleType = data.map.particle;
    
    // predefined constants
    this.stage_container = "stage-container";
    
    this.stage;
    this.layer; this.particlesLayer; this.utilsLayer;
    this.anim;
    this.playStatus = 0;
    
    // objects in the map
    this.src; this.target;
    this.paths = [];
    this.particles = [];
    
    this.objects = [];
    this.particles = [];
}

/* stage setup functions */
Stage.prototype.setup = function() {
    this.layer = new Kinetic.Layer();
    this.particlesLayer = new Kinetic.Layer();
    this.utilsLayer = new Kinetic.Layer();
    
    this.setStageMap();
    this.setGoal();
    this.setUtilities();
    
    this.draw();
}

Stage.prototype.setStageMap = function() {
    
    // set canvas stage according to map's grid
    this.stage = new Kinetic.Stage({
        container: this.stage_container,
        width : this.map.w,
        height: this.map.h
    });
    
    // add initial objects on the map
    this.addSource(this.makeObjFromElmt(this.map.src));
    this.addTarget(this.makeObjFromElmt(this.map.goal));
    for (var i = 0; i < this.map.elmts.length; i++)
        this.addPath(this.makeObjFromElmt(this.map.elmts[i]));
    
    // disable drag in the fixed map layer // ???
}

Stage.prototype.setGoal = function() {
    // set display for energy target ???
}

Stage.prototype.setUtilities = function() {
    // set utilities that user can use ???
}

/* Create a corresponding object from element.
 * Element means basic object structure that only has "type", "pos", and "dir".
 * When an element is converted to an object, it has additional method, like .move(), etc
 */
Stage.prototype.makeObjFromElmt = function(elmt) {
    var constructor = getConstructorFromType(elmt.type);
    var obj = new constructor(elmt.pos[0], elmt.pos[1], elmt.dir);
    return obj;
}


/* Add an element to the canvas layer (to be drawn on canvas)
 * an element must have attribute "type", "pos", and "dir"
 * * type: image and shape of the element will be determined based on its type
 * * pos : position of the element on the grid
 * * dir : 0 upward, 1 right, 2 downward, or 3 left
 */
Stage.prototype.addSource = function(srcObj) {
    this.src = srcObj;
    this.layer.add(srcObj.shape);
}

Stage.prototype.addTarget = function(targetObj) {
    this.target = targetObj;
    this.layer.add(targetObj.shape);
}

Stage.prototype.addPath = function(pathObj) {
    this.paths.push(pathObj);
    this.layer.add(pathObj.shape);
}

Stage.prototype.addParticles = function(particleObj) {
    this.particles.push(particleObj);
    this.particlesLayer.add(particleObj.shape);
}

Stage.prototype.removeParticle = function(particle) {
    // remove from particles array
    var idx = -1;
    for (var i = 0; i < this.particles.length; i++) {
        if (this.particles[i] == particle) {
            idx = i;
            this.particles.splice(i, 1);
            break;
        }
    }
    
    if (idx != -1) 
        this.particlesLayer.children[idx].remove();
}

Stage.prototype.draw = function() {
    this.stage.add(this.layer);
    this.stage.add(this.utilsLayer);
    this.stage.add(this.particlesLayer);
}


/* Stage runtime functions */
Stage.prototype.play = function() {
    this.playStatus = 1;
    if (runTimerID == 0) this.run();
}

Stage.prototype.pause = function() {
    this.playStatus = 0;
}

Stage.prototype.stop = function() {
    // this.playStatus = 0;
    clearTimeout(runTimerID);
    runTimerID = 0;
    
    // reset source
    this.src.reset();
    
    // delete all particles
    for (var i = 0; i < this.particles.length; i++) {
        this.removeParticle(this.particles[0]);
    }
    // this.particles = [];
    // this.particlesLayer.removeChildren();
}

// this is perhaps the longest function in this file
Stage.prototype.run = function() {
    if (this.playStatus == 1) {
        
        this.stage.clear();
        
        // ****** move all particles ******
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].move();
        }
        
        // ****** detect collisions among particles, between particles and objects ******
        var allObjects = this.particles.concat(this.paths);
        allObjects = allObjects.concat([this.src, this.target]);
        
        var colliders = [];
        // check all particles - objects combinations for collision
        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            
            for (var j = 0; j < allObjects.length; j++) {
                var object = allObjects[j];
                
                // if they are same, just skip it
                if (particle == object) {
                    continue;
                }
                
                if (object.isCollide(particle)) {
                    colliders.push([particle, object]);
                }
            }
        }
        var getParticleIdx = function(objColliders) {
            var pIdx = -1;
            if (objColliders[0].group == "particle") pIdx = 0;
            else if (objColliders[1].group == "particle") pIdx = 1;
            return pIdx;
        }
        
        // ****** accelerate particles if in E or B ******
        for (var i = 0; i < colliders.length; i++) {
            var pIdx = getParticleIdx(colliders[i]);
            
            // if there is no particle collides, skip it
            if (pIdx == -1) continue;
            
            var p0 = colliders[i][pIdx]; // particle
            var p1 = colliders[i][1-pIdx]; // other object
            
            // treat particle as the object it touches
            if (p1.type == "mag-field" || p1.type == "strong-mag-field") {
                p0.doLorentzForce(p1.Bz);
            }
            else if (p1.type == "elec-field") {
                p0.doElectricForce(p1.E, p1.dir);
            }
        }
        
        // ****** delete particles if they hit some block ******
        for (var i = 0; i < colliders.length; i++) {
            var pIdx = getParticleIdx(colliders[i]);
            
            // if there is no particle collides, skip it
            if (pIdx == -1) continue;
            
            var p0 = colliders[i][pIdx]; // particle
            var p1 = colliders[i][1-pIdx]; // other object
            
            if (!p1.penetrable) {
                this.removeParticle(p0);
                if (p1.group == "particle") this.removeParticle(p1);
            }
        }
        
        // ****** delete particles if they are outside canvas ******
        for (var i = 0; i < this.particles.length; i++) {
            var d = 5; // deviation, just to make sure it's deleted after not showing at all
            var x = this.particles[i].shape.getX();
            var y = this.particles[i].shape.getY();
            // console.log(x, y, this.map.w, this.map);
            if (!(x >= -d && x < this.map.w+d && y >= -d && y < this.map.h+d))
                this.removeParticle(this.particles[i]);
        }
        
        // ****** emit particle if the source can emit ******
        if (this.src.canEmitParticle()) {
            var particleObj = this.src.emitParticle(this.particleType);
            this.addParticles(particleObj);
        }
        
        this.stage.draw();
    }
    
    
    var thisObj = this;
    runTimerID = setTimeout(function() {
        thisObj.run();
    }, 1000/C.fps)
}
