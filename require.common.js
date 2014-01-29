var BOWER_DIR = 'bower_components';

require.config({
  paths: {
    jquery: BOWER_DIR + '/jquery/jquery',
    backbone: BOWER_DIR + '/backbone/backbone',
    lodash: BOWER_DIR + '/lodash/lodash'
  },

  map: {
    "*": {
      "underscore" : "lodash"
    }
  },

  packages: [
    {name: 'audioManager', location: 'src'}
  ],

  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
  }
});
