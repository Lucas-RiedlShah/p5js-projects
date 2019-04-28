//Need to stop p5 from listening for key presses when editing input values with keyboard.
let particles = []
let qtree
let gui
let endSim = false
let pageIsLoaded = false

let settings = {
    'Reset Canvas (R)': resetSketch,
    'End Simulation (E)': function(){endSim=true},
    'Save As PNG (S)': function(){saveCanvas(canvas, 'central-vibrance', 'png')},
    "canvas": {
        "width": 1024,
        _width: {min:1,max:8192,step:1},
        "height": 1024,
        _height: {min:1,max:8192,step:1}
    },
    _canvas: {openFolder:true,name:'Canvas Size'},
    "originRadius": {
        "ignoreRadius": false,
        "min": 0,
        "max": 192,
        _all: {min:0,max:8192,step:1}
    },
    _originRadius: {openFolder:true,name:'Origin Radius'},
    "particleCount": 100,
    _particleCount: {min:1,max:400,step:1,name:'Particle Count'},
    "mouseAttractsParticles": false,
    "mouseAttractionRange": 100,
    _mouseAttractionRange: {min:0,max:4096,step:1,name:'Mouse Attraction Range',hide:true},
    "bounceEdges": false,
    "drawTrails": true,
    "maxStartingVelocity": 1,
    _maxStartingVelocity: {min:0,max:100,step:0.01},
    "maxVelocity": 1,
    _maxVelocity: {min:0,max:100,step:0.01},
    "lockAxis": {
        "xAxis": false,
        "yAxis": false
    },
    "colors": {
        "showParticles": false,
        _showParticles: {name:"Show Particles"},
        "particleOutline": {
            "particleWidth": 25,
            "particleHeight": 25,
            "drawOutline": true,
            "particleOutlineColor": "#ffffff",
            "particleOutlineAlpha": 255,
            _particleOutlineAlpha: {min:0,max:255,step:1},
            _all:{min:0,max:250,step:1}
        },
        _particleOutline: {name: "Particle Outline",hide:true},
        "backgroundColor": {r:21,g:21,b:21},
        _backgroundColor: {name:'Background Color',type:'color'},
        "backgroundAlpha": 255,
        _backgroundAlpha: {min:0,max:255,step:1,name:'Background Alpha'},
        "particleColorType": 'randomRGBA',
        _particleColorType: {type:'select',name:'Particle Color Type',options:['randomRGBA','randomHSLA','gradient']},
        "randomRGBA": {
            "redMin": 0,
            "redMax": 255,
            "greenMin": 0,
            "greenMax": 255,
            "blueMin": 0,
            "blueMax": 255,
            "alphaMin": 0,
            "alphaMax": 255,
            _all: {min:0,max:255,step:1}
        },
        _randomRGBA: {openFolder:true},
        "randomHSLA": {
            "hueMin": 0,
            "hueMax": 255,
            "saturationMin": 0,
            "saturationMax": 255,
            "lightnessMin": 0,
            "lightnessMax": 255,
            "alphaMin": 0,
            "alphaMax": 255,
            _all: {min:0,max:255,step:1}
        },
        "gradient": {
            "firstColor": '#ffffff',
            "secondColor": '#000000',
            "alphaMin": 0,
            "alphaMax": 255,
            _all: {type:'color',min:0,max:255,step:1}
        },
        "image":{
            "Open File": function() {console.log('this code needs writing')},
            "alphaMin": 0,
            "alphaMax": 255,
            _all: {min:0,max:255,step:1}
        },
        _all: {openFolder:true,hide:true}
    },
    _colors: {openFolder:true,name:'Colors'},
    "lines": {
        "connectPoints": true,
        "changeSpeedConnected": true,
        changeSpeedChance: 0.1,
        _changeSpeedChance: {min:0,max:1,step:0.01},
        "changeSpeedBy": 0.97,
        _changeSpeedBy: {min:-4,max:4,step:0.01},
        "maxLineDist": 25,
        _maxLineDist: {min:1,max:512,step:1}
    },
    'Attract Particles to Center': true,
    "centerAttractionForce": {
        "chance": 0.1,
        _chance: {min:0,max:1,step:0.0001,name:'Chance of Forces'},
        "radius": 128,
        _radius: {min:0,max:8192,step:1},
        "outside":{
            "min": -1,
            "max": 1,
            _all: {min:-100,max:100,step:0.01}
        },
        _outside: {openFolder:true,name:"Force Outside Of Center"},
        "inside":{
            "min": -2,
            "max": 2,
            _all: {min:-100,max:100,step:0.01}
        },
        _inside: {openFolder:true,name:"Force Inside Center"},
        "extra": {
            "chance": 0.005,
            _chance: {min:0,max:1,step:0.0001},
            "min": -5,
            "max": 5,
            _all: {min:-100,max:100,step:0.01}
        },
        _extra: {openFolder:true,name:'Extra Force Inside Center'}
    },
    _centerAttractionForce: {name:'Central Attraction Force'}
}

