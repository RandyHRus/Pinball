function constructBumper(gridPos, radius) {

    let worldPos = calculateWorldPos(gridPos);

    let body = Matter.Bodies.circle(worldPos.x, worldPos.y, radius, {
        restitution: 1, //make ball bounce
        isStatic: true,
    });

    return body;
}