let GRID_SIZE = 10;
let BALL_RADIUS = 1 * GRID_SIZE;

let objects = [];
let constraints = [];


function calculateWorldPos(gridPos) {
    return {
        x: window.innerWidth/2 + (gridPos.x * GRID_SIZE),
        y: window.innerHeight/2 - (gridPos.y * GRID_SIZE)
    }
}

function createRectangle(bottomLeft, topRight) {

    gridCenterX = (topRight.x + bottomLeft.x)/2;
    gridCenterY = (topRight.y + bottomLeft.y)/2
    let worldPos = calculateWorldPos({x: gridCenterX, y: gridCenterY});

    let body = Matter.Bodies.rectangle(
        worldPos.x, //pos x
        worldPos.y, //pos y
        (Math.abs(topRight.x - bottomLeft.x)+1) * GRID_SIZE, //size x
        (Math.abs(topRight.y - bottomLeft.y)+1) * GRID_SIZE, //size y
        {isStatic: true}
    );

    Matter.World.add(engine.world, body);

    objects.push({
        body: body,
        gridPos: {
            x: gridCenterX,
            y: gridCenterY
        }
    });

    return body;
}

function createBodyFromVertices(gridPos, vertexSets) {

    let body = Matter.Bodies.fromVertices(calculateWorldPos(gridPos), vertexSets);

    Matter.World.add(engine.world, body);

    objects.push({
        body: body,
        gridPos: gridPos
    })

    return body;
}

function createBall() {
    
    let gridPos = {
        x: 22,
        y: 20
    }

    let worldPos = calculateWorldPos(gridPos);
    let body = Matter.Bodies.circle(worldPos.x, worldPos.y, BALL_RADIUS, {
        restitution: 0.6 //make ball bounce
    });

    objects.push({
        body: body,
        gridPos: gridPos
    })

    Matter.World.add(engine.world, body);

    return body;
}

function createSling() {
    let worldPos = calculateWorldPos(slingGridPosition);
    let slingBumper = Matter.Bodies.rectangle(
        worldPos.x, //pos x
        worldPos.y, //pos y
        3 * GRID_SIZE, //size x
        3 * GRID_SIZE, //size y
    )
    let slingString = Matter.Constraint.create({
        pointB: worldPos,
        bodyA: slingBumper,
        stiffness: CHARGE_DEFAULT_STIFFNESS,
        length: 0,
        damping: 0
    })

    objects.push({
        body: slingBumper,
        gridPos: slingGridPosition
    })

    constraints.push({
        body: slingString,
        gridPos: slingGridPosition
    })

    Matter.World.add(engine.world, [slingBumper, slingString]);

    return [slingBumper, slingString];
}

function createFlippers() {
    let [leftFlipper, leftFlipperPivot] = constructFlipper({x:-8, y: -20}, false);
    let [rightFlipper, rightFlipperPivot] = constructFlipper({x:8, y: -20}, true);

    Matter.World.add(engine.world, [leftFlipper.body, rightFlipper.body, leftFlipperPivot, rightFlipperPivot]);

    objects.push({
        body: leftFlipper.body,
        gridPos: {x:-8, y: -20}
    })

    constraints.push({
        body: leftFlipperPivot,
        gridPos: {x:-8, y: -20}
    })

    objects.push({
        body: rightFlipper.body,
        gridPos: {x:8, y: -20}
    })

    constraints.push({
        body: rightFlipperPivot,
        gridPos: {x:8, y: -20}
    })

    return [leftFlipper, rightFlipper];
}

function drawBoard() {

    createRectangle({x:-25,y:-30},{x:25,y:-31}); //ground
    createRectangle({x:-25,y:30},{x:25,y:31}); //ceiling
    createRectangle({x:-24,y:-29},{x:-25,y:29}); //leftWall
    createRectangle({x:24,y:-29},{x:25,y:29}); //rightWall
    createRectangle({x:19,y:-29},{x:20,y:22}); //holder
    createBall(); //ball
    //createBodyFromVertices();

    let [slingBumper, slingString] = createSling();
    let [leftFlipper, rightFlipper] = createFlippers();

    reposition();

    return [
        leftFlipper, 
        rightFlipper,
        slingBumper,
        slingString
    ];
}

function reposition() {

    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;

    for (let o of objects) {
        Matter.Body.setPosition(o.body, calculateWorldPos(o.gridPos))
    }

    for (let c of constraints) {
        c.body.pointB = calculateWorldPos(c.gridPos);
    }
}