function setup() {
    let ratio = windowWidth / windowHeight
    if(ratio > 1) {
        settings['canvas']['width'] = 1920
        settings['canvas']['height'] = 1920 / ratio
    } else {
        settings['canvas']['width'] = 1920 * ratio
        settings['canvas']['height'] = 1920
    }
    canvas = createCanvas(settings['canvas']['width'], settings['canvas']['height']).parent("canvas-container")
    resetSketch()
}

function draw() {
    qtree.clear()
    for (let particle of particles) {
        qtree.insert(particle)
        particle.checked = false
    }

    if (!settings['drawTrails']) {
        colorMode(RGB, 255)
        background(settings['colors']['backgroundColor']['r'],settings['colors']['backgroundColor']['g'],settings['colors']['backgroundColor']['b'],settings['colors']['backgroundAlpha'])
    }

    // qtree.p5show()

    for (var i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].capVel(settings['maxVelocity'], settings['lockAxis']['xAxis'], settings['lockAxis']['yAxis'])

        if(settings['colors']['showParticles']) {
            particles[i].show(settings['colors']['particleOutline']['particleWidth'],settings['colors']['particleOutline']['particleHeight'], settings['colors']['particleOutline']['drawOutline'], settings['colors']['particleOutline']['particleOutlineColor'], settings['colors']['particleOutline']['particleOutlineAlpha'])
        }

        if(settings['bounceEdges']) {
            particles[i].bounceCanvasEdge()
        }

        if(settings['mouseAttractsParticles']) {
            particles[i].mouseAttract(settings['mouseAttractionRange'])
        }

        if(Math.random() < settings['centerAttractionForce']['chance'] && settings['Attract Particles to Center']) {
            let attractCenterForce = createVector(width/2, height/2)
            attractCenterForce.sub(particles[i].pos)
            if(dist(particles[i].pos.x, particles[i].pos.y, width/2, height/2) > settings['centerAttractionForce']['radius']) {
                if(Math.random() < 0.5) {
                    attractCenterForce.setMag(random(settings['centerAttractionForce']['outside']['min'], settings['centerAttractionForce']['outside']['max']))
                } else {
                    attractCenterForce.setMag(0)
                }
            } else {
                if(Math.random() < settings['centerAttractionForce']['extra']['chance']) {
                    attractCenterForce.setMag(random(settings['centerAttractionForce']['extra']['min'], settings['centerAttractionForce']['extra']['max']))
                } else {
                    attractCenterForce.setMag(random(settings['centerAttractionForce']['inside']['min'], settings['centerAttractionForce']['inside']['max']))
                }
            }
            particles[i].applyForce(attractCenterForce);
        } else if(Math.random() < 0.002){
            particles[i].applyForce(createVector(random(-settings['maxStartingVelocity'],settings['maxStartingVelocity']), random(-settings['maxStartingVelocity'],settings['maxStartingVelocity'])))
        }

        if(settings['lines']['connectPoints']){
            let points = qtree.query(new Circle(particles[i].pos.x, particles[i].pos.y, settings.lines.maxLineDist))
            for (let point of points) {
                if(particles[i] != point) {
                    stroke(lerpColor(particles[i].color, point.color, 0.5))
                    line(particles[i].pos.x, particles[i].pos.y, point.pos.x, point.pos.y)
                    if(Math.random() < settings.lines.changeSpeedChance && settings.lines.changeSpeedConnected) {
                        point.vel.mult(settings.lines.changeSpeedBy)
                    }
                } else {
                    point.checked = true
                }
            }
        }

        if(endSim){
            if(alpha(particles[i].color) > 0) {
                particles[i].color.setAlpha(alpha(particles[i].color) - 1)
            } else {
                particles.splice(i,1)
            }
        }
    }
}

function keyPressed() {
    if (key === "r") {
        resetSketch()
    } else if (key === "s") {
        saveCanvas(canvas, 'central-vibrance', 'png')
    } else if (key === "e") {
        endSim = true
    }
}

