const express = require('express');
const db = require('./database');
const router = express.Router();

// Get all commentaries
router.get('/commentaries', (req, res) => {
  db.getAllCommentaries((err, commentaries) => {
    if (err) {
      res.status(500).json({ error: 'Failed to retrieve commentaries' });
    } else {
      res.json(commentaries);
    }
  });
});

// Get single commentary by ID
router.get('/commentaries/:id', (req, res) => {
  db.getCommentaryById(req.params.id, (err, commentary) => {
    if (err) {
      res.status(500).json({ error: 'Failed to retrieve commentary' });
    } else if (!commentary) {
      res.status(404).json({ error: 'Commentary not found' });
    } else {
      res.json(commentary);
    }
  });
});

// Add new commentary
router.post('/commentaries', (req, res) => {
  const { title, originalText, romanianTranslation } = req.body;
  
  if (!title || !originalText) {
    return res.status(400).json({ error: 'Title and original text are required' });
  }

  db.addCommentary(title, originalText, romanianTranslation || '', (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Failed to add commentary: ' + err.message });
    } else {
      res.status(201).json({ success: true, id: result.id });
    }
  });
});

// Update commentary
router.put('/commentaries/:id', (req, res) => {
  const { title, originalText, romanianTranslation } = req.body;
  
  if (!title || !originalText) {
    return res.status(400).json({ error: 'Title and original text are required' });
  }

  db.updateCommentary(req.params.id, title, originalText, romanianTranslation || '', (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to update commentary' });
    } else {
      res.json({ success: true });
    }
  });
});

// Delete commentary
router.delete('/commentaries/:id', (req, res) => {
  db.deleteCommentary(req.params.id, (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to delete commentary' });
    } else {
      res.json({ success: true });
    }
  });
});

// Search commentaries
router.get('/search/:query', (req, res) => {
  db.searchCommentaries(req.params.query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Search failed' });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
