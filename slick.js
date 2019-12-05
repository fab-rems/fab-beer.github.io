

  $(function(){
    $('.slick-center').slick({
    
        centerMode: true,
         slidesToShow: 2,
         variableWidth: true,
         arrows:true,
        infinite:false,
        padding:50,
    
      responsive: [
        {
          breakpoint: 768,
          settings: {
            centerMode: true,
         slidesToShow: 1,
         variableWidth: true,
         arrows:true,
        infinite:true,
        padding:50,
          }
        },    
      ]
    })
    })

