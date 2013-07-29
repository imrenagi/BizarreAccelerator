function Stage(data) {
    runTimerID = 0;
    this.data = data;
    this.stageName = data.stageName;
    
    // stage-specific variables
    this.map = data.map;
    this.goal = data.map.goal;
    this.utils = data.utilities;
    this.particleType = data.map.particle;
    
    // predefined constants
    this.stage_container = "stage-container";
    this.utils_container = "utils-container";
    this.utils_container_w = 300;
    this.utils_container_h = 100;
    
    this.stage;
    this.mBgLayer; this.mLayer; this.mParticlesLayer; this.mUtilsLayer;
    this.anim;
    this.playStatus = 0;
    
    // objects in the map
    this.bg;
    this.elements = [];
    this.utilsOnMap = [];
    this.particles = [];
    
    this.objects = [];
    this.particles = [];
}

/* stage setup functions */
Stage.prototype.setup = function() {
    // layers on the map
    this.mBgLayer = new Kinetic.Layer();
    this.mLayer = new Kinetic.Layer();
    this.mParticlesLayer = new Kinetic.Layer();
    this.mUtilsLayer = new Kinetic.Layer();
    
    // layers on the utilities canvas
    this.uImageLayer = new Kinetic.Layer();
    this.uNumLayer = new Kinetic.Layer();
    
    this.setStageMap();
    this.setGoal();
    this.setUtilities();
    
    this.draw();
}

// displaying map
Stage.prototype.setStageMap = function() {
    
    // set canvas stage according to map's grid
    this.stage = new Kinetic.Stage({
        container: this.stage_container,
        width : this.map.w,
        height: this.map.h
    });
    
    // add background
    this.bg = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: this.map.w,
        height: this.map.h,
        fill: "white"
    });
    this.mBgLayer.add(this.bg);
    
    // set the click handler on the background
    // if it's clicked, then add the selected utility onto the map
    // if there is no selected utility, then do nothing
    var thisObj = this;
    this.bg.on("click", function(evt) {
        // do nothing if there is no selected util
        if (!thisObj.canPlaceUtil()) return;
        
        var pos = thisObj.stage.getMousePosition();
        var x = parseInt(pos.x);
        var y = parseInt(pos.y);
        thisObj.placeUtil(x, y);
    });
    
    // add initial objects on the map
    for (var i = 0; i < this.map.elmts.length; i++) {
        var obj = this.makeObjFromElmt(this.map.elmts[i]);
        this.addElement(obj);
    }
    
    // disable drag in the fixed map layer // ???
}

Stage.prototype.setGoal = function() {
    // set display for energy target ???
}

Stage.prototype.setUtilities = function() {
    
    // set canvas for showing utilities
    this.utilsCanvas = new Kinetic.Stage({
        container: this.utils_container,
        width: this.utils_container_w,
        height: this.utils_container_h
    });
    
    // set all utils to be unselected
    for (var type in this.utils) {
        this.utils[type].selected = 0;
    }
    this.refreshUtils();
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


/* Add/remove an element to/from the map canvas layer (to be drawn on canvas)
 * an element must have attribute "type", "pos", and "dir"
 * * type: image and shape of the element will be determined based on its type
 * * pos : position of the element on the grid
 * * dir : 0 upward, 1 right, 2 downward, or 3 left
 */
Stage.prototype.addElement = function(elmtObj) {
    this.elements.push(elmtObj);
    this.mLayer.add(elmtObj.shape);
}

Stage.prototype.addUtil = function(utilObj) {
    this.utilsOnMap.push(utilObj);
    this.mUtilsLayer.add(utilObj.shape);
}

Stage.prototype.removeUtil = function(utilObj) {
    var idx = -1;
    var type = utilObj.type;
    for (var i = 0; i < this.utilsOnMap.length; i++) {
        if (this.utilsOnMap[i] == utilObj) {
            idx = i;
            this.utilsOnMap.splice(i, 1);
            this.utils[type].num += 1;
            break;
        }
    }
    if (idx != -1) {
        this.mUtilsLayer.children[idx].remove();
        this.refreshUtils();
        this.refresh();
    }
}

Stage.prototype.removeAllUtils = function() {
    var n = this.utilsOnMap.length;
    for (var i = 0; i < n; i++) {
        this.removeUtil(this.utilsOnMap[0]);
    }
    // this.mUtilsLayer.removeChildren();
}

Stage.prototype.addParticle = function(particleObj) {
    this.particles.push(particleObj);
    this.mParticlesLayer.add(particleObj.shape);
}

Stage.prototype.removeParticle = function(particleObj) {
    // remove from particles array
    var idx = -1;
    for (var i = 0; i < this.particles.length; i++) {
        if (this.particles[i] == particleObj) {
            idx = i;
            this.particles.splice(i, 1);
            break;
        }
    }
    
    if (idx != -1)
        this.mParticlesLayer.children[idx].remove();
}

Stage.prototype.removeAllParticles = function() {
    var n = this.particles.length;
    for (var i = 0; i < n; i++) {
        this.particles.pop();
    }
    this.mParticlesLayer.removeChildren();
}

Stage.prototype.draw = function() {
    this.stage.add(this.mBgLayer);
    this.stage.add(this.mLayer);
    this.stage.add(this.mUtilsLayer);
    this.stage.add(this.mParticlesLayer);
}

Stage.prototype.refresh = function() {
    this.stage.clear();
    this.draw();
}

/* getting elements on the map */
Stage.prototype.getSources = function() {
    var objects = this.elements.concat(this.utilsOnMap);
    var srcs = [];
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].group == "source") srcs.push(objects[i]);
    }
    return srcs;
}

