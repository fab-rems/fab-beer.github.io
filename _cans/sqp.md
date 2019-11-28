---
layout: can
name: Squid Pro Quo
code: sqp
artist_id: andy
style: can
---

<div class="can-gallery d-md-flex d-none">
    <div class="can-list">

        {% for can in site.cans %}
        {% if can.id == "/cans/sqp" %}
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
“I imagined him floating over a psychedelic sunset, riding tubes in pure bliss. 5 alternate reality surfer Trumps guide the strings harmoniously. Like if he grew up surfing with his dad, going to the beach each weekend.”
--ANDREW JACOBS, Wellfleet Mass.
@SOULKONTROLLER
<img href="/assets/headshots/adam_001.png"/>
</div>