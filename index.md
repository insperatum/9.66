---
layout: default
title: 9.660 Problem Sets
custom_js:
- assets/js/index.js
custom_css:
- assets/css/index.css
---

<div id="header">
  <h1 id='title'>9.660 Problem Sets</h1>
</div>

<br />

{% assign sorted_pages = site.pages | sort:"name" %}

<!-- <ul> -->
<div>
{% for p in sorted_pages %}
    {% if p.layout == 'chapter' and p.hidden != true %}
	    <div class="listing{% if p.type == 'pset' %} pset_listing{% endif %}">
	    <a href="{{ site.baseurl }}{{ p.url }}">{{p.title}}</a><br />
	    <em>{{ p.description }}</em>
	    </div>
    {% endif %}
{% endfor %}
<!-- </ol> -->

</div>

<hr />

Some WebPPL resources and examples:

- [WebPPL Website](http://webppl.org/)
- [WebPPL Documentation](http://docs.webppl.org/en/master/)
- [WebPPL source code](https://github.com/probmods/webppl)
- [Probmods textbook](http://probmods.org/)
- [Toby and Kevin's tutorial](https://github.com/tobiasgerstenberg/webppl_tutorial)
- [Modelling Agents with Probabilistic Programs](http://agentmodels.org)
- [Design and Implementation of Probabilistic Programs](http://dippl.org)
