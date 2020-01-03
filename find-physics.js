



Queue = TinyQueue
function knn(tree, x, y, n, predicate, maxDistance) {
    var node = tree.data,
        result = [],
        toBBox = tree.toBBox,
        i, child, dist, candidate;

    var queue = new Queue([], compareDist);

    while (node) {
        for (i = 0; i < node.children.length; i++) {
            child = node.children[i];
            dist = boxDist(x, y, node.leaf ? toBBox(child) : child);
            if (!maxDistance || dist <= maxDistance) {
                queue.push({
                    node: child,
                    isItem: node.leaf,
                    dist: dist
                });
            }
        }

        while (queue.length && queue.peek().isItem) {
            candidate = queue.pop().node;
            if (!predicate || predicate(candidate))
                result.push(candidate);
            if (n && result.length === n) return result;
        }

        node = queue.pop();
        if (node) node = node.node;
    }

    return result;
}

function compareDist(a, b) {
    return a.dist - b.dist;
}

function boxDist(x, y, box) {
    var dx = axisDist(x, box.minX, box.maxX),
        dy = axisDist(y, box.minY, box.maxY);
    return dx * dx + dy * dy;
}

function axisDist(k, min, max) {
    return k < min ? min - k : k <= max ? 0 : k - max;
}




$(function(){
    
    var lng_factor = 510
    var lat_factor = -690

    var string_color = "white";
    window.updateBounds = function(){
        window.engine.render.bounds.min = {
            x:( window.map.getBounds().getSouthWest().lng() )*lng_factor,
            y:(window.map.getBounds().getNorthEast().lat() )*lat_factor
        };

        window.engine.render.bounds.max = {
            x:( window.map.getBounds().getNorthEast().lng() )*lng_factor,
            y:(window.map.getBounds().getSouthWest().lat() ) *lat_factor
        };


    }
    var default_cons_length =20
    var default_texture_scale = .25

    for( v of venue_beers){
        sorted_stations = _.sortBy(weather, (e)=>{return (Number(e.Lat) - Number(v.lat))**2+ (Number(e.Lon) - Number(v.lng))**2})
        influences = _.map(sorted_stations.slice(0,3),(e)=>{return 1 / ( (Number(e.Lat) - Number(v.lat))**2+ (Number(e.Lon) - Number(v.lng))**2)})
        console.log(influences)
        total = _.reduce(influences,(memo, num)=>{return memo + num})


        console.log(total)
        wind_mags = _.reduce(_.map(sorted_stations.slice(0,3),(e,i)=>{
             return Number(e.speed) * influences[i] / total
        }), (memo, num)=>memo+num)


        wind_degs = _.reduce(_.map(
            sorted_stations.slice(0,3),(e,i)=>{
                return Number(e.deg) * influences[i] / total
                
        }), (memo, num)=>memo+num)

        v["wind_mag"] = wind_mags
        v["wind_deg"] = wind_degs
    }


    
    tree = new RBush();
    for (w of weather){
        const item = {
            minX: w.Lon,
            minY: w.Lat,
            maxX: w.Lon,
            maxY: w.Lat,
            wind_x: Math.cos(w.deg / 180 * Math.PI) * w.speed,
            wind_y: Math.sin(w.deg / 180 * Math.PI) * w.speed,
            foo: 'bar'
        };
        tree.insert(item);
    }


    window.wind_direction = 0

    var wind_attractor_func = function(bodyA, bodyB) {
        var zonal_factor = Math.pow((bodyA.position.y - bodyB.position.y) * 1e-3,2)*10

        
        //venue_id = /vid-\d*/.exec(bodyB.label)
        //console.log(bodyB.category)

        if (bodyB.label == "particle"){

            var lng = bodyB.position.x / lng_factor
            var lat = bodyB.position.y / lat_factor
            nearest = knn(tree, lng ,lat ,1)[0]

            return {x: nearest.wind_x/1000,
                    y:nearest.wind_y/1000}

        } else if(bodyB.label == "balloon"){

            
            //console.log(bodyB.venue)
            //return null
            // var v = bodyB.venue
            // console.log(bodyB.v)
            //hits = knn( tree, bodyB.lat, bodyB.lng, 3 )
            //console.log(tree)
            //console.log(knn(tree, Number(bodyB.venue.lat),Number(bodyB.venue.lng),5))

            nearest = knn(tree, Number(bodyB.venue.lng),Number(bodyB.venue.lat),1)[0]

            // return {
            //     x: Math.cos(v.wind_deg / 180 * Math.PI)*v.wind_mag*.2, // * zonal_factor,
            //     y: Math.sin(v.wind_deg / 180 * Math.PI)*v.wind_mag*.2,
            // };

            return {
                x: nearest.wind_x/1000, // * zonal_factor,
                y: nearest.wind_y/1000,
            };
        } else {return null}

    }

    var default_attractor = function(bodyA, bodyB) {
        return {
            x: 0,//.01, //-1* (bodyA.position.x - bodyB.position.x) * 20 * 1e-6,
            y: 0//-.01, //(bodyA.position.y - bodyB.position.y) * 1e-6,
        };
    }
    var drag_attractor = function(bodyA, bodyB){
        return {
            x: .01, //-1* (bodyA.position.x - bodyB.position.x) * 20 * 1e-6,
            y: -.00, //(bodyA.position.y - bodyB.position.y) * 1e-6,
        };  
    }

    window.startDragging = (e)=>{

        var p = window.physics;
        p.attractiveBody.plugin.attractors = [drag_attractor]
    }

    window.doneDragging = (e)=>{

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
                    e.length = cons_scl/3;

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


        },10000)
        window.physics = {}
        window.physics.items = [];
        window.physics.chains = [];
        
        
        Matter.use('matter-attractors');
        Matter.use('matter-wrap');

        const { Bodies, Body, Composite, Composites, Constraint, Engine, Mouse, MouseConstraint, Render, Runner, World } = Matter

        
        const runner = Runner.create()


        xmin = ( window.map.getBounds().getSouthWest().lng() )*lng_factor
        ymin = (window.map.getBounds().getNorthEast().lat() )*lat_factor
        ymax = (window.map.getBounds().getSouthWest().lat() ) *lat_factor
        xmax = ( window.map.getBounds().getNorthEast().lng() )*lng_factor

        const engine = Engine.create({
            enableSleeping: false, // def = false
            render: {
                element: document.querySelector('.physics'),
                   bounds:{max:{
                       x:xmax,
                       y:ymax},
                    min:{
                        x:xmin,
                        y:ymin,
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
                    (Number(v.lng))*lng_factor, 
                    (Number(v.lat))*lat_factor, 
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
                 anchor_body.venue = v.venue
                 anchor_body.can = v.can
                screen_anchors[k].push(anchor_body)
            }
        }
        
        
        engine.world.gravity.y =1;
        
        // create item
        const createItem = ({ length: stringLength, texture = '', anchorBody:anchorBody}) => {
            //const group = Body.nextGroup(true)


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
                    visible:false,
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
                item.venue = anchorBody.venue
                item.can = anchorBody.can
                window.physics.items.push(item)

    

                var buoyancyAttractor = Bodies.circle(100, 100, stringLength/4, {
                    isStatic:false ,
                     plugin: {
                    attractors: [
                        (bodyA, bodyB)=>{
                            // console.log("B",bodyB.id)
                            // console.log("Item", item.id)
                            if( bodyB.id ==item.id){ //bodyB.label=="balloon"){
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
                    pointA: { x: 0, y: 1 },
                    pointB: { x: 0, y: 0 },
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

                    World.add(world, itemConstraint)
                    World.add(world, anchorBody)
                    World.add(world, item)
                }
                
                // sun

                var wind = Bodies.circle(
                    0 ,
                    0 , 
                    10,{
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

            
                for (var i = 0 ; i < 5; i++){

                var body = Matter.Bodies.circle(
                    xmin+ (xmax - xmin)*Math.random(), 
                    ymin+ (ymax - xmin)*Math.random() ,
                    2, {
                    frictionAir: 0.6, 
                    mass:.25,
                    label:"particle",
                    render:{
                       // fillStyle:"white",
                        sprite:i==-1?{
                            texture:"/assets/map/goose-01.png",
                            xScale:.2,
                            yScale:.2,
                        }:{}
                    
                    },

                
                    plugin: {
                      wrap: {
                        min: {
                          x: xmin,
                          y: ymin
                        },
                        max: {
                          x: xmax,
                          y: ymax
                        }
                      }
                    }
                }
                  );
                World.add(world,body)

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
