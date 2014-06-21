'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Videoresume = new Module('Videoresume');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Videoresume.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    Videoresume.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
    Videoresume.menus.add({
        'title': 'Create videoresume',
        'link': 'create videoresume',
        'roles': ['authenticated'],
        'menu': 'main'
    });

    // Videoresume.menus.add({
    //     'title': 'Videoresume host',
    //     'link': 'videoresume create',
    //     'roles': ['authenticated'],
    //     'menu': 'main'
    // });

    // Videoresume.menus.add({
    //     'title': 'Videoresume participants',
    //     'link': 'videoresume edit',
    //     'roles': ['authenticated'],
    //     'menu': 'main'
    // });

    // Videoresume.menus.add({
    //     'title': 'Videoresume history',
    //     'link': 'videoresume list',
    //     'roles': ['authenticated'],
    //     'menu': 'main'
    // });

    // Videoresume.menus.add({
    //     'title': 'Videoresume view',
    //     'link': 'videoresume view',
    //     'roles': ['authenticated'],
    //     'menu': 'main'
    // });


    
    /*
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Videoresume.settings({
	'someSetting': 'some value'
    }, function(err, settings) {
	//you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Videoresume.settings({
	'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Videoresume.settings(function(err, settings) {
	//you now have the settings object
    });
    */

    return Videoresume;
});
