---
layout: default
title: 9.660 Computationl Cognitive Science
custom_js:
- assets/js/index.js
custom_css:
- assets/css/index.css
---

<div id="header">
  <h1 id='title'>9.660 Computationl Cognitive Science</h1>
</div>

<br />

{% assign sorted_pages = site.pages | sort:"name" %}


<h3>Problem Sets</h3>

<ol>
{% for p in sorted_pages %}
    {% if p.layout == 'chapter' %}
    <li><a href="{{ site.baseurl }}{{ p.url }}">{{p.title}}</a><br />
    <em>{{ p.description }}</em>
    </li>

    {% endif %}
{% endfor %}

</ol>