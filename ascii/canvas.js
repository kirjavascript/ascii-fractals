import chunk from 'lodash.chunk';
import styles from './styles.scss';

export default function(width, height) {

    // load render target

    let canvas = {
        element: document.createElement('pre'),
        textNode: document.createTextNode(''),
        debug: '',
        init: false,
        width: width,
        height: height
    };

    canvas.element.appendChild(canvas.textNode);
    document.body.appendChild(canvas.element);

    canvas.findIndex = (x,y) => {
        return (x|0) + ((y|0) * canvas.width);
    };

    canvas.findXY = (index) => {
        return {
            x: index % canvas.width,
            y: (index / canvas.width)|0
        };
    };

    canvas.glyphs = '#$&?%≡=:*\'-·';

    canvas.colours = '4054274483582782982a84b77d5bd2fe3'
        .match(/.../g).map((c)=>'#'+c);

    // responsiveness
    
    canvas.respond = function() {
        requestAnimationFrame(function (){
            if (!canvas.rawWidth) {
                let { width, height } = canvas.element.getBoundingClientRect();
                canvas.rawWidth = width;
                Object.assign(colourWrapper.style, {
                    width: width + 'px',
                    height: height + 'px',
                });
            }
            
            let scaleX = window.innerWidth / canvas.rawWidth;
            canvas.element.style.transform = `scale(${scaleX})`;
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
    console.log(navigator.appVersion+ 'asd');
    if (window.chrome && window.chrome.webstore) {
        // chrome
        if (~osStr.indexOf('Win')) { 
            pixels.style.width = '7px';
            pixels.style.height = '6.3px';
        }
        else { // linux + mac
            pixels.style.width = '6px';
            pixels.style.height = '6.3px';
            pixels.style.transform = 'scaleX(1.1)';
        }
    }
    else if (typeof InstallTrigger !== 'undefined') {
        // firefox;
        if (~osStr.indexOf('Mac')) {
            pixels.style.width = '6px';
            pixels.style.height = '6px';
            pixels.style.transform = 'scaleX(1.1) scaleY(1.11)';
        }
        else { // window + linux
            pixels.style.width = '7px';
            pixels.style.height = '6.9px';
            pixels.style.transform = 'scaleY(1.106)';
        }
    }
    else if (window.StyleMedia) {
        // IE Edge
        pixels.style.width = '6px';
        pixels.style.height = '6px';
        pixels.style.transform = 'scaleX(1.1) scaleY(1.11)';
    }
    canvas.pixels = pixels;

    // renderer

    canvas.render = function(vram) {
        
        generateBoxShadow(canvas, vram);

        if (canvas.debug) {
            let location = vram.length - (width*2) + 1;
            [...canvas.debug].forEach((ch, i) => {
                vram[location + i] = ch;
            });
        }

        canvas.textNode.nodeValue = formatVRAM(vram, width);

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

function generateBoxShadow(canvas, vram) {

    let { pixels } = canvas;

    let colourRAM = [];

    let [ width, height ] = [
        parseInt(pixels.style.width, 10)|0,
        parseInt(pixels.style.height, 10)|0
    ];

    if (!width || !height) {
        canvas.debug = 'Error: colours are not available for this browser/OS';
        return;
    }

    for (let i=0;i < vram.length;i++) {
        if (vram[i] != ' ') {
            let depth = canvas.glyphs.indexOf(vram[i]);
            let { x, y } = canvas.findXY(i);
            colourRAM.push(getPixel(canvas.colours[depth], x, y, width, height));
        }
    }

    pixels.style.boxShadow = colourRAM.join`,`;

}

function getPixel(colour, x, y, w, h) {
    return `${x*w}px ${y*h}px ${colour}`;
}

