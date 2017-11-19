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

<ol> 
{% for p in sorted_pages %}
    {% if p.layout == 'chapter' and p.hidden != true %}
    <li><a href="{{ site.baseurl }}{{ p.url }}">{{p.title}}</a><br />
    <em>{{ p.description }}</em>
    </li>

    {% endif %}
{% endfor %}
</ol>

<hr/>

Some WebPPL resources and examples:

- [Probmods textbook](http://probmods.org/)
- [WebPPL Documentation](http://docs.webppl.org/en/master/)
- [Modelling Agents with Probabilistic Programs](http://agentmodels.org)
- [Design and Implementation of Probabilistic Programs](http://dippl.org)
- [WebPPL source code](https://github.com/probmods/webppl)