function generateColor() {
    let colorType = settings['colors']['particleColorType']
    let c
    if (colorType === 'randomRGBA') {
        colorMode(RGB, 255)
        c = color(random(settings['colors']['randomRGBA']['redMin'],settings['colors']['randomRGBA']['redMax']),random(settings['colors']['randomRGBA']['greenMin'],settings['colors']['randomRGBA']['greenMax']),random(settings['colors']['randomRGBA']['blueMin'],settings['colors']['randomRGBA']['blueMax']),random(settings['colors']['randomRGBA']['alphaMin'],settings['colors']['randomRGBA']['alphaMax']))
    } else if (colorType === 'randomHSLA') {
        colorMode(HSL, 255)
        c = color(random(settings['colors']['randomHSLA']['hueMin'],settings['colors']['randomHSLA']['hueMax']),random(settings['colors']['randomHSLA']['saturationMin'],settings['colors']['randomHSLA']['saturationMax']),random(settings['colors']['randomHSLA']['lightnessMin'],settings['colors']['randomHSLA']['lightnessMax']),random(settings['colors']['randomHSLA']['alphaMin'],settings['colors']['randomHSLA']['alphaMax']))
    } else if (colorType === 'gradient') {
        colorMode(RGB, 255)
        c = lerpColor(color(settings['colors']['gradient']['firstColor']),color(settings['colors']['gradient']['secondColor']),random())
        c.setAlpha(random(settings['colors']['gradient']['alphaMin'],settings['colors']['gradient']['alphaMax']))
    }
    return c
}

function resetSketch() {
    endSim = false

    resizeCanvas(settings['canvas']['width'], settings['canvas']['height'])

    let canvasElem = document.getElementById("defaultCanvas0")
    canvasElem.style.width = ""
    canvasElem.style.height = ""

    colorMode(RGB, 255)
    background(settings['colors']['backgroundColor']['r'],settings['colors']['backgroundColor']['g'],settings['colors']['backgroundColor']['b'],settings['colors']['backgroundAlpha'])
    
    particles = []
    qtree = new QuadTree(new Rectangle(width/2,height/2,width/2,height/2), 1)
    for (var i = 0; i < settings['particleCount'];) {
        let origin = createVector(random(width), random(height))
        if(settings.originRadius.ignoreRadius || (dist(origin.x, origin.y, width/2, height/2) < settings['originRadius']['max'] && dist(origin.x, origin.y, width/2, height/2)) > settings['originRadius']['min']) {
            particles[i] = new Particle(origin, generateColor());
            particles[i].applyForce(createVector(random(-settings['maxStartingVelocity'],settings['maxStartingVelocity']), random(-settings['maxStartingVelocity'],settings['maxStartingVelocity'])))
            i++
        }
    }

    if (pageIsLoaded) {
        if(width > height) {
            gui.controllers["settings.originRadius.min"].__max = settings.canvas.width
            gui.controllers["settings.originRadius.max"].__max = settings.canvas.width
            gui.controllers["settings.maxStartingVelocity"].__max = settings.canvas.width * 0.04
            gui.controllers["settings.maxVelocity"].__max = settings.canvas.width * 0.04
            gui.controllers["settings.lines.maxLineDist"].__max = settings.canvas.width * 0.25
        } else {
            gui.controllers["settings.originRadius.min"].__max = settings.canvas.height
            gui.controllers["settings.originRadius.max"].__max = settings.canvas.height
            gui.controllers["settings.maxStartingVelocity"].__max = settings.canvas.height * 0.04
            gui.controllers["settings.maxVelocity"].__max = settings.canvas.height * 0.04
            gui.controllers["settings.lines.maxLineDist"].__max = settings.canvas.height * 0.25
        }
        
        gui.updateAllDisplays()
    }
}

window.onload = () => {
    gui = new AutoGUI({width: 350})
    gui.enablePresets(defaultPresets, 'centralVibrance.userPresets')
    gui.autoAdd(settings, 'settings')
    gui.sticky('settings.Reset Canvas (R)')
    gui.sticky('settings.End Simulation (E)')
    gui.sticky('settings.Save As PNG (S)')
    gui.addToggleDisplayEvent('settings.Attract Particles to Center','settings.centerAttractionForce')
    gui.addToggleDisplayEvent('settings.mouseAttractsParticles','settings.mouseAttractionRange')
    gui.addToggleDisplayEvent('settings.colors.showParticles','settings.colors.particleOutline')
    gui.addMenuFolderSwitch('settings.colors.particleColorType', 'settings.colors')
    gui.presetsChanged = () => {
        resetSketch()
    }
    if (windowWidth < 700){
        gui.width = windowWidth - 30
        gui.close()
    }
    pageIsLoaded = true
}

