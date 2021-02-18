const appointment = require("../models/Appointment")
const mongoose = require("mongoose")
const AppointmentFactory = require("../factories/AppointmentFactory")
const Appo = mongoose.model("Appointment", appointment)
const nodemailer = require("nodemailer")
class AppointmentService {
    async create(name, email, description, cpf, date, time) {
        const newAppo = new Appo({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished:false,
            notified:false
        })
        try {
            await newAppo.save()
            return true
        } catch (error) {
            console.log(error)
            return false
        }

    }

    async GetAll(showFinished){
        if(showFinished){
            return await Appo.find()
        }else{
            const appos =  await Appo.find({'finished':false})
            const appointments = []
            appos.forEach(appointment=>{
                if(appointment.date != undefined){
                    appointments.push(AppointmentFactory.Build(appointment))
                }
              
            })
            return appointments
        }

    }

    async GetById(id){
        try {
            const event = await Appo.findOne({'_id':id})
            return event
        } catch (error) {
            console.log(error)
        }
       
    }
    

    async Finish(id){
        try {  
            await Appo.findByIdAndUpdate(id,{finished:true})
            return true
        } catch(error) {
            console.log(error)
            return false
        }
    
    }

    async Search(query){
        try {
            const appos = await Appo.find().or([{email: query},{cpf:query}])
      return appos
        } catch (error) {
            console.log(error)
            return false
        }
      
    }

    async SendNotification(){
        const appos = await this.GetAll(false)
        const tranporter = nodemailer.createTransport({
            host:"smtp.mailtrap.io",
            port:2525,
            auth:{
                user:"f444a611ce3277",
                pass:"e73b747e15d20a"
            }
        })
       
        appos.forEach(async apps => {
            const date = apps.start.getTime();
            const hour = 1000 * 60 * 60
            const gap = date - Date.now()

            if(gap <= hour){
                if(!apps.notified){
                 await Appo.findByIdAndUpdate(apps.id,{notified:true})
                tranporter.sendMail({
                    from:"Matheus de Paula <matheusdepaula527@gmail.com>",
                    to:apps.email,
                    subject:"Sua consulta vai acontecer em breve",
                    text:"lorem lorem lorem lorem lorem"
                }).then(()=>{

                }).catch(err=>{
                    console.log(err)
                })
                }
            }
        })
    }

}
module.exports = new AppointmentService()