/*
 * 
 * Coal.js MVC Framework, part of lufny
 * THERE IS NO DOC, NO WARRANTY AND NO GIRLS IN HERE, GO USE BACKBONE.JS INSTEAD OF THIS SHIT
 *
 */



function query(array, search, keyname) {
  var sel = [];
  for (var i in array) {
    if (array[i][keyname] == search) {
      sel.push(array[i]);
    }
  }
  
  return sel;
}

function route_parse(url, array) {
  for (var i in array) {
    url = url.split(":"+i).join(array[i]); // Snippet for global replace without regexp
  }
  
  return url;
}

function Model(model) {
  var defaults,
    reserved = {"model": 1, "attributes": 1, "set": 1, "get": 1, "save": 1, "fetch": 1, "url": 1, "view": 1, "controller": 1};
  this.model = model;
  this.attributes = {};
  this.middlewares_pre = [];
  this.middlewares_post = [];
  
  if (typeof model.url != "undefined") {
    this.url = model.url;
  }
  //alert(this.url);
  
  if (typeof this.model.defaults == "object") {
    defaults = this.model.defaults;
    for (var p in defaults) { this.attributes[p] = defaults[p]; } // Horrible snippet for merging objects
  }
  
  for (var i in model) {
    if (!(i in reserved) && typeof model[i] == "function") {
      this[i] = model[i];
    }
  }
}


Model.prototype.pre = function(type, callback) {
  var types = {"connect": 1, "fetch": 1, "save": 1, "data": 1, "get": 1, "set": 1, "unset": 1};
  
  if (!(type in types)) {
    throw new Error("Invalid type");
  }
  
  if (typeof callback != "function") {
    throw new Error("Invalid callback");
  }
  
  this.middlewares_pre.push({type: type, callback: callback});
}

Model.prototype.post = function(type, callback) {
  var types = {"connect": 1, "fetch": 1, "save": 1, "data": 1, "set": 1, "unset": 1};
  
  if (!(type in types)) {
    throw new Error("Invalid type");
  }
  
  if (typeof callback != "function") {
    throw new Error("Invalid callback");
  }
  
  this.middlewares_post.push({type: type, callback: callback});
}

Model.prototype.apply_middleware_pre = function(keys, types, args) {
  var mids = [], i, rkeys = {};
  
  for (i in types) {
    mids = mids.concat(query(this.middlewares_pre, types[i], "type"));
  }
  
  for (i in mids) {
    if (typeof args != "undefined") {
      ret = mids[i].callback.apply(this, args);
    } else {
      ret = mids[i].callback();
    }
    
    if (typeof ret == "object") {
      if (ret.abort === true)
        return true;
        
      for (i in keys) {
        if (typeof ret[keys[i]] != "undefined") {
          rkeys[keys[i]] = ret[keys[i]];
        }
      }
    }
  }
  
  return rkeys;
}


Model.prototype.apply_middleware_post = function(types, args) {
  var mids = [], i, abort = false;
  //alert("inpost");
  
  for (i in types) {
    mids = mids.concat(query(this.middlewares_post, types[i], "type"));
  }
  
  for (i in mids) {
    if (typeof args != "undefined") {
      //alert("incall");
      ret = mids[i].callback.apply(this, args);
    } else {
      //alert("incall");
      ret = mids[i].callback();
    }
    
    if (typeof ret == "boolean") {
      abort = ret;
    }
  }
  
  return abort;
}


// Set into attributes
Model.prototype.set = function(key, value) {
  var ret;
  if (typeof key == "undefined" || typeof value == "undefined") {
    throw new Error("Something missing");
  }
  
  ret = this.apply_middleware_pre(["key", "value"], ["data", "set"], [key, value]);
  
  if (ret === true) {
    return;
  }
  
  if (typeof ret.key != "undefined") {
    key = ret.key;
  }
  
  if (typeof ret.value != "undefined") {
    value = ret.value;
  }
    
  this.attributes[key] = value;
  
  ret = this.apply_middleware_post(["data", "set"], [key, value]);
}

