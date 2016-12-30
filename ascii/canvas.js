import chunk from 'lodash.chunk';
import styles from './styles.scss';

export default function(width, height) {

    // load render target

    let canvas = {
        node: document.createElement('pre'),
        debug: '',
        init: false,
        width: width,
        height: height
    };

    document.body.appendChild(canvas.node);

    canvas.findIndex = (x,y) => {
        return (x|0) + ((y|0) * canvas.width);
    };

    canvas.findXY = (index) => {

    };

    // responsiveness
    
    canvas.respond = function() {
        requestAnimationFrame(function (){
            if (!canvas.rawWidth) {
                let { width, height } = canvas.node.getBoundingClientRect();
                canvas.rawWidth = width;
                Object.assign(colourWrapper.style, {
                    width: width + 'px',
                    height: height + 'px',
                });
            }
            
            let scaleX = window.innerWidth / canvas.rawWidth;
            canvas.node.style.transform = `scale(${scaleX})`;
            colourWrapper.style.transform = `scale(${scaleX})`;

        });
    };

    window.addEventListener('resize', canvas.respond);

    // colour interface

    let colourWrapper = document.createElement('div');
    colourWrapper.className = styles.colourWrapper;

    let pixels = document.createElement('div');
    document.body.appendChild(colourWrapper);
    colourWrapper.appendChild(pixels);

    // account for font rendering differences in different browsers / OS
    // yes really
    let osStr = navigator.appVersion;
    if (window.chrome && window.chrome.webstore) {
        // chrome
        if (~osStr.indexOf('Win')) { 
            // pixels.style.width = '7px';
            // pixels.style.height = '6.3px';
        }
        else if (~osStr.indexOf('Linux')) {
            pixels.style.width = '6px';
            pixels.style.height = '6.3px';
            pixels.style.transform = 'scaleX(1.102) scaleY(1.002)';
        }
    }
    else if (typeof InstallTrigger !== 'undefined') {
        // firefox
        pixels.style.width = '7px';
        pixels.style.height = '6.9px';
        pixels.style.transform = 'scaleY(1.106)';
    }
    else if (window.StyleMedia) {
        // IE Edge
        // pixels.style.width = '6.6px';
        // pixels.style.height = '6.98px';
    }
    canvas.pixels = pixels;

    // renderer

    canvas.render = function(vram) {

        if (canvas.debug) {
            let location = vram.length - (width*2) + 1;
            [...canvas.debug].forEach((ch, i) => {
                vram[location + i] = ch;
            });
        }

        generateBoxShadow(canvas, vram);

        canvas.node.textContent = formatVRAM(vram, width);

        if (!canvas.init) {
            canvas.respond();
            canvas.init = true;
        }
    };

    return canvas;

}

function formatVRAM(vram, width) {
    let lines = chunk(vram, width);
    return lines.map((d) => d.join``).join`\n`;
}

// colourRAM

let palette = '4054274483582782982a84b77d5bd2fe3'.match(/.../g).map((c)=>'#'+c);

function generateBoxShadow(canvas, vram) {

    let { pixels } = canvas;

    let colourRAM = [];

    let [ width, height ] = [
        parseInt(pixels.style.width, 10),
        parseInt(pixels.style.height, 10)
    ];

    if (!width || !height) {
        canvas.debug = 'Error: colours are not available for this browser/OS';
        return;
    }

    for (let i=0;i<canvas.width;i++) {
        colourRAM.push(getPixel(palette[0], i, 0, width, height));
        colourRAM.push(getPixel(palette[1], i, canvas.height-1, width, height));
    }
    for (let i=0;i<canvas.height;i++) {
        colourRAM.push(getPixel(palette[2], 0, i, width, height));
        colourRAM.push(getPixel(palette[3], canvas.width-1, i, width, height));
    }

    // for (let i=0;i < vram.length;i++) {
    //     if (vram == '█') {
    //         console.log(vram);
    //     }
    // }

    pixels.style.boxShadow = colourRAM.join`,`;

}

function getPixel(colour, x, y, w, h) {
    return `${x*w}px ${y*h}px ${colour}`;
}

