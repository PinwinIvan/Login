//Express summon
const express = require('express');
const app = express();

//set urlencoded
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//invoke dotenv
const dotenv = require('dotenv');
dotenv.config ({path:'./env/.env'});

//public directory path
app.use('/', express.static('public'));
app.use('/', express.static(__dirname + '/public'));

//establish ejs search motor
app.set('view engine', 'ejs');

//invoke bcryptjs
const bcryptjs= require('bcryptjs');

//Session Variables
const session= require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//invoke database connection module, after env and db config
const connection = require('./database/db')
const { name } = require('ejs');


//Establish paths
/*app.get('/', (req,res) =>{
  res.render('index');  
})*/

app.get('/login', (req,res) =>{
    res.render('login');    
})

app.get('/register', (req,res) =>{
    res.render('register');  
})

// register 
app.post('/register' , async(req, res) => {
  const user = req.body.user;
  const name = req.body.name;
  const rol = req.body.rol;
  const pass = req.body.pass;
  let passwordHash = await bcryptjs.hash(pass, 8);
  connection.query ('INSERT INTO users SET ?' , {user:user, name:name, rol:rol, pass:passwordHash}, async(error, results)=>{
    if(error){ 
      console.log(error);
    }else{
      //res.send('Successful Registration!')
      res.render('register', {
        alert: true,
        alertTitle: "Registration",
        alertMessage: 'Registration Succesful',
        alertIcon: 'success',
        showConfirmButton: false,
        timer: '1500',
        ruta:''
      })
    }
  })
})
    
//Authorization
app.post('/auth', async (req, res) =>{
  const user = req.body.user;
  const pass = req.body.pass;
  let passwordHash = await bcryptjs.hash(pass,8);
  if(user && pass){
      connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results)=> {
          if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
              //res.send('Usuario y/o contraseña incorrecta');
              res.render('login', {
                  alert: true,
                  alertTitle: "Error",
                  alertMessage: "Inconrrect user or password",
                  alertIcon: 'error',
                  showConfirmButton: true,
                  timer: false,
                  ruta: 'login'
              });
          }else{
              //res.send('Login correcto');
              req.session.loggedin = true;
              req.session.name = results[0].name
              res.render('login', {
                  alert: true,
                  alertTitle: "Succesful Connection",
                  alertMessage: "Correct Login",
                  alertIcon: 'success',
                  showConfirmButton: false,
                  timer: 1500,
                  ruta: ''
              });
          }
      })

  }else{
      //res.send('Por favor ingrese un usuario y/o password');
      res.render('login', {
          alert: true,
          alertTitle: "Advertencia",
          alertMessage: "Please enter a user and/or password",
          alertIcon: 'warning',
          showConfirmButton: true,
          timer: 1500,
          ruta: 'login'
      });
  }

})

//13 Auth Pages
app.get('/', (req, res) =>{
  if(req.session.loggedin){
      res.render('index', {
          login: true,
          name: req.session.name
      });
  }else{
      res.render('index', {
          login: false,
          name: 'Debe iniciar sesión'
      })
  }
})

//14 Logout
app.get('/logout', (req, res)=>{
  req.session.destroy(()=>{
      res.redirect('/');
  })
})


app.listen(3000, (req , res) => {
    console.log('Server running on https://localhost:3000/')
})
