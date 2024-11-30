const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const port = 3010;

app.use(express.static('static'));
app.use(cors());
app.use(express.json());

// databbase connection

let db;

(async () => {
  db = await open({
    filename: './ExerciseFolder/database.sqlite',
    driver: sqlite3.Database,
  });
  console.log('got');
})();

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

const getAllResturents = async () => {
  let query = 'SELECT * FROM restaurants';
  const response = await db.all(query, []);
  return { restaurants: response };
};

const getResturentById = async (id) => {
  const query = 'SELECT * FROM restaurants WHERE id=?';

  const result = await db.all(query, [id]);
  return { restaurant: result };
};

const getByCat = async (id) => {
  const query = 'SELECT * FROM restaurants WHERE cuisine=?';

  const result = await db.all(query, [id]);
  return { restaurants: result };
};

const getFilteredResturents = async (isVeg, isLuxury, hasOutdoorSeating) => {
  const query =
    'SELECT * FROM restaurants WHERE isVeg=? AND isLuxury=? AND hasOutdoorSeating=?';
  const result = await db.all(query, [isVeg, isLuxury, hasOutdoorSeating]);
  console.log(result, isVeg, isLuxury, hasOutdoorSeating);
  return { restaurants: result };
};

const getAllSortedByRatting = async () => {
  let query = `
  SELECT DISTINCT id, name, cuisine, isVeg, rating, priceForTwo, location, hasOutdoorSeating, isLuxury
  FROM restaurants
  ORDER BY rating DESC
`;
  const result = await db.all(query, []);
  return { restaurants: result };
};

app.get('/restaurants', async (req, res) => {
  try {
    let result = await getAllResturents();
    if (result.restaurants.length === 0) {
      res.status(404).json({ msg: 'no result found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get('/restaurants/details/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let result = await getResturentById(id);
    if (result.restaurant.length === 0) {
      res.status(404).json({ msg: 'no result found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get('/restaurants/cuisine/:cat', async (req, res) => {
  try {
    let id = req.params.cat;

    let result = await getByCat(id);
    if (result.restaurants.length === 0) {
      res.status(404).json({ msg: 'no result found' });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});
// restaurants/filter?isVeg=true&hasOutdoorSeating=true&isLuxury=false
app.get('/restaurants/filter', async (req, res) => {
  try {
    const { isVeg, hasOutdoorSeating, isLuxury } = req.query;

    let result = await getFilteredResturents(
      isVeg,
      isLuxury,
      hasOutdoorSeating
    );
    if (result.restaurants.length === 0) {
      res.status(404).json({ msg: 'no result found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    let result = await getAllSortedByRatting();
    if (result.restaurants.length === 0) {
      res.status(404).json({ msg: 'no result found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

const getAllDishes = async () => {
  const query = 'SELECT * from dishes';
  const result = await db.all(query, []);
  return { dishes: result };
};

app.get('/dishes', async (req, res) => {
  try {
    const result = await getAllDishes();
    if (result.dishes.length === 0) {
      res.status(404).json({ msg: 'no result found' });
    }

    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

const getDishesDetails = async (id) => {
  console.log(id);
  let query = 'SELECT * FROM dishes WHERE id=?';
  const result = await db.all(query, [id]);
  return { dish: result };
};

app.get('/dishes/details/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await getDishesDetails(id);
    if (result.dish.length === 0) {
      res.status(404).json({ msg: 'no result found' });
    }
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
});
const getFilteredDish = async (isVeg) => {
  console.log(isVeg);
  const query = 'SELECT * FROM dishes WHERE isVeg=?';
  const result = await db.all(query, [isVeg]);
  return { dishes: result };
};

app.get('/dishes/filter', async (req, res) => {
  try {
    const isVeg = req.query.isVeg;
    const result = await getFilteredDish(isVeg);
    if (result.dishes.length === 0) {
      res.status(404).json({ msg: 'no result found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

const getSortedDishes = async () => {
  const query = 'SELECT * FROM dishes ORDER BY price ASC';
  const result = await db.all(query, []);
  return { dishes: result };
};

app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    const result = await getSortedDishes();
    if (result.dishes.length === 0) {
      res.status(404).json({ msg: 'no result found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
