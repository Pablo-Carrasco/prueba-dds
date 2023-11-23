var request = require("supertest");
require('dotenv').config();
const app = require('./app');
const db = require("./config/db.js")
const { Sequelize } = require('sequelize');

var loc = Sequelize.fn('ST_GeomFromText', 'POINT(-33.0000000 -70.0000000)')

beforeAll(async () => {
  var testCinema = null
  try{
    testCinema = await db.Cinema.create({
    name: 'Cine Prueba',
      location: loc,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: 4000
  })
  } catch (e) {
    console.error(e)
  }

  const testShow = await db.Show.create({
    title: "Batman Prueba",
      schedule: "12:00:00",
      link_to_show: "aaalink1",
      link_to_picture: "aaalink2",
      id_cinema: 4000,
      createdAt: new Date(),
      updatedAt: new Date(),
      date: new Date("2023-11-27")
  })


  var testCinema7 = null
  try{
    testCinema7 = await db.Cinema.create({
    name: 'Cine Prueba 2',
      location: loc,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: 5000
  })
  } catch (e) {
    console.error(e)
  }
  const testShow9 = await db.Show.create({
    title: "Batman Prueba",
      schedule: "12:00:00",
      link_to_show: "aaalink1",
      link_to_picture: "aaalink2",
      id_cinema: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
      date: new Date("2023-11-27")
  })
  const testShow2 = await db.Show.create({
    title: "Joker Prueba",
      schedule: "17:00:00",
      link_to_show: "aaalink1",
      link_to_picture: "aaalink2",
      id_cinema: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
      date: new Date("2023-11-27")
  })
  const testShow3 = await db.Show.create({
    title: "Joker Prueba",
      schedule: "14:00:00",
      link_to_show: "aaalink1",
      link_to_picture: "aaalink2",
      id_cinema: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
      date: new Date("2023-11-28")
  })
  const testShow4 = await db.Show.create({
    title: "Joker Prueba",
      schedule: "11:00:00",
      link_to_show: "aaalink1",
      link_to_picture: "aaalink2",
      id_cinema: 5000,
      createdAt: new Date(),
      updatedAt: new Date(),
      date: new Date("2023-11-29")
  })

})

afterAll(async () => {
  try {
    console.log(process.env.NODE_ENV)
    console.log(process.env.PSQL_DATABASE_URL_TEST)
    console.log('Deleting data...');
    await Promise.all([
      db.Cinema.destroy({
        where: {
          name: {
            [db.Sequelize.Op.or]: ['Cine Prueba', 'Cine Prueba 2']
          }
        }
      }),
      db.Show.destroy({
        where: {
          title: {
            [db.Sequelize.Op.or]: ['Batman Prueba', 'Joker Prueba']
          }
        }
      })
    ]);
    await db.sequelize.close();

  } catch (error) {
    console.error('Error en afterAll:', error);
  }
});


describe("Movies", () => {
    it("shows the 3 shows created in that cinema", async () => {
      const res = await request(app)
      .post('/movieInfo')
      .send({
        "cinema_id": 5000,
        "movie_title": "Joker Prueba"
      })
        expect(res.statusCode).toEqual(200)
        expect(res.body.shows.length).toEqual(3)
        
  })
})

describe('GET /movies', () => {
  it("shows all movies", async () => {
    const response = await request(app).get('/movies');
    var check = response.body.includes('Joker Prueba') && response.body.includes('Batman Prueba')
    expect(response.status).toBe(200);
    expect(check).toEqual(true)
  });
  it("does not shows movies not created", async () => {
    const response = await request(app).get('/movies');
    var check = response.body.includes('Joker Prueba no esta')
    expect(response.status).toBe(200);
    expect(check).toEqual(false)
  });
});


describe("Shows", () => {
    it("test-noShowsWithTitle", async () => {
      const res = await request(app)
      .post('/search')
      .send({
        "location": "Latitude: -33.417052, Longitude: -70.5100854",
        "movie": "Batman Prueba",
        "currentLocation": true,
        "date": "2023-11-28"
    })
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual([ [], 'Batman Prueba' ])
    
  });

  it("test-ShowsWithDate", async () => {
      const res = await request(app)
      .post('/search')
      .send({
        "location": "Latitude: -33.0000000, Longitude: -70.0000000",
        "movie": "Batman Prueba",
        "currentLocation": true,
        "date": "2023-11-28"
    })
        expect(res.statusCode).toEqual(200)
        var json = JSON.parse(JSON.stringify(res.body[0]))
        expect(res.body[1]).toEqual('Batman Prueba')
        console.log(json[0])
        expect(json[0].name).toEqual('Cine Prueba') 
  });
  it("test-NoShowsWithDate", async () => {
      const res = await request(app)
      .post('/search')
      .send({
        "location": "Latitude: -33.0000000, Longitude: -70.0000000",
        "movie": "Batman Prueba",
        "currentLocation": true,
        "date": "2023-11-15"
    })
        expect(res.statusCode).toEqual(200)
        var json = JSON.parse(JSON.stringify(res.body[0]))
        expect(res.body[1]).toEqual('Batman Prueba')
        expect(res.body[0]).toEqual([])
  });

})


describe('GET /', () => {
  it('responds with "Hello, World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hola mundo esto es una demo!');
  });
});