Stage.prototype.getTargets = function() {
    var objects = this.elements.concat(this.utilsOnMap);
    var targets = [];
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].group == "target") targets.push(objects[i]);
    }
    return targets;
}

/* utilities functions */
Stage.prototype.refreshUtils = function() { // refresh the utils canvas according to current number of utilities in this.utils
    // clear canvas
    this.utilsCanvas.removeChildren();
    
    // clear all layers
    this.uImageLayer.removeChildren();
    this.uNumLayer.removeChildren();
    
    // set the position pointer // CONF
    var xMin = 10;
    var yMin = 10;
    var xMax = 150;
    var dx = 30;
    var dy = 30;
    var dir = 0;
    var x = xMin;
    var y = yMin;
    var xNum = 15;
    var yNum = 15;
    
    // add drawings to the utils canvas
    var type;
    for (type in this.utils) {
        // add the utilities objects images to the canvas
        var constructor = getConstructorFromType(type);
        var obj = new constructor(x, y, 0);
        
        // if it's selected
        if (this.utils[type].selected) {
            obj.shape.setStroke("brown"); // can be specified per object
        }
        
        // select/unselect util if it's clicked
        var thisObj = this;
        obj.on("click", function() {
            // toggle selected
            var selected = thisObj.utils[this.type].selected;
            thisObj.setSelectUtil(this.type, 1-selected);
            thisObj.refreshUtils();
        });
        
        // add the shape of the util
        this.uImageLayer.add(obj.shape);
        
        // add the number besides the image
        var num = this.utils[type].num;
        var numShape = new Kinetic.Text({
            x: x+xNum,
            y: y+yNum,
            text: num.toString(),
            fontSize: 10,
            fontFamily: "Calibri",
            fill: "black"
        });
        this.uNumLayer.add(numShape);
        
        // update the position
        x += dx;
        if (x > xMax) {
            x = xMin;
            y += dy;
        }
    }
    
    // add the new canvas
    this.utilsCanvas.add(this.uImageLayer);
    this.utilsCanvas.add(this.uNumLayer);
}

Stage.prototype.getSelectedUtil = function() { // get the type of util that is selected, 0 if none util is selected
    for (var type in this.utils) {
        if (this.utils[type].selected) return type;
    }
    return 0;
}

Stage.prototype.setSelectUtil = function(typeSelected, select) { // set the util to be selected/unselected
    for (var type in this.utils) this.utils[type].selected = 0;
    this.utils[typeSelected].selected = select;
}

Stage.prototype.canPlaceUtil = function() {
    var typeSelected = this.getSelectedUtil();
    if (typeSelected == 0) return false;
    return this.utils[typeSelected].num > 0;
}

