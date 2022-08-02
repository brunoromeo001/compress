import {EventEmitter} from  'events';

class Evento extends EventEmitter {}
const meuEvento = new Evento();

// Assinante 
meuEvento.on("convert", (x, y)=>{

  console.log(`Executando a conversão...`);
})

// Emissor
meuEvento.emit('convert', 'userAdmin', 'Converteu');

// Assinante 
meuEvento.on("encerrar", (dados)=>{

  console.log(`Assinante: ${dados}`);
});

// Emissor
meuEvento.emit('encerrar', 'Encerrando a execução da importação dos dados.');