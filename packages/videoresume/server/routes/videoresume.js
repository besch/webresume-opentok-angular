'use strict';

// The Package is past automatically as first parameter
module.exports = function(Videoresume, app, auth, database) {

    // app.get('/videoresume/example/anyone', function(req, res, next) {
    //     res.send('Anyone can access this');
    // });

    // app.get('/videoresume/example/auth', auth.requiresLogin, function(req, res, next) {
    //     res.send('Only authenticated users can access this');
    // });

    // app.get('/videoresume/example/admin', auth.requiresAdmin, function(req, res, next) {
    //     res.send('Only users with Admin role can access this');
    // });


  var OpenTok = require('opentok');

  // Verify that the API Key and API Secret are defined
  var apiKey = '27381212',
      apiSecret = '49e68ee8e2f8363b736862c56c5489d51c2a25f0';

  var opentok = new OpenTok(apiKey, apiSecret);

  opentok.createSession(function(err, session) {
    if (err) throw err;
    app.set('sessionId', session.sessionId);
  });



  app.get('/videoresume', function(req, res) {
    res.render('index.html');
  });

  app.get('/videoresume/host', function(req, res) {
    var sessionId = app.get('sessionId'),
        // generate a fresh token for this client
        token = opentok.generateToken(sessionId, { role: 'moderator' });

    res.json({
      apiKey: apiKey,
      sessionId: sessionId,
      token: token
    });
  });

  app.get('/videoresume/participant', function(req, res) {
    var sessionId = app.get('sessionId'),
        // generate a fresh token for this client
        token = opentok.generateToken(sessionId, { role: 'moderator' });

      res.json({
      apiKey: apiKey,
      sessionId: sessionId,
      token: token
    });
  });

  app.get('/videoresume/history', function(req, res) {
    var page = req.param('page') || 1,
        offset = (page - 1) * 5;
    opentok.listArchives({ offset: offset, count: 5 }, function(err, archives, count) {
      if (err) return res.send(500, 'Could not list archives. error=' + err.message);
      res.render('history.html', {
        archives: archives,
        showPrevious: page > 1 ? ('/history?page='+(page-1)) : null,
        showNext: (count > offset + 5) ? ('/history?page='+(page+1)) : null
      });
    });
  });

  app.get('/videoresume/download/:archiveId', function(req, res) {
    var archiveId = req.param('archiveId');
    opentok.getArchive(archiveId, function(err, archive) {
      if (err) return res.send(500, 'Could not get archive '+archiveId+'. error='+err.message);
      res.redirect(archive.url);
    });
  });

  app.get('/videoresume/start', function(req, res) {
    opentok.startArchive(app.get('sessionId'), {
      name: 'Node Archiving Sample App'
    }, function(err, archive) {
      // if (err) return res.send(500,
      //   'Could not start archive for session '+sessionId+'. error='+err.message
      // );
      if(err) return console.log(err);
      res.json(archive);
    });
  });

  app.get('/videoresume/stop/:archiveId', function(req, res) {
    var archiveId = req.param('archiveId');
    opentok.stopArchive(archiveId, function(err, archive) {
      if (err) return res.send(500, 'Could not stop archive '+archiveId+'. error='+err.message);
      res.json(archive);
    });
  });

  app.get('/videoresume/delete/:archiveId', function(req, res) {
    var archiveId = req.param('archiveId');
    opentok.deleteArchive(archiveId, function(err) {
      if (err) return res.send(500, 'Could not stop archive '+archiveId+'. error='+err.message);
      res.redirect('/history');
    });
  });

  app.get('/videoresume/render', function(req, res, next) {
      Videoresume.render('index', {
          package: 'videoresume'
      }, function(err, html) {
          //Rendering a view from the Package server/views
          res.send(html);
      });
  });

    // app.get('/videoresume/example/render', function(req, res, next) {
    //     Videoresume.render('index', {
    //         package: 'videoresume'
    //     }, function(err, html) {
    //         //Rendering a view from the Package server/views
    //         res.send(html);
    //     });
    // });
};