Stage.prototype.placeUtil = function(x, y) { // place the selected util and return its object (precondition: there must be a selected util)
    var thisObj = this;
    
    // get the type of selected util
    var typeSelected = this.getSelectedUtil();
    
    // construct an object of the selected util
    var constructor = getConstructorFromType(typeSelected);
    var obj = new constructor(x, y, 0);
    
    // adjust the position
    obj.moveTo(obj.shape.getX()-obj.shape.getWidth()/2, obj.shape.getY()-obj.shape.getHeight()/2);
    
    // set the object to be draggable
    obj.shape.setDraggable(1);
    
    // if the object is dragged to a place with other object, then return it to the initial place
    var xInit = -1; var yInit = -1; var wasPlayed = 0;
    var thisObj = this; var dragged = 0;
    obj.shape.on("dragstart", function() {
        xInit = obj.shape.getX();
        yInit = obj.shape.getY();
        wasPlayed = thisObj.playStatus;
        thisObj.pause();
    });
    obj.shape.on("dragend", function() {
        obj.updateBoundingShape();
        
        // check whether the dragged object collides with other objects
        var colliders = thisObj.getAllColliders([obj], thisObj.elements);
        
        // if they collide, then return the object to its initial position
        if (colliders.length > 0) {
            obj.moveTo(xInit, yInit);
            thisObj.refresh();
        }
        // todo: add animation here ???
        
        if (wasPlayed) thisObj.play();
        dragged = 1;
    });
    
    // rotate the object if it's left-clicked or delete the object if it's right-clicked
    obj.shape.on("mouseup", function(e) {
        // detect right or left click
        var rightClick = false;
        if (e.which) rightClick = (e.which == 3);
        else if (e.button) rightClick = (e.button == 2);
        
        if (!rightClick) { // left click, rotate the object
            setTimeout(function() {
                // cancel this event if user only dragged it
                if (!dragged) {
                    obj.rotateOnClick();
                    thisObj.refresh();
                }
                else dragged = 0;
            }, 1);
            return true;
        }
        
        else { // right click, delete the object
            var type = obj.type;
            thisObj.removeUtil(obj);
            return false;
        }
    });
    
    obj.shape.on("mouseenter", function(e) {
        document.getElementsByTagName("body")[0].style.cursor = "pointer";
    });
    
    obj.shape.on("mouseleave", function(e) {
        document.getElementsByTagName("body")[0].style.cursor = "auto";
    });
    
    // add the util onto the map
    this.addUtil(obj);
    
    // reduce the number of the util
    this.utils[typeSelected].num -= 1;
    
    // refresh the utilities canvas and the map canvas
    this.refreshUtils();
    this.refresh();
    
    return obj;
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
    
    // reset sources
    var srcs = this.getSources();
    for (var i = 0; i < srcs.length; i++) srcs[i].reset();
    
    // reset targets
    var targets = this.getTargets();
    for (var i = 0; i < targets.length; i++) targets[i].reset();
    
    // delete all particles
    this.removeAllParticles();
    
    // refresh map
    this.refresh();
}

