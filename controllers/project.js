'use strict'


var fs = require('fs');
var Project = require('../models/project');
var path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();


var controller ={
  home: function(req, res){
      return res.status(200).send({
          message:'Soy la home'
      });
  },

  test: function(req, res){
      return res.status(200).send({
          message:'Soy el mtodo o accion test del controlador de project'
      });
  },


  saveProject: async function (req, res) {
    try {
        // Validación de los parámetros
        var { name, description, category, year, langs } = req.body;
        if (!name || !description || !category || !year || !langs) {
            return res.status(400).send({ message: 'Faltan parámetros' });
        }
        

        var project = new Project({
            name,
            description,
            category,
            year,
            langs,
            image: null
        });

        await project.save();
        return res.status(200).send({ message: 'Proyecto guardado' });
    } catch (err) {
        return res.status(500).send({ message: 'No se ha podido guardar el proyecto', errors: err });
    }
  },


  getProject: async function(req, res){
    var projectId = req.params.id; 
    let project;
    if (projectId == null) return res.status(404).send({messege: "el proyecto no existe"})
    try{
      project = await Project.findById(projectId);
      return res.status(200).send({project});
    }catch (err){
      return res.status(404).send({messege:"El proyecto no existe", error: err});
    }
  },

  getProjects: async function(req, res){
    try{
      let projects = await Project.find({}).sort('year').exec()    
      if(!projects) return res.status(404).send({message: "No hay proyectos para mostrar"});
      return res.status(200).send({projects});
    } catch(err){
      if(err) return res.status(500).send({message: "Error al devolver los proyectos"});
    }
  },

  updateProject: function(req, res){
    var projectId = req.params.id;
    var update = req.body;

    Project.findByIdAndUpdate(projectId, update, {new: true})
      .then((projectUpdated)=>{
          return res.status(200).send({
              project: projectUpdated
          })
      })
      .catch(() => {
          return res.status(404).send({message: "Proyecto no encontrado para actualizar."});
      })
  },

  deleteProject:async function(req,res){
    var projectId = req.params.id;
 
    Project.findByIdAndDelete(projectId)
    .then((projectRemoved) => {
        return res.status(200).send({
            project: projectRemoved
        })
    })
    .catch((err, projectRemoved) =>{
        if(err) return res.status(500).send({message: 'No se pudo eliminar el proyecto.'});

        if(!projectRemoved) return res.status(404).send({message: 'No se pudo encontrar el proyecto para ser eliminado.'});
    })
  },
  
  uploadImage: async function (req, res) {
    try {
        var validExt = ["png", "jpg", "jpeg", "gif"];
        var  projectId = req.params.id;
        var fileName = 'Imagen no subida';

        if (req.files && req.files.image) {
            var filePath = req.files.image.path; 
            var fileSplit = filePath.split('//');
            var fileNameNew = fileSplit[fileSplit.length - 1];
            var fileExt = fileNameNew.split('.').pop().toLowerCase();

            if (validExt.includes(fileExt)){
              var updateImage = await Project.findByIdAndUpdate( 
                projectId,
                { image: fileNameNew }, 
                { new: true }
              );
              if (updateImage) {
                return res.status(200).send({
                      files: fileNameNew,
                      message: 'El archivo se ha subido con éxito'
                  });
              } else {
                  return res.status(404).send({message: 'No se ha encontrado el proyecto'});
              }

            }else{
              //eliminar un archivo no valido
              fs.unlinkSync(filePath);
              return res.status(404).send({ message: "Tipo de archivo incorrecto."});
            }
              
        } else {
        return res.status(200).send({
            message: fileName
        });
        }
      } catch (err) {
        return res.status(500).send({ message: 'Error al llamar al método uploadImage' });
      }
  },

  getImageFile: function(req, res){
    var file =req.params.image;
    var path_file = './uploads/'+file;

    fs.exists(path_file, (exists) => {
      if (exists){
        return res.sendFile(path.resolve(path_file));
      }else{
        return res.status(200).send({
          massage: "No existe la imagen..."
        });
      }
    });

  },


  //para el envio de emails

  postEmail: function(req, res) {
    const { name, email, subject, message } = req.body;

    console.log(req.body);

    // Configurar el servicio de transporte de correo electrónico
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Utilizo de Gmail o uno que prefiera
        auth: {
            user: process.env.EMAIL_USER, // mi correo electrónico
            pass: process.env.EMAIL_PASS // mi contraseña (o token si usas autenticación de 2 factores)
        }
    });

    // Configurar el correo electrónico
    const mailOptions = {
        from: email,
        to: process.env.EMAIL_FINAL, // correo al que quiero que llegue el mensaje
        subject: subject || `Nuevo mensaje de ${name}`, // Usa el asunto del formulario o uno por defecto
        text: `Nombre: ${name}\nCorreo: ${email}\nAsunto: ${subject}\nMensaje: ${message}`
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send({ error: 'Error al enviar el correo.' });
        }
        res.send({ message: 'Correo enviado con éxito.' });
    });
}
  







}

module.exports = controller;

