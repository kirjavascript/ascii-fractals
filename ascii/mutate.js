import { scaleLinear } from 'd3-scale';
import { render, canvas, tree, octAngle, maxDepth } from './index';

let globalScale = scaleLinear().domain([1,0]).range([0,2]);

window.addEventListener('mousemove', (e) => {
    // let tilt = ((e.pageX / window.innerWidth) -.5) * 4;
    // let scale = (e.pageY / window.innerHeight);
    // let gScale = globalScale(scale);
    // mutate(tilt, gScale);
});

function mutate(tiltDelta, gScale) {

    ~function recurse(node) {

        if (!node.children) return;

        let [left, right] = node.children;
        
        {   // left

            let angle = (octAngle/3)*(3 + tiltDelta);

            // angle *= gScale;

            let scale = Math.cos(angle) * gScale;
            let rotation = -angle * gScale;

            left.cube.scale = scale;
            left.cube.rot = rotation;

            let { dx, dy } = dxdy(angle, gScale);

            // console.log(dx);

            let calcX = (-.5 - dx) * gScale;
            let calcY = (-1 + dy) * (gScale);

            left.cube.x = (calcX);
            left.cube.y = (calcY);
        }

        {   // right
            let angle = (octAngle/3)*(3 - tiltDelta);

            let scale = Math.cos(angle) * gScale;
            let rotation = angle * gScale;

            right.cube.scale = scale;
            right.cube.rot = rotation;

            let { dx, dy } = dxdy(angle, gScale);

            let calcX = (.5 + dx) * gScale;
            let calcY = (-1 + dy) * gScale;

            right.cube.x = (calcX);
            right.cube.y = (calcY);
        }

        if (node.children) {
            node.children.forEach(recurse);
        }

    } (tree);

    // trim the tree a little when things get heavy

    render(do {
        if (gScale > 1.2) {
            maxDepth - (((gScale-1.2)*6)|0);
        }
    });
}

function dxdy(angle, gScale = 1) {

    // dx

    let squRadius = ((Math.cos(angle)) / Math.SQRT2); // circle radius

    let dx = squRadius * Math.tan(angle-octAngle); // actual dx - 0.5

    // dy

    let dxHyp = Math.cos((octAngle*2)-angle) * (Math.cos(angle)); // dx of hyp

    let dy = Math.cos(angle-octAngle) * (((0.5)-dxHyp) + dx);

    return { dx, dy };
}