// this is perhaps the longest function in this file
Stage.prototype.run = function() {
    if (this.playStatus == 1) {
        
        var stageFinish = false; // indicates if the stage has finished
        
        // ****** move all particles ******
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].move();
        }
        
        // ****** detect collisions among particles, between particles and objects ******
        var allObjects = this.elements.concat(this.particles);
        allObjects = allObjects.concat(this.utilsOnMap);
        
        // check all particles - objects combinations for collision
        var colliders = this.getAllColliders(this.particles, allObjects);
        
        var getParticleIdx = function(objColliders) {
            var pIdx = -1;
            if (objColliders[0].group == "particle") pIdx = 0;
            else if (objColliders[1].group == "particle") pIdx = 1;
            return pIdx;
        }
        
        // ****** accelerate particles if in E or B, and check if it collides the target ******
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
            else if (p1.type == "alt-mag-field") {
                if (p1.magFieldIsActive()) {
                    p0.doLorentzForce(p1.Bz);
                }
            }
            else if (p1.type == "elec-field") {
                p0.doElectricForce(p1.E, p1.dir);
            }
            else if (p1.type == "xray") {
                if (!p0.penetrable) {
                    if (p1.canProduceXRay(p0)) {
                        var photons = p1.produceXRay(p0);
                        for (var i = 0; i < photons.length; i++) {
                            this.addParticle(photons[i]);
                        }
                    }
                }
            }
            else if (p1.group == "particle") {
                if (!(p0.penetrable || p1.penetrable)) {
                    var newParticles = p0.collisionParticles(p1);//.concat(p0.decayParticles());
                    for (var j = 0; j < newParticles.length; j++) {
                        this.addParticle(newParticles[j]);
                    }
                }
            }
            
            // **** check target/goal ****
            // check if a particle collides the target
            if (p1.type == "fixed-target") {
                if (p1.checkGoal(p0)) {
                    p1.goal();
                }
                
                p1.showParticleEnergy(p0.getEnergy());
            }
            // check if two particles collide inside the detector (collision target)
            else if (p1.group == "particle") {
                var targets = this.getTargets();
                for (var j = 0; j < targets.length; j++) {
                    if (targets[j].type == "collision-target") {
                        if (p0.isCollide(targets[j]) && p1.isCollide(targets[j])) {
                            if (targets[j].checkGoal(p0, p1)) {
                                targets[j].goal();
                            }
                        }
                    }
                }
            }
        }
        
        
        // ****** delete particles if they hit some block ******
        for (var i = 0; i < colliders.length; i++) {
            var pIdx = getParticleIdx(colliders[i]);
            
            // if there is no particle collides, skip it
            if (pIdx == -1) continue;
            
            var p0 = colliders[i][pIdx]; // particle
            var p1 = colliders[i][1-pIdx]; // other object
            
            if (!(p1.penetrable || p0.penetrable)) {
                this.removeParticle(p0);
                if (p1.group == "particle") this.removeParticle(p1);
            }
        }
        
        // ****** delete particles if they have zero lifetime ******
        for (var i = 0; i < this.particles.length; i++) {
            if (this.particles[i].lifetime <= 0) {
                var newParticles = this.particles[i].decayParticles();
                for (var j = 0; j < newParticles.length; j++) {
                    this.addParticle(newParticles[j]);
                }
                this.removeParticle(this.particles[i]);
            }
        }
        
        // ****** delete particles if they are outside canvas ******
        for (var i = 0; i < this.particles.length; i++) {
            var d = 5; // deviation, just to make sure it's deleted after not showing at all
            var x = this.particles[i].shape.getX();
            var y = this.particles[i].shape.getY();
            if (!(x >= -d && x < this.map.w+d && y >= -d && y < this.map.h+d))
                this.removeParticle(this.particles[i]);
        }
        
        // ****** emit particle if the source can emit ******
        var srcs = this.getSources();
        for (var i = 0; i < srcs.length; i++) {
            if (srcs[i].canEmitParticle()) {
                var particleObj = srcs[i].emitParticle();
                this.addParticle(particleObj);
            }
        }
        
        this.postRunProcess();
        this.refresh();
        
        // finish the stage
        var targets = this.getTargets();
        var finish = true;
        for (var i = 0; i < targets.length; i++) {
            if (!targets[i].finish) finish = false;
        }
        if (finish && targets.length > 0) this.finishStage();
    }
    
    var thisObj = this;
    runTimerID = setTimeout(function() {
        thisObj.run();
    }, 1000/C.fps)
}

Stage.prototype.finishStage = function() {
    this.pause();
    alert("Congratulations!"); // todo: add some special congratulation here
    this.stop();
    
    clearTimeout(runTimerID);
    runTimerID = 0;
    
    goToNextStage(this.stageName);
}

Stage.prototype.postRunProcess = function() {
    var allObjects = this.particles.concat(this.elements);
    allObjects = allObjects.concat(this.utilsOnMap);
    
    for (var i = 0; i < allObjects.length; i++) {
        allObjects[i].postProcess();
    }
}

// return all pairs of objects from objs0 that collide with objects in objs1
// return format: [[obj0A, obj1A], [obj0B, obj1B], ...] with no same pair
Stage.prototype.getAllColliders = function(objs0, objs1) {
    var colliders = [];
    
    var arrayContainsPair = function(arr, pair) {
        for (var i = 0; i < arr.length; i++) {
            if ((arr[i][0] == pair[0]) && (arr[i][1] == pair[1])) return true;
            if ((arr[i][1] == pair[0]) && (arr[i][0] == pair[1])) return true;
        }
        return false;
    }
    
    for (var i = 0; i < objs0.length; i++) {
        var obj0 = objs0[i];
        
        for (var j = 0; j < objs1.length; j++) {
            var obj1 = objs1[j];
            
            // if they are same, just skip it
            if (obj0 == obj1) {
                continue;
            }
            
            if (obj0.isCollide(obj1) == 1) {
                var pair = [obj0, obj1];
                if (!arrayContainsPair(colliders, pair)) colliders.push(pair);
            }
        }
    }
    
    return colliders;
}

// get the configuration basic object of all elements on the map
Stage.prototype.getConfigObj = function() {
    var objects = this.elements.concat(this.utilsOnMap);
    
    var conf = {};
    conf.stageName = "";
    conf.map = {};
    conf.map.w = this.map.w;
    conf.map.h = this.map.h;
    conf.map.elmts = [];
    
    for (var i = 0; i < objects.length; i++) {
        var obj = {};
        obj.type = objects[i].type;
        obj.pos = [objects[i].shape.getX(), objects[i].shape.getY()];
        obj.dir = objects[i].dir;
        conf.map.elmts.push(obj);
    }
    
    return conf;
}