var express = require("express");
var server = express();
var bodyParser = require("body-parser");
const e = require("express");

var model = {
    clients: {},
    reset: () => {
        model.clients = {};
    },
    addAppointment: (client, date) => {
        if (model.clients[client]) {
            model.clients[client].push({ ...date, status: 'pending' })
        } else {
            model.clients[client] = [{ ...date, status: 'pending' }]
        }

    },

    attend: (name, date) => {
        model.clients[name].map(el => {
            if (el.date === date) {
                el.status = 'attended'
            }
        })
    },

    expire: (name, date) => {
        model.clients[name].map(el => {
            if (el.date === date) {
                el.status = 'expired'
            }
        })
    },

    cancel: (name, date) => {
        model.clients[name].map(el => {
            if (el.date === date) {
                el.status = 'cancelled'
            }
        })
    },

    erase: (name, date) => {
        if (date === 'attended' || date === 'expired' || date === 'cancelled') {
            model.clients[name] = model.clients[name].filter(d => d.status !== date);
        }
        else {
            let appointment = model.clients[name].find(d => d.date === date);
            let index = model.clients[name].indexOf(appointment);
            model.clients[name].splice(index, 1);

        }
    },

    getAppointments: (name, status) => {
        if (status) {
            return model.clients[name].filter(el => el.status === status)
        } else {
            return model.clients[name]
        }
    },

    getClients: () => {
        return Object.keys(model.clients)

    }
};

server.use(bodyParser.json());

server.get('/api', (req, res) => {
    res.send(model.clients)
})

server.post('/api/Appointments', (req, res) => {
    const { client, appointment } = req.body;

    if (!client) {
        return res.status(400).send('the body must have a client property');
    };
    if (typeof client !== 'string') {
        return res.status(400).send('client must be a string');
    };

    model.addAppointment(client, appointment);

    res.send({ date: appointment.date, status: 'pending' })

})

server.get('/api/Appointments/clients', (req, res) => {
    console.log(model.getClients())
    res.send(model.getClients())
})
server.get('/api/Appointments/:name', (req, res) => {
    const name = req.params.name;
    const date = req.query.date;
    const status = req.query.option;
    const client = model.clients[name];

    if (!client) {
        return res.status(400).send('the client does not exist')
    }

    const appointment = client.find(e => e.date === date)

    if (!appointment) {
        return res.status(400).send('the client does not have a appointment for that date')
    }

    switch (status) {
        case "attend":
            model.attend(name, date);
            return res.send(appointment);
        case "expire":
            model.expire(name, date);
            return res.send(appointment);
        case "cancel":
            model.cancel(name, date);
            return res.send(appointment);
        default:
            res.status(400).send('the option must be attend, expire or cancel');
            break;
    }
})

server.get('/api/Appointments/:name/erase', (req, res) => {
    let clients = model.getClients()
    let client = clients.includes(req.params.name)
    if (client === false) {
        res.status(400).send('the client does not exist')
    }
    else if (req.query.date === 'expired' || req.query.date === 'attended' || req.query.date === 'cancelled') {
        let appointments = model.getAppointments(req.params.name)
        let appointment = appointments.filter(d => d.status === req.query.date)
        model.erase(req.params.name, req.query.date)
        res.send(appointment)
    }
    else {
        let appointments = model.getAppointments(req.params.name)
        let appointment = appointments.find(d => d.date === req.query.date)
        model.erase(req.params.name, req.query.date)
        res.send(appointment)
    }
})
// const name = req.params.name;
// const date = req.query.date; ?
// const client = model.clients[name];


// if (!client) {
//     return res.status(400).send('the client does not exist')
// }
// console.log(date)
// const eDelete = model.erase(name, date);

// res.send(eDelete);


server.get('/api/Appointments/getAppointments/:name', (req, res) => {
    const name = req.params.name;
    const status = req.query.status;

    res.send(model.getAppointments(name, status));
})

server.listen(3003);
module.exports = { model, server };