Model.prototype.unset = function(key) {
  var ret;
  if (typeof key == "undefined" || typeof this.attributes[key] == "undefined") {
    throw new Error("Something missing");
  }
  
  ret = this.apply_middleware_pre(["key"], ["data", "unset"], [key]);
  
  if (ret === true) {
    return;
  }
  
  if (typeof ret.key != "undefined") {
    key = ret.key;
  }
  
  delete this.attributes[key];
  ret = this.apply_middleware_post(["data", "unset"], [key]);
}


// Get from attributes
Model.prototype.get = function(key) {
  if (typeof key == "undefined") {
    throw new Error("Something missing");
  }
  
  ret = this.apply_middleware_pre(["key"], ["data", "get"], [key]);
  
  if (ret === true) {
    return;
  }
  
  if (typeof ret.key != "undefined") {
    key = ret.key;
  }
  
  if (typeof this.attributes[key] == "undefined") {
    throw new Error("Inexistent key");
  }
  
  return this.attributes[key];
}

// Save the model (backbone.js-style)/Send some data to an url
Model.prototype.save = function(opts) {
  var data = {}, 
    //self = this,
    success = false,
    error = false,
    req = new XMLHttpRequest(),
    protos = {post: 1, "delete": 1, put: 1},
    self = this,
    async = (typeof opts.async != "undefined") ? opts.async : true,
    url,
    callback = function() {
      if (async) {
        ret = self.apply_middleware_post(["save", "connect"], [req, opts.url, opts.proto, opts.async, opts.data, opts.sucess, opts.error]);
      
        if (ret) {
          return;
        }
      }
      
      if (req.status == 200) {
        if (success) 
          opts.success(req.responseText, req);
      } else {
        if (error)
          opts.error(req.status, req);
      }
    };
  
  url = (typeof opts.url != "undefined") ? opts.url : this.url;
  
  if (typeof url == "undefined") {
    throw new Error("Url needed");
  }
  
  if (typeof opts.proto == "undefined" || !(opts.proto in protos)) {
    throw new Error("Inexistent protocol");
  }
  
  ret = this.apply_middleware_pre(["url", "proto", "async", "data", "success", "error"], ["save", "connect"], [opts.url, opts.proto, opts.async, opts.data, opts.sucess, opts.error]);
  
  for (var i in opts) {
    if (i in ret) {
      opts[i] = ret[i];
    }
  }
  
  // If a "data" option is passed, we will consider that
  if (typeof opts.data != "undefined") {
    for (var i in opts.data) {
      if (opts.data[i] instanceof Model) { // Getting data from other models
        
        data[i] = opts.data[i].get(i);
      } else {
        data[i] = opts.data[i];
      }
    }
  } else {
    // Otherwise we will use model attributes (backbone.js-style)
    data = this.attributes;
  }
  
  // Preparing the callbacks
  if (typeof opts.success == "function") {
    opts.success.model = this.model;
    success = true;
  }
  
  if (typeof opts.error == "function") {
    opts.error.model = this.model;
    error = true;
  }
  
  url = route_parse(url, this.attributes);
  // Preparing the xmlhttprequest object
  req.open(opts.proto, url, async);
  req.setRequestHeader("Content-Type", "application/json");
  
  if (async) {
    req.onloadend = callback;
  }
  
  req.send(JSON.stringify(data));
  
  
  
  if (!async) {
    callback();
    ret = this.apply_middleware_post(["save", "connect"], [req, opts.url, opts.proto, opts.async, opts.data, opts.sucess, opts.error]);
    return req.responseText;
  }
  return null;
}

