vg.scene.build = (function() {
  var GROUP  = vg.scene.GROUP,
      ENTER  = vg.scene.ENTER,
      UPDATE = vg.scene.UPDATE,
      EXIT   = vg.scene.EXIT;
  
  function build(model, db, node, parentData) {
    var data = model.from ? model.from(db) : parentData || [1];
    
    // build node and items
    node = buildNode(model, node);
    node.items = buildItems(model, data, node);
    
    // recurse if group
    if (model.type === GROUP) {
      buildGroup(model, db, node);
    }
    
    return node;
  };
  
  function buildNode(model, node) {
    node = node || {};
    node.def = model;
    node.marktype = model.type;
    node.interactive = !(model.interactive === false);
    return node;
  }
  
  function buildItems(model, data, node) {
    var keyf = keyFunction(model.key),
        prev = node.items || [],
        next = [],
        map = {},
        i, key, len, item, datum;

    for (i=0, len=prev.length; i<len; ++i) {
      item = prev[i];
      item._status = EXIT;
      if (keyf) map[item.key] = item;
    }
    
    for (i=0, len=data.length; i<len; ++i) {
      datum = data[i];
      key = i;
      item = keyf ? map[key = keyf(datum)] : prev[i];
      enter = item ? false : (item = {}, true);
      item._status = enter ? ENTER : UPDATE;
      item.datum = datum;
      item.key = key;
      next.push(item);
    }
    
    for (i=0, len=prev.length; i<len; ++i) {
      item = prev[i];
      if (item._status === EXIT) {
        item.key = keyf ? item.key : next.length;
        next.push(item);
      }
    }
    
    return next;
  }
  
  function buildGroup(model, db, node) {
    var groups = node.items,
        marks = model.marks,
        i, len, m, mlen, group;

    for (i=0, len=groups.length; i<len; ++i) {
      group = groups[i];
      group.items = group.items || [];
      for (m=0, mlen=marks.length; m<mlen; ++m) {
        group.items[m] = build(marks[m], db, group.items[m], group.datum);
      }
    }
  }
  
  function keyFunction(key) {
    return key ? vg.accessor(key) : null;
  }
  
  return build;
})();