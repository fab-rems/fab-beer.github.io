
$(function(){
    Matter.use('matter-attractors');
    
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
    
    engine.world.gravity.y = -4;
    
    // create item
    const createItem = ({ x: stringX, y: stringY, length: stringLength, texture = ''}) => {
        const group = Body.nextGroup(true)
        const string = Composites.stack(stringX, stringY, 5, 1, 2, 2, (x, y) =>
        Bodies.rectangle(x, y, stringLength / 2,2, {
           collisionFilter:-1, // collisionFilter: { group },
            density:.01,
            render: {

                strokeStyle: "white",
                visible:true,
            },
        })
        )
        const firstBody = string.bodies[0]
        const lastBody = string.bodies[string.bodies.length - 1]
        const item = Bodies.circle(
            lastBody.position.x, lastBody.position.y + 57, 50, {
            frictionAir: 0.05, 
            collisionFilter:-2,// collisionFilter: { group },
            render: {
                sprite: {
                    texture: texture,
                    xScale: 1,
                    yScale: 1,
                },
                        },

           
           
        })
        const itemConstraint = Constraint.create({
            bodyA: item,
            bodyB: lastBody,
            pointA: { x: 0, y:0},
            pointB: { x:20, y: 0 },
            stiffness: 0.75,
            damping:.2,
            render: {

                strokeStyle: "white",
                visible:true,
                type:'line',
            },
        })
        
        Composites.chain(string, .5,0,-.5,0, {
            stiffness: .5,
            length: 20,
            render: { 
                type: 'line', 
                visible: true ,
            strokeStyle:'white'
        },
        })
        
        Composite.add(
            string,
            Constraint.create({
                bodyB: firstBody,
                pointA: { x: firstBody.position.x, y: firstBody.position.y },
                pointB: { x:-10, y:0},
                stiffness: 0.5,
                damping:.05,

            render: {

                strokeStyle: "white",
                visible:true,
                type:'line',
            },
            })
            )
            
            World.add(world, [string, item, itemConstraint])
        }
        
        // sun
        createItem({
            x: window.innerWidth * 0.2,
            y: window.innerHeight,
            length: window.innerHeight * 0.1,
            texture: '/assets/balloons/small-heads_bf.png',
            
        })

            // sun
    createItem({
        x: window.innerWidth * 0.05,
        y: window.innerHeight,
        length: window.innerHeight * 0.1,
        texture: '/assets/balloons/small-heads_sqp.png',
    })

//       // create a body with an attractor
//   var attractiveBody = Bodies.circle(
//     0,
//     0,
//     0, 
//     {
//     isStatic: true,

//     // example of an attractor function that 
//     // returns a force vector that applies to bodyB
//     plugin: {
//       attractors: [
//         function(bodyA, bodyB) {
//           return {
//             x: .01, //-1* (bodyA.position.x - bodyB.position.x) * 20 * 1e-6,
//             y: 0, //(bodyA.position.y - bodyB.position.y) * 1e-6,
//           };
//         }
//       ]
//     }
//   });


  
//   World.add(world, attractiveBody);



        // mouse

        // var mouseConstraint = Matter.MouseConstraint.create(engine, { //Create Constraint
        //     element: myCanvas,
        //     constraint: {
        //       render: {
        //         visible: false
        //       },
        //       stiffness:0.8
        //     }
        //   });
        //   Matter.World.add(world, mouseConstraint);

        const mouseContraint = MouseConstraint.create(engine, {
            mouse: Mouse.create(render.canvas),
            element:render.canvas,
            constraint: {
                stiffness: 0.8,
                render: { visible: false },
            }
        })
        console.log("ADDED CONTSTAEIT")
        World.add(world, mouseContraint)
        
        Runner.run(runner, engine)
        Render.run(render)
    }
)