const express = require('express')
const app = express()
const mongoose = require('mongoose')
const AppointmentService = require('./services/appointmentService')
app.use(express.static('public'))
const bodyParser = require('body-parser')
const appointmentService = require('./services/appointmentService')
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.set('view engine', 'ejs')

mongoose.connect("mongodb://localhost:27017/agenda", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.set('useFindAndModify',false)
app.get("/", (req, res) => {
    res.render('index')
})
app.get("/cadastro", (req, res) => {
    res.render('create')
})

app.post("/create", async (req, res) => {
    const {
        name,
        email,
        description,
        cpf,
        date,
        time
    } = req.body
    const status = await appointmentService.create(name, email, description, cpf, date, time)

    if(status){
        res.redirect("/cadastro")
    }else{
        res.send("Ocorreu uma falha!!")
    }
})

app.get("/getcalendar",async (req,res)=>{
    const appointments = await AppointmentService.GetAll(false)
    res.json(appointments)
})

app.get("/event/:id", async (req,res)=>{
    const {id} = req.params
    const appointment = await AppointmentService.GetById(id)
   res.render("event",{appo:appointment})
})

app.post("/finish",async (req,res)=>{
    const {id} = req.body
 
    const result = await AppointmentService.Finish(id)
    if(result){
        res.status(200)
        res.redirect("/")
    }else{
        res.status(400)
        res.json({err:"Consulta não encontrada",result:result})

    }
    
})

app.get("/list",async (req,res)=>{
  
    const appos = await AppointmentService.GetAll(true)
    res.render('list',{appos})
})

app.get("/search",async (req, res)=>{
    const appos = await AppointmentService.Search(req.query.search)
res.render('list',{appos})

})

setInterval(async ()=>{
await AppointmentService.SendNotification()
},5000)

app.listen(8080, () => {})