// Send the entire model/Some data and save the response (json) in the model
Model.prototype.fetch = function(opts) {
  var data = {},
    url,
    self = this,
    protos = {post: 1, "delete": 1, put: 1, get: 1},
    success = false,
    error = false,
    req = new XMLHttpRequest(),
    async = (typeof opts.async != "undefined") ? opts.async : true,
    callback = function() {
      var ndata;
      if (async) {
        ret = self.apply_middleware_post(["fetch", "connect"], [req, opts.url, opts.proto, opts.async, opts.data, opts.sucess, opts.error]);
        
        if (ret) 
          return;
      }
      
      //alert("ndataa");
      if (req.status == 200) {
        try {
          ndata = JSON.parse(req.responseText, req);
        } catch (e) {
          throw new Error("Invalid JSON");
        }
        
        for (var i in ndata) {
          self.set(i, ndata[i]);
        }
        if (success) {
          opts.success(req.responseText, req);
        }
      } else {
        if (error)
          opts.error(req.status, req);
      }
    };
  
  url = (typeof opts.url != "undefined") ? opts.url : this.url;
  //alert(url);
  if (typeof url == "undefined") {
    throw new Error("Url needed");
  }
  
  if (typeof opts.proto == "undefined" || !(opts.proto in protos)) {
    throw new Error("Inexistent protocol");
  }
  
  ret = this.apply_middleware_pre(["url", "proto", "async", "data", "success", "error"], ["fetch", "connect"], [opts.url, opts.proto, opts.async, opts.data, opts.success, opts.error]);
  
  for (var i in opts) {
    if (i in ret) {
      opts[i] = ret[i];
    }
  }
  
  
  if (typeof opts.data != "undefined") {
    for (var i in opts.data) {
      if (opts.data[i] instanceof Model) { // Getting data from other models
        data[i] = opts.data[i].get(i);
      } else {
        data[i] = opts.data[i];
      }
    }
  } else {
    // Otherwise we will use model attributes (backbone.js-style)
    data = this.attributes;
  }
  
  if (opts.proto == "get") {
    if (url[url.length-1] != "?") {
      url += "?";
    }
    
    for (var i in data) {
      url += i+"="+encodeURIComponent(data[i])+"&";
    }
    
    url = url.substring(0, url.length-1); // Removing final "&"
  }
  
  if (typeof opts.success == "function") {
    opts.success.model = this.model;
    success = true;
  }
  
  if (typeof opts.error == "function") {
    opts.error.model = this.model;
    error = true;
  }
  url = route_parse(url, this.attributes);  
  // Preparing the xmlhttprequest object
  req.open(opts.proto, url, async);
  
  if (opts.proto != "get")
    req.setRequestHeader("Content-Type", "application/json");
  
  if (async) {
    req.onloadend = callback;
  }
  
  req.send((opts.proto == "get") ? null : JSON.stringify(data));
  
  if (!async) {
    ret = this.apply_middleware_post(["fetch", "connect"], [req, opts.url, opts.proto, opts.async, opts.data, opts.sucess, opts.error]);
    callback();
    return req.responseText;
  }
  
  return null;
}

// ------


function View(view) {
  var reserved = {"render": 1, "model": 1, "el": 1};
  if (typeof view.model == "undefined" || !(view.model instanceof Model)) {
    throw new Error("A valid model is needed");
  }
  
  if (typeof view.render != "undefined" && typeof view.render != "function") {
    throw new Error("The render must be a function");
  }
  
  if (typeof view.el != "undefined") {
    this.el = view.el;
  }
  
  this.render = view.render;
  this.model = view.model;
  
  for (var i in view) {
    if (!(i in reserved) && typeof view[i] == "function") {
      
      
      this[i] = view[i];
    }
  }
  
  if (typeof this.render != "undefined") {
    this.render();
  }
}

// ------


