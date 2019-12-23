const { Bodies, Body, Composite, Composites, Constraint, Engine, Mouse, MouseConstraint, Render, Runner, World } = Matter

const runner = Runner.create()
const engine = Engine.create()
const world = engine.world
const render = Render.create({
    element: document.querySelector('.canvas'),
    engine,
    options: {
        background: 'transparent',
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
    }
})


// create item
const createItem = ({ x: stringX, y: stringY, length: stringLength, texture = ''}) => {
    const group = Body.nextGroup(true)
    const string = Composites.stack(stringX, stringY, 18, 1, 2, 2, (x, y) =>
        Bodies.rectangle(x, y, stringLength / 2, 2, {
            collisionFilter:-1,
            render: {
                fillStyle: "black",
                strokeStyle: "black",
            },
        })
    )
    const firstBody = string.bodies[0]
    const lastBody = string.bodies[string.bodies.length - 1]
    const item = Bodies.circle(lastBody.position.x, lastBody.position.y + 57, 50, {
        collisionFilter:-2,
        render: {
            sprite: {
                texture,
                xScale: 0.5,
                yScale: 0.5,
            },
        }
    })
    const itemConstraint = Constraint.create({
        bodyA: item,
        bodyB: lastBody,
        pointA: { x: 0, y: -57 },
        pointB: { x: 0, y: 0 },
        stiffness: 0.5,
        render: { visible: false },
    })

    Composites.chain(string, 0.49, 0, -0.49, 0, {
        stiffness: 0.7,
        length: 0,
        render: { type: 'line', visible: false },
    })

    Composite.add(
        string,
        Constraint.create({
            bodyB: firstBody,
            pointA: { x: firstBody.position.x, y: firstBody.position.y },
            pointB: { x: -1, y: 0 },
            stiffness: 0.5,
        })
    )

    World.add(world, [string, item, itemConstraint])
}

// sun
createItem({
    x: window.innerWidth * 0.25,
    y: -20,
    length: window.innerHeight * 0.05,
    texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/59639/sun.png'
})

// moon
createItem({
    x: window.innerWidth * 0.7,
    y: -20,
    length: window.innerHeight * 0.06,
    texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/59639/moon.png'
})

// mouse
const mouseContraint = MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
    constraint: {
        stiffness: 0.2,
        render: { visible: false },
    }
})
World.add(world, mouseContraint)

Runner.run(runner, engine)
Render.run(render)