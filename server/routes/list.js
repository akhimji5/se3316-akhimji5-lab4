const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const User = require('./../models/user'); 
const List = require('../models/list'); 
const Superhero = require('../models/superhero'); 


router.post('/favoriteLists', async (req, res) => {
  const { listName, isPublic, userId, userName } = req.body;
  try {
    let list = await List.findOne({ listName });
    if (list) {
      return res.status(400).send('List name already exists.');
    }
    list = new List({ listName, isPublic, userId, userName }); // Add userName to the new list

    await list.save();
    res.status(200).send('Superhero list created successfully.');
  } catch (error) { 
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});


// POST route to add a review to a public list
router.post('/favoriteLists/:listName/reviews', async (req, res) => {
  const { listName } = req.params;
  const { reviewerName, comment, rating } = req.body;

  try {
    const list = await List.findOne({ listName });
    if (!list) {
      return res.status(404).send(`List '${listName}' not found.`);
    }

    // Check if the list is public
    if (!list.isPublic) {
      return res.status(403).send('Only public lists can be reviewed.');
    }

    const newReview = { reviewerName, comment, rating, hidden: false };
    list.reviews.push(newReview);
    await list.save();

    res.status(200).send('Review added successfully.');
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});

// GET route to fetch reviews for a list
router.get('/favoriteLists/:listName/reviews', async (req, res) => {
  const { listName } = req.params;

  try {
    const list = await List.findOne({ listName }).select('reviews');
    if (!list) {
      return res.status(404).send(`List '${listName}' not found.`);
    }

    // Filter out hidden reviews
    const visibleReviews = list.reviews.filter(review => !review.hidden);

    res.json(visibleReviews);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});


// GET route to fetch reviews for a list admin
router.get('/favoriteLists/:listName/reviews/admin', async (req, res) => {
  const { listName } = req.params;

  try {
    const list = await List.findOne({ listName }).select('reviews');
    if (!list) {
      return res.status(404).send(`List '${listName}' not found.`);
    }

    res.json(list.reviews);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});

// GET Route for public superhero lists
router.get('/publicFavoriteLists', async (req, res) => {
  try {
    const publicLists = await List.find({ isPublic: true });
    res.json(publicLists);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});


router.put('/favoriteLists/:listName', [
  param('listName').trim().escape().notEmpty().withMessage('List name is required.'),
  body('superheroIds.*').isInt().withMessage('Each superhero ID must be an integer'),
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { listName } = req.params;
  const { superheroIds, userId } = req.body;

  try {
    let list = await List.findOne({ listName });
    if (!list) {
      return res.status(404).send(`List '${listName}' does not exist.`);
    }

    if (list.userId.toString() !== userId) {
      return res.status(403).send('Unauthorized to modify this list.');
    }

    // Add new superhero IDs to the list
    list.superheroes = [...new Set([...list.superheroes, ...superheroIds])];
    await list.save();
    res.status(200).send(`Superhero list '${listName}' updated successfully.`);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});


router.get('/favoriteLists/:listName', async (req, res) => {
  const { listName } = req.params;
  try {
    const list = await List.findOne({ listName });
    if (!list) {
      return res.status(404).send(`List '${listName}' not found.`);
    }
    res.json(list);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});

router.put('/favoriteLists/:listName/updateStatus', async (req, res) => {
  const listName = req.params.listName;
  const { isPublic } = req.body;

  try {
    // Find the list with the given name
    let list = await List.findOne({ listName });
    if (!list) {
      return res.status(404).send(`List '${listName}' does not exist.`);
    }

    // Update the isPublic status
    list.isPublic = isPublic;
    await list.save();

    res.status(200).send(`Updated public status of '${listName}' successfully.`);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});




// GET Route to retrieve a list of names, information, and powers of superheroes in a given list
router.get('/favoriteLists/:listName/superheroes/info', async (req, res) => {
  const { listName } = req.params;
  const userId = req.query.userId; // Get userId from query parameters

  try {
    const list = await List.findOne({ listName });
    if (!list) {
      return res.status(404).json({ error: 'List does not exist' });
    }

    if (!list.isPublic && list.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view this list' });
    }

    const superheroesInList = await Superhero.find({ id: { $in: list.superheroes } });
    res.json(superheroesInList);
  } catch (error) {
    console.error('Error fetching list info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// DELETE Route to remove a superhero list by name
router.delete('/favoriteLists/:listName', async (req, res) => {
  const { listName } = req.params;
  const userId = req.body.userId; // Assume the user's ID is sent in the request body

  try {
    const list = await List.findOne({ listName });
    if (!list) {
      return res.status(404).send(`List '${listName}' not found.`);
    }

    // Check if the user is the creator of the list
    if (list.userId.toString() !== userId) {
      return res.status(403).send('Unauthorized to delete this list.');
    }

    await List.deleteOne({ listName });
    
    res.send(`List '${listName}' has been deleted.`);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});

router.delete('/favoriteLists/:listName/superheroes/:heroId', async (req, res) => {
  const { listName, heroId } = req.params;
  const userId = req.body.userId; // User ID from the request body

  try {
    // Find the list by name
    let list = await List.findOne({ listName });
    if (!list) {
      return res.status(404).send(`List '${listName}' not found.`);
    }

    // Check if the user is the creator of the list
    if (list.userId.toString() !== userId) {
      return res.status(403).send('Unauthorized to modify this list.');
    }

    // Convert heroId to a number as superheroes are stored as numbers in the list
    const heroIdNum = parseInt(heroId, 10);

    // Remove the superhero ID from the list
    list.superheroes = list.superheroes.filter(id => id !== heroIdNum);
    await list.save();

    res.status(200).send(`Superhero with ID ${heroId} removed from list '${listName}'.`);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});


const adminCheck = async (req, res, next) => {
  const adminUserId = req.body.userId; 

  try {
      const adminUser = await User.findById(adminUserId);
      if (adminUser && adminUser.isAdmin) {
          next(); 
      } else {
          res.status(403).send('Access denied. Admins only.');
      }
  } catch (error) {
      res.status(500).send('Internal server error');
  }
};

router.post('/favoriteLists/:listName/reviews/:reviewId/toggle', adminCheck, async (req, res) => {
  const { listName, reviewId } = req.params;

  try {
      const list = await List.findOne({ listName });
      if (!list) {
          return res.status(404).send(`List '${listName}' not found.`);
      }

      const review = list.reviews.id(reviewId);
      if (!review) {
          return res.status(404).send('Review not found.');
      }

      // Toggle the hidden status of the review
      review.hidden = !review.hidden;
      await list.save();

      res.status(200).send('Review visibility toggled.');
  } catch (error) {
      console.error('Server Error:', error);
      res.status(500).send('Server error');
  }
});


module.exports = router;