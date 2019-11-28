---
layout: default
name: Balloon Factory
code: bf
artist_id: adam
navbar: true
style: main
---

<div class="can-gallery d-md-flex d-none">
    <div class="can-list">

        {% for can in site.cans %}
        {% if can.code == page.code %}
        <div class="can">
            <a href= "/babydictators"> <img  class="main" src="/assets/canart/cans_{{ can.code }}_art.png" /></a>
            <div class="additional-images">
                <img src="/assets/canart/cans_{{ can.code }}_tall_can.png"/>
                <img src="/assets/canart/cans_{{ can.code }}_wide_can.png"/>
            </div>
        </div>
        {% endif %}
        {% endfor %}    

    </div>
</div>

<div class="col-md-6 offset-md-3">
ARTIST’S STATEMENT
“This baby Trump balloon is a very orange Georgia peach. The poor guy didn’t seem happy in the city. He is freed from a menacing urban landscape and drifts to a farm I painted in New Hampshire. The word farm has multiple meanings: retiring in peace... or going to jail.”
--ADAM O’DAY, Balloon Factory, MA
@ADAM_ODAY
</div>
<div class="col-md-10 offset-md-1">
<div class="wip-flex-list">



{% for image in site.static_files %}
    {% if image.path contains 'bf' %}
    {% if image.path contains 'wip' %}

    <div class="item">
        <img src="{{ site.baseurl }}{{ image.path }}" alt="image" />
        </div>
    {% endif %}
    {% endif %}
{% endfor %}

                    </div>
<!-- 

                                        {% for artist in site.data.artists %}
                            {% if artist.shortname == "adam" %}

                    <div class="artist item">
                    <a href="{{ artist.link }}" >
                        <img class="artist-img" src="{{ artist.headshot }}" /><span class="desc"><span class="name">{{artist.name}}</span></span>
                    </a></div>
                    {% endif %}
                    {% endfor %} -->



</div>