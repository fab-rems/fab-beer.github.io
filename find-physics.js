
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
    var default_cons_length = 5
    var default_texture_scale = .5
    
    window.wind_direction = 0

    var wind_attractor_func = function(bodyA, bodyB) {
        var zonal_factor = Math.pow((bodyA.position.y - bodyB.position.y) * 1e-3,2)*3
        return {
            x: .02 + Math.cos(window.wind_direction)*.2 * zonal_factor,
            y: Math.sin(window.wind_direction)*.2,
        };
    }

    var default_attractor = function(bodyA, bodyB) {
        return {
            x: .04, //-1* (bodyA.position.x - bodyB.position.x) * 20 * 1e-6,
            y: -.04, //(bodyA.position.y - bodyB.position.y) * 1e-6,
        };
    }
    var drag_attractor = function(bodyA, bodyB){
        return {
            x: .02, //-1* (bodyA.position.x - bodyB.position.x) * 20 * 1e-6,
            y: -.00, //(bodyA.position.y - bodyB.position.y) * 1e-6,
        };  
    }

    window.startDragging = (e)=>{
        console.log("started")
        var p = window.physics;
        p.attractiveBody.plugin.attractors = [drag_attractor]
    }

    window.doneDragging = (e)=>{
        console.log("done")
        var p = window.physics;
        p.attractiveBody.plugin.attractors = [default_attractor]

    }
    window.zoomChanged = (e)=>{
        //console.log("done")
        var p = window.physics;
        //p.attractiveBody.plugin.attractors = [] 

        for( var item of window.physics.items){
            //console.log(item.render.sprite)
            var m = window.map
            console.log((.5 )* (10 / m.zoom))
            var pix_scl = default_texture_scale * 1.5**( (10 / m.zoom -1))
            var cons_scl = default_cons_length * 2**( (10 / m.zoom - 1))


            for (c of p.chains){
                for (e of c.constraints){
                    //e.stiffness = ;
                    e.length = cons_scl;

                }
            }

            item.render.sprite.yScale = pix_scl;
            item.render.sprite.xScale = pix_scl;

            //console.log(item.render.sprite)
            // console.log(e)
            // last_event = e
        }
    }

    window.createPhysics = function(){
        window.setInterval(()=>{
           var  step = 0 
           var delta = (this.Math.random() - .5)*.25
            window.setInterval(()=>{
                step+=1;
                if (step > 5){return}
                else{ window.wind_direction= window.wind_direction + delta * (step / 5)}
            }, 50)

            console.log(window.wind_direction)
        },5000)
        window.physics = {}
        
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
        
        
        engine.world.gravity.y = -4;
        
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
                density:.2,
                render: {
                    
                    fillStyle: string_color,
                    visible:true,
                },
            })
            )

            window.physics.string = string;
            if (! ("items" in window.physics) ){
                window.physics.items = [];
            }

            if (! ("chains" in window.physics) ){
                window.physics.chains = [];
            }

        
            const firstBody = string.bodies[0]
            const lastBody = string.bodies[string.bodies.length - 1]

            //anchor the item to the end of the string
            const item = Bodies.circle(
                lastBody.position.x, lastBody.position.y + 10, 30,
                 {
                    frictionAir: 0.5, 
                    density:.005,
                    collisionFilter:{group:-1},
                    render: {
                        sprite: {
                            texture: texture,
                            xScale: default_texture_scale,
                            yScale: default_texture_scale,
                        },
                    },
                    
                    
                    
                })

                window.physics.items.push(item)


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
                

                window.physics.chains.push(  Composites.chain(string, .5,0,-.5,-.5, {
                    stiffness: .75,
                    length:default_cons_length,
                    collisionFilter:{group:-1},
                    render: { 

                        lineWidth:.5,
                        anchors:false,
                        type: 'line', 
                        visible: true ,
                        strokeStyle: "black"
                    },
                }))
                
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
                            strokeStyle: "red",
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


                first_anchor = null
                for (nm in screen_anchors){
                    anchors = screen_anchors[nm]
                    for (v of anchors){
                        if (! first_anchor){
                            first_anchor = v;
                        }
                    
                        
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
                        plugin: {
                            attractors: [
                                
                                default_attractor
                            ]
                        }
                    });
                    
                    window.physics.attractiveBody = attractiveBody;
                    World.add(world, attractiveBody);


                    console.log(first_anchor)
                    var wind = Bodies.circle(
                        first_anchor.position.x- 50, 
                        first_anchor.position.y, 
                        0,{
                            isStatic:true,
                            plugin:{
                                attractors:[
                                    wind_attractor_func
                                ]
                            }
                        }
                    )
                    window.physics.wind = wind;
                    World.add(world, wind);

                    
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
