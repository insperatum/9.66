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

<!-- <div style="background:#ddffee; padding:15px;font-style: italic;font-size:12px">
Hi class,<br/>
A few people seem to be having autosave/export issues with PSET4. I think it's to do with the size of the export being too big for some browsers, but I'm not sure. If you're having issues:<br/><br/>
<ol>
<li>Try this <a href="/chapters/04-pset4-new.html">alternate PSET4 page</a>, which only saves code/text (but not the generated graphs/animations/etc). This is fine to submit to stellar.</li>
<li>Look at your cache size <a href="/chapters/localStorage.html">here</a> and tell me what it says (e.g. on <a href="https://piazza.com/class/jmpdtl0mg8b3hw?cid=161">piazza</a>)</li>
</ol>
If anybody's still having issues, let me know and hopefully I can sort them out today. Thanks for your help working this out!<br/>
~ Luke
</div>
<hr /> -->

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
