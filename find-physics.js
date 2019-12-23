
$(function(){
    var string_color = "white";
    window.updateBounds = function(){
        window.engine.render.bounds.min = {
            x:( window.map.getBounds().getSouthWest().lng() )*510,
            y:(window.map.getBounds().getNorthEast().lat() )*-690
        };

        window.engine.render.bounds.max = {
            x:( window.map.getBounds().getNorthEast().lng() )*510,
            y:(window.map.getBounds().getSouthWest().lat() ) *-690
        };


    }
    


    window.createPhysics = function(){

        
        Matter.use('matter-attractors');
        const { Bodies, Body, Composite, Composites, Constraint, Engine, Mouse, MouseConstraint, Render, Runner, World } = Matter
        
        const runner = Runner.create()
        const engine = Engine.create({
            enableSleeping: false, // def = false
            render: {
                element: document.querySelector('.physics'),
                   bounds:{max:{
                       x:( window.map.getBounds().getNorthEast().lng() )*510,
                       y:(window.map.getBounds().getSouthWest().lat() ) *-690},
                    min:{
                        x:( window.map.getBounds().getSouthWest().lng() )*510,
                        y:(window.map.getBounds().getNorthEast().lat() )*-690
                    }}, 

              options: {
                //showAngleIndicator : true,
                wireframes         : false,
                //showVelocity       : true,
                //showCollisions     : true,
                enableSleeping     : true,
                hasBounds          : true,
                background: 'rgba(255,0,0,0)', // or '#ff0000' or other valid color string,
                width:window.innerWidth,
                height:window.innerHeight,
              }
            }
        })
        const world = engine.world
        // const render = Render.create({
        //     element: document.querySelector('.physics'),
        //     engine,
        //     options: {
        //         background: 'transparent',
        //         width: window.innerWidth,
        //         height: window.innerHeight,
        //         wireframes: true,
        //         showAngleIndicator : true,
        //         showVelocity       : true,
        //         showCollisions     : true,
        //         enableSleeping     : true,
        //         hasBounds          : true

        //     }
        // })

        window.world = world;
        window.render = engine.render;
        window.engine = engine

        var overlay = window.overlay;
        var anchors = window.anchors;
        var screen_anchors = window.screen_anchors;


        for (k in anchors){    
            screen_anchors[k] = []
            for(v of anchors[k]){
                var anchor_body = Bodies.circle(
                    (Number(v.lng))*510, 
                    (Number(v.lat))*-690, 
                    1, 
                    {
                    collisionFilter:{group:-1},
                    isStatic:true,
                    render: { 
                        visible: false ,

                    },
                 }
                )
                screen_anchors[k].push(anchor_body)
            }
        }
        
        
        engine.world.gravity.y = -2;
        
        // create item
        const createItem = ({ length: stringLength, texture = '', anchorBody:anchorBody }) => {
            const group = Body.nextGroup(true)


            var stringX = anchorBody.position.x;
            var stringY = anchorBody.position.y;

            //define the stack of elements in the string
            const string = Composites.stack(stringX, stringY, 3, 1, 2, 2, (x, y) =>
            Bodies.rectangle(x, y, stringLength / 2,.5, {
                // collisionFilter:{group},
                collisionFilter:{group:-1},
                density:.1,
                render: {
                    
                    fillStyle: string_color,
                    visible:true,
                },
            })
            )

        
            const firstBody = string.bodies[0]
            const lastBody = string.bodies[string.bodies.length - 1]

            //anchor the item to the end of the string
            const item = Bodies.circle(
                lastBody.position.x, lastBody.position.y + 10, 20, {
                    frictionAir: 0.05, 
                    collisionFilter:{group:-1},
                    render: {
                        sprite: {
                            texture: texture,
                            xScale: .5,
                            yScale: .5,
                        },
                    },
                    
                    
                    
                })


                window.lastBody = lastBody
                const itemConstraint = Constraint.create({
                    bodyA: item,
                    bodyB: lastBody,
                    pointA: { x: 0, y:0},
                    pointB: { x:lastBody.bounds.max.x - lastBody.position.x, y: 0 },
                    stiffness: 0.75,
                    damping:.3,
                    render: {
                        strokeStyle: string_color,
                        visible:true,
                        type:'line',
                        lineWidth:.5,
                        anchors:false,
                    },
                })
                
                Composites.chain(string, .49,0,-.49,0, {
                    stiffness: .3,
                    length: 5,
                    collisionFilter:{group:-1},
                    render: { 

                        lineWidth:.5,
                        anchors:false,
                        type: 'line', 
                        visible: true ,
                        strokeStyle: string_color
                    },
                })
                
                Composite.add(
                    string,
                    Constraint.create({
                        bodyA: anchorBody,
                        bodyB: firstBody,
                        pointA: { x: 0, y: 0 },
                        pointB: { x: firstBody.bounds.min.x - firstBody.position.x, y:0},
                        stiffness: 0.25,
                        damping:.05,
                        render: {
                            strokeStyle: string_color,
                            visible:true,
                            type:'line',
                        lineWidth:.5,
                        anchors:false,
                        },
                    })
                    )
                    
                    World.add(world, [string, item, itemConstraint,anchorBody])
                }
                
                // sun


                for (nm in screen_anchors){
                    anchors = screen_anchors[nm]
                    for (v of anchors){
                    
                        
                createItem({
                    anchorBody:v,
                    length: window.innerHeight * 0.05,
                    texture: `/assets/balloons/small-heads_${nm}.png`,
                })
                    }
                }
            
                
                // create a body with an attractor
                var attractiveBody = Bodies.circle(
                    0,
                    0,
                    0, 
                    {
                        isStatic: true,
                        
                        // example of an attractor function that 
                        // returns a force vector that applies to bodyB
                        plugin: {
                            attractors: [
                                function(bodyA, bodyB) {
                                    return {
                                        x: .01, //-1* (bodyA.position.x - bodyB.position.x) * 20 * 1e-6,
                                        y: 0, //(bodyA.position.y - bodyB.position.y) * 1e-6,
                                    };
                                }
                            ]
                        }
                    });
                    
                    
                    
                    World.add(world, attractiveBody);
                    // mouse
                    const mouseContraint = MouseConstraint.create(engine, {
                        mouse: Mouse.create(engine.render.canvas),
                        constraint: {
                            stiffness: 0.2,
                            render: { visible: false },
                        }
                    })
                    World.add(world, mouseContraint)
                    Runner.run(runner, engine)
                    //Render.run(engine.render)
                    
                }
            }
            )




            console.clear() 
