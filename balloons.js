
var lastOffset = $( ".hero" ).scrollTop();
var lastDate = new Date().getTime();

$( ".hero" ).scroll(function(e) {
    var delayInMs = e.timeStamp - lastDate;
    var offset = e.target.scrollTop - lastOffset;
    var speedInpxPerMs = offset / delayInMs;
    console.log(speedInpxPerMs);

    lastDate = e.timeStamp;
    lastOffset = e.target.scrollTop;
});

$( document ).ready(function() {
    //window.setInterval(
    
    var interval = 200;

    function addParticle(particle_offset){
        $(".balloons").append($("<div>").addClass("particle").css("transition-duration",`${interval/1000}s`).offset(particle_offset))
    }

    wind_speed_constant = 5
    wind_degrees = 0
    atmosphere_scale = 250

    var wind_height_fun = function(y){
        return wind_speed_constant * (y / atmosphere_scale) **2;
    }
    wind_radians = wind_degrees / 180 * 3.14
    buoyancy_force = 20
    damping = .85
    var vx = {}
    var vy = {}

    var string_lengths = [window.innerWidth/2,window.innerWidth/3]
    var init_len = 10
    $(".balloon-head").css("transition-duration",`${interval/1000}s`)


    $(".balloon-head").each(
        function(i,e){    

            op = $(e).offsetParent().offset()
            $(e).offset(
            {top:(op.top)  -(2**.5)*init_len,
            left:op.left +(2**.5)*init_len})
            vx[i] = 0
            vy[i] = 0

        })

    var np =20;
    for(var i = 0; i < np; i++){
        addParticle({left:0,top:-(i/np)*window.innerHeight})
    }

    window.setInterval(
        function(){
            wind_fluctuation = 20
            wind_degrees = wind_degrees +(  ( Math.random() - .5) * wind_fluctuation)
            wind_degrees = wind_degrees < 5 ? 5: (wind_degrees > 30 ? 30: wind_degrees)
            wind_radians = wind_degrees / 180 * 3.14
        },1500)
    window.setInterval(()=>{
        $(".particle").each(

            (i,e)=>{
                op = $(e).offsetParent().offset()
                var {top, left} = $(e).offset()

                var y = -1*(top - op.top)
                var x = left - op.left

                new_y = y+Math.sin(wind_radians)*wind_height_fun(y)*20 - 10
                new_x = x+Math.cos(wind_radians)*wind_height_fun(y)*20
                if( (Math.abs(new_x) > 500 )| (Math.abs(new_y) > 500)){
                    $(e).remove()
                    addParticle({top:-Math.random()*window.innerHeight/3,left:0})

                    return
                }
                $(e).offset({top:op.top - new_y,
                        left:op.left + new_x})
                }
        )
        $(".balloon-head").each(
        function(i,e){


            op = $(e).offsetParent().offset()
            var ofs = $(e).offset();
            var wleft = ofs.left;
            var wtop =  ofs.top;
            var string_length = string_lengths[i]
            var y = -1*(wtop - op.top)
            var x = wleft - op.left

            // var scl = energy;
            // var new_left = left + scl*Math.random() - scl/2 + wind_x - (i*3)
            // var new_top = top + scl*Math.random() - scl/2 + wind_y + (i*3)
            // rotation = Math.atan(new_left / new_top)
            // abs = Math.sqrt(new_left**2 + new_top **2)
            // rescale = string_len/abs
            // new_left = new_left * rescale
            // new_top = new_top * rescale

            string_radians = Math.atan(y / x)

            var  wind_speed = wind_height_fun(y)
            f_wind_x = wind_speed * Math.cos(wind_radians)
            f_wind_y = wind_speed * Math.sin(wind_radians)

            f_wind_r = wind_speed * Math.cos(wind_radians - string_radians)
            f_wind_t = wind_speed * Math.sin(wind_radians - string_radians)

            f_boyancy_y = buoyancy_force

            arc_radius = Math.sqrt(x**2 + y**2)
            spring_k = 1.25
            spring_force = (arc_radius > string_length) ?  ((arc_radius-string_length) * spring_k) :0;

            f_net_x = f_wind_t * Math.cos(string_radians + 3.14/2) +  (f_wind_r - spring_force)* Math.cos(string_radians)
            f_net_y = f_wind_t * Math.sin(string_radians + 3.14/2) +  (f_wind_r - spring_force)* Math.sin(string_radians) + f_boyancy_y

            vx[i] += f_net_x
            vy[i] += f_net_y

            vx[i] *= damping
            vy[i] *= damping

            new_x = x+vx[i]
            new_y = y+vy[i]

            $(e).offset(
                {top:-1 * new_y+ op.top,
                left:new_x+ op.left})

            $(e).css({"transform":`rotate(${-1*(string_radians-(+3.14/2))}rad)`})

        })} ,interval)

});