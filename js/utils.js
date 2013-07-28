// This file contains any geometry functions / mathematical operations

/* rotates point from xy0 respect to xyAxis with theta rad angle
 * return [x, y] array as final position
 */
function rotatePoint(xy0, xyAxis, theta) {
    var x0 = xy0[0];    var y0 = xy0[1];
    var xA = xyAxis[0]; var yA = xyAxis[1];
    var dx = x0-xA;     var dy = y0-yA;
    
    var phiF = theta + Math.atan2(dy, dx);
    var r = Math.sqrt(dx*dx + dy*dy);
    
    var xF = xA + r * Math.cos(phiF);
    var yF = yA + r * Math.sin(phiF);
    return [xF, yF];
}

// rotate more than 1 points that are collected to an array of coordinates "coords"
function rotateBox(coords, xyAxis, theta) {
    var newCoords = [];
    for (var i = 0; i < coords.length; i++) {
        newCoords.push(rotatePoint(coords[i], xyAxis, theta));
    }
    return newCoords;
}

function movePoint(xy0, dxy) {
    return [xy0[0]+dxy[0], xy0[1]+dxy[1]];
}

function moveBox(coords, dxy) {
    var newCoords = [];
    for (var i = 0; i < coords.length; i++) {
        newCoords.push(movePoint(coords[i], dxy));
    }
    return newCoords;
}

/* check if 2 boxes overlap, given their corners' coordinates */
function boxesOverlap(coords0, coords1) {
    return oneBoxInsideAnother(coords0, coords1) || oneBoxInsideAnother(coords1, coords0);
}

function oneBoxInsideAnother(coords0, coords1) {
    // get the coordinate of the box1's CM
    var xcm = 0;
    var ycm = 0;
    for (var i = 0; i < coords0.length; i++) {
        xcm += coords0[i][0];
        ycm += coords0[i][1];
    }
    xcm /= coords0.length;
    ycm /= coords0.length;
    
    // get the angle of the box
    var theta = Math.atan2(coords0[1][1]-coords0[0][1],coords0[1][0]-coords0[0][0]);
    
    // now get the width and height of the first box
    var dx01 = coords0[1][0] - coords0[0][0]; var dy01 = coords0[1][1] - coords0[0][1];
    var dx12 = coords0[2][0] - coords0[1][0]; var dy12 = coords0[2][1] - coords0[1][1];
    var w0 = Math.sqrt(dx01*dx01 + dy01*dy01);
    var h0 = Math.sqrt(dx12*dx12 + dy12*dy12);
    
    // transform the another box to a coordinate where the CM of the first box is the center
    var c1 = moveBox(coords1, [-xcm, -ycm]);
    c1 = rotateBox(c1, [0, 0], -theta);
    
    // check overlap for each point
    for (var i = 0; i < c1.length; i++) {
        var x = c1[i][0]; var y = c1[i][1];
        if (Math.abs(x) <= w0/2 && Math.abs(y) <= h0/2) return 1;
    }
    return 0;
}

// center of mass energy
function getCMEnergy(particles) {
    var sum = 0;
    for (var i = 0; i < particles.length; i++) {
        sum += particles[i].getEnergy();
    }
    return sum;
}
