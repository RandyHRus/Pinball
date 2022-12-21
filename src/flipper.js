FLIPPER_LENGTH = 70;
FLIPPER_WIDTH = 20;

function constructFlipper(gridPos, reverse) {
    let flipperBody = Matter.Bodies.rectangle(0, 0, FLIPPER_LENGTH, FLIPPER_WIDTH)
    let flipperPivot = Matter.Constraint.create({
        bodyA: flipperBody,
        pointB: calculateWorldPos(gridPos),
        pointA: {x: (reverse? 1 : -1) * (FLIPPER_LENGTH/2 - 8), y:0},
        length: 0,
        stiffness: 1
    })

    let flipper = {
        body: flipperBody,
        pivot: flipperPivot,
        state: "rest",
        keyDown: false,
        flip: reverse? -1 : 1
    }

    return [flipper, flipperPivot];
}