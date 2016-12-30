import loadCanvas from './canvas';
import './mutate';

// init

export let canvas, tree = {};

// grab ?resolution= URL param
let resolution = ((location.search.slice(location.search.indexOf('=')+1)))||1;

export const width = 144 * resolution,
    height = (width/4)*3,
    cubeSize = width / 9,
    maxDepth = 10,
    octAngle = Math.PI/4,
    blankCanvas = (' '.repeat(width)).repeat(height);

// init

document.addEventListener('DOMContentLoaded', () => {
    canvas = loadCanvas(width, height);
    render();
});

~function drawTree(node, depth = 0) {

    if (depth >= maxDepth) return;

    else if (!depth) {
        // draw extra root at depth 0
        node.cube = {
            parent: null,
            x: null,
            y: null,
            rot: 0,
            scale: 1,
            depth: -1
        };
    }

    let left = {
        parent: node.cube,
        x: -.5,
        y: -1,
        rot: -octAngle,
        scale: Math.cos(octAngle),
        depth
    };

    let right = {
        parent: node.cube,
        x: .5,
        y: -1,
        rot: octAngle,
        scale: Math.cos(octAngle),
        depth
    };

    node.children = [{cube: left}, {cube: right}];

    node.children.forEach((child) => {
        drawTree(child, depth+1);
    });

} (tree);

// renderer

export function render(forceMaxDepth) {

    requestAnimationFrame(function() {

        let vram = [...blankCanvas];

        ~function recurse(node) {

            if (forceMaxDepth && node.cube.depth >= forceMaxDepth) {
                return;
            }

            drawCube(node.cube, vram);

            node.children &&
            node.children.forEach(recurse);

        } (tree);

        canvas.render(vram);

    });

}

function drawCube(cube, vram) {

    // this method mutates the tree

    let { x, y, scale, rot = 0, parent, depth } = cube;

    let size;

    if (parent === null) {
        // root node
        x = cube.xAbs = (width/2);
        y = cube.yAbs = (height)-(cubeSize/2);
        size = cube.size = cubeSize;
        cube.rotAbs = 0;
        cube.scaleAbs = 1;
    }
    else {
        // store relative and absolute positions for a better API
        scale = cube.scaleAbs = (scale * parent.scaleAbs);
        size = cube.size = cubeSize * scale;
        x = parent.xAbs + (x*parent.size);
        y = parent.yAbs + (y*parent.size);
        // adjust for parent rotation
        if (parent.rot) {
            let rotCos = Math.cos(parent.rotAbs);
            let rotSin = Math.sin(parent.rotAbs);

            // rotate around parent origin
            let [xT, yT] = [
                x - parent.xAbs,
                y - parent.yAbs
            ];

            // apply matrix
            let rotX = (xT * rotCos) - (yT * rotSin);  
            let rotY = (xT * rotSin) + (yT * rotCos);

            x = rotX + parent.xAbs|0;
            y = rotY + parent.yAbs|0;
        }
        rot = cube.rotAbs = rot + parent.rotAbs;
        cube.xAbs = x;
        cube.yAbs = y;
    }

    // massive performance improvement;
    // don't render if it falls outside the box
    // if (
    //     x < -size/2
    //     || x > width + size/2
    //     || y < -size/2
    //     || y > height + size/2
    // ) return;

    // move to top right
    x = x - (size/2);
    y = y - (size/2);

    let indices = [];

    for (let i = 0; i < size**2; i++) { 
        indices.push([(i%size), (i/size)]);
    }

    if (rot) {
        let rotCos = Math.cos(rot);
        let rotSin = Math.sin(rot);

        for (let i = 0; i < indices.length;i++) {

            let [x, y] = indices[i];

            // adjust for rot origin
            let [xT, yT] = [x - (size/2), y - (size/2)];

            // apply matrix
            let rotX = (xT * rotCos) - (yT * rotSin);  
            let rotY = (xT * rotSin) + (yT * rotCos);

            indices[i] = [
                rotX + Math.round(size/2),
                rotY + Math.round(size/2)
            ];
        }
    }

    for (let i = 0; i < indices.length;i++) {

        let [ix, iy] = indices[i];

        draw(x + ix, y + iy, vram, canvas.glyphs[depth+1]);
    }

}

function draw(x, y, vram, ch = '?') {

    let index = canvas.findIndex(x, y);

    // prevent wrapping
    if (
        x >= 0
        && x <= width
        && y < height
        && y >= 0
        && index >= 0
        && index < vram.length
    ) {
        vram[index] = ch;
    }
}