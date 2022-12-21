let GRID_SIZE = 10;
let BALL_RADIUS = 1.4 * GRID_SIZE;

let objects = [];
let constraints = [];

let ballGridPos = {
    x: 22,
    y: 20
}

function calculateWorldPos(gridPos) {
    return {
        x: AREA_SIZE_X/2 + (gridPos.x * GRID_SIZE),
        y: AREA_SIZE_Y/2 - (gridPos.y * GRID_SIZE)
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

function createBodyFromVertices(verticesGrid) {

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (let v of verticesGrid) {
        if (v.x < minX)
            minX = v.x
        if (v.x > maxX)
            maxX = v.x
        if (v.y < minY)
            minY = v.y
        if (v.y > maxY)
            maxY = v.y
    }
    let avgX = (maxX+minX)/2;
    let avgY = (maxY+minY)/2;
    verticesWorld = verticesGrid.map(function(p) {
        return calculateWorldPos(p);
    });

    let worldPos = calculateWorldPos({x: avgX, y: avgY});
    let body = Matter.Bodies.fromVertices(worldPos.x, worldPos.y, verticesWorld, {
        isStatic: true
    });

    Matter.World.add(engine.world, body);

    objects.push({
        body: body,
        gridPos: {x: avgX, y: avgY}
    })

    return body;
}

function createBall() {

    let worldPos = calculateWorldPos(ballGridPos);
    let body = Matter.Bodies.circle(worldPos.x, worldPos.y, BALL_RADIUS, {
        restitution: 0.52 //make ball bounce
    });

    objects.push({
        body: body,
        gridPos: ballGridPos
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

    leftFlipperPos = {x:-7.5, y: -20};
    rightFlipperPos = {x:7.5, y: -20}

    let [leftFlipper, leftFlipperPivot] = constructFlipper(leftFlipperPos, false);
    let [rightFlipper, rightFlipperPivot] = constructFlipper(rightFlipperPos, true);

    Matter.World.add(engine.world, [leftFlipper.body, rightFlipper.body, leftFlipperPivot, rightFlipperPivot]);

    objects.push({
        body: leftFlipper.body,
        gridPos: leftFlipperPos
    })

    constraints.push({
        body: leftFlipperPivot,
        gridPos: leftFlipperPos
    })

    objects.push({
        body: rightFlipper.body,
        gridPos: rightFlipperPos
    })

    constraints.push({
        body: rightFlipperPivot,
        gridPos: rightFlipperPos
    })

    return [leftFlipper, rightFlipper];
}

function createBumpers() {

    let bumper1Pos = {x:0,y:10};
    let bumper1 = constructBumper(bumper1Pos, 20);
    objects.push({
        body: bumper1,
        gridPos: bumper1Pos
    })

    let bumper2Pos = {x:-6,y:20};
    let bumper2 = constructBumper(bumper2Pos, 20);
    objects.push({
        body: bumper2,
        gridPos: bumper2Pos
    })

    let bumper3Pos = {x:6,y:20};
    let bumper3 = constructBumper(bumper3Pos, 20);
    objects.push({
        body: bumper3,
        gridPos: bumper3Pos
    })

    Matter.World.add(engine.world, [bumper1, bumper2, bumper3]);
}

function drawBoard() {

    createRectangle({x:-25,y:-30},{x:25,y:-31}); //ground
    createRectangle({x:-25,y:30},{x:25,y:31}); //ceiling
    createRectangle({x:-24,y:-29},{x:-25,y:29}); //leftWall
    createRectangle({x:24,y:-29},{x:25,y:29}); //rightWall
    createRectangle({x:19,y:-29},{x:20,y:22}); //holder
    createRectangle({x:-20,y:-29},{x:-19,y:29}); //holder
    let ball = createBall(); //ball
    
    let shootAngleVertices=Matter.Vertices.create([{ x: 20, y: 30 }, { x: 24, y: 30 }, { x: 24, y: 26 }]);
    createBodyFromVertices(shootAngleVertices); //shootAngle

    createBodyFromVertices(Matter.Vertices.create([{ x: 10, y: -18 }, { x: 8, y: -18 }, { x: 13, y: -15 }, { x: 15, y: -15 }])); //right curve bottom
    createRectangle({x: 13.5, y: -14.5}, {x: 14.5, y: -5}) //right Curve Straight
    createBodyFromVertices(Matter.Vertices.create([{ x: 14, y: 5 }, { x: 12, y: 5 }, { x: 19, y: -2 }, { x: 19, y: 0 }])); //right top thing bottom
    createRectangle({x: 12, y: 5}, {x: 13, y: 12}) //right top thing straight
    createBodyFromVertices(Matter.Vertices.create([{ x: 14, y: 12 }, { x: 12, y: 12 }, { x: 19, y: 22 }, { x: 19, y: 20 }])); //right top thing top
    createBodyFromVertices(Matter.Vertices.create([{ x: 10, y: -25 }, { x: 8, y: -25 }, { x: 19, y: -18 }, { x: 19, y: -20 }])); //right curve offshoot bottom

    createBodyFromVertices(Matter.Vertices.create([{ x: -10, y: -18 }, { x: -8, y: -18 }, { x: -13, y: -15 }, { x: -15, y: -15 }])); //left curve bottom
    createRectangle({x: -13.5, y: -14.5}, {x: -14.5, y: -5}) //left Curve Straight
    createBodyFromVertices(Matter.Vertices.create([{ x: -14, y: 5 }, { x: -12, y: 5 }, { x: -19, y: -2 }, { x: -19, y: 0 }])); //left top thing bottom
    createRectangle({x: -12, y: 5}, {x: -13, y: 12}) //left top thing straight
    createBodyFromVertices(Matter.Vertices.create([{ x: -14, y: 12 }, { x: -12, y: 12 }, { x: -19, y: 22 }, { x: -19, y: 20 }])); //left top thing top
    createBodyFromVertices(Matter.Vertices.create([{ x: -10, y: -25 }, { x: -8, y: -25 }, { x: -19, y: -18 }, { x: -19, y: -20 }])); //left curve offshoot bottom

    let [slingBumper, slingString] = createSling();
    let [leftFlipper, rightFlipper] = createFlippers();

    createBumpers();

    reposition();

    return [
        leftFlipper, 
        rightFlipper,
        slingBumper,
        slingString,
        ball
    ];
}

function reposition() {

    render.canvas.width = AREA_SIZE_X;
    render.canvas.height = AREA_SIZE_Y;

    for (let o of objects) {
        Matter.Body.setPosition(o.body, calculateWorldPos(o.gridPos))
    }

    for (let c of constraints) {
        c.body.pointB = calculateWorldPos(c.gridPos);
    }
}

function resetBall() {
    Matter.Body.setAngularVelocity(ball, 0);
    Matter.Body.setPosition(ball, calculateWorldPos(ballGridPos))
}