const defaultPresets = {
    "Connected Points":{
        "settings.Attract Particles to Center": false,
        "settings.bounceEdges": true,
        "settings.colors.backgroundColor": {"r":255,"g":255,"b":255},
        "settings.colors.gradient.alphaMax": 0,
        "settings.colors.particleColorType": "randomHSLA",
        "settings.colors.particleOutline.particleOutlineAlpha": 160,
        "settings.colors.particleOutline.particleOutlineColor": "#ff487e",
        "settings.colors.randomHSLA.lightnessMin": 80,
        "settings.colors.randomHSLA.saturationMin": 160,
        "settings.colors.showParticles": true,
        "settings.drawTrails": false,
        "settings.lines.maxLineDist": 50,
        "settings.lines.slowWhenConnected": false,
        "settings.maxStartingVelocity": 3,
        "settings.maxVelocity": 3,
        "settings.mouseAttractionRange": 70,
        "settings.mouseAttractsParticles": true,
        "settings.originRadius.ignoreRadius": true,
        "settings.originRadius.max": 400
    },
    "Smoke":{
        "settings.originRadius.max":300,
        "settings.bounceEdges":true,
        "settings.maxStartingVelocity":2,
        "settings.maxVelocity":2.3,
        "settings.mouseAttractsParticles": true,
        "settings.colors.showParticles":true,
        "settings.colors.particleOutline.particleWidth":2,
        "settings.colors.particleOutline.particleHeight":2,
        "settings.colors.particleOutline.drawOutline":false,
        "settings.colors.particleOutline.particleOutlineColor":"#000000",
        "settings.colors.backgroundColor":{"r":129,"g":132.5,"b":137.5},
        "settings.colors.particleColorType":"gradient",
        "settings.colors.gradient.alphaMin":5,
        "settings.colors.gradient.alphaMax":45,
        "settings.lines.slowWhenConnected":false,
        "settings.centerAttractionForce.radius":250,
        "settings.centerAttractionForce.outside.max":10,
        "settings.centerAttractionForce.inside.min":0,
        "settings.centerAttractionForce.inside.max":5,
        "settings.centerAttractionForce.extra.chance":0.6,
        "settings.centerAttractionForce.extra.max":0
    },
    "Monochrome":{
        "settings.originRadius.max":400,
        "settings.bounceEdges":true,
        "settings.maxStartingVelocity":2,
        "settings.maxVelocity":3,
        "settings.colors.showParticles":true,
        "settings.colors.particleOutline.particleWidth":2,
        "settings.colors.particleOutline.particleHeight":2,
        "settings.colors.particleOutline.drawOutline":false,
        "settings.colors.particleOutline.particleOutlineColor":"#000000",
        "settings.colors.backgroundColor":{"r":53,"g":87,"b":167.5},
        "settings.colors.particleColorType":"gradient",
        "settings.colors.gradient.alphaMin":5,
        "settings.colors.gradient.alphaMax":45,
        "settings.lines.slowWhenConnected":false,
        "settings.centerAttractionForce.radius":1,
        "settings.centerAttractionForce.outside.max":5,
        "settings.centerAttractionForce.inside.min":-1,
        "settings.centerAttractionForce.inside.max":1,
        "settings.centerAttractionForce.extra.chance":0.1,
        "settings.centerAttractionForce.extra.max":1,
        "settings.particleCount":200,
        "settings.lockAxis.yAxis":true,
        "settings.colors.gradient.firstColor":"#bbf3ff",
        "settings.colors.gradient.secondColor":"#98b6ff",
        "settings.lines.maxLineDist":20,
        "settings.centerAttractionForce.outside.min":-4,
        "settings.centerAttractionForce.extra.min":-1
    },
    "Points": {
        "settings.originRadius.ignoreRadius":true,
        "settings.originRadius.max":400,
        "settings.particleCount":200,
        "settings.mouseAttractsParticles":true,
        "settings.mouseAttractionRange":150,
        "settings.bounceEdges":true,
        "settings.drawTrails":false,
        "settings.maxStartingVelocity":2,
        "settings.maxVelocity":10,
        "settings.colors.showParticles":true,
        "settings.colors.particleOutline.particleWidth":10,
        "settings.colors.particleOutline.particleHeight":10,
        "settings.colors.particleOutline.drawOutline":false,
        "settings.colors.particleOutline.particleOutlineColor":"#000000",
        "settings.colors.backgroundColor":{
          "r":255,
          "g":255,
          "b":255
        },
        "settings.colors.particleColorType":"gradient",
        "settings.colors.gradient.firstColor":"#000000",
        "settings.colors.gradient.alphaMin":37,
        "settings.colors.gradient.alphaMax":236,
        "settings.lines.changeSpeedConnected":false,
        "settings.lines.changeSpeedBy":1,
        "settings.Attract Particles to Center":false,
        "settings.centerAttractionForce.chance":0.1,
        "settings.centerAttractionForce.radius":210,
        "settings.centerAttractionForce.outside.min":0,
        "settings.centerAttractionForce.outside.max":0,
        "settings.centerAttractionForce.extra.chance":0.1,
        "settings.centerAttractionForce.extra.min":-10,
        "settings.centerAttractionForce.extra.max":0
    },
    Neon: {
        "settings.originRadius.max":480,
        "settings.particleCount":400,
        "settings.mouseAttractsParticles":true,
        "settings.mouseAttractionRange":150,
        "settings.bounceEdges":true,
        "settings.drawTrails":true,
        "settings.maxStartingVelocity":2,
        "settings.maxVelocity":4,
        "settings.colors.showParticles":true,
        "settings.colors.particleOutline.particleWidth":1,
        "settings.colors.particleOutline.particleHeight":1,
        "settings.colors.particleOutline.drawOutline":false,
        "settings.colors.particleOutline.particleOutlineColor":"#000000",
        "settings.colors.backgroundColor":{
          "r":45,
          "g":14,
          "b":40
        },
        "settings.colors.particleColorType":"randomHSLA",
        "settings.colors.randomHSLA.saturationMin":160,
        "settings.colors.randomHSLA.lightnessMin":140,
        "settings.colors.gradient.firstColor":"#4179ff",
        "settings.colors.gradient.alphaMin":8,
        "settings.colors.gradient.alphaMax":236,
        "settings.lines.changeSpeedConnected":false,
        "settings.lines.changeSpeedBy":1.1,
        "settings.Attract Particles to Center":false,
        "settings.centerAttractionForce.chance":0.1052,
        "settings.centerAttractionForce.radius":209,
        "settings.centerAttractionForce.outside.min":0,
        "settings.centerAttractionForce.outside.max":3,
        "settings.centerAttractionForce.extra.chance":0.5,
        "settings.centerAttractionForce.extra.min":-10,
        "settings.centerAttractionForce.extra.max":0,
        "settings.canvas.width":1000,
        "settings.canvas.height":2100,
        "settings.originRadius.min":263,
        "settings.lockAxis.xAxis":true,
        "settings.colors.particleOutline.particleOutlineAlpha":20,
        "settings.colors.randomHSLA.hueMin":244,
        "settings.colors.randomHSLA.hueMax":63,
        "settings.colors.randomHSLA.lightnessMax":189,
        "settings.colors.randomHSLA.alphaMax":35,
        "settings.colors.gradient.secondColor":"#ff9232"
    },
    "Fusion":{
        "settings.originRadius.max":350,"settings.particleCount":400,"settings.mouseAttractionRange":240,"settings.drawTrails":false,"settings.maxStartingVelocity":2.2,"settings.maxVelocity":12,"settings.colors.showParticles":true,"settings.colors.particleOutline.particleWidth":13,"settings.colors.particleOutline.particleHeight":13,"settings.colors.particleOutline.drawOutline":false,"settings.colors.backgroundColor":{"r":33,"g":33,"b":33},"settings.colors.backgroundAlpha":71,"settings.colors.particleColorType":"gradient","settings.colors.randomHSLA.hueMin":41,"settings.colors.randomHSLA.saturationMin":110,"settings.colors.randomHSLA.lightnessMin":117,"settings.colors.randomHSLA.lightnessMax":170,"settings.colors.randomHSLA.alphaMin":119,"settings.colors.gradient.firstColor":"#ffe9a2","settings.colors.gradient.secondColor":"#1e436e","settings.colors.gradient.alphaMin":127,"settings.lines.connectPoints":false,"settings.lines.changeSpeedConnected":false,"settings.lines.maxLineDist":6,"settings.centerAttractionForce.chance":0.66,"settings.centerAttractionForce.radius":0,"settings.centerAttractionForce.outside.max":4,"settings.centerAttractionForce.inside.min":-7,"settings.centerAttractionForce.extra.chance":0.55
    }
}