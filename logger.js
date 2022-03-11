var amqp = require('amqplib');
var argv = require('minimist')(process.argv.slice(2))
const TOPIC = 'iot/sensors/mq7'

if(argv.h || argv._.length === 0){
    console.log("logger.js [192.168.1.181]")
    process.exit();
}

let main = async (ip) => {
	const connection = await amqp.connect('amqp://guest:guest@192.168.1.181:5672');
	process.once('SIGINT', () => connection.close());

    const channel = await connection.createChannel();
    console.log(' [*] Waiting for messages. To exit press CTRL+C');
	await channel.assertQueue(TOPIC,{durable:false});
	await channel.consume(TOPIC, (msg) => {
		if (msg !== null) {
            const d = new Date()
            const now = d.getUTCFullYear() +"/"+ (d.getUTCMonth()+1) +"/"+ d.getUTCDate() + " " + d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds()
            console.log(" ["+now+"] %s: '%s'", msg.fields.routingKey, msg.content.toString());
			channel.ack(msg);
		}
	});
}

main(argv._[0])
	.then((msg) => console.log('Logging on queue:' + TOPIC))
	.catch((err) => console.error(''+ err));
