$(document).ready(function() {
  var bugzilla = bz.createClient();

  var cachedConfig = localStorage["fileit-config"];
  if (cachedConfig) {
    populateAutocomplete(JSON.parse(cachedConfig));
  }

  bugzilla.getConfiguration({
     flags: 0,
     cached_ok: 1
  },
  function(err, config) {
    if (err) {
      throw "Error getting Bugzilla configuration: " + err;
    }
    if (config) {
      localStorage["fileit-config"] = JSON.stringify(config);
      if (!cachedConfig) {
        populateAutocomplete(config);
      }
    }
  });

  $("#file-form").submit(function(event) {
    event.preventDefault();

    var comp = toComponent($("#file-form .component-search").val());
    window.open("http://bugzilla.mozilla.org/enter_bug.cgi?"
                + "product=" + encodeURIComponent(comp[0]) + "&"
                + "component=" + encodeURIComponent(comp[1]));
  });
});


function populateAutocomplete(config) {
  var components = [];
  for (product in config.product) {
    var comps = config.product[product].component;
    for (component in comps) {
       components.push({
          product: product,
          component: component,
          string: componentName({product: product, component: component})
       });
    }
  }

  var input = $(".component-search, .new-component");
  input.autocomplete({
    list: components,
    minCharacters: 2,
    timeout: 200,
    adjustWidth: 360,
    template: function(item) {
      return "<li value='" + item.string + "'><span class='product'>"
         + item.product + "</span>" + "<span class='component'>"
         + item.component + "</span></li>";
    },
    matcher: function(typed) {
      return typed;
    },
    match: function(item, matcher) {
      var words = matcher.split(/\s+/);
      return _(words).all(function(word) {
         return item.string.toLowerCase().indexOf(word.toLowerCase()) >= 0;
      });
    },
    insertText: function(item) {
      return item.string;
    }
 });
}

function componentName(comp) {
  return comp.product + "/" + comp.component;
}

function toComponent (name) {
  return name.split("/");
}