function Controller(controller) {
  if (typeof controller.view == "undefined" || !(controller.view instanceof View) || typeof controller.view.el == "undefined") {
    throw new Error("Invalid view");
  }
  
  if (typeof controller.model != "undefined" && controller.model instanceof Model) {
    this.model = controller.model;
  }
  
  this.view = controller.view;
  this.classlivehash = {};
  this.taglivehash = {};
  this.live_events = {};
  this.idlivehash = {};
}


Controller.prototype.perform = function(live, ev) {
  var ceve, cel, cels, cfunc, cev,
    self = this;
  
  
  if (!ev) {
    ev = live;
    live = undefined;
  }
  
  if (typeof ev != "object") {
    throw new Error("Invalid events");
  }
  

  // TODO: Find a more efficent way to do this
  for (var i in ev) {
    if (typeof ev[i] != "string" && typeof ev[i] != "function") {
      throw new Error("Invalid events");
    }
    
    ceve = i.split(" ");
    
    if (ceve.length < 2) {
      throw new Error("Invalid events");
    }
    
    if (!(ceve[0] in this.live_events) && live) {
      document.addEventListener(ceve[0], function(event) { // jQuery-like .live handler
        // To rewrite using event.target
        var classes;
        
        if (!event.toElement) {
          event.toElement = event.target;
        }
        
        if (typeof event.toElement != "undefined") {
          classes = event.toElement.className.split(" ");
          for (var x in classes) {
            if (classes[x] in self.classlivehash) {
              self.classlivehash[classes[x]].forEach(function(a) {
                a.apply(event.toElement, event); // Simulate an event, ugly thing
              });
            }
          }
          
          if (event.toElement.tagName in self.taglivehash) {
            self.taglivehash[event.toElement.tagName].forEach(function(a) {
              a.apply(event.toElement, event);
            });
          }
          
          if (event.toElement.id in self.idlivehash) {
            
            self.idlivehash[event.toElement.id].forEach(function(a) {
              a.apply(self.view, event);
            });
          }
        }
      });
      this.live_events[ceve[0]] = true;
    }

    
    for (var n=1; n<ceve.length; n++) {
      if (typeof ev[i] != "string" && typeof ev[i] != "function") {
        throw new Error("Invalid handler");
      }
      cfunc = (typeof ev[i] == "function") ? ev[i] : this.view[ev[i]];
      cev = ceve[n].substring(1);
      switch (ceve[n].substring(0,1)) {
        case '#': // id
          if (live) {
            if (typeof this.idlivehash[cev] == "undefined") {
              this.idlivehash[cev] = [cfunc];
            } else {
              this.idlivehash[cev].push(cfunc);
            } 
          } else {
            cel = document.getElementById(ceve[n].substring(1));
            if (cel === null) {
              throw new Error("Invalid events on "+ceve[n].substring(1));
            }
            
            cel.addEventListener(ceve[0], cfunc.bind(this.view)); // Ugly as hell, i know
          }
          break;
          
        case '.': // class
          if (live) {
            if (typeof this.classlivehash[cev] == "undefined") {
              this.classlivehash[cev] = [cfunc];
            } else {
              this.classlivehash[cev].push(cfunc);
            } 
          } else {
          
            cels = this.view.el.getElementsByClassName(ceve[n].substring(1));

            if (cels === null) {
              throw new Error("Invalid events");
            }

            for (var k=0; k<cels.length; k++) {
              cel = cels[k];
              cel.addEventListener(ceve[0], cfunc);
            }
          }
          
          break;
        
        default: // tag name
          if (live) {
            if (typeof this.taglivehash[cev] == "undefined") {
              this.taglivehash[cev] = [cfunc];
            } else {
              this.taglivehash[cev].push(cfunc);
            } 
          } else {
            cels = this.view.el.getElementsByTagName(ceve[n].substring(1));
            
            if (cels === null) {
              throw new Error("Invalid events");
            }
            
            for (var k=0; k<cels.length; k++) {
              cel = cels[k];
              cel.addEventListener(ceve[0], cfunc);
            }
          }
          
          break;
      }
    }
  }
}