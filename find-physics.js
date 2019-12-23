
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
    var default_cons_length =20
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
            x: .01, //-1* (bodyA.position.x - bodyB.position.x) * 20 * 1e-6,
            y: -.01, //(bodyA.position.y - bodyB.position.y) * 1e-6,
        };
    }
    var drag_attractor = function(bodyA, bodyB){
        return {
            x: .06, //-1* (bodyA.position.x - bodyB.position.x) * 20 * 1e-6,
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

            miles_per_pixel = 4**( (10 / m.zoom -1)) * 1
            pix_scl = default_texture_scale * miles_per_pixel;
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
        },10000)
        window.physics = {}
        window.physics.items = [];
        window.physics.chains = [];
        
        
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
                wireframes         :  false,
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
                        label:"anchor",
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
        
        
        engine.world.gravity.y =1;
        
        // create item
        const createItem = ({ length: stringLength, texture = '', anchorBody:anchorBody }) => {
            const group = Body.nextGroup(true)


            var string_visibility = true;
            var stringX = anchorBody.position.x;
            var stringY = anchorBody.position.y;

            //define the stack of elements in the string
            const string = Composites.stack(stringX+ stringLength, stringY, 5, 1,stringLength/4,stringLength/4, (x, y) =>
            Bodies.circle(x, y, stringLength/10, {
                collisionFilter:{group:-1},
                label:"joint",
                mass:4.0,
                isStatic:false,
                render: {
                    strokeStyle: "orange",
                    visible:string_visibility,
                },
            })
            )

            window.physics.string = string;


        
            const firstBody = string.bodies[0]
            const lastBody = string.bodies[string.bodies.length - 1]



                window.lastBody = lastBody


            //anchor the item to the end of the string
            const item = Bodies.circle(
                lastBody.position.x+stringLength*2, lastBody.position.y, stringLength/4,
                 {
                    frictionAir: 0.1, 
                    mass: 5,
                    collisionFilter:{group:-1},
                    label:"balloon",
                    isStatic:false,
                    render: {
                        sprite: {
                            texture: texture,
                            xScale: default_texture_scale,
                            yScale: default_texture_scale,
                        },
                    },
                    
                    
                    
                })

                

                window.physics.items.push(item)

                var buoyancyAttractor = Bodies.circle(100, 100, stringLength/4, {
                    isStatic:false ,
                plugin: {
                    
                    attractors: [
                        (bodyA, bodyB)=>{
                            // console.log("B",bodyB.id)
                            // console.log("Item", item.id)
                            if( bodyB.id ==item.id){ //bodyB.label=="balloon"){
                                console.log("MATCHED!!")
                                console.log(bodyB.label)
                                return         {
                                x:0,
                                y:-.02,
                            } } else { return  null}
                        }
                    ]
                }
                })
                    World.add(world, buoyancyAttractor);


                const itemConstraint = Constraint.create({
                    bodyA: item,
                    bodyB: lastBody,
                    length:stringLength*2,
                    render: {
                        strokeStyle: string_color,
                        visible:string_visibility,
                        type:'line',
                        lineWidth:.5,
                        anchors:false,
                    },
                })
                

                window.physics.chains.push(  Composites.chain(
                    string,
                     0,
                     0,
                     0,
                     0, {
                    stiffness: .8,

                    length:default_cons_length,
                    collisionFilter:{group:-1},
                    render: { 

                        lineWidth:.5,
                        anchors:false,
                        type: 'line', 
                        visible: string_visibility ,
                        strokeStyle: string_color,
                    },
                }))
                
                Composite.add(
                    string,
                    Constraint.create({
                        bodyA: anchorBody,
                        bodyB: firstBody,
                        pointA: { x: 0, y: 0 },
                        pointB: { x: firstBody.bounds.min.x - firstBody.position.x, y:0},
                        stiffness: 0.75,
                        damping:.25,
                        length:stringLength,
                        render: {
                            strokeStyle: string_color,
                            visible:string_visibility,
                            type:'line',
                        lineWidth:.5,
                        anchors:false,
                        },
                    })
                    )
                    
                    World.add(world, string)
                    World.add(world,item)
                    World.add(world, itemConstraint)
                    World.add(world,anchorBody)
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
                    length: 10,
                    texture: `/assets/balloons/small-heads_${nm}.png`,
                })
                    }
                }
            
                
                //create a body with an attractor
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


      


                    //var buoyancyAttractor = Bodies.circle


                    // console.log(first_anchor)
                    // var wind = Bodies.circle(
                    //     first_anchor.position.x- 50, 
                    //     first_anchor.position.y, 
                    //     0,{
                    //         isStatic:true,
                    //         plugin:{
                    //             attractors:[
                    //                 wind_attractor_func
                    //             ]
                    //         }
                    //     }
                    // )
                    // window.physics.wind = wind;
                    // World.add(world, wind);

                    
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
